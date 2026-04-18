import { Kyc } from "../../models/kyc.model.js";
import { ApiResponse, asyncHandler } from "../../utils/index.js";

export const getAllKyc = asyncHandler(async (_, res) => {
    const kycs = await Kyc.find();

    return res
        .status(200)
        .json(new ApiResponse(200, true, true, "Fetched all kyc", kycs));
});
