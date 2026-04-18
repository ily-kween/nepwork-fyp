import mongoose from "mongoose";
import { ApiError, ApiResponse, asyncHandler } from "../../utils/index.js";
import { Milestone, Job } from "../../models/index.js";

export const updateMilestone = asyncHandler(async (req, res) => {
    const { milestoneId } = req.params;
    const { title, description, amount, deadline, order } = req.body;
    const userId = req.user.id;

    if (!mongoose.isValidObjectId(milestoneId)) {
        throw new ApiError(400, false, "Invalid milestoneId");
    }

    const milestone = await Milestone.findById(milestoneId).populate("projectId");
    if (!milestone) {
        throw new ApiError(404, false, "Milestone not found");
    }

    const project = milestone.projectId;

    // Only client can update milestones
    if (project.postedBy.toString() !== userId) {
        throw new ApiError(401, false, "Only project client can update milestones");
    }

    // Cannot update completed or approved milestones
    if (["completed", "approved"].includes(milestone.status)) {
        throw new ApiError(
            400,
            false,
            "Cannot update completed or approved milestones"
        );
    }

    // Update fields
    if (title) milestone.title = title;
    if (description) milestone.description = description;
    if (amount) milestone.amount = amount;
    if (deadline) milestone.deadline = new Date(deadline);
    if (order !== undefined) milestone.order = order;

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
                "Milestone updated successfully",
                milestone
            )
        );
});
