import mongoose from "mongoose";
import { User } from "../../models/user.model.js";
import { ApiError, ApiResponse, asyncHandler } from "../../utils/index.js";
import { tags } from "../../constants.js";

const validateTags = (sentTags) => {
    for (let i = 0; i < sentTags.length; i++) {
        if (!tags.includes(sentTags[i])) {
            return false;
        }
    }
    return true;
};

export const getProfileData = asyncHandler(async (req, res) => {
    const { userId } = req.params;

    if (!userId) throw new ApiError(400, false, "userId is required");

    if (!mongoose.isValidObjectId(userId))
        throw new ApiError(400, false, "Invalid userId");

    const userProfileData = await User.findById(userId)
        .select(
            "-password -refreshToken -lastRoleChange -kycStatus -email -emailVerified -updatedAt -__v -jobsApplied",
        )
        .populate({ path: "kyc", select: "address.temporary" });

    if (!userProfileData) throw new ApiError(404, false, "User not found");

    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                true,
                false,
                `${userProfileData.name.firstName} profile data fetched`,
                userProfileData,
            ),
        );
});

export const updateProfileTags = asyncHandler(async (req, res) => {
    const userId = req.user.id;

    const newTags = req.body.newTags ?? [];

    if (newTags.length === 0)
        throw new ApiError(400, true, "Please provide newTags");

    if (!Array.isArray(newTags))
        throw new ApiError(400, true, "typeof newTagsshould be an array");

    if (!validateTags(newTags))
        throw new ApiError(400, true, "newTags contains invalid tag");

    const user = await User.findById(userId);

    user.tags = newTags;
    await user.save();

    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                true,
                true,
                `${user.name.firstName} tags updated`,
                newTags,
            ),
        );
});

export const updateAbout = asyncHandler(async (req, res) => {
    const userId = req.user.id;

    const newAbout = req.body.newAbout ?? "";

    if (!newAbout) throw new ApiError(400, true, "newAbout is required");

    const user = await User.findById(userId);

    user.about = newAbout;
    await user.save();

    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                true,
                true,
                `${user.name.firstName} about updated`,
                { newAbout: user.about },
            ),
        );
});

export const updateHourlyRate = asyncHandler(async (req, res) => {
    const userId = req.user.id;

    const newHourlyRate = req.body.newHourlyRate ?? 0;

    if (!newHourlyRate)
        throw new ApiError(400, true, "newHourlyrate is required");

    if (isNaN(newHourlyRate))
        throw new ApiError(
            400,
            true,
            "Invalid newHourlyRate, it should be number",
        );

    const user = await User.findById(userId);

    user.hourlyRate = newHourlyRate;
    await user.save();

    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                true,
                true,
                `${user.name.firstName} hourly rate updated`,
                { newHourlyRate },
            ),
        );
});
