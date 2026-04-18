import { ApiResponse, asyncHandler } from "../../utils/index.js";
import { Job } from "../../models/job.model.js";
import mongoose from "mongoose";

export const getHomePageJobs = asyncHandler(async (req, res) => {
    const userId = req.body.userId ?? "";

    // if userId not provided send all jobs
    if (!userId) {
        const jobs = await Job.find({ status: "open" })
            .select("-applications -acceptedFreelancer")
            .populate({
                path: "postedBy",
                select: "name avatar _id",
            });
        return res
            .status(200)
            .json(new ApiResponse(200, true, false, "fetched all jobs", jobs));
    }

    if (userId && mongoose.isValidObjectId(userId)) {
        const jobs = await getRecommendedJobs(userId);

        return res
            .status(200)
            .json(
                new ApiResponse(
                    200,
                    true,
                    false,
                    `Fetched jobs for ${userId}`,
                    jobs,
                ),
            );
    }

    // TODO: send jobs that would be more relevent if userId is provided
    async function getRecommendedJobs(userId) {
        const jobs = await Job.find({ status: "open" }).populate({
            path: "postedBy",
            select: "name avatar _id",
        });
        return jobs;
    }
});
