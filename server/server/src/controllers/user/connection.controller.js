import mongoose from "mongoose";
import { ApiError, ApiResponse, asyncHandler } from "../../utils/index.js";
import { User } from "../../models/user.model.js";

export const followUser = asyncHandler(async (req, res) => {
    const { targetId } = req.params;
    const userId = req.user.id;

    if (!mongoose.isValidObjectId(targetId))
        throw new ApiError(400, true, "Invalid targetId");

    if (targetId === userId)
        throw new ApiError(400, true, "You cannot follow yourself");

    const targetUser = await User.findById(targetId);
    if (!targetId) throw new ApiError(404, true, "Target user not found");

    const user = await User.findById(userId);

    const alreadyFollowing = user.following.some(
        (follow) => follow.userId.toString() === targetId,
    );

    if (alreadyFollowing)
        throw new ApiError(400, true, "You're already following this user");

    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const curDate = new Date();

        targetUser.followers.push({
            userId: userId,
            at: curDate,
        });

        user.following.push({
            userId: targetId,
            at: curDate,
        });

        await Promise.all([targetUser.save(), user.save()]);

        await session.commitTransaction();
        session.endSession();

        const msgForTarget = `${user.name.firstName} started following you`;
        return res
            .status(200)
            .json(
                new ApiResponse(
                    200,
                    true,
                    true,
                    `Followed user ${targetId} `,
                    null,
                ),
            );
    } catch (error) {
        await session.abortTransaction();
        session.endSession();

        throw new ApiError(500, true, "Failed to follow!, try again");
    }
});

export const unFollowUser = asyncHandler(async (req, res) => {
    const { targetId } = req.params;
    const userId = req.user.id;

    if (!mongoose.isValidObjectId(targetId))
        throw new ApiError(400, true, "Invalid targetId");

    const targetUser = await User.findById(targetId);
    if (!targetUser) throw new ApiError(404, true, "targetUser not found");

    const user = await User.findById(userId);

    const isFollowing = user.following.some(
        (item) => item.userId.toString() === targetId,
    );

    if (!isFollowing)
        throw new ApiError(400, true, "You're not following this user");

    const session = await mongoose.startSession();

    session.startTransaction();

    try {
        user.following.pull({ userId: targetId });
        targetUser.followers.pull({ userId: userId });
        await Promise.all([user.save(), targetUser.save()]);
        await session.commitTransaction();
        session.endSession();
        return res
            .status(200)
            .json(
                new ApiResponse(
                    200,
                    true,
                    true,
                    `You unfollowed ${targetId}`,
                    null,
                ),
            );
    } catch (error) {
        await session.abortTransaction();
        session.endSession();

        throw new ApiError(500, true, "Failed to unfollow!, try again");
    }
});

export const getFollowing = asyncHandler(async (req, res) => {
    const { targetId } = req.params;

    if (!mongoose.isValidObjectId(targetId))
        throw new ApiError(400, false, "Invalid targetId");

    const user = await User.findById(targetId).populate(
        "following.userId",
        "avatar name _id",
    );

    if (!user) throw new ApiError(404, false, "User not found");

    const followingList = user.following;

    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                true,
                false,
                "Following list fetched",
                followingList,
            ),
        );
});

export const getFollowers = asyncHandler(async (req, res) => {
    const { targetId } = req.params;

    if (!mongoose.isValidObjectId(targetId))
        throw new ApiError(400, false, "Invalid targetId");

    const user = await User.findById(targetId).populate(
        "followers.userId",
        "avatar _id name",
    );

    if (!user) throw new ApiError(404, false, "User not found");

    const followersList = user.followers;

    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                true,
                false,
                "Followers list fetched",
                followersList,
            ),
        );
});
