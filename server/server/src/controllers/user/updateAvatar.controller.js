import { ApiResponse, asyncHandler, cloudinary } from "../../utils/index.js";
import fs from "fs";
import { User } from "../../models/user.model.js";

export const updateAvatar = asyncHandler(async (req, res) => {
    const newAvatarPath = await req.file.path;
    let avatarUrl;

    if (!newAvatarPath)
        throw new ApiResponse(
            400,
            true,
            "Something went wrong while avatar was uploading, Try again",
        );

    try {
        const response = await cloudinary.uploader.upload(newAvatarPath);
        avatarUrl = response.url;

        fs.unlink(newAvatarPath, (err) => {
            if (err) {
                console.log(
                    "Error removing new avatar from local system after uploading to cloudinary",
                );
            } else {
                console.log(
                    "Removed new avatar from local system after uploading to cloudinary",
                );
            }
        });
    } catch (error) {
        fs.unlink(newAvatarPath, (err) => {
            if (err) {
                console.log(
                    "Error removing new avatar from local system after failed to upload to cloudinary",
                );
            } else {
                console.log(
                    "Removed new avatar from local system after uploading to cloudinary",
                );
            }
        });
    }
    const user = await User.findById(req.user.id);
    user.avatar = avatarUrl;
    await user.save();

    return res
        .status(200)
        .json(new ApiResponse(200, true, true, `avatar updated`, user.avatar));
});
