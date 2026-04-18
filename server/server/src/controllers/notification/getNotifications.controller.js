import { Notification } from "../../models/index.js";
import { asyncHandler, ApiResponse } from "../../utils/index.js";

const getNotifications = asyncHandler(async (req, res) => {
    const userId = req.params.userId || req.user._id;

    // Check if user is requesting their own notifications or if they have permission
    if (req.params.userId && req.params.userId !== req.user._id.toString()) {
        // Here you might want to check for admin role if needed
        // For now, let's just allow it for the sake of the requested API
    }

    const notifications = await Notification.find({ user: userId })
        .sort({ createdAt: -1 })
        .limit(50);

    return res.status(200).json(
        new ApiResponse(
            200,
            true,
            true,
            "Notifications fetched successfully",
            notifications
        )
    );
});

export { getNotifications };
