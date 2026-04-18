import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useParams, useNavigate, Link } from "react-router";
import api from "../utils/api";
import { Loader } from "../components";
import default_avatar from "../assets/default_avatar.svg";
import {
    FiArrowLeft,
    FiDollarSign,
    FiCalendar,
    FiClipboard,
    FiUser,
    FiBriefcase,
} from "react-icons/fi";
import { useAuth } from "../stores";

function SingleTransaction() {
    const { tId } = useParams();
    const navigate = useNavigate();
    const { userData } = useAuth();
    const [txnData, setTxnData] = useState(null);
    const [fetching, setFetching] = useState(true);
    const isReceiver = userData?._id === txnData?.receiver?._id;

    const fetchSetTxnData = async () => {
        try {
            const response = await api.get(`/user/transactions/${tId}`);
            setTxnData(response.data.data);
            setFetching(false);
        } catch (error) {
            toast.error("Failed to load transaction");
            console.error(error);
        }
    };

    useEffect(() => {
        fetchSetTxnData();
    }, []);

    if (fetching) {
        return <Loader />;
    }

    return (
        <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto mt-8 md:mt-28">
                <button
                    onClick={() => navigate(-1)}
                    className="mb-8 flex items-center text-primary hover:text-primary/60 transition-colors"
                >
                    <FiArrowLeft className="mr-2" />
                    Back
                </button>

                <div className="bg-white rounded-2xl shadow-lg p-6 sm:p-8">
                    {/* Header Section */}
                    <div className="border-b pb-6 mb-6">
                        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 flex items-center">
                            <FiDollarSign className="mr-3 text-primary" />
                            Transaction Details
                        </h1>
                        <p className="mt-2 text-gray-500">
                            Transaction ID: {txnData._id}
                        </p>
                    </div>

                    {/* Main Content Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {/* Left Column */}
                        <div>
                            <div className="space-y-6">
                                <DetailItem
                                    icon={<FiClipboard />}
                                    label="Transaction Code"
                                    value={txnData.transactionCode}
                                />
                                <div className="flex items-start space-x-4">
                                    <span className="text-primary mt-1">
                                        <div className="w-5 h-5 rounded-full bg-[#60bb46] flex items-center justify-center text-[10px] text-white font-bold">e</div>
                                    </span>
                                    <div>
                                        <p className="text-sm text-gray-500">Payment Method</p>
                                        <p className="font-medium text-gray-900">eSewa</p>
                                    </div>
                                </div>
                                <DetailItem
                                    icon={<FiCalendar />}
                                    label="Payment Date & Time"
                                    value={new Date(
                                        txnData.paidTime,
                                    ).toLocaleDateString("en-US", {
                                        year: "numeric",
                                        month: "long",
                                        day: "numeric",
                                        hour: "2-digit",
                                        minute: "2-digit",
                                    })}
                                />
                                <Link
                                    to={`/jobs/${txnData.jobId._id}`}
                                    className="flex items-start space-x-4"
                                >
                                    <span className="text-primary mt-1">
                                        <FiBriefcase />
                                    </span>
                                    <div>
                                        <p className="text-sm text-gray-500">
                                            Project Title
                                        </p>
                                        <p className="font-medium text-gray-900 hover:text-gray-500 break-all">
                                            {txnData.jobId.title}
                                        </p>
                                    </div>
                                </Link>
                            </div>
                        </div>

                        {/* Right Column */}
                        <div>
                            <div className="space-y-6">
                                <DetailItem
                                    icon={<FiDollarSign />}
                                    label="Amount"
                                    value={`Rs. ${txnData.amount.toFixed(2)}`}
                                />
                                <div className="flex items-center space-x-4">
                                    <span className="text-sm font-medium text-gray-500">
                                        Status:
                                    </span>
                                    <span
                                        className={`px-3 py-1 rounded-full text-sm font-medium ${txnData.status === "done"
                                            ? "bg-green-100 text-green-800"
                                            : "bg-yellow-100 text-yellow-800"
                                            }`}
                                    >
                                        {txnData.status}
                                    </span>
                                </div>

                                {/* Parties Involved Section */}
                                <div className="border-t pt-6 space-y-6">
                                    <div>
                                        <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                                            <FiUser className="mr-2 text-primary" />
                                            Sender Details
                                        </h3>
                                        <div className="flex items-center space-x-4">
                                            <img
                                                src={txnData.initiator?.avatar || default_avatar}
                                                alt="Sender"
                                                className="w-12 h-12 rounded-full object-cover border-2 border-primary/30"
                                            />
                                            <div>
                                                <Link
                                                    to={`/profile/${txnData.initiator?._id}`}
                                                    className="font-medium text-gray-900 hover:text-gray-500"
                                                >
                                                    {txnData.initiator?.name ? `${txnData.initiator.name.firstName} ${txnData.initiator.name.lastName}` : "Unknown"}
                                                </Link>
                                            </div>
                                        </div>
                                    </div>

                                    <div>
                                        <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                                            <FiUser className="mr-2 text-primary" />
                                            Receiver Details
                                        </h3>
                                        <div className="flex items-center space-x-4">
                                            <img
                                                src={txnData.receiver?.avatar || default_avatar}
                                                alt="Receiver"
                                                className="w-12 h-12 rounded-full object-cover border-2 border-primary/30"
                                            />
                                            <div>
                                                <Link
                                                    to={`/profile/${txnData.receiver?._id}`}
                                                    className="font-medium text-gray-900 hover:text-gray-500"
                                                >
                                                    {txnData.receiver?.name ? `${txnData.receiver.name.firstName} ${txnData.receiver.name.lastName}` : "Unknown"}
                                                </Link>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Additional Details */}
                    <div className="mt-8 pt-6 border-t">
                        <h3 className="text-lg font-medium text-gray-900 mb-4">
                            Additional Information
                        </h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                            <div className="flex justify-between items-center">
                                <span className="text-gray-500">
                                    Transaction UUID:
                                </span>
                                <span className="font-medium text-gray-900">
                                    {txnData.transactionUUID}
                                </span>
                            </div>
                            <div className="flex gap-x-4 items-center">
                                <span className="text-gray-500">
                                    Initiated At:
                                </span>
                                <span className="font-medium text-gray-900">
                                    {new Date(
                                        txnData.createdAt,
                                    ).toLocaleDateString("en-US", {
                                        year: "numeric",
                                        month: "long",
                                        day: "numeric",
                                        hour: "2-digit",
                                        minute: "2-digit",
                                    })}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

const DetailItem = ({ icon, label, value }) => (
    <div className="flex items-start space-x-4">
        <span className="text-primary mt-1">{icon}</span>
        <div>
            <p className="text-sm text-gray-500">{label}</p>
            <p className="font-medium text-gray-900">{value}</p>
        </div>
    </div>
);

export default SingleTransaction;
