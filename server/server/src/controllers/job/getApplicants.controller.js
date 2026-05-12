import { JobApplication, Job } from "../../models/index.js";
import { ApiResponse, asyncHandler } from "../../utils/index.js";
import { scoreJobForFreelancer } from "../../utils/recommendation.js";

export const getApplicants = asyncHandler(async (req, res) => {
    const { jobId } = req.params;

    const job = await Job.findById(jobId);
    if (!job) {
        return res.status(404).json(new ApiResponse(404, false, true, "Job not found"));
    }

    const jobApplicants = await JobApplication.find({ appliedTo: jobId })
        .select("-appliedTo -updatedAt -__v")
        .populate({ 
            path: "appliedBy", 
            select: "avatar name tags hourlyRate rating available kycVerified" 
        });

    // Calculate match score for each applicant
    const applicantsWithScores = jobApplicants.map(app => {
        const applicant = app.toObject();
        const freelancer = applicant.appliedBy;
        
        if (freelancer) {
            const recommendation = scoreJobForFreelancer({ job, freelancer });
            applicant.recommendationScore = recommendation.recommendationScore;
            applicant.matchReasons = recommendation.matchReasons;
        } else {
            applicant.recommendationScore = 0;
            applicant.matchReasons = [];
        }
        
        return applicant;
    }).sort((a, b) => b.recommendationScore - a.recommendationScore);

    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                true,
                false,
                "Jobs applicants fetched with match scores",
                applicantsWithScores,
            ),
        );
});
