import { Notification } from "../../models/index.js";
import { asyncHandler, ApiResponse, ApiError } from "../../utils/index.js";

export const deleteNotification = asyncHandler(async (req, res) => {
    const { notificationId } = req.params;
    const userId = req.user._id;

    const notification = await Notification.findOneAndDelete({
        _id: notificationId,
        user: userId,
    });

    if (!notification) {
        throw new ApiError(404, true, "Notification not found or unauthorized");
    }

    return res.status(200).json(
        new ApiResponse(200, true, true, "Notification deleted successfully", null)
    );
});
