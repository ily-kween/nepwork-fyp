import mongoose from "mongoose";
import { ApiError, ApiResponse, asyncHandler, sendNotification } from "../../utils/index.js";
import { Job, User } from "../../models/index.js";

export const inviteFreelancer = asyncHandler(async (req, res) => {
    const { jobId } = req.params;
    const { freelancerId } = req.body;
    const userId = req.user.id;

    if (!mongoose.isValidObjectId(jobId)) {
        throw new ApiError(400, true, "Invalid job id");
    }

    if (!mongoose.isValidObjectId(freelancerId)) {
        throw new ApiError(400, true, "Invalid freelancer id");
    }

    const job = await Job.findById(jobId);
    if (!job) {
        throw new ApiError(404, true, "Job not found");
    }

    if (job.postedBy?.toString() !== userId) {
        throw new ApiError(403, true, "Only the project client can invite freelancers");
    }

    const freelancer = await User.findOne({ _id: freelancerId, role: "freelancer" });
    if (!freelancer) {
        throw new ApiError(404, true, "Freelancer not found");
    }

    await sendNotification({
        receiverId: freelancer._id,
        senderId: userId,
        projectId: job._id,
        title: "Project Invitation",
        message: `You have been invited to review the project \"${job.title}\".`,
        type: "new_project",
        link: `/jobs/${job._id}`,
    });

    return res.status(200).json(
        new ApiResponse(200, true, true, "Freelancer invited successfully", {
            jobId: job._id,
            freelancerId: freelancer._id,
        }),
    );
});
