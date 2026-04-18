import React, { useState, useEffect } from "react";
import { FiStar } from "react-icons/fi";
import api from "../utils/api";

function ReviewsSummary({ freelancerId }) {
    const [rating, setRating] = useState(0);
    const [totalReviews, setTotalReviews] = useState(0);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchData();
    }, [freelancerId]);

    const fetchData = async () => {
        try {
            setLoading(true);
            
            // Fetch rating
            const ratingResponse = await api.get(`/reviews/rating/${freelancerId}`);
            const ratingData = ratingResponse.data?.data;
            setRating(ratingData?.averageRating || 0);

            // Fetch reviews to get count
            const reviewsResponse = await api.get(`/reviews/freelancer/${freelancerId}`);
            const reviewsData = reviewsResponse.data?.data;
            setTotalReviews(reviewsData?.totalReviews || 0);
        } catch (error) {
            console.error("Failed to fetch review data:", error);
            setRating(0);
            setTotalReviews(0);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="h-20 bg-gray-100 rounded-lg animate-pulse" />
        );
    }

    return (
        <div className="p-5 bg-gradient-to-br from-yellow-50 to-orange-50 border border-yellow-200 rounded-xl text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
                <div className="text-2xl font-black text-gray-900">{rating.toFixed(1)}</div>
                <div className="flex items-center gap-0.5">
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
            <p className="text-xs font-semibold text-gray-600">
                {totalReviews} {totalReviews === 1 ? 'review' : 'reviews'}
            </p>
        </div>
    );
}

export default ReviewsSummary;
