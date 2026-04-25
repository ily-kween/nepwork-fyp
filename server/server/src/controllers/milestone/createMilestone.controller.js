import mongoose from "mongoose";
import { ApiError, ApiResponse, asyncHandler } from "../../utils/index.js";
import { Milestone, Job } from "../../models/index.js";

export const createMilestone = asyncHandler(async (req, res) => {
    const { projectId, title, description, amount, deadline, order } = req.body;
    const userId = req.user.id;

    // Validate input
    if (!projectId || !title || !description || !amount || !deadline) {
        throw new ApiError(
            400,
            false,
            "Missing required fields: projectId, title, description, amount, deadline"
        );
    }

    if (!mongoose.isValidObjectId(projectId)) {
        throw new ApiError(400, false, "Invalid projectId");
    }

    // Check if project exists
    const project = await Job.findById(projectId);
    if (!project) {
        throw new ApiError(404, false, "Project not found");
    }

    // Only the assigned freelancer can create milestones
    if (project.acceptedFreelancer?.toString() !== userId) {
        throw new ApiError(401, false, "Only assigned freelancer can create milestones");
    }

    if (!["assigned", "in_progress", "pending_review", "completed", "paid"].includes(project.status)) {
        throw new ApiError(400, false, "Milestones can only be created once the project is assigned");
    }

    // Create milestone
    const milestone = new Milestone({
        projectId,
        title,
        description,
        amount,
        deadline: new Date(deadline),
        createdBy: userId,
        order: order || 0,
        status: "pending",
        paymentStatus: "pending_payment",
    });

    await milestone.save();

    return res
        .status(201)
        .json(
            new ApiResponse(
                201,
                true,
                false,
                "Milestone created successfully",
                milestone
            )
        );
});
