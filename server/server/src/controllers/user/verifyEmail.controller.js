import { User, Otp } from "../../models/index.js";
import { ApiResponse, ApiError, asyncHandler } from "../../utils/index.js";

export const verifyEmail = asyncHandler(async (req, res) => {
    const data = req.body;
    const email = (data.email || "").trim().toLowerCase();
    let otpCode = data.otpCode || Number();

    otpCode = Number(otpCode);

    if (!email) {
        return res
            .status(400)
            .json(
                new ApiError(
                    400,
                    true,
                    "Email is required for email verification",
                ),
            );
    }

    if (email !== req.user.email) {
        return res
            .status(400)
            .json(
                new ApiError(
                    400,
                    true,
                    "Email doesn't matches with linked email",
                ),
            );
    }

    if (!otpCode) {
        return res
            .status(400)
            .json(new ApiError(400, true, "Please provide OTP"));
    }

    const otp = await Otp.findOne({ email });

    if (!otp) {
        return res
            .status(400)
            .json(
                new ApiError(
                    400,
                    true,
                    "OTP expired or has not been requested, try again",
                ),
            );
    }

    if (otpCode !== otp.otpCode) {
        return res.status(400).json(new ApiError(400, true, "Invalid OTP"));
    }

    const user = await User.findOne({ email });

    if (!user) {
        return res
            .status(400)
            .json(new ApiError(500, false, "User not found to verify email"));
    }

    if (user.emailVerified) {
        return res
            .status(400)
            .json(new ApiError(400, true, "Email was already verified"));
    }

    // * verify email after validations
    user.emailVerified = true;
    await user.save();

    // * delete otp after use
    await otp.deleteOne();

    return res.status(200).json(
        new ApiResponse(200, true, true, "Email verified successfully", {
            email,
        }),
    );
});
