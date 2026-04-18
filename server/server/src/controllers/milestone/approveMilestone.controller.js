import mongoose from "mongoose";
import { ApiError, ApiResponse, asyncHandler } from "../../utils/index.js";
import { Milestone, Job } from "../../models/index.js";

export const approveMilestone = asyncHandler(async (req, res) => {
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

    // Only client can approve milestones
    if (project.postedBy.toString() !== userId) {
        throw new ApiError(401, false, "Only project client can approve milestones");
    }

    // Check if milestone is in completed status
    if (milestone.status !== "completed") {
        throw new ApiError(
            400,
            false,
            "Only completed milestones can be approved"
        );
    }

    // Update milestone status
    milestone.status = "approved";
    milestone.approvedAt = new Date();
    milestone.rejectionReason = null; // Clear any previous rejection reason
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
                "Milestone approved successfully",
                milestone
            )
        );
});
