import { ApiResponse, asyncHandler } from "../../utils/index.js";
import { Job, User } from "../../models/index.js";
import mongoose from "mongoose";
import { rankJobsForFreelancer } from "../../utils/recommendation.js";

export const getHomePageJobs = asyncHandler(async (req, res) => {
    const userId = req.query.userId ?? req.body.userId ?? "";

    // if userId not provided send all jobs
    if (!userId) {
        const jobs = await Job.find({ status: "open" })
            .select("-applications -acceptedFreelancer")
            .populate({
                path: "postedBy",
                select: "name avatar _id",
            })
            .sort({ createdAt: -1 });
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
        const freelancer = await User.findById(userId).select("tags hourlyRate rating available kycVerified role");

        const jobs = await Job.find({ status: "open", postedBy: { $ne: userId } }).populate({
            path: "postedBy",
            select: "name avatar _id rating",
        }).sort({ createdAt: -1 });
        if (!freelancer || freelancer.role !== "freelancer") {
            return jobs;
        }

        return rankJobsForFreelancer(jobs, freelancer).map((job) => ({
            ...job,
            recommendationScore: job.recommendation?.recommendationScore || 0,
            recommendation: job.recommendation,
        }));
    }
});
