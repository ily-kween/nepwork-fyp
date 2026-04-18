import mongoose from "mongoose";
import { User } from "../../models/user.model.js";
import { ApiResponse, asyncHandler } from "../../utils/index.js";

export const getFreelancers = asyncHandler(async (req, res) => {
    const userId = (req.body.userId ?? "").trim();

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
    // TODO: send only relevant freelancers
    const users = await User.find({ role: "freelancer" }).select(
        "name avatar _id rating available hourlyRate kycVerified",
    );
    return users;
}
