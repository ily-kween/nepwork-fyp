import mongoose from "mongoose";
import { ApiError, ApiResponse, asyncHandler } from "../../utils/index.js";
import { Milestone, Job } from "../../models/index.js";

export const getMilestones = asyncHandler(async (req, res) => {
    const { projectId } = req.params;
    const userId = req.user.id;

    if (!mongoose.isValidObjectId(projectId)) {
        throw new ApiError(400, false, "Invalid projectId");
    }

    // Check if user has access to this project
    const project = await Job.findById(projectId);
    if (!project) {
        throw new ApiError(404, false, "Project not found");
    }

    // Check if user is client or assigned freelancer
    if (
        project.postedBy.toString() !== userId &&
        project.acceptedFreelancer?.toString() !== userId
    ) {
        throw new ApiError(401, false, "You do not have access to this project");
    }

    // Get all milestones for the project, sorted by order
    const milestones = await Milestone.find({ projectId })
        .populate("createdBy", "name avatar")
        .sort({ order: 1, createdAt: 1 });

    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                true,
                false,
                "Milestones fetched successfully",
                milestones
            )
        );
});
