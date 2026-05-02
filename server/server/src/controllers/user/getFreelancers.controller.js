import mongoose from "mongoose";
import { User, Job } from "../../models/index.js";
import { ApiResponse, asyncHandler } from "../../utils/index.js";
import { rankFreelancersForJobs } from "../../utils/recommendation.js";

export const getFreelancers = asyncHandler(async (req, res) => {
    const userId = (req.query.userId ?? req.body.userId ?? "").trim();

    if (userId && mongoose.isValidObjectId(userId)) {
        const freelancers = await fetchRelevantFreelancers(userId);
        return res
            .status(200)
            .json(
                new ApiResponse(
                    200,
                    true,
                    false,
                    "Fetched relevant freelancers",
                    freelancers,
                ),
            );
    }

    // if userId not provided send all freelancers
    const ranFreelancers = await User.find({ role: "freelancer" }).select(
        "name avatar _id rating available hourlyRate kycVerified tags about",
    );
    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                true,
                false,
                "Fetched all freelancers",
                ranFreelancers,
            ),
        );
});
async function fetchRelevantFreelancers(userId) {
    const clientJobs = await Job.find({ postedBy: userId, status: { $in: ["open", "contract_pending"] } })
        .select("title tags hourlyRate createdAt status")
        .sort({ createdAt: -1 })
        .limit(10);

    const freelancers = await User.find({ role: "freelancer" }).select(
        "name avatar _id rating available hourlyRate kycVerified tags about",
    );

    return rankFreelancersForJobs(freelancers, clientJobs).map((freelancer) => ({
        ...freelancer,
        recommendationScore: freelancer.recommendation?.recommendationScore || 0,
        recommendation: freelancer.recommendation,
    }));
}
