import mongoose from "mongoose";
import { Kyc } from "../../models/kyc.model.js";
import { ApiResponse, ApiError, asyncHandler } from "../../utils/index.js";

export const getKycById = asyncHandler(async (req, res) => {
    const kycId = req.params.id;

    if (!mongoose.isValidObjectId(kycId)) {
        throw new ApiError(400, true, "Invalid kyc id");
    }

    const kyc = await Kyc.findById(kycId);

    if (!kyc) throw new ApiError(404, true, "Kyc not found");

    return res
        .status(200)
        .json(new ApiResponse(200, true, true, `Fetched kyc ${kyc._id}`, kyc));
});
