import mongoose from "mongoose";
import { Job } from "../../models/index.js";
import { ApiError, ApiResponse, asyncHandler, sendNotification } from "../../utils/index.js";

export const reviewJobByClient = asyncHandler(async (req, res) => {
    const { jobId } = req.params;
    const { status } = req.body; // should be 'completed'
    const userId = req.user._id;

    if (!mongoose.isValidObjectId(jobId)) {
        throw new ApiError(400, true, "Invalid job id");
    }

    const job = await Job.findById(jobId);
    if (!job) {
        throw new ApiError(404, true, "Job not found");
    }

    if (job.postedBy.toString() !== userId.toString()) {
        throw new ApiError(403, true, "Only the project owner can review this work");
    }

    if (status === "completed" && job.status === "pending_review") {
        job.status = "completed";
        job.hasFinished = true;
        
        // Calculate worked time if not already done
        if (job.startTime && job.endTime) {
             const diff = (new Date(job.endTime).getTime() - new Date(job.startTime).getTime()) / 1000;
             job.workedTimeInSec = Math.floor(diff);
             
             // Calculate payment amount based on hourly rate (precise to the second)
             const hours = job.workedTimeInSec / 3600;
             job.payment.amount = Math.round(hours * job.hourlyRate);
             
             // Ensure at least 1 unit if worked
             if (job.payment.amount < 1 && job.workedTimeInSec > 0) {
                 job.payment.amount = 1; 
             }
        }

        await job.save();

        await sendNotification({
            receiverId: job.acceptedFreelancer,
            senderId: userId,
            projectId: job._id,
            title: "Project Approved",
            message: "The client has approved your work and marked the project as completed.",
            type: "job_completed",
            link: `/jobs/${job._id}`
        });

        return res.status(200).json(
            new ApiResponse(200, true, true, "Project approved and marked as completed", job)
        );
    } else {
        throw new ApiError(400, true, "Invalid status transition. Project must be in 'pending_review' state.");
    }
});
