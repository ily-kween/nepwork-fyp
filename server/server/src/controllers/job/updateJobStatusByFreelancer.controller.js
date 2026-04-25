import mongoose from "mongoose";
import { Job } from "../../models/index.js";
import { ApiError, ApiResponse, asyncHandler, sendNotification } from "../../utils/index.js";

export const updateJobStatusByFreelancer = asyncHandler(async (req, res) => {
    const { jobId } = req.params;
    const { status, progress, message } = req.body;
    const userId = req.user._id;

    if (!mongoose.isValidObjectId(jobId)) {
        throw new ApiError(400, true, "Invalid job id");
    }

    const job = await Job.findById(jobId);
    if (!job) {
        throw new ApiError(404, true, "Job not found");
    }

    if (job.acceptedFreelancer.toString() !== userId.toString()) {
        throw new ApiError(403, true, "Only the assigned freelancer can update this job");
    }

    if (!job.contract?.initialPaymentDone || job.contract?.status !== "active") {
        throw new ApiError(400, true, "Contract approval and initial payment must be completed before work starts");
    }

    let notificationTitle = "";
    let notificationMessage = "";
    let notificationType = "";

    if (status) {
        if (status === "in_progress" && job.status === "assigned") {
            job.status = "in_progress";
            job.startTime = Date.now();
            notificationTitle = "Job Started";
            notificationMessage = "The freelancer has started working on your project.";
            notificationType = "job_started";
        } else if (status === "pending_review" && job.status === "in_progress") {
            job.status = "pending_review";
            job.endTime = Date.now();
            notificationTitle = "Job Completed";
            notificationMessage = "The freelancer has completed the project. Please review the work.";
            notificationType = "job_completed";
        } else {
            throw new ApiError(400, true, `Invalid status transition from ${job.status} to ${status}`);
        }
    }

    if (progress !== undefined) {
        job.progress = progress;
        if (!notificationTitle) {
            notificationTitle = "Progress Update";
            notificationMessage = `The freelancer has updated progress on "${job.title}": ${progress}% ${message ? `(${message})` : ""}`;
            notificationType = "progress_update";
        }
    }

    await job.save();

    if (notificationTitle) {
        await sendNotification({
            receiverId: job.postedBy,
            senderId: userId,
            projectId: job._id,
            title: notificationTitle,
            message: notificationMessage,
            type: notificationType,
            link: `/jobs/${job._id}`
        });
    }

    return res.status(200).json(
        new ApiResponse(200, true, true, "Job updated successfully", job)
    );
});
