import React, { useState, useEffect } from "react";
import { FiStar, FiX } from "react-icons/fi";
import toast from "react-hot-toast";
import api from "../utils/api";

function ReviewModal({ projectId, freelancerId, onClose, onSuccess }) {
    const [rating, setRating] = useState(0);
    const [reviewText, setReviewText] = useState("");
    const [hoveredRating, setHoveredRating] = useState(0);
    const [loading, setLoading] = useState(false);
    const [submitError, setSubmitError] = useState(null);

    const handleSubmitReview = async (e) => {
        e.preventDefault();
        setSubmitError(null);

        if (rating === 0) {
            setSubmitError("Please select a rating");
            toast.error("Please select a rating");
            return;
        }

        setLoading(true);
        try {
            console.log("Submitting review:", {
                project_id: projectId,
                rating,
                review_text: reviewText,
            });
            
            const response = await api.post("/reviews/submit", {
                project_id: projectId,
                rating,
                review_text: reviewText,
            });

            console.log("Review submitted successfully:", response.data);
            toast.success("Review submitted successfully! 🎉");
            
            // Reset form
            setRating(0);
            setReviewText("");
            setSubmitError(null);
            
            // Call success callback
            onSuccess();
            onClose();
        } catch (error) {
            const errorMessage = error.response?.data?.message || error.message || "Failed to submit review";
            console.error("Failed to submit review:", error.response?.data || error.message);
            setSubmitError(errorMessage);
            toast.error(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-200 sticky top-0 bg-gradient-to-r from-white to-gray-50">
                    <div className="space-y-1">
                        <h2 className="text-xl font-bold text-gray-900">Leave a Review</h2>
                        <p className="text-xs text-gray-500">Share your experience with this freelancer</p>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                        <FiX className="w-5 h-5 text-gray-600" />
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmitReview} className="p-6 space-y-6">
                    {/* Error Message */}
                    {submitError && (
                        <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                            <p className="text-sm text-red-700 font-medium">{submitError}</p>
                        </div>
                    )}
                    <div className="space-y-4">
                        <label className="block text-sm font-semibold text-gray-900">
                            Rate your experience
                        </label>
                        <div className="flex gap-3 justify-center">
                            {[1, 2, 3, 4, 5].map((star) => (
                                <button
                                    key={star}
                                    type="button"
                                    onClick={() => setRating(star)}
                                    onMouseEnter={() => setHoveredRating(star)}
                                    onMouseLeave={() => setHoveredRating(0)}
                                    className="transition-all transform hover:scale-125"
                                >
                                    <FiStar
                                        className={`w-10 h-10 transition-all ${
                                            star <= (hoveredRating || rating)
                                                ? "fill-yellow-400 text-yellow-400 drop-shadow-md"
                                                : "text-gray-300"
                                        }`}
                                    />
                                </button>
                            ))}
                        </div>
                        {rating > 0 && (
                            <div className="text-center">
                                <span className="inline-block px-4 py-2 bg-yellow-50 text-yellow-700 rounded-full text-sm font-semibold border border-yellow-200">
                                    {rating} out of 5 stars
                                </span>
                            </div>
                        )}
                    </div>

                    {/* Review Text */}
                    <div className="space-y-2">
                        <label
                            htmlFor="reviewText"
                            className="block text-sm font-semibold text-gray-900"
                        >
                            Your feedback (optional)
                        </label>
                        <textarea
                            id="reviewText"
                            value={reviewText}
                            onChange={(e) => setReviewText(e.target.value)}
                            placeholder="Share your experience working with this freelancer... What did they do well? Any suggestions?"
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent resize-none transition-all"
                            rows="4"
                            maxLength="500"
                        />
                        <div className="flex justify-between items-center">
                            <p className="text-xs text-gray-500">
                                {reviewText.length > 0 ? `${reviewText.length}/500 characters` : 'Add comments (optional)'}
                            </p>
                            {reviewText.length > 400 && (
                                <span className="text-xs text-yellow-600 font-medium">Nearly full</span>
                            )}
                        </div>
                    </div>

                    {/* Buttons */}
                    <div className="flex gap-3 pt-4 border-t border-gray-200">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 px-4 py-2.5 border border-gray-300 text-gray-900 font-semibold rounded-lg hover:bg-gray-50 transition-colors active:scale-95"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading || rating === 0}
                            className="flex-1 px-4 py-2.5 bg-gradient-to-r from-primary to-primary/80 text-white font-semibold rounded-lg hover:from-primary/90 hover:to-primary/70 disabled:opacity-50 disabled:cursor-not-allowed transition-all active:scale-95 shadow-md hover:shadow-lg"
                        >
                            {loading ? (
                                <span className="flex items-center justify-center gap-2">
                                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                    Submitting...
                                </span>
                            ) : (
                                'Submit Review'
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default ReviewModal;
