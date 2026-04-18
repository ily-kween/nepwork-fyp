import { Notification } from "../../models/index.js";
import { asyncHandler, ApiResponse } from "../../utils/index.js";

const markAsRead = asyncHandler(async (req, res) => {
    const { notificationId } = req.params;
    const userId = req.user._id;

    if (notificationId === "all") {
        await Notification.updateMany({ user: userId }, { isRead: true });
        return res.status(200).json(new ApiResponse(200, true, true, "All notifications marked as read", {}));
    }

    const notification = await Notification.findOneAndUpdate(
        { _id: notificationId, user: userId },
        { isRead: true },
        { new: true }
    );

    if (!notification) {
        return res.status(404).json(new ApiResponse(404, false, true, "Notification not found", null));
    }

    return res.status(200).json(new ApiResponse(200, true, true, "Notification marked as read", notification));
});

export { markAsRead };
