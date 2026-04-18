import React, { useState, useEffect } from "react";
import { FiStar, FiChevronDown, FiCheck, FiArrowRight } from "react-icons/fi";
import toast from "react-hot-toast";
import api from "../utils/api";
import ReviewModal from "./ReviewModal";

function ReviewsDisplay({ freelancerId, projectId, showReviewButton = false, onReviewSubmitted }) {
    const [reviews, setReviews] = useState([]);
    const [rating, setRating] = useState(0);
    const [totalReviews, setTotalReviews] = useState(0);
    const [ratingBreakdown, setRatingBreakdown] = useState({
        5: 0,
        4: 0,
        3: 0,
        2: 0,
        1: 0,
    });
    const [sort, setSort] = useState("latest");
    const [loading, setLoading] = useState(true);
    const [expandedReview, setExpandedReview] = useState(null);
    const [showReviewModal, setShowReviewModal] = useState(false);
    const [reviewStatus, setReviewStatus] = useState({
        canReview: false,
        hasReview: false,
        isCompleted: false,
    });

    useEffect(() => {
        fetchReviewsData();
        fetchRatingData();
        if (projectId) {
            checkReviewStatus();
        }
    }, [freelancerId, sort, projectId]);

    const checkReviewStatus = async () => {
        if (!projectId) return;
        try {
            const response = await api.get(`/reviews/check/${projectId}`);
            const data = response.data?.data;
            if (!data) {
                console.warn("No review status data returned from API", response.data);
                setReviewStatus({
                    canReview: false,
                    hasReview: false,
                    isCompleted: false,
                });
                return;
            }
            console.log("ReviewsDisplay check status:", data);
            setReviewStatus({
                canReview: data.canReview || false,
                hasReview: data.hasReview || false,
                isCompleted: data.isCompleted || false,
            });
        } catch (error) {
            console.error("Failed to check review status:", error.response?.data || error.message);
            setReviewStatus({
                canReview: false,
                hasReview: false,
                isCompleted: false,
            });
        }
    };

    const fetchReviewsData = async () => {
        try {
            setLoading(true);
            const response = await api.get(`/reviews/freelancer/${freelancerId}?sort=${sort}`);
            const data = response.data.data;
            if (!data) {
                console.warn("No review data returned from API");
                setReviews([]);
                setTotalReviews(0);
                return;
            }
            setReviews(data.reviews || []);
            setTotalReviews(data.totalReviews || 0);
            setRatingBreakdown(data.ratingBreakdown || { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 });
        } catch (error) {
            console.error("Failed to fetch reviews:", error.response?.data || error.message);
            setReviews([]);
            setTotalReviews(0);
        } finally {
            setLoading(false);
        }
    };

    const fetchRatingData = async () => {
        try {
            const response = await api.get(`/reviews/rating/${freelancerId}`);
            const data = response.data.data;
            if (!data) {
                console.warn("No rating data returned from API");
                setRating(0);
                return;
            }
            setRating(data.averageRating || 0);
        } catch (error) {
            console.error("Failed to fetch rating:", error.response?.data || error.message);
            setRating(0);
        }
    };

    const getRatingPercentage = (count) => {
        return totalReviews > 0 ? ((count / totalReviews) * 100).toFixed(0) : 0;
    };

    const handleReviewSuccess = () => {
        setShowReviewModal(false);
        checkReviewStatus();
        fetchReviewsData();
        fetchRatingData();
        if (onReviewSubmitted) {
            onReviewSubmitted();
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center py-20">
                <div className="text-gray-500">Loading reviews...</div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header Card */}
            <div className="bg-white border shadow-sm rounded-2xl border-slate-200 overflow-hidden">
                <div className="p-6 bg-gradient-to-r from-yellow-50 to-orange-50 border-b border-yellow-200">
                    <div className="flex items-center justify-between gap-4">
                        <div>
                            <h3 className="text-2xl font-bold text-gray-900">⭐ Client Reviews</h3>
                            <p className="mt-1 text-sm text-gray-600">Based on {totalReviews} {totalReviews === 1 ? 'review' : 'reviews'}</p>
                        </div>
                        <div className="text-center">
                            <div className="text-4xl font-black text-primary">{rating.toFixed(1)}</div>
                            <div className="flex items-center justify-center gap-0.5 mt-2">
                                {[...Array(5)].map((_, i) => (
                                    <FiStar
                                        key={i}
                                        className="w-4 h-4"
                                        style={{
                                            fill: i < Math.round(rating) ? '#fbbf24' : '#e5e7eb',
                                            color: i < Math.round(rating) ? '#fbbf24' : '#e5e7eb',
                                        }}
                                    />
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Rating Breakdown */}
            {totalReviews > 0 && (
                <div className="bg-white border shadow-sm rounded-2xl border-slate-200 p-6">
                    <h4 className="mb-4 text-sm font-black tracking-wide uppercase text-gray-900">Rating Distribution</h4>
                    <div className="space-y-3">
                        {[5, 4, 3, 2, 1].map((star) => (
                            <div key={star} className="flex items-center gap-3">
                                <div className="flex items-center w-12 gap-1">
                                    {[...Array(star)].map((_, i) => (
                                        <FiStar
                                            key={i}
                                            className="w-3 h-3"
                                            style={{ fill: '#fbbf24', color: '#fbbf24' }}
                                        />
                                    ))}
                                    {[...Array(5 - star)].map((_, i) => (
                                        <FiStar
                                            key={`empty-${i}`}
                                            className="w-3 h-3"
                                            style={{ color: '#e5e7eb' }}
                                        />
                                    ))}
                                </div>
                                <div className="flex-1">
                                    <div className="w-full h-2 overflow-hidden bg-gray-200 rounded-full">
                                        <div
                                            className="h-full transition-all rounded-full bg-gradient-to-r from-primary to-primary/70"
                                            style={{
                                                width: `${getRatingPercentage(ratingBreakdown[star])}%`,
                                            }}
                                        ></div>
                                    </div>
                                </div>
                                <div className="w-8 text-sm font-medium text-right text-gray-600">
                                    {ratingBreakdown[star]}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
            {showReviewButton && projectId && (
                <div className={`rounded-xl border-2 p-6 ${
                    reviewStatus.hasReview 
                        ? 'bg-gradient-to-br from-green-50 to-emerald-50 border-green-200' 
                        : 'bg-gradient-to-br from-blue-50 to-primary/10 border-primary/30'
                }`}>
                    <div className="flex items-start justify-between">
                        <div className="flex-1">
                            {reviewStatus.hasReview ? (
                                <div className="space-y-2">
                                    <div className="flex items-center gap-2">
                                        <div className="flex items-center justify-center w-8 h-8 bg-green-500 rounded-full">
                                            <FiCheck className="w-5 h-5 text-white" />
                                        </div>
                                        <h4 className="text-lg font-bold text-gray-900">Review Submitted!</h4>
                                    </div>
                                    <p className="text-sm text-gray-600">Thank you for your feedback</p>
                                </div>
                            ) : reviewStatus.isCompleted ? (
                                <div className="space-y-2">
                                    <h4 className="text-lg font-bold text-gray-900">Share Your Experience</h4>
                                    <p className="text-sm text-gray-600">Help other clients by rating and reviewing this professional</p>
                                </div>
                            ) : (
                                <div className="space-y-2">
                                    <h4 className="text-lg font-bold text-gray-900">Complete the Project to Review</h4>
                                    <p className="text-sm text-gray-600">You can give a rating and review once the project is completed</p>
                                </div>
                            )}
                        </div>
                        {!reviewStatus.hasReview && reviewStatus.isCompleted && (
                            <button
                                onClick={() => setShowReviewModal(true)}
                                className="flex items-center flex-shrink-0 gap-2 px-4 py-2 ml-4 text-sm font-semibold text-white transition-all rounded-lg shadow-md bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 hover:shadow-lg active:scale-95"
                            >
                                <FiStar className="w-4 h-4" />
                                <span>Give Review</span>
                                <FiArrowRight className="w-4 h-4" />
                            </button>
                        )}
                    </div>
                </div>
            )}

            {/* Rating Summary Section */}
            <div className="p-6 bg-white border border-gray-200 rounded-xl md:p-8">
                <h3 className="mb-6 text-xl font-bold text-gray-900 md:text-2xl">Ratings & Reviews</h3>

                <div className="grid grid-cols-1 gap-6 md:grid-cols-2 md:gap-8">
                    {/* Left: Average Rating */}
                    <div className="flex flex-col items-center justify-center p-6 border border-yellow-200 rounded-lg bg-gradient-to-br from-yellow-50 to-orange-50">
                        <div className="mb-2 text-5xl font-bold text-gray-900">{rating.toFixed(1)}</div>
                        <div className="flex items-center gap-1 mb-3">
                            {[...Array(5)].map((_, i) => (
                                <FiStar
                                    key={i}
                                    className={`w-5 h-5 ${
                                        i < Math.round(rating)
                                            ? "fill-yellow-400 text-yellow-400"
                                            : "text-gray-300"
                                    }`}
                                />
                            ))}
                        </div>
                        <div className="text-sm text-center text-gray-600">
                            Based on <span className="font-semibold">{totalReviews}</span> {totalReviews === 1 ? "review" : "reviews"}
                        </div>
                    </div>

                    {/* Right: Rating Breakdown */}
                    <div className="space-y-3">
                        {[5, 4, 3, 2, 1].map((star) => (
                            <div key={star} className="flex items-center gap-3">
                                <div className="flex items-center flex-shrink-0 w-12 gap-1">
                                    <span className="font-medium text-gray-700">{star}</span>
                                    <FiStar className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                                </div>
                                <div className="flex-1 h-2.5 bg-gray-200 rounded-full overflow-hidden">
                                    <div
                                        className="h-full transition-all duration-300 bg-gradient-to-r from-yellow-400 to-orange-400"
                                        style={{
                                            width: `${getRatingPercentage(ratingBreakdown[star])}%`,
                                        }}
                                    />
                                </div>
                                <div className="w-8 text-sm font-semibold text-right text-gray-600">
                                    {ratingBreakdown[star]}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Reviews List */}
            {/* Reviews List */}
            {totalReviews > 0 ? (
                <div className="bg-white border shadow-sm rounded-2xl border-slate-200 overflow-hidden">
                    <div className="p-6 border-b border-gray-100">
                        <div className="flex items-center justify-between">
                            <h4 className="text-lg font-black tracking-wide uppercase text-gray-900">
                                All Reviews <span className="text-gray-500 text-base">({totalReviews})</span>
                            </h4>
                            <select
                                value={sort}
                                onChange={(e) => setSort(e.target.value)}
                                className="px-3 py-2 text-sm transition bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent hover:border-gray-400"
                            >
                                <option value="latest">Latest First</option>
                                <option value="highest">Highest Rating</option>
                                <option value="lowest">Lowest Rating</option>
                            </select>
                        </div>
                    </div>

                    <div className="p-6 space-y-4">
                        {reviews.map((review) => (
                            <div
                                key={review._id}
                                className="p-5 transition-all duration-300 bg-gradient-to-br from-white to-slate-50 border border-slate-200 rounded-xl hover:border-primary/40 hover:shadow-md"
                            >
                                {/* Review Header */}
                                <div className="flex items-start justify-between mb-3">
                                    <div className="flex items-center flex-1 gap-3">
                                        <div className="flex items-center justify-center w-10 h-10 rounded-full bg-gradient-to-br from-primary/20 to-primary/10 flex-shrink-0">
                                            <span className="text-sm font-bold text-primary">
                                                {(review.client_id?.name?.firstName || review.client_id?.firstName || 'A').charAt(0).toUpperCase()}
                                            </span>
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="font-semibold text-gray-900 text-sm">
                                                {review.client_id?.name?.firstName || review.client_id?.firstName || 'Anonymous'}{" "}
                                                {review.client_id?.name?.lastName || ""}
                                            </p>
                                            <p className="text-xs text-gray-500 mt-0.5">
                                                {new Date(review.createdAt).toLocaleDateString('en-US', {
                                                    year: 'numeric',
                                                    month: 'short',
                                                    day: 'numeric',
                                                })}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className="px-2 py-1 text-sm font-bold text-yellow-600 bg-yellow-100 rounded-lg">{review.rating}</span>
                                        <div className="flex items-center gap-0.5">
                                            {[...Array(5)].map((_, i) => (
                                                <FiStar
                                                    key={i}
                                                    className={`w-4 h-4 ${
                                                        i < review.rating
                                                            ? "fill-yellow-400 text-yellow-400"
                                                            : "text-gray-300"
                                                    }`}
                                                />
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                {/* Project Title Badge */}
                                <div className="mb-4 inline-block px-3 py-1 text-xs font-semibold text-primary bg-gradient-to-r from-primary/10 to-primary/5 border border-primary/20 rounded-full">
                                    📁 {review.project_id?.title}
                                </div>

                                {/* Review Text */}
                                {review.review_text && (
                                    <div className="space-y-2">
                                        <p className="text-sm leading-relaxed text-gray-700">
                                            {expandedReview === review._id
                                                ? review.review_text
                                                : review.review_text.substring(0, 150)}
                                            {review.review_text.length > 150 && expandedReview !== review._id && '...'}
                                        </p>
                                        {review.review_text.length > 150 && (
                                            <button
                                                onClick={() =>
                                                    setExpandedReview(
                                                        expandedReview === review._id ? null : review._id
                                                    )
                                                }
                                                className="flex items-center gap-1 text-xs font-bold text-primary hover:text-primary/80 transition-colors"
                                            >
                                                {expandedReview === review._id ? 'Show Less' : 'Read More'}
                                                <FiChevronDown
                                                    className={`w-3 h-3 transition-transform ${expandedReview === review._id ? 'rotate-180' : ''}`}
                                                />
                                            </button>
                                        )}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            ) : showReviewButton && projectId && reviewStatus.isCompleted ? (
                // Show Review Form when no reviews exist but user can review
                <div className="p-8 border-2 border-dashed shadow-sm bg-gradient-to-br from-blue-50 via-white to-primary/5 rounded-xl border-primary/40">
                    <div className="mb-6 text-center">
                        <div className="inline-flex items-center justify-center w-16 h-16 mb-4 rounded-full bg-gradient-to-br from-primary/20 to-primary/10">
                            <FiStar className="w-8 h-8 text-primary" />
                        </div>
                        <h4 className="mb-2 text-xl font-bold text-gray-900">Be the First to Review! ⭐</h4>
                        <p className="max-w-sm text-sm text-gray-600">Share your experience to help other clients make informed decisions</p>
                    </div>

                    {/* Review Form */}
                    <form onSubmit={(e) => {
                        e.preventDefault();
                        setShowReviewModal(true);
                    }} className="space-y-5">
                        {/* Star Rating */}
                        <div className="space-y-4">
                            <label className="block text-base font-bold text-gray-900">
                                Rate your experience <span className="text-red-500">*</span>
                            </label>
                            <div className="flex justify-center gap-3">
                                {[1, 2, 3, 4, 5].map((star) => (
                                    <button
                                        key={star}
                                        type="button"
                                        onClick={() => {
                                            const input = document.getElementById('rating-input');
                                            if (input) input.value = star;
                                            const event = new Event('change', { bubbles: true });
                                            input.dispatchEvent(event);
                                        }}
                                        className="p-1 transition-all duration-200 transform hover:scale-125 active:scale-95"
                                    >
                                        <FiStar
                                            className={`w-10 h-10 transition-all cursor-pointer hover:drop-shadow-lg`}
                                            style={{
                                                fill: 'currentColor',
                                                color: star <= (document.getElementById('rating-input')?.value || 0) ? '#fbbf24' : '#d1d5db'
                                            }}
                                        />
                                    </button>
                                ))}
                            </div>
                            <p className="text-xs text-center text-gray-500">Click to rate (required)</p>
                            <input
                                id="rating-input"
                                type="hidden"
                                value={0}
                                onChange={(e) => {
                                    const stars = document.querySelectorAll('button[type="button"]');
                                    const value = parseInt(e.target.value);
                                    stars.forEach((star, idx) => {
                                        if (idx < 5) {
                                            const icon = star.querySelector('svg');
                                            if (icon) {
                                                icon.style.color = idx < value ? '#fbbf24' : '#d1d5db';
                                                icon.style.fill = idx < value ? '#fbbf24' : 'none';
                                            }
                                        }
                                    });
                                }}
                            />
                        </div>

                        {/* Review Text */}
                        <div className="space-y-2">
                            <div className="flex items-center justify-between">
                                <label htmlFor="review-comment" className="block text-base font-bold text-gray-900">
                                    Your feedback <span className="font-normal text-gray-500">(optional)</span>
                                </label>
                                <span className="text-xs text-gray-500" id="char-count">0/500</span>
                            </div>
                            <textarea
                                id="review-comment"
                                placeholder="Tell other clients about your experience with this professional. What did they do well? Share specific details..."
                                rows="5"
                                maxLength="500"
                                onChange={(e) => {
                                    document.getElementById('char-count').textContent = `${e.target.value.length}/500`;
                                }}
                                className="w-full px-4 py-3 transition-all border-2 border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-primary focus:border-primary hover:border-gray-400"
                            />
                        </div>

                        {/* Submit Button */}
                        <button
                            type="submit"
                            className="flex items-center justify-center w-full gap-2 px-6 py-3 text-base font-bold text-white transition-all duration-200 rounded-lg shadow-lg bg-gradient-to-r from-primary via-primary to-primary/80 hover:shadow-2xl hover:scale-105 active:scale-95"
                        >
                            <FiStar className="w-5 h-5" />
                            Submit Your Review
                        </button>
                    </form>
                </div>
            ) : (
                <div className="bg-white border shadow-sm rounded-2xl border-slate-200 overflow-hidden">
                    <div className="p-12 text-center bg-gradient-to-br from-gray-50 to-slate-50">
                        <div className="inline-flex items-center justify-center w-16 h-16 mb-4 bg-gray-200 rounded-full">
                            <FiStar className="w-8 h-8 text-gray-400" />
                        </div>
                        <p className="mb-2 text-lg font-bold text-gray-900">No reviews yet</p>
                        <p className="text-sm text-gray-600 mb-4">
                            This professional has completed projects but hasn't received any reviews yet.
                        </p>
                        {reviewStatus?.isCompleted && (
                            <p className="text-sm font-semibold text-primary">
                                ⭐ You can be the first to leave a review!
                            </p>
                        )}
                    </div>
                </div>
            )}

            {/* Review Modal */}
            {showReviewModal && (
                <ReviewModal
                    projectId={projectId}
                    onClose={() => setShowReviewModal(false)}
                    onSuccess={handleReviewSuccess}
                />
            )}
        </div>
    );
}

export default ReviewsDisplay;
