import { Review } from "../../models/index.js";
import asyncHandler from "../../utils/asyncHandler.js";
import ApiError from "../../utils/ApiError.js";
import ApiResponse from "../../utils/ApiResponse.js";

export const getFreelancerReviews = asyncHandler(async (req, res) => {
    const { freelancerId } = req.params;
    const { sort = "latest", page = 1, limit = 10 } = req.query;

    // Validate freelancer ID
    if (!freelancerId) {
        throw new ApiError(400, "Freelancer ID is required");
    }

    // Build sort object
    let sortObj = { createdAt: -1 }; // Default: latest first
    if (sort === "highest") {
        sortObj = { rating: -1, createdAt: -1 };
    } else if (sort === "lowest") {
        sortObj = { rating: 1, createdAt: -1 };
    }

    // Pagination
    const pageNum = parseInt(page, 10) || 1;
    const limitNum = parseInt(limit, 10) || 10;
    const skip = (pageNum - 1) * limitNum;

    // Get reviews with pagination
    const reviews = await Review.find({ freelancer_id: freelancerId })
        .populate("client_id", "name avatar")
        .populate("project_id", "title")
        .sort(sortObj)
        .skip(skip)
        .limit(limitNum);

    // Get total count
    const totalReviews = await Review.countDocuments({ freelancer_id: freelancerId });

    // Calculate rating breakdown
    const allReviews = await Review.find({ freelancer_id: freelancerId });
    const ratingBreakdown = {
        5: allReviews.filter((r) => r.rating === 5).length,
        4: allReviews.filter((r) => r.rating === 4).length,
        3: allReviews.filter((r) => r.rating === 3).length,
        2: allReviews.filter((r) => r.rating === 2).length,
        1: allReviews.filter((r) => r.rating === 1).length,
    };

    res.status(200).json(
        new ApiResponse(
            200,
            true,
            false,
            "Reviews fetched successfully",
            {
                reviews,
                totalReviews,
                totalPages: Math.ceil(totalReviews / limitNum),
                currentPage: pageNum,
                ratingBreakdown,
            }
        )
    );
});
