import { JobApplication } from "../../models/index.js";
import { ApiResponse, asyncHandler } from "../../utils/index.js";

export const getApplicants = asyncHandler(async (req, res) => {
    const { jobId } = req.params;

    const jobApplicants = await JobApplication.find({ appliedTo: jobId })
        .select("-appliedTo -_id  -updatedAt -__v")
        .populate({ path: "appliedBy", select: "avatar name " });

    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                true,
                false,
                "Jobs applicants fetched",
                jobApplicants,
            ),
        );
});
