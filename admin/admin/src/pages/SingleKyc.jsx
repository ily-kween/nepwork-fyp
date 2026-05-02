import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router";
import { Loader, Button } from "../components";
import { api } from "../utils";
import toast from "react-hot-toast";
import { PhotoProvider, PhotoView } from "react-photo-view";
import { useForm, Controller } from "react-hook-form";
import { FiArrowLeft, FiCheckCircle, FiXCircle, FiClock, FiFileText, FiMapPin, FiPhone, FiMail } from "react-icons/fi";

function SingleKyc() {
    const navigate = useNavigate();
    const params = useParams();
    const [data, setData] = useState(null);
    const [editStatus, setEditStatus] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const {
        register,
        handleSubmit,
        control,
        watch,
        reset,
        formState: { errors },
    } = useForm({
        defaultValues: {
            selectKyc: "pending",
        },
    });

    const kycStatus = watch("selectKyc");

    const onSubmit = async (formData) => {
        if (!editStatus) {
            setEditStatus(true);
        } else {
            if (formData.selectKyc !== data.status) {
                setIsSubmitting(true);
                const payload = {
                    status: formData.selectKyc,
                    failedReason: formData.reason,
                };
                try {
                    const response = await api.post(
                        `/kyc/update-status/${data._id}`,
                        payload,
                    );
                    toast.success(
                        `Status updated: ${response.data.data.status}`,
                    );
                    reset();
                    fetchKyc();
                } catch (err) {
                    console.log(err);
                    toast.error(`Failed to save status`);
                } finally {
                    setIsSubmitting(false);
                }
            }
            setEditStatus(false);
        }
    };

    const fetchKyc = async () => {
        try {
            const response = await api.get(`/kyc/get-kyc/${params.kycId}`);
            setData(response.data.data);
        } catch (err) {
            console.log(err);
            toast.error("Failed to fetch kyc");
        }
    };

    useEffect(() => {
        fetchKyc();
    }, []);
    
    useEffect(() => {
        if (data) {
            reset({
                selectKyc: data.status ?? "pending",
            });
        }
    }, [data]);

    if (!data) return <Loader />;

    const getStatusColor = (status) => {
        switch (status) {
            case 'verified':
                return 'primary';
            case 'failed':
                return 'red';
            case 'pending':
                return 'amber';
            default:
                return 'gray';
        }
    };

    const getStatusIcon = (status) => {
        switch (status) {
            case 'verified':
                return <FiCheckCircle className="w-5 h-5" />;
            case 'failed':
                return <FiXCircle className="w-5 h-5" />;
            case 'pending':
                return <FiClock className="w-5 h-5" />;
            default:
                return null;
        }
    };

    const statusColor = getStatusColor(data.status);

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-primary/5 pb-24">
            {/* Header */}
            <header className="bg-white border-b border-gray-200 pt-6 pb-6 px-6 md:px-12">
                
                <div className="max-w-7xl mx-auto">
                    <button
                        onClick={() => navigate("/kycs")}
                        className="flex items-center gap-2 px-4 py-2 mb-8 bg-gray-50 hover:bg-gray-100 text-slate-700 rounded-lg transition-all border border-gray-200"
                    >
                        <FiArrowLeft className="w-4 h-4" />
                        Back to KYC List
                    </button>
                    
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-3xl md:text-4xl font-black text-slate-900 mb-2">KYC Verification Details</h1>
                            <p className="text-slate-600">Review and manage user identity verification</p>
                        </div>
                        <div className={`flex items-center gap-3 px-6 py-3 rounded-xl border-2 ${
                            statusColor === 'emerald' ? 'bg-primary/10 border-primary/30 text-primary' :
                            statusColor === 'red' ? 'bg-red-50 border-red-200 text-red-600' :
                            'bg-amber-50 border-amber-200 text-amber-600'
                        }`}>
                            {getStatusIcon(data.status)}
                            <span className="font-bold capitalize text-sm">{data.status}</span>
                        </div>
                    </div>
                </div>
            </header>

            {/* Content */}
            <main className="max-w-7xl mx-auto px-6 md:px-12 py-12 relative z-20 space-y-6">
                {/* Personal Details */}
                <div className="bg-white rounded-2xl p-8 border border-gray-200 shadow-sm">
                    <h2 className="text-2xl font-bold text-slate-900 mb-6 flex items-center gap-3">
                        <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600">
                            👤
                        </div>
                        Personal Information
                    </h2>
                    <div className="grid md:grid-cols-4 gap-6">
                        <InfoCard label="First Name" value={data.name.firstName} />
                        <InfoCard label="Middle Name" value={data.name.middleName || "—"} />
                        <InfoCard label="Last Name" value={data.name.lastName} />
                        <InfoCard label="Gender" value={data.gender || "Not provided"} />
                        <InfoCard 
                            label="Date of Birth" 
                            value={`${data.dob.year}-${data.dob.month}-${data.dob.day}`}
                            span="col-span-1"
                        />
                    </div>
                </div>

                {/* Address */}
                <div className="bg-white rounded-2xl p-8 border border-gray-200 shadow-sm">
                    <h2 className="text-2xl font-bold text-slate-900 mb-6 flex items-center gap-3">
                        <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-600">
                            <FiMapPin className="w-5 h-5" />
                        </div>
                        Address Details
                    </h2>
                    
                    <div className="space-y-6">
                        <div>
                            <h3 className="text-sm font-black text-slate-600 uppercase tracking-widest mb-4">Permanent Address</h3>
                            <div className="grid md:grid-cols-3 gap-4">
                                <InfoCard 
                                    label="Country" 
                                    value={data.address.permanent.country.toUpperCase()}
                                />
                                <InfoCard 
                                    label="State" 
                                    value={data.address.permanent.state}
                                />
                                <InfoCard 
                                    label="City" 
                                    value={data.address.permanent.city.toUpperCase()}
                                />
                            </div>
                        </div>

                        <div className="border-t border-slate-100 pt-6">
                            <h3 className="text-sm font-black text-slate-600 uppercase tracking-widest mb-4">Temporary Address</h3>
                            <div className="grid md:grid-cols-3 gap-4">
                                <InfoCard 
                                    label="Country" 
                                    value={data.address.temporary.country.toUpperCase()}
                                />
                                <InfoCard 
                                    label="State" 
                                    value={data.address.temporary.state}
                                />
                                <InfoCard 
                                    label="City" 
                                    value={data.address.temporary.city.toUpperCase()}
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Contact Information */}
                <div className="bg-white rounded-2xl p-8 border border-gray-200 shadow-sm">
                    <h2 className="text-2xl font-bold text-slate-900 mb-6 flex items-center gap-3">
                        <div className="w-10 h-10 bg-green-50 rounded-xl flex items-center justify-center text-green-600">
                            📞
                        </div>
                        Contact Information
                    </h2>
                    <div className="grid md:grid-cols-2 gap-6">
                        <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-200">
                            <FiMail className="w-5 h-5 text-slate-500 flex-shrink-0" />
                            <div className="min-w-0">
                                <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest">Email</p>
                                <p className="text-slate-900 font-medium truncate">{data.contact?.email || "—"}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-200">
                            <FiPhone className="w-5 h-5 text-slate-500 flex-shrink-0" />
                            <div className="min-w-0">
                                <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest">Phone</p>
                                <p className="text-slate-900 font-medium">{data.contact?.phoneNumber || "—"}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Document Information */}
                <div className="bg-white rounded-2xl p-8 border border-gray-200 shadow-sm">
                    <h2 className="text-2xl font-bold text-slate-900 mb-6 flex items-center gap-3">
                        <div className="w-10 h-10 bg-purple-50 rounded-xl flex items-center justify-center text-purple-600">
                            <FiFileText className="w-5 h-5" />
                        </div>
                        Identity Document
                    </h2>
                    
                    <div className="grid md:grid-cols-2 gap-8">
                        <div>
                            <div className="space-y-4">
                                <InfoCard 
                                    label="Document Type" 
                                    value={data.document.type}
                                />
                                <InfoCard 
                                    label="Document ID" 
                                    value={data.document.id}
                                />
                            </div>
                        </div>

                        <div>
                            <p className="text-xs font-black text-slate-600 uppercase tracking-widest mb-3">Document Image</p>
                            <PhotoProvider>
                                <PhotoView src={`${data.document.url}`}>
                                    <img
                                        src={`${data.document.url}`}
                                        alt="Identity Document"
                                        className="w-full h-64 object-cover rounded-2xl border border-slate-200 cursor-pointer hover:border-primary transition-all shadow-sm"
                                    />
                                </PhotoView>
                            </PhotoProvider>
                            <p className="text-xs text-slate-500 mt-2">Click to enlarge</p>
                        </div>
                    </div>
                </div>

                {/* Status Management */}
                <div className="bg-white rounded-2xl p-8 border border-gray-200 shadow-sm">
                    <h2 className="text-2xl font-bold text-slate-900 mb-6">Decision & Action</h2>
                    
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                        <div className="flex items-end gap-4">
                            <div className="flex-1">
                                <label className="block text-sm font-semibold text-slate-900 mb-2">KYC Status</label>
                                <Controller
                                    name="selectKyc"
                                    control={control}
                                    render={({ field }) => (
                                        <select
                                            {...field}
                                            disabled={!editStatus}
                                            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-lg font-medium focus:bg-white focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all outline-none disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            <option value="pending">⏳ Pending Review</option>
                                            <option value="verified">✓ Verified</option>
                                            <option value="failed">✗ Failed</option>
                                        </select>
                                    )}
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className={`px-8 py-3 rounded-lg font-semibold transition-all active:scale-95 ${
                                    editStatus
                                        ? "bg-emerald-600 text-white hover:bg-emerald-700 shadow-lg"
                                        : "bg-blue-600 text-white hover:bg-blue-700 shadow-lg"
                                } disabled:opacity-50 disabled:cursor-not-allowed`}
                            >
                                {isSubmitting ? "Saving..." : editStatus ? "Save Changes" : "Edit Status"}
                            </button>

                            {editStatus && (
                                <button
                                    type="button"
                                    onClick={() => {
                                        setEditStatus(false);
                                        reset();
                                    }}
                                    className="px-6 py-3 border-2 border-slate-200 text-slate-700 rounded-lg font-semibold hover:bg-slate-50 transition-all"
                                >
                                    Cancel
                                </button>
                            )}
                        </div>

                        {kycStatus === "failed" && editStatus && (
                            <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                                <label htmlFor="reason" className="block text-sm font-semibold text-red-900 mb-3">
                                    Rejection Reason
                                </label>
                                <textarea
                                    id="reason"
                                    {...register("reason", {
                                        validate: (value) => {
                                            if (!editStatus) return true;
                                            return (
                                                value.trim() !== "" ||
                                                "Reason is required when rejecting"
                                            );
                                        },
                                    })}
                                    defaultValue={data?.failedReason ?? ""}
                                    className="w-full px-4 py-3 bg-white border border-red-200 rounded-lg text-red-900 placeholder-red-300 focus:border-red-500 focus:ring-2 focus:ring-red-500/20 outline-none resize-none"
                                    rows="4"
                                    placeholder="Explain why this KYC verification failed..."
                                />
                                {errors.reason && (
                                    <p className="text-red-600 text-sm font-medium mt-2">
                                        {errors.reason.message}
                                    </p>
                                )}
                            </div>
                        )}
                    </form>
                </div>
            </main>
        </div>
    );
}

const InfoCard = ({ label, value, span = "col-span-1" }) => (
    <div className={span}>
        <p className="text-xs font-black text-slate-600 uppercase tracking-widest mb-2">{label}</p>
        <p className="text-lg font-bold text-slate-900">{value}</p>
    </div>
);

export default SingleKyc;
