import React, { useState, useEffect } from "react";
import { FiStar, FiCheck } from "react-icons/fi";
import toast from "react-hot-toast";
import api from "../utils/api";
import ReviewModal from "./ReviewModal";

function ReviewButton({ projectId, onReviewSubmitted }) {
    const [showModal, setShowModal] = useState(false);
    const [canReview, setCanReview] = useState(false);
    const [hasReview, setHasReview] = useState(false);
    const [isCompleted, setIsCompleted] = useState(false);
    const [isPaid, setIsPaid] = useState(false);
    const [isClient, setIsClient] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        checkReviewStatus();
    }, [projectId]);

    const checkReviewStatus = async () => {
        try {
            setLoading(true);
            const response = await api.get(`/reviews/check/${projectId}`);
            console.log("Review status response:", response.data);
            const data = response.data?.data;
            if (!data) {
                console.warn("No review status data returned from API");
                setCanReview(false);
                setHasReview(false);
                setIsCompleted(false);
                setIsPaid(false);
                setIsClient(false);
                return;
            }
            setCanReview(data.canReview || false);
            setHasReview(data.hasReview || false);
            setIsCompleted(data.isCompleted || false);
            setIsPaid(data.isPaid || false);
            setIsClient(data.isClient || false);
        } catch (error) {
            console.error("Failed to check review status:", error.response?.data || error.message);
            if (error.response?.status === 401) {
                toast.error("Please log in to give a review");
            }
        } finally {
            setLoading(false);
        }
    };

    const handleReviewSuccess = () => {
        setCanReview(false);
        setHasReview(true);
        // Re-check status after a slight delay to ensure backend is updated
        setTimeout(() => {
            checkReviewStatus();
        }, 500);
        if (onReviewSubmitted) {
            onReviewSubmitted();
        }
    };

    if (loading) {
        return null;
    }

    // Only show review button for clients
    if (!isClient) {
        return null;
    }

    if (!isCompleted && !isPaid) {
        return (
            <div className="text-xs text-gray-500">
                Complete project to leave a review
            </div>
        );
    }

    if (hasReview) {
        return (
            <div className="flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-green-50 to-emerald-50 text-green-700 rounded-lg text-xs font-semibold border border-green-200">
                <FiCheck className="w-4 h-4" />
                Review submitted
            </div>
        );
    }

    return (
        <>
            <button
                onClick={() => setShowModal(true)}
                className="flex items-center gap-2 px-4 py-1.5 bg-gradient-to-r from-primary to-primary/80 text-white rounded-lg hover:from-primary/90 hover:to-primary/70 transition-all font-semibold text-sm shadow-md hover:shadow-lg active:scale-95"
            >
                <FiStar className="w-4 h-4" />
                Give Review
            </button>

            {showModal && (
                <ReviewModal
                    projectId={projectId}
                    onClose={() => setShowModal(false)}
                    onSuccess={handleReviewSuccess}
                />
            )}
        </>
    );
}

export default ReviewButton;
