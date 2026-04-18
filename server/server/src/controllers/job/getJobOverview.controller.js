import mongoose from "mongoose";
import { ApiError, ApiResponse, asyncHandler } from "../../utils/index.js";
import { Job } from "../../models/index.js";
import { acceptFreelancer } from "./acceptFreelancer.controller.js";

const calculateWorkedTimeInSec = (start, end) => {
    if (!start || !end) return 0;

    const startDate = new Date(start);
    const endDate = new Date(end);

    const diff = (endDate.getTime() - startDate.getTime()) / 1000;
    const seconds = Math.floor(diff);

    return seconds;
};

export const getJobOverview = asyncHandler(async (req, res) => {
    const { jobId } = req.params;
    const userId = req.user.id;

    if (!mongoose.isValidObjectId(jobId)) {
        throw new ApiError(400, false, "Invalid jobId");
    }

    const job = await Job.findOne({
        _id: jobId,
        $or: [{ postedBy: userId }, { acceptedFreelancer: userId }],
    });

    if (!job) {
        throw new ApiError(404, false, "Job not found");
    }

    if (
        userId !== job.postedBy.toString() &&
        userId !== job.acceptedFreelancer.toString()
    ) {
        throw new ApiError(401, false, "You do not have access");
    }

    const overview = {
        workStartedAt: job.startTime,
        workEndedAt: job.endTime,
        finished: job.hasFinished,
        rate: job.hourlyRate,
        workedTimeInSec: job.endTime
            ? job.workedTimeInSec
            : job.startTime
              ? calculateWorkedTimeInSec(job.startTime, Date.now())
              : 0,
        payment: job.payment,
        jobStatus: job.status,
    };

    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                true,
                false,
                `Fetched job overview of ${jobId}`,
                overview,
            ),
        );
});
