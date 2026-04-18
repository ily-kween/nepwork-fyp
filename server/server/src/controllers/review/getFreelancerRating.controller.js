import { Review } from "../../models/index.js";
import asyncHandler from "../../utils/asyncHandler.js";
import ApiError from "../../utils/ApiError.js";
import ApiResponse from "../../utils/ApiResponse.js";

export const getFreelancerRating = asyncHandler(async (req, res) => {
    const { freelancerId } = req.params;

    // Validate freelancer ID
    if (!freelancerId) {
        throw new ApiError(400, "Freelancer ID is required");
    }

    // Get all reviews for freelancer
    const reviews = await Review.find({ freelancer_id: freelancerId });

    if (reviews.length === 0) {
        return res.status(200).json(
            new ApiResponse(
                200,
                true,
                false,
                "No reviews yet",
                {
                    averageRating: 0,
                    totalReviews: 0,
                }
            )
        );
    }

    // Calculate average rating
    const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
    const averageRating = (totalRating / reviews.length).toFixed(1);

    res.status(200).json(
        new ApiResponse(
            200,
            true,
            false,
            "Rating fetched successfully",
            {
                averageRating: parseFloat(averageRating),
                totalReviews: reviews.length,
            }
        )
    );
});
