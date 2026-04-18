import mongoose from "mongoose";

const reviewSchema = new mongoose.Schema(
    {
        project_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Job",
            required: true,
        },
        client_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        freelancer_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        rating: {
            type: Number,
            min: 1,
            max: 5,
            required: true,
        },
        review_text: {
            type: String,
            default: "",
        },
        isApproved: {
            type: Boolean,
            default: true,
        },
    },
    { timestamps: true }
);

// Ensure only one review per (project, client) and one per (project, freelancer)
reviewSchema.index({ project_id: 1, client_id: 1 }, { unique: true, sparse: true });
reviewSchema.index({ project_id: 1, freelancer_id: 1 }, { unique: true, sparse: true });

export const Review = mongoose.model("Review", reviewSchema);
