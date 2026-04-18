import mongoose from "mongoose";

const messageSchema = new mongoose.Schema(
    {
        text: {
            type: String,
            required: true,
        },
        sender: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        receiver: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
    },
    { timestamps: { createdAt: "timestamp" } },
);

export const Message = mongoose.model("Message", messageSchema);

const chatSchema = new mongoose.Schema(
    {
        userOne: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        userTwo: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        messages: [{ type: mongoose.Schema.Types.ObjectId, ref: "Message" }],
        lastMessage: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Message",
            default: null,
        },
        unreadOne: {
            // Unread by user one
            type: Number,
            default: 0,
        },
        unreadTwo: {
            // unread message by user two
            type: Number,
            default: 0,
        },
    },
    { timestamps: true },
);

export const Chat = mongoose.model("Chat", chatSchema);
