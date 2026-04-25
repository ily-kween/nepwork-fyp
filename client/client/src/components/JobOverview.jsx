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
        contract_pending: "bg-amber-500 text-white",
        assigned: "bg-purple-500 text-white",
        in_progress: "bg-blue-500 text-white",
        pending_review: "bg-orange-500 text-white",
        completed: "bg-teal-500 text-white",
        closed: "bg-red-500 text-white",
        paid: "bg-emerald-600 text-white",
    };

    const contract = data?.contract;
    const isClient = !isSelectedFreelancer;
    const needsInitialPayment = contract?.status === "pending_payment" && !contract?.initialPaymentDone;
    const canApproveContract = contract && (!contract.clientApproved || !contract.freelancerApproved);

    const downloadContractPdf = async () => {
        try {
            const response = await api.get(`/jobs/${jobId}/contract/pdf`, {
                responseType: "blob",
            });
            const pdfUrl = window.URL.createObjectURL(new Blob([response.data], { type: "application/pdf" }));
            const link = document.createElement("a");
            link.href = pdfUrl;
            link.setAttribute("download", `contract-${jobId}.pdf`);
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(pdfUrl);
            toast.success("Contract PDF downloaded");
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to download contract PDF");
        }
    };

    const approveContract = async () => {
        try {
            await api.patch(`/jobs/${jobId}/contract/approve`);
            toast.success("Contract approval saved");
            fetchSetOverviewData();
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to approve contract");
        }
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
                                        navigate(
                                            needsInitialPayment
                                                ? `/jobs/${jobId}/pay?stage=initial`
                                                : `/jobs/${jobId}/pay`,
                                        )
                                    }
                                    disabled={
                                        needsInitialPayment
                                            ? !contract?.clientApproved || !contract?.freelancerApproved
                                            : data?.jobStatus !== "completed"
                                    }
                                    variant="filled"
                                    className={"w-full font-bold"}
                                >
                                    {needsInitialPayment
                                        ? "Pay Contract Deposit"
                                        : data?.jobStatus === "completed"
                                            ? "Pay Now"
                                            : contract?.status === "pending_signature"
                                                ? "Awaiting contract approval"
                                                : "Project not completed"}
                                </Button>
                            )}

                            {/* Freelancer Actions */}
                            {isSelectedFreelancer && data?.jobStatus === "assigned" && contract?.status === "active" && (
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
                            {isSelectedFreelancer && data?.jobStatus === "in_progress" && contract?.status === "active" && (
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

                            {isSelectedFreelancer && contract?.status === "pending_signature" && (
                                <div className="space-y-3 rounded-lg border border-amber-200 bg-amber-50 p-4">
                                    <div>
                                        <p className="text-sm font-bold text-amber-800">Contract approval required</p>
                                        <p className="text-sm text-amber-700 mt-1">
                                            Review the contract PDF, approve it, and wait for the client deposit before starting work.
                                        </p>
                                    </div>
                                    <div className="flex flex-col gap-2">
                                        <Button
                                            variant="filled"
                                            className="w-full font-bold bg-amber-600 hover:bg-amber-700"
                                            onClick={downloadContractPdf}
                                        >
                                            Download Contract PDF
                                        </Button>
                                        {canApproveContract && (
                                            <Button
                                                variant="filled"
                                                className="w-full font-bold bg-slate-900 hover:bg-slate-800"
                                                onClick={approveContract}
                                            >
                                                Approve Contract
                                            </Button>
                                        )}
                                    </div>
                                </div>
                            )}

                            {isClient && contract && (
                                <div className="space-y-4 rounded-lg border border-gray-200 bg-white p-4">
                                    <div className="flex items-center justify-between gap-3">
                                        <div>
                                            <p className="text-sm font-bold text-gray-900">Contract Status</p>
                                            <p className="text-sm text-gray-600 capitalize">{contract.status?.replaceAll("_", " ")}</p>
                                        </div>
                                        <span className="px-3 py-1 rounded-full text-xs font-bold bg-gray-100 text-gray-700">
                                            {contract.clientApproved && contract.freelancerApproved ? "Ready for payment" : "Waiting for signatures"}
                                        </span>
                                    </div>
                                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm">
                                        <div className="rounded-lg bg-gray-50 p-3">
                                            <p className="text-gray-500">Client</p>
                                            <p className="font-semibold text-gray-900">{contract.clientApproved ? "Approved" : "Pending"}</p>
                                        </div>
                                        <div className="rounded-lg bg-gray-50 p-3">
                                            <p className="text-gray-500">Freelancer</p>
                                            <p className="font-semibold text-gray-900">{contract.freelancerApproved ? "Approved" : "Pending"}</p>
                                        </div>
                                        <div className="rounded-lg bg-gray-50 p-3">
                                            <p className="text-gray-500">Deposit</p>
                                            <p className="font-semibold text-gray-900">Rs. {contract.initialPaymentAmount?.toLocaleString?.() ?? contract.initialPaymentAmount}</p>
                                        </div>
                                    </div>
                                    <div className="flex flex-col gap-2 sm:flex-row">
                                        <Button
                                            variant="filled"
                                            className="w-full sm:w-auto font-bold"
                                            onClick={downloadContractPdf}
                                        >
                                            Download Contract PDF
                                        </Button>
                                        {canApproveContract && (
                                            <Button
                                                variant="filled"
                                                className="w-full sm:w-auto font-bold bg-slate-900 hover:bg-slate-800"
                                                onClick={approveContract}
                                            >
                                                Approve Contract
                                            </Button>
                                        )}
                                    </div>
                                </div>
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
