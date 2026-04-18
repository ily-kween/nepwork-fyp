import mongoose from "mongoose";
import { ApiError, ApiResponse, asyncHandler } from "../../utils/index.js";
import { Milestone, Job } from "../../models/index.js";

export const completeMilestone = asyncHandler(async (req, res) => {
    const { milestoneId } = req.params;
    const userId = req.user.id;

    if (!mongoose.isValidObjectId(milestoneId)) {
        throw new ApiError(400, false, "Invalid milestoneId");
    }

    const milestone = await Milestone.findById(milestoneId).populate("projectId");
    if (!milestone) {
        throw new ApiError(404, false, "Milestone not found");
    }

    const project = milestone.projectId;

    // Only assigned freelancer can mark milestone as completed
    if (project.acceptedFreelancer?.toString() !== userId) {
        throw new ApiError(401, false, "Only assigned freelancer can mark milestone as completed");
    }

    // Check if milestone is in pending or in_progress status
    if (!["pending", "in_progress", "rejected"].includes(milestone.status)) {
        throw new ApiError(
            400,
            false,
            "Milestone is already in completed, approved status or cannot be updated"
        );
    }

    // Update milestone status
    milestone.status = "completed";
    milestone.completedAt = new Date();
    await milestone.save();

    // Populate fields for response
    await milestone.populate("createdBy", "name avatar");

    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                true,
                false,
                "Milestone marked as completed successfully",
                milestone
            )
        );
});
