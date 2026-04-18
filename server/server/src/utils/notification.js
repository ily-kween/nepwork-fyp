import { Notification } from "../models/index.js";
import { io } from "../index.js";

/**
 * Send a notification to a user and emit via socket.io
 * @param {Object} options - Notification options
 * @param {string} options.receiverId - ID of the user receiving the notification
 * @param {string} options.senderId - ID of the user sending the notification (optional)
 * @param {string} options.projectId - ID of the related project (optional)
 * @param {string} options.title - Notification title
 * @param {string} options.message - Notification message
 * @param {string} options.type - Notification type (enum)
 * @param {string} options.link - Link for the notification (optional)
 */
export const sendNotification = async ({
    receiverId,
    senderId,
    projectId,
    title,
    message,
    type,
    link,
}) => {
    try {
        const notification = await Notification.create({
            user: receiverId,
            sender: senderId,
            project: projectId,
            title,
            message,
            type,
            link,
        });

        // Emit real-time update via socket.io
        if (io) {
            io.to(receiverId.toString()).emit("notification", notification);
            console.log(`Notification emitted to ${receiverId.toString()}`);
        }

        return notification;
    } catch (error) {
        console.error("Error sending notification:", error);
    }
};
