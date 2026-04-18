import React, { useEffect, useState } from "react";
import { ReviewButton, Loader } from "../index.js";
import api from "../../utils/api";
import toast from "react-hot-toast";
import { Link } from "react-router";
import capitalize from "../../utils/capitalize";
import { FiDollarSign, FiCheckCircle, FiCalendar, FiUser } from "react-icons/fi";
import Button from "../Button";

function ClientWorkHistory({ clientId }) {
    const [completedJobs, setCompletedJobs] = useState([]);
    const [fetching, setFetching] = useState(true);

    const fetchCompletedJobs = async () => {
        try {
            setFetching(true);
            const response = await api.get(`/jobs/${clientId}/open-jobs`);
            // Filter for completed/paid projects
            const completed = (response.data.data || []).filter(job => 
                ["completed", "paid"].includes(job.status)
            );
            setCompletedJobs(completed);
        } catch (error) {
            console.error(error);
            toast.error("Failed to load work history");
        } finally {
            setFetching(false);
        }
    };

    useEffect(() => {
        fetchCompletedJobs();
    }, [clientId]);

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
        });
    };

    if (fetching) {
        return <Loader />;
    }

    if (completedJobs.length === 0) {
        return (
            <div className="text-center py-12">
                <FiCheckCircle className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                <p className="text-slate-500 font-medium">No completed projects yet</p>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {completedJobs.map((job) => (
                <div
                    key={job._id}
                    className="bg-gradient-to-r from-emerald-50 to-slate-50 border border-emerald-200 rounded-xl p-5 hover:shadow-md transition-shadow"
                >
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                        {/* Project Info */}
                        <div className="flex-1 space-y-3">
                            <div className="flex items-start gap-3">
                                <div className="flex-1">
                                    <h3 className="text-base font-bold text-slate-900">
                                        {job.title}
                                    </h3>
                                    <p className="text-xs text-slate-500 mt-1">
                                        ID: {job._id.slice(-6).toUpperCase()}
                                    </p>
                                </div>
                                <span className="px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full text-xs font-bold flex items-center gap-1 whitespace-nowrap">
                                    <FiCheckCircle className="w-3 h-3" />
                                    Completed
                                </span>
                            </div>

                            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
                                <div className="flex items-center gap-2 text-slate-600">
                                    <FiUser className="w-4 h-4 text-slate-400" />
                                    <span>
                                        <span className="font-semibold">Freelancer:</span>{" "}
                                        {job.acceptedFreelancer
                                            ? `${capitalize(job.acceptedFreelancer?.name?.firstName || "")} ${capitalize(
                                                job.acceptedFreelancer?.name?.lastName || ""
                                            )}`
                                            : "Unassigned"}
                                    </span>
                                </div>
                                <div className="flex items-center gap-2 text-slate-600">
                                    <FiDollarSign className="w-4 h-4 text-slate-400" />
                                    <span>
                                        <span className="font-semibold">Rate:</span> Rs. {job.hourlyRate}/hr
                                    </span>
                                </div>
                                <div className="flex items-center gap-2 text-slate-600">
                                    <FiCalendar className="w-4 h-4 text-slate-400" />
                                    <span>
                                        <span className="font-semibold">Completed:</span> {formatDate(job.updatedAt)}
                                    </span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase ${
                                        job.status === "paid" 
                                            ? "bg-emerald-100 text-emerald-700"
                                            : "bg-slate-100 text-slate-700"
                                    }`}>
                                        {job.status === "paid" ? "✓ Settled" : "Completed"}
                                    </span>
                                </div>
                            </div>

                            <p className="text-sm text-slate-600 line-clamp-2">
                                {job.description}
                            </p>
                        </div>

                        {/* Actions */}
                        <div className="flex flex-col sm:flex-row gap-2 items-center">
                            <Link to={`/jobs/${job._id}`} className="w-full sm:w-auto">
                                <Button variant="outline" className="w-full sm:w-auto text-xs">
                                    View Details
                                </Button>
                            </Link>
                            
                            <div className="w-full sm:w-auto" onClick={(e) => e.stopPropagation()}>
                                <ReviewButton
                                    projectId={job._id}
                                    onReviewSubmitted={() => {
                                        toast.success("Thank you for your feedback!");
                                        fetchCompletedJobs();
                                    }}
                                />
                            </div>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
}

export default ClientWorkHistory;
