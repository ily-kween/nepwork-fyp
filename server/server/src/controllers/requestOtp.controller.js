import {
    ApiResponse,
    ApiError,
    MailService,
    asyncHandler,
} from "../utils/index.js";
import { User, Otp } from "../models/index.js";

export const requestOtp = asyncHandler(async (req, res) => {
    const email = (req.body.email || "").trim().toLowerCase();

    if (!email) {
        return res
            .status(400)
            .json(new ApiError(400, true, "Email not provided for otp"));
    }

    if (email !== req.user.email) {
        return res
            .status(400)
            .json(
                new ApiError(
                    400,
                    true,
                    "Failed, email doesnot match with linked email",
                ),
            );
    }

    const user = await User.findOne({ email });

    if (!user) {
        return res
            .status(404)
            .json(
                new ApiError(404, false, "Failed, No any user with this email"),
            );
    }

    const alreadyCreatedOtp = await Otp.findOne({ email });
    if (alreadyCreatedOtp) {
        return res
            .status(425)
            .json(
                new ApiError(
                    425,
                    true,
                    "Previous OTP has not expired wait to expire before requesting again",
                ),
            );
    }

    const otp = await Otp.create({
        email,
        otpCode: Math.floor(Math.random() * (999999 - 100000 + 1)) + 100000,
        expireAt: new Date(Date.now() + 305 * 1000),
    });

    // * deleting otp after n minutes
    setTimeout(async () => {
        await Otp.findOneAndDelete({ email });
    }, 300000);

    const mailed = await MailService.otpMail(email, otp.otpCode);

    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                true,
                true,
                "OTP for Email verification was sent",
                mailed.response,
            ),
        );
});
