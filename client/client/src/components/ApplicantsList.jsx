import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import api from "../utils/api";
import Button from "./Button";
import default_avatar from "../assets/default_avatar.svg";
import { FiMessageSquare, FiUserCheck } from "react-icons/fi";
import { HiOutlineClock } from "react-icons/hi";
import { Link } from "react-router";
import ConfirmModal from "./ConfirmModal";
import capitalize from "../utils/capitalize";
import ViewMsgModal from "./ViewMsgModal";

function ApplicantsList({ currentJobData, userData, refetchJobFn }) {
    const [applicants, setApplicants] = useState([]);

    const fetchSetApplicants = async () => {
        try {
            const response = await api.get(
                `/jobs/applicants/${currentJobData._id}`,
            );
            setApplicants(response.data.data);
        } catch (error) {
            toast.error("Failed to fetch applicants");
            console.error(error);
        }
    };

    useEffect(() => {
        fetchSetApplicants();
    }, [currentJobData]);

    const [acceptFreelancerModal, setAcceptFreelancerModal] = useState(false);
    const [acceptErr, setAcceptErr] = useState(null);
    const [acceptLoading, setAcceptLoading] = useState(false);
    const [currentSelectedApplicant, setCurrentSelectedApplicant] =
        useState(null);
    const [viewMsgModal, setViewMsgModal] = useState(false);

    const handleAcceptOnConfirm = async () => {
        setAcceptLoading(true);
        if (acceptErr) setAcceptErr(null);
        try {
            await api.post(`/jobs/${currentJobData._id}/accept-freelancer`, {
                acceptedFreelancerId: currentSelectedApplicant.appliedBy._id,
            });
            await refetchJobFn();
            toast.success("Freelancer accepted");
            setAcceptFreelancerModal(false);
        } catch (error) {
            setAcceptErr(error.response.data.message || "Failed to accept");
            console.error(error);
        } finally {
            setAcceptLoading(false);
        }
    };

    return (
        <>
            {viewMsgModal && (
                <ViewMsgModal
                    message={currentSelectedApplicant.message}
                    setModalFn={setViewMsgModal}
                />
            )}
            {acceptFreelancerModal && (
                <ConfirmModal
                    title={`Are you sure to accept ${currentSelectedApplicant.appliedBy?.name?.firstName || currentSelectedApplicant.appliedBy?.firstName || ''} ${currentSelectedApplicant.appliedBy?.name?.lastName || currentSelectedApplicant.appliedBy?.lastName || ''}?`}
                    setShowModalFn={setAcceptFreelancerModal}
                    onConfirmFn={handleAcceptOnConfirm}
                    loading={acceptLoading}
                    err={acceptErr}
                />
            )}
            <div className="w-full md:w-96 lg:w-[500px]">
                <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100 transition-all duration-300 hover:shadow-xl">
                    <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-100">
                        <h2 className="text-xl font-semibold text-gray-800">
                            Applicants
                            <span className="ml-2 text-white bg-blue-600 px-2.5 py-0.5 rounded-full text-sm font-medium">
                                {applicants.length}
                            </span>
                        </h2>
                    </div>

                    <div className="space-y-4">
                        {applicants.length === 0 ? (
                            <div className="text-center p-6 rounded-lg bg-gray-50 border border-dashed border-gray-200">
                                <p className="text-gray-500">
                                    No applicants yet
                                </p>
                            </div>
                        ) : (
                            applicants.map((item) => (
                                <ApplicantListCard
                                    key={item.appliedBy._id}
                                    applicantData={item}
                                    isOwner={
                                        currentJobData.postedBy._id ===
                                        userData?._id
                                    }
                                />
                            ))
                        )}
                    </div>
                </div>
            </div>{" "}
        </>
    );

    function ApplicantListCard({ applicantData, isOwner }) {
        const getTimeSinceApplied = (createdAt) => {
            const now = new Date();
            const createdTime = new Date(createdAt);
            const timeDifference = Math.floor((now - createdTime) / 1000);

            if (timeDifference < 60) return `${timeDifference} seconds ago`;
            if (timeDifference < 3600) {
                const minutes = Math.floor(timeDifference / 60);
                return `Applied ${minutes} minute${minutes > 1 ? "s" : ""} ago`;
            }
            if (timeDifference < 86400) {
                const hours = Math.floor(timeDifference / 3600);
                return `Applied ${hours} hour${hours > 1 ? "s" : ""} ago`;
            }
            const days = Math.floor(timeDifference / 86400);
            return `Applied ${days} day${days > 1 ? "s" : ""} ago`;
        };

        return (
            <div
                className={`group p-4 rounded-lg transition-all duration-200 hover:bg-gray-50 border-2 ${
                    currentJobData?.acceptedFreelancer?._id ===
                    applicantData?.appliedBy._id
                        ? "border-green-500 bg-green-50 hover:bg-green-50"
                        : "border-gray-100 hover:border-gray-300"
                } shadow-sm hover:shadow-md`}
            >
                <div className="flex items-start gap-4">
                    {/* Image Section */}
                    <div className="flex-shrink-0">
                        <img
                            src={
                                applicantData.appliedBy.avatar || default_avatar
                            }
                            alt={`${applicantData.appliedBy?.name?.firstName || applicantData.appliedBy?.firstName || 'User'}'s avatar`}
                            className="w-14 h-14 rounded-full object-cover border-2 border-white shadow-md"
                        />
                    </div>

                    {/* Content Section */}
                    <div className="flex-1 min-w-0 space-y-2">
                        <div className="flex items-baseline gap-2">
                            <Link
                                to={`/profile/${applicantData.appliedBy._id}`}
                                className="text-lg font-semibold text-gray-900 hover:text-blue-600 hover:underline truncate"
                            >
                                {capitalize(
                                    applicantData.appliedBy?.name?.firstName || applicantData.appliedBy?.firstName || '',
                                )}{" "}
                                {capitalize(
                                    applicantData.appliedBy?.name?.lastName || applicantData.appliedBy?.lastName || '',
                                )}
                            </Link>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                            <HiOutlineClock className="w-4 h-4 flex-shrink-0" />
                            <span>
                                {getTimeSinceApplied(applicantData.createdAt)}
                            </span>
                        </div>
                        {/* Action Buttons */}
                        {isOwner && (
                            <div className="flex flex-col sm:flex-row gap-2 pt-3">
                                <Button
                                    variant="outline"
                                    className="text-sm px-3 py-2 w-full justify-center gap-2 hover:bg-gray-100"
                                    onClick={() => {
                                        setCurrentSelectedApplicant(
                                            applicantData,
                                        );
                                        setViewMsgModal(true);
                                    }}
                                >
                                    <FiMessageSquare className="w-4 h-4 flex-shrink-0" />
                                    <span className="truncate">View Msg</span>
                                </Button>
                                <Button
                                    disabled={
                                        currentJobData.acceptedFreelancer
                                            ? true
                                            : false
                                    }
                                    variant="filled"
                                    className={`text-sm px-3 py-2 w-full justify-center gap-1 ${
                                        currentJobData.acceptedFreelancer
                                            ? "bg-gray-300 hover:bg-gray-300 cursor-not-allowed"
                                            : "bg-green-600 hover:bg-green-700"
                                    } ${
                                        currentJobData.acceptedFreelancer
                                            ?._id ===
                                        applicantData.appliedBy._id
                                            ? "bg-primary border-primary text-white"
                                            : ""
                                    }
`}
                                    onClick={() => {
                                        setCurrentSelectedApplicant(
                                            applicantData,
                                        );
                                        setAcceptFreelancerModal(true);
                                    }}
                                >
                                    <FiUserCheck className="w-4 h-4 flex-shrink-0" />
                                    <span className="truncate">
                                        {currentJobData.acceptedFreelancer
                                            ?._id ===
                                        applicantData.appliedBy._id
                                            ? "Accepted"
                                            : "Accept"}
                                    </span>
                                </Button>
                            </div>
                        )}{" "}
                    </div>
                </div>
            </div>
        );
    }
}

export default ApplicantsList;
