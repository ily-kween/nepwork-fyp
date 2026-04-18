import { Review, Job } from "../../models/index.js";
import asyncHandler from "../../utils/asyncHandler.js";
import ApiError from "../../utils/ApiError.js";
import ApiResponse from "../../utils/ApiResponse.js";

export const checkReviewStatus = asyncHandler(async (req, res) => {
    const { projectId } = req.params;
    const user_id = req.user._id;

    // Validate project ID
    if (!projectId) {
        throw new ApiError(400, "Project ID is required");
    }

    // Check if project exists
    const project = await Job.findById(projectId);
    if (!project) {
        throw new ApiError(404, "Project not found");
    }

    // Verify user is the project owner (client)
    const isClient = project.postedBy.toString() === user_id.toString();
    const isFreelancer = project.acceptedFreelancer?.toString() === user_id.toString();

    if (!isClient && !isFreelancer) {
        throw new ApiError(403, "Only project owner or accepted freelancer can check review status");
    }

    // Check if project is completed or paid (eligible for review)
    const isCompleted = ["completed", "paid"].includes(project.status);
    const isPaid = project.status === "paid";

    // Only clients can review freelancers - check for client reviews only
    let hasReview = false;
    let existingReview = null;

    if (isClient) {
        // Client checking if they reviewed the freelancer
        existingReview = await Review.findOne({ 
            project_id: projectId,
            client_id: user_id,
            freelancer_id: project.acceptedFreelancer
        });
        hasReview = !!existingReview;
    }

    res.status(200).json(
        new ApiResponse(
            200,
            true,
            true,
            "Review status fetched successfully",
            {
                canReview: isClient && isCompleted && !hasReview,
                isCompleted,
                isPaid,
                hasReview,
                isClient,
                isFreelancer,
                reviewedUser: project.acceptedFreelancer,
            }
        )
    );
});
