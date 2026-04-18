import mongoose from "mongoose";
import { tags } from "../../constants.js";
import { Job } from "../../models/index.js";
import { ApiError, ApiResponse, asyncHandler } from "../../utils/index.js";

const calculateWorkedTimeInSec = (start, end) => {
    if (!start || !end) return 0;

    const startDate = new Date(start);
    const endDate = new Date(end);

    const diff = (endDate.getTime() - startDate.getTime()) / 1000;
    const seconds = Math.floor(diff);

    return seconds;
};
const calculateAmountToPay = (hourlyRate, workedTimeInSec) => {
    if (!hourlyRate || !workedTimeInSec) return null;

    const rateInSec = hourlyRate / 3600;
    const amount = Math.ceil(rateInSec * workedTimeInSec);

    return amount;
};

const validateTags = (sentTags) => {
    for (let i = 0; i < sentTags.length; i++) {
        if (!tags.includes(sentTags[i])) {
            return false;
        }
    }
    return true;
};

export const updateJob = asyncHandler(async (req, res) => {
    const data = req.body;

    const userId = req.user._id;
    const jobId = (req.body.id ?? "").trim();
    const jobTitle = (data.title ?? "").trim();
    const jobDescription = (data.description ?? "").trim();
    const hourlyRate = Number(data.rate);
    const jobTags = data.tags ?? [];
    const status = data.status;

    if (!jobId) throw new ApiError(400, true, "Job id is required");
    if (!mongoose.isValidObjectId(jobId))
        throw new ApiError(400, true, "Invalid job id");

    if (!jobTitle) throw new ApiError(400, true, "Job title is required");
    if (!jobDescription)
        throw new ApiError(400, true, "Job description is required");

    if (!status) throw new ApiError(400, true, "Status is required");

    // validating tags
    if (!Array.isArray(jobTags))
        throw new ApiError(400, true, "Invalid tags format, send in array");
    if (jobTags.length == 0)
        throw new ApiError(400, true, "Atleast one tag is required");
    if (!validateTags(jobTags))
        throw new ApiError(400, true, "Tags contains invalid tags");

    if (!data.rate) throw new ApiError(400, true, "Hourly rate is required");
    if (isNaN(hourlyRate) || hourlyRate <= 0)
        throw new ApiError(
            400,
            true,
            "Invalid hourly rate, must be a positive number",
        );

    const job = await Job.findOne({ _id: jobId, postedBy: userId });
    if (!job) throw new ApiError(400, true, "Job not found");

    if (job.status === "finished") {
        throw new ApiError(400, true, "Cannot update finished job");
    }

    if (
        job.acceptedFreelancer &&
        (jobTitle !== job.title ||
            hourlyRate !== job.hourlyRate ||
            jobDescription !== job.description ||
            JSON.stringify(jobTags) !== JSON.stringify(job.tags))
    ) {
        throw new ApiError(
            400,
            true,
            "Can only update job status once freelancer is selected",
        );
    }

    // job status validation
    if (status === "open" && job.status !== "closed") {
        throw new ApiError(
            400,
            true,
            "Can only set job status to open if job is closed",
        );
    }

    if (status === "closed" && job.status !== "open") {
        throw new ApiError(
            400,
            true,
            "Can only set job status to close if job is open",
        );
    }
    if (status === "closed" && job.acceptedFreelancer) {
        throw new ApiError(
            400,
            true,
            "Cannot close job after selecting freelancer",
        );
    }

    if (
        status === "in_progress" &&
        (job.status !== "open" || !job.acceptedFreelancer)
    ) {
        throw new ApiError(
            400,
            true,
            "Job must be open and have selected freelancer to set 'In Progress'",
        );
    }

    if (status === "finished" && job.status !== "in_progress") {
        throw new ApiError(
            400,
            true,
            "Job must be in progress before can be finished",
        );
    }

    if (status === "in_progress") {
        job.startTime = Date.now();
    }

    if (status === "finished") {
        const date = Date.now();
        job.endTime = date;
        job.hasFinished = true;
        job.workedTimeInSec = calculateWorkedTimeInSec(job.startTime, date);
        job.payment.amount = calculateAmountToPay(
            job.hourlyRate,
            job.workedTimeInSec,
        );
    }

    job.description = jobDescription;
    job.hourlyRate = hourlyRate;
    job.tags = jobTags;
    job.status = status;
    await job.save();

    return res
        .status(200)
        .json(
            new ApiResponse(200, true, true, `Job updated: ${job.title}`, job),
        );
});
