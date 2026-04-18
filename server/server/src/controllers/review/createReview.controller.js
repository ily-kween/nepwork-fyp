import { Review, Job, User } from "../../models/index.js";
import asyncHandler from "../../utils/asyncHandler.js";
import ApiError from "../../utils/ApiError.js";
import ApiResponse from "../../utils/ApiResponse.js";

export const createReview = asyncHandler(async (req, res) => {
    const { project_id, rating, review_text } = req.body;
    const reviewer_id = req.user._id;

    // Validate input
    if (!project_id || !rating) {
        throw new ApiError(400, "Project ID and rating are required");
    }

    if (rating < 1 || rating > 5) {
        throw new ApiError(400, "Rating must be between 1 and 5");
    }

    // Check if project exists
    const project = await Job.findById(project_id);
    if (!project) {
        throw new ApiError(404, "Project not found");
    }

    // Verify project is completed or paid
    if (!["completed", "paid"].includes(project.status)) {
        throw new ApiError(400, "Can only review completed or paid projects");
    }

    // Only allow clients (project poster) to review freelancers
    const isClient = project.postedBy.toString() === reviewer_id.toString();
    const isFreelancer = project.acceptedFreelancer?.toString() === reviewer_id.toString();

    if (!isClient) {
        throw new ApiError(403, "Only the client can leave reviews for freelancers");
    }

    if (!project.acceptedFreelancer) {
        throw new ApiError(400, "No freelancer assigned to this project");
    }

    // Check if review already exists for this project
    const existingReview = await Review.findOne({ 
        project_id,
        client_id: reviewer_id,
        freelancer_id: project.acceptedFreelancer
    });
    
    if (existingReview) {
        throw new ApiError(400, "You have already reviewed this freelancer for this project");
    }

    // Client reviewing freelancer
    const freelancer = await User.findById(project.acceptedFreelancer);
    if (!freelancer) {
        throw new ApiError(404, "Freelancer not found");
    }

    const reviewData = {
        project_id,
        client_id: reviewer_id,
        freelancer_id: project.acceptedFreelancer,
        rating,
        review_text: review_text || "",
    };

    // Create review
    const review = await Review.create(reviewData);

    const populatedReview = await review.populate([
        { path: "client_id", select: "name avatar" },
        { path: "freelancer_id", select: "name avatar" },
        { path: "project_id", select: "title" },
    ]);

    res.status(201).json(
        new ApiResponse(201, true, true, "Review submitted successfully! Thank you for your feedback.", populatedReview)
    );
});
