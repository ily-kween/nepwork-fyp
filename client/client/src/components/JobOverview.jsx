import Button from "./Button";
import api from "../utils/api";
import toast from "react-hot-toast";
import Loader from "./Loader";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router";

function JobOverview({ jobId, jobData, isSelectedFreelancer }) {
    const navigate = useNavigate();
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);

    const statusStyles = {
        open: "bg-green-500 text-white",
        assigned: "bg-purple-500 text-white",
        in_progress: "bg-blue-500 text-white",
        pending_review: "bg-orange-500 text-white",
        completed: "bg-teal-500 text-white",
        closed: "bg-red-500 text-white",
        paid: "bg-emerald-600 text-white",
    };

    const fetchSetOverviewData = async () => {
        try {
            const response = await api.get(`/jobs/overview/${jobId}`);
            setData(response.data.data);
        } catch (error) {
            toast.error("Failed to load overview");
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSetOverviewData();
    }, [jobData]);

    if (loading) return <Loader />;

    return (
        <div className="mt-8 max-w-7xl mx-auto px-4 pb-8">
            <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-6 border-b pb-2">
                    Project Overview
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Payment Summary */}
                    <div className="bg-gray-50 p-4 rounded-lg">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">
                            Payment Summary
                        </h3>
                        <div className="space-y-3">
                            <div className="flex justify-between">
                                <span className="text-gray-600">
                                    Hourly Rate
                                </span>
                                <span className="font-medium">
                                    NRS {data?.rate?.toLocaleString()}
                                </span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-600">
                                    Project time
                                </span>
                                <div className="flex gap-2 items-center font-medium">
                                    <span className="font-bold">
                                        {(data?.workedTimeInSec / 3600).toFixed(
                                            1,
                                        )}
                                        h
                                    </span>
                                    <span className="text-sm">
                                        {(data?.workedTimeInSec / 60).toFixed(
                                            1,
                                        )}
                                        m
                                    </span>
                                </div>
                            </div>
                            <div className="flex justify-between border-t pt-2">
                                <span className="text-gray-900 font-semibold">
                                    Total
                                </span>
                                <span className="font-semibold text-blue-600">
                                    NRS{" "}
                                    {data?.payment?.amount?.toLocaleString()}
                                </span>
                            </div>
                            <div className="flex justify-between items-center mt-4">
                                <span className="text-gray-600">
                                    Payment Status
                                </span>
                                <span
                                    className={`px-3 py-1 rounded-full text-sm ${data?.payment?.done
                                            ? "bg-green-100 text-green-800"
                                            : "bg-red-100 text-red-800"
                                        }`}
                                >
                                    {data?.payment?.done ? "Paid" : "Pending"}
                                </span>
                            </div>
                            {!data?.payment?.done && !isSelectedFreelancer && (
                                <Button
                                    onClick={() =>
                                        navigate(`/jobs/${jobId}/pay`)
                                    }
                                    disabled={data?.jobStatus !== "completed"}
                                    variant="filled"
                                    className={"w-full font-bold"}
                                >
                                    {data?.jobStatus === "completed"
                                        ? "Pay Now"
                                        : "Project not completed"}
                                </Button>
                            )}

                            {/* Freelancer Actions */}
                            {isSelectedFreelancer && data?.jobStatus === "assigned" && (
                                <Button
                                    variant="filled"
                                    className="w-full font-bold mt-2"
                                    onClick={async () => {
                                        try {
                                            await api.patch(`/jobs/${jobId}/status-update`, { status: "in_progress" });
                                            toast.success("Project started!");
                                            fetchSetOverviewData();
                                        } catch (err) {
                                            toast.error(err.response?.data?.message || "Failed to start project");
                                        }
                                    }}
                                >
                                    Start Project
                                </Button>
                            )}
                            {isSelectedFreelancer && data?.jobStatus === "in_progress" && (
                                <Button
                                    variant="filled"
                                    className="w-full font-bold mt-2"
                                    onClick={async () => {
                                        try {
                                            await api.patch(`/jobs/${jobId}/status-update`, { status: "pending_review" });
                                            toast.success("Project marked for review!");
                                            fetchSetOverviewData();
                                        } catch (err) {
                                            toast.error(err.response?.data?.message || "Failed to update project");
                                        }
                                    }}
                                >
                                    Mark as Completed
                                </Button>
                            )}

                            {/* Client Actions */}
                            {!isSelectedFreelancer && data?.jobStatus === "pending_review" && (
                                <Button
                                    variant="filled"
                                    className="w-full font-bold mt-2 bg-orange-500 hover:bg-orange-600"
                                    onClick={async () => {
                                        try {
                                            await api.patch(`/jobs/${jobId}/client-review`, { status: "completed" });
                                            toast.success("Project approved and completed!");
                                            fetchSetOverviewData();
                                        } catch (err) {
                                            toast.error(err.response?.data?.message || "Failed to approve project");
                                        }
                                    }}
                                >
                                    Approve & Complete
                                </Button>
                            )}
                        </div>
                    </div>

                    {/* Work Timeline */}
                    <div className="bg-gray-50 p-4 rounded-lg">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">
                            Project Timeline
                        </h3>
                        <div className="space-y-4">
                            <div>
                                <p className="text-sm text-gray-500 mb-1">
                                    Start Date
                                </p>
                                <p className="font-medium">
                                    {data?.workStartedAt
                                        ? new Date(
                                            data.workStartedAt,
                                        ).toLocaleString(undefined, {
                                            year: "numeric",
                                            month: "short",
                                            day: "numeric",
                                            hour: "2-digit",
                                            minute: "2-digit",
                                            second: "2-digit",
                                            timeZoneName: "short",
                                        })
                                        : "Not started yet"}
                                </p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-500 mb-1">
                                    End Date
                                </p>
                                <p className="font-medium">
                                    {data?.workEndedAt
                                        ? new Date(
                                            data.workEndedAt,
                                        ).toLocaleString(undefined, {
                                            year: "numeric",
                                            month: "short",
                                            day: "numeric",
                                            hour: "2-digit",
                                            minute: "2-digit",
                                            second: "2-digit",
                                            timeZoneName: "short",
                                        })
                                        : "-"}
                                </p>
                            </div>
                            <div className="pt-2 border-t">
                                <p className="text-sm text-gray-500 mb-2">
                                    Current Status
                                </p>
                                <span
                                    className={`px-3 py-1 rounded-full text-sm ${statusStyles[data?.jobStatus]}`}
                                >
                                    {data?.jobStatus?.replace("_", " ")}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Additional Info Section */}
                {data?.jobStatus === "completed" && (
                    <div className="mt-6 bg-blue-50 p-4 rounded-lg">
                        <div className="flex items-center gap-3">
                            <svg
                                className="w-6 h-6 text-blue-600"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M5 13l4 4L19 7"
                                />
                            </svg>
                            <p className="text-blue-800">
                                This project was successfully completed on{" "}
                                {new Date(
                                    data.workEndedAt,
                                ).toLocaleDateString()}
                            </p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
export default JobOverview;
