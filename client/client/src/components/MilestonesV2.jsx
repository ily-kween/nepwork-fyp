import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import api from "../utils/api";
import toast from "react-hot-toast";
import Loader from "./Loader";
import { useAuth } from "../stores";
import { FiCheck, FiX, FiEdit2, FiTrash2, FiCreditCard } from "react-icons/fi";

function Milestones({ projectId, projectData, onMilestoneUpdate }) {
    const navigate = useNavigate();
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
    const canManageMilestones = isClient && ["assigned", "in_progress", "pending_review", "completed", "paid"].includes(projectData?.status);
    const canReviewMilestones = isClient;

    const statusStyles = {
        pending: "bg-slate-100 text-slate-700",
        in_progress: "bg-sky-100 text-sky-700",
        completed: "bg-amber-100 text-amber-700",
        approved: "bg-emerald-100 text-emerald-700",
        rejected: "bg-rose-100 text-rose-700",
    };

    const paymentStyles = {
        pending_payment: "bg-yellow-100 text-yellow-700",
        released: "bg-emerald-100 text-emerald-700",
        not_required: "bg-slate-100 text-slate-700",
    };

    const statusLabels = {
        pending: "Pending",
        in_progress: "In Progress",
        completed: "Completed",
        approved: "Approved",
        rejected: "Rejected",
    };

    const paymentLabels = {
        pending_payment: "Payment Pending",
        released: "Payment Released",
        not_required: "No Payment",
    };

    const fetchMilestones = async () => {
        try {
            setLoading(true);
            const response = await api.get(`/milestones/project/${projectId}`);
            setMilestones(Array.isArray(response.data?.data) ? response.data.data : []);
        } catch (error) {
            console.error("Failed to fetch milestones:", error);
            toast.error("Failed to load milestones");
            setMilestones([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (projectId) {
            fetchMilestones();
        }
    }, [projectId]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const resetForm = () => {
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
    };

    const handleCreateMilestone = async (e) => {
        e.preventDefault();
        if (!canManageMilestones) {
            toast.error("Only the project client can create milestones");
            return;
        }

        if (!formData.title || !formData.description || !formData.amount || !formData.deadline) {
            toast.error("Please fill all required fields");
            return;
        }

        setSubmitting(true);
        try {
            await api.post("/milestones", {
                projectId,
                title: formData.title,
                description: formData.description,
                amount: Number(formData.amount),
                deadline: formData.deadline,
                order: Number(formData.order || 0),
            });

            toast.success("Milestone created successfully");
            resetForm();
            await fetchMilestones();
            onMilestoneUpdate?.();
        } catch (error) {
            console.error("Failed to create milestone:", error);
            toast.error(error.response?.data?.message || "Failed to create milestone");
        } finally {
            setSubmitting(false);
        }
    };

    const handleUpdateMilestone = async (e) => {
        e.preventDefault();
        if (!editingMilestone) return;

        if (!canManageMilestones) {
            toast.error("Only the project client can update milestones");
            return;
        }

        if (!formData.title || !formData.description || !formData.amount || !formData.deadline) {
            toast.error("Please fill all required fields");
            return;
        }

        setSubmitting(true);
        try {
            await api.patch(`/milestones/${editingMilestone._id}`, {
                title: formData.title,
                description: formData.description,
                amount: Number(formData.amount),
                deadline: formData.deadline,
                order: Number(formData.order || 0),
            });

            toast.success("Milestone updated successfully");
            resetForm();
            await fetchMilestones();
            onMilestoneUpdate?.();
        } catch (error) {
            console.error("Failed to update milestone:", error);
            toast.error(error.response?.data?.message || "Failed to update milestone");
        } finally {
            setSubmitting(false);
        }
    };

    const handleCompleteMilestone = async (milestoneId) => {
        try {
            await api.patch(`/milestones/${milestoneId}/complete`);
            toast.success("Milestone marked as completed");
            await fetchMilestones();
            onMilestoneUpdate?.();
        } catch (error) {
            console.error("Failed to complete milestone:", error);
            toast.error(error.response?.data?.message || "Failed to complete milestone");
        }
    };

    const handleApproveMilestone = async (milestoneId) => {
        try {
            await api.patch(`/milestones/${milestoneId}/approve`);
            toast.success("Milestone approved. Payment can now be released.");
            await fetchMilestones();
            onMilestoneUpdate?.();
        } catch (error) {
            console.error("Failed to approve milestone:", error);
            toast.error(error.response?.data?.message || "Failed to approve milestone");
        }
    };

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
            onMilestoneUpdate?.();
        } catch (error) {
            console.error("Failed to reject milestone:", error);
            toast.error(error.response?.data?.message || "Failed to reject milestone");
        }
    };

    const handleDeleteMilestone = async (milestoneId) => {
        if (!window.confirm("Are you sure you want to delete this milestone?")) {
            return;
        }

        try {
            await api.delete(`/milestones/${milestoneId}`);
            toast.success("Milestone deleted successfully");
            await fetchMilestones();
            onMilestoneUpdate?.();
        } catch (error) {
            console.error("Failed to delete milestone:", error);
            toast.error(error.response?.data?.message || "Failed to delete milestone");
        }
    };

    const handlePayMilestone = (milestoneId) => {
        navigate(`/milestones/${milestoneId}/pay`);
    };

    const startEditMilestone = (milestone) => {
        setEditingMilestone(milestone);
        setFormData({
            title: milestone.title,
            description: milestone.description,
            amount: milestone.amount,
            deadline: milestone.deadline ? new Date(milestone.deadline).toISOString().split("T")[0] : "",
            order: milestone.order || 0,
        });
        setShowEditForm(true);
        setShowCreateForm(false);
    };

    const formatDate = (dateString) => new Date(dateString).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
    });

    const approvedCount = milestones.filter((milestone) => milestone.status === "approved").length;
    const totalCount = milestones.length;
    const progressPercentage = totalCount > 0 ? (approvedCount / totalCount) * 100 : 0;

    const activeMilestones = milestones.filter((milestone) => ["pending", "in_progress", "rejected"].includes(milestone.status));
    const completedMilestones = milestones.filter((milestone) => ["completed", "approved"].includes(milestone.status));
    const displayedMilestones = selectedTab === "active" ? activeMilestones : completedMilestones;

    if (loading) return <Loader />;

    return (
        <div className="mt-8 max-w-7xl mx-auto px-4 pb-8">
            <div className="bg-white rounded-2xl shadow-lg p-6">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6 border-b border-slate-200 pb-4">
                    <div>
                        <h2 className="text-2xl font-bold text-slate-900">Milestones</h2>
                        <p className="text-sm text-slate-500 mt-1">Milestones are defined and approved by the client, completed by the freelancer, and released phase by phase.</p>
                    </div>
                    {canManageMilestones && !showCreateForm && !showEditForm && !["completed", "paid"].includes(projectData?.status) && (
                        <button
                            onClick={() => setShowCreateForm(true)}
                            className="px-4 py-2 rounded-xl bg-slate-900 text-white font-semibold hover:bg-slate-700 transition"
                        >
                            + Add Milestone
                        </button>
                    )}
                </div>

                {totalCount > 0 && (
                    <div className="flex gap-4 mb-6 border-b border-slate-200">
                        <button
                            onClick={() => setSelectedTab("active")}
                            className={`pb-3 px-1 font-medium transition-colors ${selectedTab === "active" ? "text-slate-900 border-b-2 border-slate-900" : "text-slate-500"}`}
                        >
                            Active <span className="ml-2 text-xs bg-slate-100 px-2 py-1 rounded-full">{activeMilestones.length}</span>
                        </button>
                        <button
                            onClick={() => setSelectedTab("completed")}
                            className={`pb-3 px-1 font-medium transition-colors ${selectedTab === "completed" ? "text-emerald-700 border-b-2 border-emerald-700" : "text-slate-500"}`}
                        >
                            Completed <span className="ml-2 text-xs bg-emerald-50 px-2 py-1 rounded-full">{completedMilestones.length}</span>
                        </button>
                    </div>
                )}

                {totalCount > 0 && (
                    <div className="mb-6">
                        <div className="flex items-center justify-between text-sm mb-2">
                            <span className="font-medium text-slate-700">Approved milestones: {approvedCount}/{totalCount}</span>
                            <span className="text-slate-500">{Math.round(progressPercentage)}%</span>
                        </div>
                        <div className="w-full h-2 rounded-full bg-slate-200 overflow-hidden">
                            <div className="h-full bg-emerald-500 rounded-full transition-all" style={{ width: `${progressPercentage}%` }} />
                        </div>
                    </div>
                )}

                {(showCreateForm || showEditForm) && (
                    <form onSubmit={showEditForm ? handleUpdateMilestone : handleCreateMilestone} className="mb-6 p-4 rounded-2xl border border-slate-200 bg-slate-50 space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <input
                                name="title"
                                value={formData.title}
                                onChange={handleInputChange}
                                placeholder="Milestone name"
                                className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 outline-none focus:ring-2 focus:ring-slate-900"
                                required
                            />
                            <input
                                type="number"
                                name="amount"
                                value={formData.amount}
                                onChange={handleInputChange}
                                placeholder="Cost"
                                min="0"
                                step="0.01"
                                className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 outline-none focus:ring-2 focus:ring-slate-900"
                                required
                            />
                        </div>
                        <textarea
                            name="description"
                            value={formData.description}
                            onChange={handleInputChange}
                            placeholder="Describe the work for this milestone"
                            rows="4"
                            className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 outline-none focus:ring-2 focus:ring-slate-900"
                            required
                        />
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <input
                                type="date"
                                name="deadline"
                                value={formData.deadline}
                                onChange={handleInputChange}
                                className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 outline-none focus:ring-2 focus:ring-slate-900"
                                required
                            />
                            <input
                                type="number"
                                name="order"
                                value={formData.order}
                                onChange={handleInputChange}
                                placeholder="Sequence"
                                min="0"
                                className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 outline-none focus:ring-2 focus:ring-slate-900"
                            />
                        </div>
                        <div className="flex gap-3">
                            <button type="submit" disabled={submitting} className="px-4 py-2 rounded-xl bg-slate-900 text-white font-semibold disabled:opacity-60">
                                {submitting ? "Saving..." : showEditForm ? "Update Milestone" : "Create Milestone"}
                            </button>
                            <button type="button" onClick={resetForm} className="px-4 py-2 rounded-xl bg-white border border-slate-300 text-slate-700 font-semibold">
                                Cancel
                            </button>
                        </div>
                    </form>
                )}

                {displayedMilestones.length === 0 ? (
                    <div className="text-center py-10 text-slate-500">
                        <p className="text-lg font-medium">{selectedTab === "active" ? (milestones.length === 0 ? "No milestones yet" : "All active milestones have been submitted") : "No approved milestones yet"}</p>
                        {canManageMilestones && milestones.length === 0 && (
                            <p className="text-sm mt-2">Add milestones to break the project into trackable payments.</p>
                        )}
                    </div>
                ) : (
                    <div className="space-y-4">
                        {displayedMilestones.map((milestone, index) => {
                            const isApproved = milestone.status === "approved";
                            const isCompleted = milestone.status === "completed";
                            const canEdit = canManageMilestones && ["pending", "rejected"].includes(milestone.status);
                            const canClientReview = canReviewMilestones && milestone.status === "completed";
                            const canPay = canReviewMilestones && isApproved && milestone.paymentStatus !== "released";

                            return (
                                <div key={milestone._id} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                                    <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                                        <div className="flex-1">
                                            <div className="flex flex-wrap items-center gap-3 mb-2">
                                                <h3 className="text-lg font-bold text-slate-900">{index + 1}. {milestone.title}</h3>
                                                <span className={`px-3 py-1 rounded-full text-xs font-bold ${statusStyles[milestone.status]}`}>{statusLabels[milestone.status]}</span>
                                                <span className={`px-3 py-1 rounded-full text-xs font-bold ${paymentStyles[milestone.paymentStatus || "pending_payment"]}`}>{paymentLabels[milestone.paymentStatus || "pending_payment"]}</span>
                                            </div>
                                            <p className="text-slate-600 text-sm leading-6">{milestone.description}</p>
                                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-4 text-sm">
                                                <div className="rounded-xl bg-slate-50 p-3">
                                                    <p className="text-slate-500 uppercase tracking-wide text-[11px] font-bold">Cost</p>
                                                    <p className="font-bold text-slate-900 mt-1">NRS {Number(milestone.amount || 0).toLocaleString()}</p>
                                                </div>
                                                <div className="rounded-xl bg-slate-50 p-3">
                                                    <p className="text-slate-500 uppercase tracking-wide text-[11px] font-bold">Deadline</p>
                                                    <p className="font-bold text-slate-900 mt-1">{milestone.deadline ? formatDate(milestone.deadline) : "Not set"}</p>
                                                </div>
                                                <div className="rounded-xl bg-slate-50 p-3">
                                                    <p className="text-slate-500 uppercase tracking-wide text-[11px] font-bold">Created By</p>
                                                    <p className="font-bold text-slate-900 mt-1">{milestone.createdBy ? `${milestone.createdBy.firstName || ""} ${milestone.createdBy.lastName || ""}`.trim() || milestone.createdBy.name?.firstName || "User" : "Unknown"}</p>
                                                </div>
                                            </div>
                                            {milestone.rejectionReason && (
                                                <div className="mt-4 p-3 rounded-xl bg-rose-50 text-rose-700 border border-rose-200 text-sm">
                                                    <span className="font-bold">Rejection note:</span> {milestone.rejectionReason}
                                                </div>
                                            )}
                                        </div>

                                        <div className="flex flex-wrap gap-2 justify-start lg:justify-end">
                                            {canEdit && (
                                                <>
                                                    <button onClick={() => startEditMilestone(milestone)} className="p-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700" title="Edit milestone">
                                                        <FiEdit2 />
                                                    </button>
                                                    <button onClick={() => handleDeleteMilestone(milestone._id)} className="p-2 rounded-xl border border-slate-200 hover:bg-rose-50 text-rose-600" title="Delete milestone">
                                                        <FiTrash2 />
                                                    </button>
                                                </>
                                            )}

                                            {isFreelancer && ["pending", "in_progress", "rejected"].includes(milestone.status) && (
                                                <button onClick={() => handleCompleteMilestone(milestone._id)} className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 text-white font-semibold hover:bg-emerald-700">
                                                    <FiCheck /> Mark Complete
                                                </button>
                                            )}

                                            {canClientReview && (
                                                <>
                                                    <button onClick={() => handleApproveMilestone(milestone._id)} className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900 text-white font-semibold hover:bg-slate-700">
                                                        <FiCheck /> Approve
                                                    </button>
                                                    <button onClick={() => setShowRejectModal(milestone._id)} className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-rose-600 text-white font-semibold hover:bg-rose-700">
                                                        <FiX /> Reject
                                                    </button>
                                                </>
                                            )}

                                            {canPay && (
                                                <button onClick={() => handlePayMilestone(milestone._id)} className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-600 text-white font-semibold hover:bg-amber-700">
                                                    <FiCreditCard /> Release Payment
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}

                {showRejectModal && (
                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                        <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
                            <h3 className="text-lg font-bold text-slate-900 mb-3">Reject milestone</h3>
                            <textarea
                                value={rejectionReason}
                                onChange={(e) => setRejectionReason(e.target.value)}
                                placeholder="Explain what needs to change"
                                rows="4"
                                className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:ring-2 focus:ring-slate-900"
                            />
                            <div className="flex gap-3 mt-4">
                                <button onClick={() => handleRejectMilestone(showRejectModal)} className="flex-1 px-4 py-2 rounded-xl bg-rose-600 text-white font-semibold hover:bg-rose-700">
                                    Reject
                                </button>
                                <button
                                    onClick={() => {
                                        setShowRejectModal(null);
                                        setRejectionReason("");
                                    }}
                                    className="flex-1 px-4 py-2 rounded-xl border border-slate-300 text-slate-700 font-semibold"
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
