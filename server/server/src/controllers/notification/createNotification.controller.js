import { Notification } from "../../models/index.js";
import { asyncHandler, ApiResponse, ApiError, sendNotification } from "../../utils/index.js";

export const createNotification = asyncHandler(async (req, res) => {
    const { receiverId, title, message, type, link, projectId } = req.body;
    const senderId = req.user._id;

    if (!receiverId || !title || !message) {
        throw new ApiError(400, true, "Receiver, title, and message are required");
    }

    const notification = await sendNotification({
        receiverId,
        senderId,
        projectId,
        title,
        message,
        type: type || "general",
        link,
    });

    return res.status(201).json(
        new ApiResponse(201, true, true, "Notification created successfully", notification)
    );
});
