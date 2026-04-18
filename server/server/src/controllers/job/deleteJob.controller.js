import mongoose from "mongoose";
import { ApiError, ApiResponse, asyncHandler } from "../../utils/index.js";
import { Job } from "../../models/job.model.js";

export const deleteJob = asyncHandler(async (req, res) => {
    const { jobId } = req.params;

    if (!mongoose.isValidObjectId(jobId)) {
        throw new ApiError(400, true, "Invalid job id");
    }

    const job = await Job.findOne({
        _id: jobId,
        postedBy: req.user.id,
    });

    if (!job) throw new ApiError(400, true, "Job not found");

    if (job.status !== "closed") {
        throw new ApiError(400, true, "Job can only be deleted if closed");
    }

    await job.deleteOne();

    return res
        .status(200)
        .json(
            new ApiResponse(200, true, true, "Job deleted", { deleted: true }),
        );
});
