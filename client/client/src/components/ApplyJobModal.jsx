import React, { useState } from "react";
import { FiX, FiAlertCircle } from "react-icons/fi";
import Button from "./Button";
import api from "../utils/api";
import toast from "react-hot-toast";

function ApplyJobModal({ jobData, setModalFn, refetchJobFn }) {
    const [message, setMessage] = useState("");
    const [resErr, setResErr] = useState(null);
    const [loading, setLoading] = useState(false);

    const handleCloseModal = () => {
        if (!loading) setModalFn(false);
    };

    const handleApplyJob = async () => {
        setLoading(true);
        setResErr(null);
        try {
            await api.post("/jobs/apply", { jobId: jobData._id, message });
            await refetchJobFn();
            toast.success("Application submitted successfully!");
            setModalFn(false);
        } catch (error) {
            setResErr(error.response?.data?.message || "An error occurred");
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl transform transition-all animate-scale-in">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-100">
                    <h2 className="text-2xl font-bold text-gray-900">
                        Apply for project
                    </h2>
                    <button
                        onClick={handleCloseModal}
                        disabled={loading}
                        className="p-1 rounded-lg hover:bg-gray-50 transition-colors text-gray-400 hover:text-gray-600"
                    >
                        <FiX className="w-6 h-6" />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6 space-y-6">
                    <div className="space-y-4">
                        <label className="block text-sm font-medium text-gray-700">
                            Application Message
                            <span className="text-gray-400 ml-1">
                                (optional)
                            </span>
                        </label>

                        <div className="relative">
                            <textarea
                                value={message}
                                onChange={(e) => setMessage(e.target.value)}
                                placeholder="Write your message to the employer..."
                                className={`
                                    w-full min-h-[160px] p-4 rounded-lg border
                                    focus:ring-2 focus:ring-blue-500 focus:border-blue-500
                                    text-gray-900 placeholder-gray-400 resize-none
                                    transition-all duration-200 shadow-sm
                                    ${resErr ? "border-red-300" : "border-gray-200"}
                                `}
                                maxLength={500}
                                disabled={loading}
                            />

                            <div className="mt-2 flex justify-between items-center">
                                {resErr && (
                                    <div className="flex items-center space-x-2 text-red-600">
                                        <FiAlertCircle className="w-4 h-4" />
                                        <span className="text-sm font-medium">
                                            {resErr}
                                        </span>
                                    </div>
                                )}
                                <span className="text-sm text-gray-400 ml-auto">
                                    {message.length}/500
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-3 justify-end border-t border-gray-100 pt-6">
                        <Button
                            onClick={handleCloseModal}
                            variant="outline"
                            disabled={loading}
                            className="border-gray-300 text-gray-700 hover:bg-gray-50"
                        >
                            Cancel
                        </Button>
                        <Button
                            variant="filled"
                            onClick={handleApplyJob}
                            loading={loading}
                            disabled={loading}
                        >
                            {loading ? "Submitting..." : "Submit Application"}
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default ApplyJobModal;
