import mongoose from "mongoose";
import { asyncHandler, ApiResponse, ApiError } from "../../utils/index.js";
import { Chat, Message } from "../../models/chat.model.js";
import { User } from "../../models/user.model.js";
import { io } from "../../index.js";

const getSocketId = async (userId) => {
    const user = await User.findById(userId);
    return user?.socketId;
};

export const createChat = asyncHandler(async (req, res) => {
    const senderId = req.user.id;
    const receiverId = (req.body.receiverId ?? "").trim();
    const text = req.body.text ?? "";

    if (!text) {
        throw new ApiError(400, true, "Initial text required");
    }

    if (!receiverId) {
        throw new ApiError(400, true, "Receiver id is required");
    }

    if (!mongoose.isValidObjectId(receiverId)) {
        throw new ApiError(400, true, "Invalid receiver id");
    }

    const receiver = await User.findById(receiverId);
    if (!receiver) {
        throw new ApiError(404, true, "Receiver not found");
    }

    const chatAlreadyExists = await Chat.findOne({
        $or: [
            { userOne: senderId, userTwo: receiver._id },
            { userOne: receiver._id, userTwo: senderId },
        ],
    });

    const selectOptions = "name _id avatar online lastSeen isTyping";

    if (chatAlreadyExists) {
        // Chat already exists, just add the message and return it
        const iniMsg = await Message.create({
            sender: senderId,
            receiver: receiver._id,
            text: text,
        });
        
        chatAlreadyExists.messages.push(iniMsg);
        chatAlreadyExists.lastMessage = iniMsg;
        await chatAlreadyExists.save();

        const populatedChat = await Chat.findById(chatAlreadyExists._id)
            .populate("userOne", selectOptions)
            .populate("userTwo", selectOptions)
            .populate("messages");

        const receiverSocketId = await getSocketId(receiverId);
        if (receiverSocketId) {
            io.to(receiverSocketId).emit("newMessage", {
                chatId: populatedChat._id,
                newMessage: iniMsg,
            });
        }

        return res
            .status(200)
            .json(new ApiResponse(200, true, true, "Message sent to existing chat", populatedChat));
    }

    const chat = await Chat.create({
        userOne: senderId,
        userTwo: receiver._id,
    });

    const populatedChat = await Chat.findById(chat._id)
        .populate("userOne", selectOptions)
        .populate("userTwo", selectOptions)
        .populate("messages");

    const iniMsg = await Message.create({
        sender: senderId,
        receiver: receiver._id,
        text: text,
    });
    populatedChat.messages.push(iniMsg);
    populatedChat.lastMessage = iniMsg;
    await populatedChat.save();

    const receiverSocketId = await getSocketId(receiverId);
    if (receiverSocketId) {
        io.to(receiverSocketId).emit("newChat", populatedChat);
    }

    return res
        .status(200)
        .json(new ApiResponse(200, true, true, "Chat created", populatedChat));
});

export const getChats = asyncHandler(async (req, res) => {
    const selectOptions = "name _id avatar online lastSeen isTyping";
    const userId = req.user.id;

    const chats = await Chat.find({
        $or: [
            { userOne: userId },
            {
                userTwo: userId,
            },
        ],
    })
        .sort({ updatedAt: -1 })
        .populate("userOne", selectOptions)
        .populate("userTwo", selectOptions)
        .populate("messages");

    res.status(200).json(
        new ApiResponse(200, true, true, "chats fetched", chats),
    );
});

export const getConnections = asyncHandler(async (req, res) => {
    const userId = req.user.id;
    const selectOptions = "name avatar online lastSeen";

    const user = await User.findById(userId)
        .populate("following.userId", selectOptions)
        .populate("followers.userId", selectOptions);

    const seenIds = new Set();

    const connectionList = [...user.following, ...user.followers].filter(
        ({ userId }) => {
            if (seenIds.has(userId._id.toString())) return false;
            seenIds.add(userId._id.toString());
            return true;
        },
    );

    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                true,
                true,
                "Connections fetched",
                connectionList,
            ),
        );
});

export const newMessage = asyncHandler(async (req, res) => {
    const { chatId } = req.params;
    const userId = req.user.id;
    const message = req.body.message ?? "";

    if (!mongoose.isValidObjectId(chatId)) {
        throw new ApiError(400, true, "Invalid chatId");
    }

    if (!message) {
        throw new ApiError(400, true, "Message is required");
    }

    const chat = await Chat.findOne({
        _id: chatId,
        $or: [{ userOne: userId }, { userTwo: userId }],
    });

    if (!chat) {
        throw new ApiError(404, true, "Chat id not found");
    }

    const sender = userId;
    const receiver =
        chat.userOne.toString() === userId ? chat.userTwo : chat.userOne;

    const newMessage = await Message.create({
        text: message,
        sender,
        receiver,
    });
    chat.messages.push(newMessage);
    await chat.save();

    const receiverSocketId = await getSocketId(receiver._id);

    if (receiverSocketId) {
        io.to(receiverSocketId).emit("newMessage", {
            chatId: chat._id,
            newMessage,
        });
    }

    return res
        .status(200)
        .json(new ApiResponse(200, true, true, "Message sent", newMessage));
});

export const deleteChat = asyncHandler(async (req, res) => {
    const userId = req.user.id;
    const { chatId } = req.params;

    if (!mongoose.isValidObjectId(chatId)) {
        throw new ApiError(400, true, "Invalid chat id");
    }

    const chat = await Chat.findByIdAndDelete(chatId);

    if (!chat) {
        throw new ApiError(404, true, "Chat not found");
    }

    const otherPartyId =
        chat.userOne.toString() === userId
            ? chat.userTwo.toString()
            : chat.userOne.toString();

    const opSocketId = await getSocketId(otherPartyId);

    if (opSocketId) {
        io.to(opSocketId).emit("chatDelete", { chatId: chat._id });
    }

    return res
        .status(200)
        .json(new ApiResponse(200, true, true, "Chat deleted", chat));
});
