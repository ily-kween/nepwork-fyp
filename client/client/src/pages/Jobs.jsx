import React, { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router";
import api from "../utils/api";
import {
    ApplyJobModal,
    Button,
    ConfirmModal,
    EditJobModal,
    JobOverview,
    Loader,
    Milestones,
    ReviewButton,
} from "../components";
import default_avatar from "../assets/default_avatar.svg";
import { useAuth } from "../stores";
import Tag from "../components/Tag";
import { FaRegTrashAlt } from "react-icons/fa";
import toast from "react-hot-toast";
import ApplicantsList from "../components/ApplicantsList";
import capitalize from "../utils/capitalize";

function Jobs() {
    const navigate = useNavigate();
    const { jobId } = useParams();
    const { userData } = useAuth();
    const [currentJob, setCurrentJob] = useState(null);
    const [showEditJobModal, setShowEditJobModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [deleteResErr, setDeleteResErr] = useState(null);
    const [deleting, setDeleting] = useState(false);
    const [applyJobModal, setApplyJobModal] = useState(false);

    const [crLoading, setCrLoading] = useState(true);

    const statusStyles = {
        open: "bg-primary text-whitetext",
        contract_pending: "bg-amber-500 text-white",
        closed: "bg-red-500 text-whitetext",
        finished: "bg-gray-500 text-whitetext",
        in_progress: "bg-gray-500 text-whitetext",
        compiled: "bg-blue-500 text-whitetext",
        paid: "bg-emerald-500 text-white",
    };

    const MapJobStatus = {
        open: "Apply",
        closed: "Closed",
        contract_pending: "Contract Pending",
        in_progress: "In Progress",
        finished: "Finished",
        paid: "Paid & Completed",
        completed: "Completed"
    };

    const getJobStatusLabel = (status) => {
        if (status === "contract_pending") return "Contract Pending";
        if (status === "pending_review") return "Pending Review";
        return status.charAt(0).toUpperCase() + status.slice(1).replaceAll("_", " ");
    };
    const fetchSetCurrentJob = async () => {
        try {
            const response = await api.get(`/jobs/${jobId}`);
            setCurrentJob(response.data.data);
        } catch (error) {
            console.error(`failed to fetch job`, error);
        } finally {
            setCrLoading(false);
        }
    };

    useEffect(() => {
        fetchSetCurrentJob();
    }, []);
    const getTimeSincePosted = (createdAt) => {
        const now = new Date();
        const createdTime = new Date(createdAt);
        const timeDifference = Math.floor((now - createdTime) / 1000);

        if (timeDifference < 60) {
            return `${timeDifference} seconds ago`;
        } else if (timeDifference < 3600) {
            const minutes = Math.floor(timeDifference / 60);
            return `${minutes} minute${minutes > 1 ? "s" : ""} ago`;
        } else if (timeDifference < 86400) {
            const hours = Math.floor(timeDifference / 3600);
            return `${hours} hour${hours > 1 ? "s" : ""} ago`;
        } else {
            const days = Math.floor(timeDifference / 86400);
            return `${days} day${days > 1 ? "s" : ""} ago`;
        }
    };

    const handleDelete = async () => {
        setDeleting(true);
        if (deleteResErr) setDeleteResErr(null);

        try {
            await api.delete(`/jobs/delete-job/${jobId}`);
            toast.success("Project deleted");
            navigate("/dashboard");
            setShowDeleteModal(false);
        } catch (error) {
            setDeleteResErr(error.response.data.message);
        } finally {
            setDeleting(false);
        }
    };

    if (crLoading) return <Loader />;

    const hasApplied =
        currentJob?.applications?.some(
            (application) => application?.appliedBy === userData?._id,
        ) ?? false;

    return (
        <>
            {applyJobModal && (
                <ApplyJobModal
                    jobData={currentJob}
                    setModalFn={setApplyJobModal}
                    refetchJobFn={fetchSetCurrentJob}
                />
            )}

            {showDeleteModal && (
                <ConfirmModal
                    setShowModalFn={setShowDeleteModal}
                    title={`Are you sure want to delete "${currentJob.title}"`}
                    err={deleteResErr}
                    loading={deleting}
                    onConfirmFn={handleDelete}
                />
            )}

            <div className="min-h-screen">
                {showEditJobModal && (
                    <EditJobModal
                        jobData={currentJob}
                        setModalStatus={setShowEditJobModal}
                        refetchJobFn={fetchSetCurrentJob}
                    />
                )}
                <div className="max-w-7xl mx-auto px-4 py-12 flex flex-col md:flex-row gap-8">
                    <div className="flex-1">
                        {!currentJob ? (
                            <Loader />
                        ) : (
                            <div className="bg-white rounded-lg shadow-md p-8">
                                {/* Job Header */}
                                <div className="flex items-start gap-4 mb-6">
                                    <Link
                                        to={`/profile/${currentJob.postedBy._id}`}
                                    >
                                        <img
                                            src={
                                                currentJob.postedBy.avatar ??
                                                default_avatar
                                            }
                                            alt="Avatar"
                                            className="w-20 h-20 rounded-full object-cover"
                                        />
                                    </Link>
                                    <div className="flex-1">
                                        <h1 className="text-2xl font-bold text-gray-900 mb-2">
                                            {currentJob.title}
                                        </h1>
                                        <div className="flex flex-wrap items-center gap-2 mb-2">
                                            <span
                                                className={`px-3 py-1 rounded-full text-sm font-medium ${statusStyles[currentJob.status] || "bg-gray-100"}`}
                                            >
                                                {getJobStatusLabel(currentJob.status)}
                                            </span>
                                            
                                            {/* Status Badges */}
                                            {["completed", "finished", "paid"].includes(currentJob.status) && (
                                                <span className="px-3 py-1 rounded-full text-sm font-medium bg-emerald-100 text-emerald-700 flex items-center gap-1">
                                                    ✓ Project Completed
                                                </span>
                                            )}
                                            
                                            {currentJob.acceptedFreelancer && !["completed", "finished", "paid"].includes(currentJob.status) && (
                                                <span className="px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-700 flex items-center gap-1">
                                                    👤 Already Assigned
                                                </span>
                                            )}
                                            
                                            <span className="text-gray-500">
                                                •
                                            </span>
                                            <span className="text-gray-600">
                                                {getTimeSincePosted(
                                                    currentJob.createdAt,
                                                )}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-2 text-gray-600">
                                            <div>
                                                Posted by
                                                <Link
                                                    to={`/profile/${currentJob.postedBy._id}`}
                                                >
                                                    <span className="ml-1 hover:text-black font-bold">
                                                        {capitalize(
                                                            currentJob.postedBy?.name?.firstName ||
                                                            currentJob.postedBy?.firstName ||
                                                            "",
                                                        )}{" "}
                                                        {capitalize(
                                                            currentJob.postedBy?.name?.lastName ||
                                                            currentJob.postedBy?.lastName ||
                                                            "",
                                                        )}
                                                    </span>
                                                </Link>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Job Details Grid */}
                                <div className="grid grid-cols-2 gap-6 mb-8 py-6 border-t border-b border-gray-200">
                                    <div>
                                        <h3 className="text-xs font-semibold text-gray-500 uppercase mb-2">
                                            Hourly Rate
                                        </h3>
                                        <p className="text-2xl font-bold text-primary">
                                            NRS{" "}
                                            {currentJob.hourlyRate.toLocaleString()}
                                        </p>
                                        <span className="text-sm text-gray-500">/ hour</span>
                                    </div>
                                    <div>
                                        <h3 className="text-xs font-semibold text-gray-500 uppercase mb-2">
                                            Applicants
                                        </h3>
                                        <p className="text-2xl font-bold text-primary">
                                            {currentJob.applications.length}
                                        </p>
                                        <span className="text-sm text-gray-500">applied</span>
                                    </div>
                                    <div>
                                        <h3 className="text-xs font-semibold text-gray-500 uppercase mb-2">
                                            Assigned to
                                        </h3>
                                        <span className="text-lg font-semibold text-gray-900">
                                            {!currentJob.acceptedFreelancer ? (
                                                <span className="text-gray-400">Not selected</span>
                                            ) : (
                                                <Link
                                                    to={`/profile/${currentJob?.acceptedFreelancer?._id}`}
                                                    className="cursor-pointer hover:underline hover:text-primary text-primary"
                                                >
                                                    {capitalize(
                                                        currentJob?.acceptedFreelancer?.name?.firstName ||
                                                        currentJob?.acceptedFreelancer?.firstName ||
                                                        "",
                                                    )}{" "}
                                                    {capitalize(
                                                        currentJob?.acceptedFreelancer?.name?.lastName ||
                                                        currentJob?.acceptedFreelancer?.lastName ||
                                                        "",
                                                    )}
                                                </Link>
                                            )}
                                        </span>
                                    </div>
                                    <div>
                                        <h3 className="text-xs font-semibold text-gray-500 uppercase mb-2">
                                            Posted
                                        </h3>
                                        <p className="text-lg font-semibold text-gray-900">
                                            {new Date(currentJob.createdAt).toLocaleDateString('en-US', {
                                                year: 'numeric',
                                                month: 'short',
                                                day: 'numeric',
                                            })}
                                        </p>
                                    </div>
                                </div>

                                {/* Tags */}
                                <div className="mb-8">
                                    <h3 className="text-sm font-medium text-gray-500 mb-3">
                                        Skills Required
                                    </h3>
                                    <div className="flex flex-wrap gap-2">
                                        {currentJob.tags.map((item) => (
                                            <Tag title={item} key={item} />
                                        ))}
                                    </div>
                                </div>

                                {/* Description */}
                                <div className="mb-8">
                                    <h2 className="text-xl font-bold text-gray-900 mb-4">
                                        Project Description
                                    </h2>
                                    <p className="text-gray-700 break-all leading-relaxed">
                                        {currentJob.description}
                                    </p>
                                </div>

                                {/* Action Button */}
                                {userData &&
                                    currentJob.postedBy._id === userData._id ? (
                                    <div className="flex justify-between">
                                        {!['completed', 'finished', 'paid'].includes(currentJob.status) && (
                                            <Button
                                                variant="filled"
                                                className="w-4/5 font-semibold bg-emerald-600 border-emerald-600 hover:bg-emerald-700 text-white"
                                                onClick={() =>
                                                    setShowEditJobModal(true)
                                                }
                                            >
                                                Edit Project
                                            </Button>
                                        )}
                                        <Button
                                            onClick={() => {
                                                setShowDeleteModal(true);
                                                if (deleteResErr)
                                                    setDeleteResErr(null);
                                            }}
                                            variant="filled"
                                            className={
                                                "w-1/6 bg-red-500 border-red-500 p-0"
                                            }
                                        >
                                            <FaRegTrashAlt className="w-5 h-5" />
                                        </Button>
                                    </div>
                                ) : (
                                    <>
                                        {["completed", "finished", "paid"].includes(currentJob.status) ? (
                                            <div className="w-full space-y-4">
                                                <div className="py-4 px-6 bg-emerald-50 border-2 border-emerald-200 rounded-lg text-center">
                                                    <p className="text-emerald-700 font-bold text-lg">
                                                        ✓ This project has been completed
                                                    </p>
                                                    <p className="text-emerald-600 text-sm mt-2">
                                                        No new applications are accepted
                                                    </p>
                                                </div>
                                                
                                                {/* Review Button for Client (reviewing freelancer) */}
                                                {userData && currentJob.postedBy._id === userData._id && currentJob.acceptedFreelancer && (
                                                    <div className="border-t pt-4">
                                                        <h3 className="text-lg font-bold text-gray-900 mb-4">⭐ Rate & Review Freelancer</h3>
                                                        <div className="flex justify-start" onClick={(e) => e.stopPropagation()}>
                                                            <ReviewButton
                                                                projectId={currentJob._id}
                                                                onReviewSubmitted={() => {
                                                                    fetchSetCurrentJob();
                                                                }}
                                                            />
                                                        </div>
                                                    </div>
                                                )}

                                                {/* Review Button for Freelancer (reviewing client) */}
                                                {userData && currentJob.acceptedFreelancer?._id === userData._id && (
                                                    <div className="border-t pt-4">
                                                        <h3 className="text-lg font-bold text-gray-900 mb-4">⭐ Rate & Review Client</h3>
                                                        <div className="flex justify-start" onClick={(e) => e.stopPropagation()}>
                                                            <ReviewButton
                                                                projectId={currentJob._id}
                                                                onReviewSubmitted={() => {
                                                                    fetchSetCurrentJob();
                                                                }}
                                                            />
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        ) : currentJob.acceptedFreelancer &&
                                          currentJob.acceptedFreelancer._id !== userData._id ? (
                                            <div className="w-full py-4 px-6 bg-blue-50 border-2 border-blue-200 rounded-lg text-center">
                                                <p className="text-blue-700 font-bold text-lg">
                                                    👤 Freelancer Already Selected
                                                </p>
                                                <p className="text-blue-600 text-sm mt-2">
                                                    {capitalize(
                                                        currentJob.acceptedFreelancer?.name?.firstName ||
                                                        currentJob.acceptedFreelancer?.firstName ||
                                                        "",
                                                    )}{" "}
                                                    {capitalize(
                                                        currentJob.acceptedFreelancer?.name?.lastName ||
                                                        currentJob.acceptedFreelancer?.lastName ||
                                                        "",
                                                    )} is working on this project
                                                </p>
                                            </div>
                                        ) : currentJob.acceptedFreelancer &&
                                          currentJob.acceptedFreelancer._id === userData._id ? (
                                            <div className="w-full py-4 px-6 bg-primary/10 border-2 border-primary rounded-lg text-center">
                                                <p className="text-primary font-bold text-lg">
                                                    ✓ You are selected for this project
                                                </p>
                                                <p className="text-primary/70 text-sm mt-2">
                                                    Proceed to milestones and payments
                                                </p>
                                            </div>
                                        ) : (
                                            <Button
                                                disabled={
                                                    hasApplied ||
                                                    currentJob?.status !== "open"
                                                }
                                                onClick={() => setApplyJobModal(true)}
                                                variant="filled"
                                                className="w-full py-4 font-bold text-lg"
                                            >
                                                {hasApplied
                                                    ? "✓ Already Applied"
                                                    : MapJobStatus[
                                                    currentJob?.status ||
                                                    "closed"
                                                    ]}
                                            </Button>
                                        )}
                                    </>
                                )}
                            </div>
                        )}
                    </div>

                    {/*Applicants List */}
                    {currentJob && userData && (
                        <ApplicantsList
                            currentJobData={currentJob}
                            userData={userData}
                            refetchJobFn={fetchSetCurrentJob}
                        />
                    )}
                </div>

                {/* Reviews Section - Show for Completed Projects */}
                {currentJob && ["completed", "finished", "paid"].includes(currentJob.status) && (
                    <div className="max-w-7xl mx-auto px-4 py-8">
                        <div className="bg-white rounded-lg shadow-md p-8">
                            {/* Client Review Section */}
                            {userData && currentJob.postedBy._id === userData._id && currentJob.acceptedFreelancer && (
                                <div className="space-y-4">
                                    <div>
                                        <h3 className="text-xl font-bold text-gray-900 mb-2">⭐ Rate & Review Freelancer</h3>
                                        <p className="text-sm text-gray-600 mb-4">Share your experience working with {currentJob.acceptedFreelancer?.name?.firstName || 'this freelancer'}</p>
                                    </div>
                                    <div className="flex items-center gap-4" onClick={(e) => e.stopPropagation()}>
                                        <ReviewButton
                                            projectId={currentJob._id}
                                            onReviewSubmitted={() => {
                                                fetchSetCurrentJob();
                                            }}
                                        />
                                    </div>
                                </div>
                            )}
                            
                            {/* Freelancer viewing completed project */}
                            {userData && currentJob.acceptedFreelancer?._id === userData._id && (
                                <div className="text-center py-8 border-t border-gray-200 mt-8">
                                    <p className="text-gray-600 font-medium">
                                        ✓ Project completed! View the client's feedback on your profile
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {userData &&
                    (currentJob?.postedBy?._id === userData?._id ||
                        currentJob?.acceptedFreelancer?._id ===
                        userData?._id) && (
                        <>
                            <JobOverview
                                jobId={currentJob._id}
                                jobData={currentJob}
                                isSelectedFreelancer={
                                    currentJob?.acceptedFreelancer?._id ===
                                    userData?._id
                                }
                            />
                            {currentJob?.acceptedFreelancer && (
                                <Milestones
                                    projectId={currentJob._id}
                                    projectData={currentJob}
                                    onMilestoneUpdate={fetchSetCurrentJob}
                                />
                            )}
                        </>
                    )}
            </div>
        </>
    );
}
export default Jobs;
