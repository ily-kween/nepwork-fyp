import mongoose from "mongoose";
import { ApiError, ApiResponse, asyncHandler } from "../../utils/index.js";
import { Milestone, Job } from "../../models/index.js";

export const deleteMilestone = asyncHandler(async (req, res) => {
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

    // Only assigned freelancer can delete milestones
    if (project.acceptedFreelancer?.toString() !== userId) {
        throw new ApiError(401, false, "Only assigned freelancer can delete milestones");
    }

    // Cannot delete submitted or approved milestones
    if (["completed", "approved"].includes(milestone.status)) {
        throw new ApiError(400, false, "Cannot delete submitted or approved milestones");
    }

    await Milestone.findByIdAndDelete(milestoneId);

    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                true,
                false,
                "Milestone deleted successfully",
                {}
            )
        );
});
