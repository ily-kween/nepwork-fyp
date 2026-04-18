import mongoose from "mongoose";
import { Kyc, User } from "../../models/index.js";
import { asyncHandler, ApiError, ApiResponse } from "../../utils/index.js";

export const updateKycStatus = asyncHandler(async (req, res) => {
    const kycId = req.params.id;
    const status = (req.body.status ?? "").trim();
    const failedReason = (req.body.failedReason ?? "").trim();

    if (!mongoose.isValidObjectId(kycId)) {
        throw new ApiError(400, true, "Invalid kyc id");
    }

    if (!status) throw new ApiError(400, true, "Status not provided");

    if (status !== "pending" && status !== "verified" && status !== "failed")
        throw new ApiError(
            400,
            true,
            "Invalid status, should be pending, verified or failed",
        );

    if (status === "failed" && !failedReason)
        throw new ApiError(
            400,
            true,
            "Status is failed but reason not provided",
        );

    const kyc = await Kyc.findById(kycId);

    if (!kyc) throw new ApiError(404, true, "Kyc not found");

    // updating from kyc doc
    kyc.status = status;
    kyc.failedReason = status === "failed" ? failedReason : "";
    await kyc.save();

    // updating form user doc
    const user = await User.findById(kyc.user);
    user.kycStatus = status;
    user.kycVerified = status === "verified";
    await user.save();

    return res.status(200).json(
        new ApiResponse(200, true, true, `Kyc status updated ${kyc.status}`, {
            status: kyc.status,
            reason: kyc.failedReason,
        }),
    );
});
