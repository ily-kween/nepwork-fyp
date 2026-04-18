import React, { useEffect, useState } from "react";
import api from "../utils/api";
import toast from "react-hot-toast";
import Button from "./Button";
import { useAuth } from "../stores";
import Loader from "./Loader";
import { FiCheck, FiX, FiEdit2, FiTrash2 } from "react-icons/fi";

function Milestones({ projectId, projectData, onMilestoneUpdate }) {
    const { userData } = useAuth();
    const [milestones, setMilestones] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showCreateForm, setShowCreateForm] = useState(false);
    const [showEditForm, setShowEditForm] = useState(false);
    const [editingMilestone, setEditingMilestone] = useState(null);
    const [submitting, setSubmitting] = useState(false);
    const [selectedTab, setSelectedTab] = useState("active");
    const [formData, setFormData] = useState({
        title: "",
        description: "",
        amount: "",
        deadline: "",
        order: 0,
    });
    const [rejectionReason, setRejectionReason] = useState("");
    const [showRejectModal, setShowRejectModal] = useState(null);

    const isClient = projectData?.postedBy?._id === userData?._id;
    const isFreelancer = projectData?.acceptedFreelancer?._id === userData?._id;

    // Status colors and styles
    const statusStyles = {
        pending: "bg-gray-100 text-gray-800",
        in_progress: "bg-blue-100 text-blue-800",
        completed: "bg-orange-100 text-orange-800",
        approved: "bg-green-100 text-green-800",
        rejected: "bg-red-100 text-red-800",
    };

    const statusLabels = {
        pending: "Pending",
        in_progress: "In Progress",
        completed: "Completed",
        approved: "Approved",
        rejected: "Rejected",
    };

    // Fetch milestones
    const fetchMilestones = async () => {
        try {
            setLoading(true);
            const response = await api.get(`/milestones/project/${projectId}`);
            setMilestones(response.data.data);
        } catch (error) {
            console.error("Failed to fetch milestones:", error);
            toast.error("Failed to load milestones");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (projectId) {
            fetchMilestones();
        }
    }, [projectId]);

    // Handle form input change
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    // Create milestone
    const handleCreateMilestone = async (e) => {
        e.preventDefault();
        setSubmitting(true);

        try {
            if (!formData.title || !formData.description || !formData.amount || !formData.deadline) {
                toast.error("Please fill all required fields");
                return;
            }

            await api.post("/milestones", {
                projectId,
                ...formData,
                amount: parseFloat(formData.amount),
            });

            toast.success("Milestone created successfully");
            setFormData({
                title: "",
                description: "",
                amount: "",
                deadline: "",
                order: 0,
            });
            setShowCreateForm(false);
            await fetchMilestones();
            if (onMilestoneUpdate) onMilestoneUpdate();
        } catch (error) {
            console.error("Failed to create milestone:", error);
            toast.error(error.response?.data?.message || "Failed to create milestone");
        } finally {
            setSubmitting(false);
        }
    };

    // Update milestone
    const handleUpdateMilestone = async (e) => {
        e.preventDefault();
        setSubmitting(true);

        try {
            if (!formData.title || !formData.description || !formData.amount || !formData.deadline) {
                toast.error("Please fill all required fields");
                return;
            }

            await api.patch(`/milestones/${editingMilestone._id}`, {
                title: formData.title,
                description: formData.description,
                amount: parseFloat(formData.amount),
                deadline: formData.deadline,
                order: formData.order,
            });

            toast.success("Milestone updated successfully");
            setShowEditForm(false);
            setEditingMilestone(null);
            setFormData({
                title: "",
                description: "",
                amount: "",
                deadline: "",
                order: 0,
            });
            await fetchMilestones();
            if (onMilestoneUpdate) onMilestoneUpdate();
        } catch (error) {
            console.error("Failed to update milestone:", error);
            toast.error(error.response?.data?.message || "Failed to update milestone");
        } finally {
            setSubmitting(false);
        }
    };

    // Complete milestone
    const handleCompleteMilestone = async (milestoneId) => {
        try {
            await api.patch(`/milestones/${milestoneId}/complete`);
            toast.success("Milestone marked as completed");
            await fetchMilestones();
            if (onMilestoneUpdate) onMilestoneUpdate();
        } catch (error) {
            console.error("Failed to complete milestone:", error);
            toast.error(error.response?.data?.message || "Failed to complete milestone");
        }
    };

    // Approve milestone
    const handleApproveMilestone = async (milestoneId) => {
        try {
            await api.patch(`/milestones/${milestoneId}/approve`);
            toast.success("Milestone approved successfully");
            await fetchMilestones();
            if (onMilestoneUpdate) onMilestoneUpdate();
        } catch (error) {
            console.error("Failed to approve milestone:", error);
            toast.error(error.response?.data?.message || "Failed to approve milestone");
        }
    };

    // Reject milestone
    const handleRejectMilestone = async (milestoneId) => {
        if (!rejectionReason.trim()) {
            toast.error("Please provide a rejection reason");
            return;
        }

        try {
            await api.patch(`/milestones/${milestoneId}/reject`, {
                reason: rejectionReason,
            });
            toast.success("Milestone rejected successfully");
            setShowRejectModal(null);
            setRejectionReason("");
            await fetchMilestones();
            if (onMilestoneUpdate) onMilestoneUpdate();
        } catch (error) {
            console.error("Failed to reject milestone:", error);
            toast.error(error.response?.data?.message || "Failed to reject milestone");
        }
    };

    // Delete milestone
    const handleDeleteMilestone = async (milestoneId) => {
        if (window.confirm("Are you sure you want to delete this milestone?")) {
            try {
                await api.delete(`/milestones/${milestoneId}`);
                toast.success("Milestone deleted successfully");
                await fetchMilestones();
                if (onMilestoneUpdate) onMilestoneUpdate();
            } catch (error) {
                console.error("Failed to delete milestone:", error);
                toast.error(error.response?.data?.message || "Failed to delete milestone");
            }
        }
    };

    // Start editing milestone
    const startEditMilestone = (milestone) => {
        setEditingMilestone(milestone);
        setFormData({
            title: milestone.title,
            description: milestone.description,
            amount: milestone.amount,
            deadline: new Date(milestone.deadline).toISOString().split("T")[0],
            order: milestone.order,
        });
        setShowEditForm(true);
        setShowCreateForm(false);
    };

    // Format date
    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
        });
    };

    // Calculate progress
    const completedCount = milestones.filter((m) => m.status === "approved").length;
    const totalCount = milestones.length;
    const progressPercentage = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;

    // Separate milestones into active and completed
    // Active: pending, in_progress, rejected (still being worked on or needs revision)
    // Completed: completed, approved (submitted for review or already approved)
    const activeMilestones = milestones.filter((m) => 
        ["pending", "in_progress", "rejected"].includes(m.status)
    );
    const completedMilestones = milestones.filter((m) => 
        ["completed", "approved"].includes(m.status)
    );

    // Determine which milestones to display
    const displayedMilestones = selectedTab === "active" ? activeMilestones : completedMilestones;

    if (loading) return <Loader />;

    return (
        <div className="mt-8 max-w-7xl mx-auto px-4 pb-8">
            <div className="bg-white rounded-lg shadow-md p-6">
                <div className="flex justify-between items-center mb-6 border-b pb-4">
                    <h2 className="text-2xl font-bold text-gray-900">Milestones</h2>
                    {isClient && !showCreateForm && !showEditForm && !['completed', 'finished', 'paid'].includes(projectData?.status) && (
                        <button
                            onClick={() => setShowCreateForm(true)}
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                        >
                            + Add Milestone
                        </button>
                    )}
                </div>

                {/* Tab Navigation */}
                {totalCount > 0 && (
                    <div className="flex gap-4 mb-6 border-b border-gray-200">
                        <button
                            onClick={() => setSelectedTab("active")}
                            className={`pb-3 px-1 font-medium transition-colors relative ${
                                selectedTab === "active"
                                    ? "text-blue-600 border-b-2 border-blue-600"
                                    : "text-gray-600 hover:text-gray-900"
                            }`}
                        >
                            Active
                            <span className="ml-2 inline-block bg-gray-100 text-gray-700 rounded-full w-6 h-6 text-xs font-semibold">
                                {activeMilestones.length}
                            </span>
                        </button>
                        <button
                            onClick={() => setSelectedTab("completed")}
                            className={`pb-3 px-1 font-medium transition-colors relative ${
                                selectedTab === "completed"
                                    ? "text-green-600 border-b-2 border-green-600"
                                    : "text-gray-600 hover:text-gray-900"
                            }`}
                        >
                            Completed
                            <span className="ml-2 inline-block bg-green-100 text-green-700 rounded-full w-6 h-6 text-xs font-semibold">
                                {completedMilestones.length}
                            </span>
                        </button>
                    </div>
                )}

                {/* Progress Bar */}
                {totalCount > 0 && (
                    <div className="mb-6">
                        <div className="flex justify-between items-center mb-2">
                            <span className="text-sm font-medium text-gray-700">
                                Progress: {completedCount}/{totalCount} completed
                            </span>
                            <span className="text-sm text-gray-600">{Math.round(progressPercentage)}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                                className="bg-green-600 h-2 rounded-full transition-all duration-300"
                                style={{ width: `${progressPercentage}%` }}
                            ></div>
                        </div>
                    </div>
                )}

                {/* Create/Edit Form */}
                {(showCreateForm || showEditForm) && (
                    <div className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
                        <h3 className="text-lg font-semibold mb-4">
                            {showEditForm ? "Edit Milestone" : "Create New Milestone"}
                        </h3>
                        <form
                            onSubmit={showEditForm ? handleUpdateMilestone : handleCreateMilestone}
                            className="space-y-4"
                        >
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Title <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        name="title"
                                        value={formData.title}
                                        onChange={handleInputChange}
                                        placeholder="e.g., Design Phase"
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Amount (NRS) <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="number"
                                        name="amount"
                                        value={formData.amount}
                                        onChange={handleInputChange}
                                        placeholder="0.00"
                                        step="0.01"
                                        min="0"
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        required
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Description <span className="text-red-500">*</span>
                                </label>
                                <textarea
                                    name="description"
                                    value={formData.description}
                                    onChange={handleInputChange}
                                    placeholder="Describe what needs to be done for this milestone..."
                                    rows="3"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    required
                                />
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Deadline <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="date"
                                        name="deadline"
                                        value={formData.deadline}
                                        onChange={handleInputChange}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Order
                                    </label>
                                    <input
                                        type="number"
                                        name="order"
                                        value={formData.order}
                                        onChange={handleInputChange}
                                        placeholder="0"
                                        min="0"
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>
                            </div>
                            <div className="flex gap-3 pt-4">
                                <button
                                    type="submit"
                                    disabled={submitting}
                                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-blue-400 transition"
                                >
                                    {submitting ? "Saving..." : showEditForm ? "Update" : "Create"}
                                </button>
                                <button
                                    type="button"
                                    onClick={() => {
                                        setShowCreateForm(false);
                                        setShowEditForm(false);
                                        setEditingMilestone(null);
                                        setFormData({
                                            title: "",
                                            description: "",
                                            amount: "",
                                            deadline: "",
                                            order: 0,
                                        });
                                    }}
                                    className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition"
                                >
                                    Cancel
                                </button>
                            </div>
                        </form>
                    </div>
                )}

                {/* Milestones List */}
                {displayedMilestones.length === 0 ? (
                    <div className="text-center py-8">
                        <p className="text-gray-500 text-lg">
                            {selectedTab === "active"
                                ? milestones.length === 0
                                    ? "No milestones yet"
                                    : "All milestones submitted for review!"
                                : "No submitted/approved milestones yet"}
                        </p>
                        {isClient && milestones.length === 0 && (
                            <p className="text-gray-400 text-sm mt-2">
                                Create milestones to divide this project into manageable phases
                            </p>
                        )}
                    </div>
                ) : (
                    <>
                        {selectedTab === "completed" && (
                            <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                                <p className="text-sm text-blue-800">
                                    <span className="font-semibold">Completed:</span> Freelancer submitted work, awaiting client approval | 
                                    <span className="font-semibold ml-2">Approved:</span> Client approved and accepted the work
                                </p>
                            </div>
                        )}
                    
                    {/* Timeline View */}
                    <div className="relative">
                        {/* Vertical Timeline Line */}
                        <div className="absolute left-5 top-0 bottom-0 w-1 bg-gradient-to-b from-blue-300 via-purple-300 to-pink-300"></div>

                        <div className="space-y-4">
                            {displayedMilestones.map((milestone, index) => {
                                const isCompleted = ["completed", "approved"].includes(milestone.status);
                                const isInProgress = milestone.status === "in_progress";
                                const isRejected = milestone.status === "rejected";
                                
                                let dotColor = "bg-gray-400";
                                if (isCompleted) dotColor = "bg-gradient-to-br from-emerald-400 to-emerald-600";
                                if (isInProgress) dotColor = "bg-gradient-to-br from-blue-400 to-blue-600";
                                if (isRejected) dotColor = "bg-gradient-to-br from-red-400 to-red-600";

                                return (
                                    <div key={milestone._id} className="relative pl-16">
                                        {/* Timeline Dot */}
                                        <div className={`absolute left-0 w-10 h-10 rounded-full ${dotColor} flex items-center justify-center text-white font-bold text-sm border-4 border-white shadow-lg z-10`}>
                                            {isCompleted ? "✓" : isInProgress ? "→" : index + 1}
                                        </div>

                                        {/* Milestone Card */}
                                        <div className="bg-white rounded-lg border border-gray-200 hover:border-gray-300 hover:shadow-lg transition-all p-5">
                                            <div className="flex justify-between items-start mb-3">
                                                <div className="flex-1">
                                                    <div className="flex items-center gap-3 mb-2">
                                                        <h3 className="text-lg font-bold text-gray-900">{milestone.title}</h3>
                                                        <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${statusStyles[milestone.status]}`}>
                                                            {statusLabels[milestone.status]}
                                                        </span>
                                                    </div>
                                                    <p className="text-gray-600 text-sm">{milestone.description}</p>
                                                </div>
                                                {(isClient || isFreelancer) && milestone.status === "pending" && !['completed', 'finished', 'paid'].includes(projectData?.status) && (
                                                    <div className="flex gap-2 ml-4">
                                                        <button
                                                            onClick={() => startEditMilestone(milestone)}
                                                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                                                            title="Edit"
                                                        >
                                                            <FiEdit2 size={18} />
                                                        </button>
                                                        {isClient && (
                                                            <button
                                                                onClick={() => handleDeleteMilestone(milestone._id)}
                                                                className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                                                                title="Delete"
                                                            >
                                                                <FiTrash2 size={18} />
                                                            </button>
                                                        )}
                                                    </div>
                                                )}
                                            </div>

                                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 my-4 py-3 border-y border-gray-200">
                                                <div>
                                                    <p className="text-xs font-bold text-gray-500 uppercase tracking-wide">Amount</p>
                                                    <p className="text-lg font-black text-gray-900 mt-1">NRS {milestone.amount.toLocaleString()}</p>
                                                </div>
                                                <div>
                                                    <p className="text-xs font-bold text-gray-500 uppercase tracking-wide">Deadline</p>
                                                    <p className="text-sm font-bold text-gray-700 mt-1">{formatDate(milestone.deadline)}</p>
                                                </div>
                                                <div>
                                                    <p className="text-xs font-bold text-gray-500 uppercase tracking-wide">Progress</p>
                                                    <div className="mt-1 flex items-center">
                                                        <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden mr-2">
                                                            <div 
                                                                className={`h-full ${isCompleted ? 'bg-emerald-500' : isInProgress ? 'bg-blue-500' : 'bg-gray-400'}`} 
                                                                style={{ width: isCompleted ? '100%' : isInProgress ? '66%' : '0%' }}
                                                            ></div>
                                                        </div>
                                                        <span className="text-xs font-bold text-gray-700">{isCompleted ? '100%' : isInProgress ? '66%' : '0%'}</span>
                                                    </div>
                                                </div>
                                                <div>
                                                    <p className="text-xs font-bold text-gray-500 uppercase tracking-wide">Order</p>
                                                    <p className="text-sm font-bold text-gray-700 mt-1">#{milestone.order || index + 1}</p>
                                                </div>
                                            </div>
                                            <div>
                                                <p className="text-xs text-gray-500 font-medium">CREATED BY</p>
                                                <p className="text-sm font-medium text-gray-700">
                                                    {milestone.createdBy
                                                        ? `${milestone.createdBy.firstName || ''} ${milestone.createdBy.lastName || ''}`.trim()
                                                        : "Unknown"}
                                                </p>
                                            </div>
                                    {milestone.completedAt && (
                                        <div>
                                            <p className="text-xs text-gray-500 font-medium">COMPLETED</p>
                                            <p className="text-sm font-medium text-gray-700">
                                                {formatDate(milestone.completedAt)}
                                            </p>
                                        </div>
                                    )}
                                </div>

                                {/* Rejection Reason Display */}
                                {milestone.status === "rejected" && milestone.rejectionReason && (
                                    <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                                        <p className="text-xs font-medium text-red-800 mb-1">REJECTION REASON</p>
                                        <p className="text-sm text-red-700">{milestone.rejectionReason}</p>
                                    </div>
                                )}

                                {/* Action Buttons */}
                                <div className="flex gap-2 flex-wrap">
                                    {/* Freelancer Actions */}
                                    {isFreelancer && milestone.status === "pending" && (
                                        <button
                                            onClick={() => handleCompleteMilestone(milestone._id)}
                                            className="flex items-center gap-2 px-3 py-2 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 transition"
                                        >
                                            <FiCheck size={16} /> Mark Complete
                                        </button>
                                    )}

                                    {isFreelancer && milestone.status === "rejected" && (
                                        <button
                                            onClick={() => handleCompleteMilestone(milestone._id)}
                                            className="flex items-center gap-2 px-3 py-2 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 transition"
                                        >
                                            <FiCheck size={16} /> Resubmit
                                        </button>
                                    )}

                                    {/* Client Actions */}
                                    {isClient && milestone.status === "completed" && (
                                        <>
                                            <button
                                                onClick={() => handleApproveMilestone(milestone._id)}
                                                className="flex items-center gap-2 px-3 py-2 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 transition"
                                            >
                                                <FiCheck size={16} /> Approve
                                            </button>
                                            <button
                                                onClick={() => setShowRejectModal(milestone._id)}
                                                className="flex items-center gap-2 px-3 py-2 bg-red-600 text-white text-sm rounded-lg hover:bg-red-700 transition"
                                            >
                                                <FiX size={16} /> Reject
                                            </button>
                                        </>
                                    )}

                                    {isClient && ["pending", "in_progress"].includes(milestone.status) && (
                                        <>
                                            <button
                                                onClick={() => startEditMilestone(milestone)}
                                                className="flex items-center gap-2 px-3 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition"
                                            >
                                                <FiEdit2 size={16} /> Edit
                                            </button>
                                            <button
                                                onClick={() => handleDeleteMilestone(milestone._id)}
                                                className="flex items-center gap-2 px-3 py-2 bg-gray-600 text-white text-sm rounded-lg hover:bg-gray-700 transition"
                                            >
                                                <FiTrash2 size={16} /> Delete
                                            </button>
                                        </>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                    </div>
                    </div>
                    </>
                )}

                {/* Rejection Modal */}
                {showRejectModal && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                        <div className="bg-white rounded-lg shadow-lg p-6 max-w-md w-full mx-4">
                            <h3 className="text-lg font-semibold mb-4 text-gray-900">Reject Milestone</h3>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Reason for Rejection
                            </label>
                            <textarea
                                value={rejectionReason}
                                onChange={(e) => setRejectionReason(e.target.value)}
                                placeholder="Please provide feedback on what needs to be improved..."
                                rows="4"
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 mb-4"
                            />
                            <div className="flex gap-3">
                                <button
                                    onClick={() => handleRejectMilestone(showRejectModal)}
                                    className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
                                >
                                    Reject
                                </button>
                                <button
                                    onClick={() => {
                                        setShowRejectModal(null);
                                        setRejectionReason("");
                                    }}
                                    className="flex-1 px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition"
                                >
                                    Cancel
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

export default Milestones;
