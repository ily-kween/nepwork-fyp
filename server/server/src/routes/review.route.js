import { Router } from "express";
import { authenticate } from "../middlewares/index.js";
import {
    createReview,
    getFreelancerReviews,
    getFreelancerRating,
    checkReviewStatus,
} from "../controllers/index.js";

const reviewRoute = Router();

// Create a review (requires authentication)
reviewRoute.post("/submit", authenticate, createReview);

// Get all reviews for a freelancer
reviewRoute.get("/freelancer/:freelancerId", getFreelancerReviews);

// Get average rating for a freelancer
reviewRoute.get("/rating/:freelancerId", getFreelancerRating);

// Check if a project can be reviewed
reviewRoute.get("/check/:projectId", authenticate, checkReviewStatus);

export { reviewRoute };
