import mongoose from "mongoose";
import { ApiError, ApiResponse, asyncHandler } from "../../utils/index.js";
import { Milestone, Job } from "../../models/index.js";

export const getMilestoneById = asyncHandler(async (req, res) => {
    const { milestoneId } = req.params;
    const userId = req.user.id;

    if (!mongoose.isValidObjectId(milestoneId)) {
        throw new ApiError(400, false, "Invalid milestoneId");
    }

    const milestone = await Milestone.findById(milestoneId)
        .populate("projectId")
        .populate("createdBy", "name avatar");

    if (!milestone) {
        throw new ApiError(404, false, "Milestone not found");
    }

    // Check if user has access to this milestone
    const project = milestone.projectId;
    if (
        project.postedBy.toString() !== userId &&
        project.acceptedFreelancer?.toString() !== userId
    ) {
        throw new ApiError(401, false, "You do not have access to this milestone");
    }

    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                true,
                false,
                "Milestone fetched successfully",
                milestone
            )
        );
});
