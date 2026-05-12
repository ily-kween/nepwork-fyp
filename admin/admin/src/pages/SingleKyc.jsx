import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router";
import { Loader, Button } from "../components";
import { api } from "../utils";
import toast from "react-hot-toast";
import { PhotoProvider, PhotoView } from "react-photo-view";
import { useForm, Controller } from "react-hook-form";
import { 
    HiOutlineArrowLeft, 
    HiOutlineCheckCircle, 
    HiOutlineXCircle, 
    HiOutlineClock, 
    HiOutlineDocumentText, 
    HiOutlineMapPin, 
    HiOutlinePhone, 
    HiOutlineEnvelope 
} from "react-icons/hi2";

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
                return <HiOutlineCheckCircle className="w-5 h-5" />;
            case 'failed':
                return <HiOutlineXCircle className="w-5 h-5" />;
            case 'pending':
                return <HiOutlineClock className="w-5 h-5" />;
            default:
                return null;
        }
    };

    const statusColor = getStatusColor(data.status);

    return (
        <div className="space-y-8">
            {/* Header & Navigation */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div>
                    <button
                        onClick={() => navigate("/kycs")}
                        className="flex items-center gap-2 px-4 py-2 mb-4 bg-white hover:bg-gray-50 text-gray-700 rounded-lg transition-all border border-gray-100 shadow-sm text-sm font-bold"
                    >
                        <HiOutlineArrowLeft className="w-4 h-4" />
                        Back to List
                    </button>
                    <h1 className="text-3xl font-black text-gray-900 tracking-tight">Identity Verification</h1>
                    <p className="text-gray-500 font-medium">Detailed review for {data.name.firstName} {data.name.lastName}</p>
                </div>

                <div className={`flex items-center gap-3 px-6 py-4 rounded-2xl border shadow-sm ${
                    data.status === 'verified' ? 'bg-primary/5 border-primary/20 text-primary' :
                    data.status === 'failed' ? 'bg-red-50 border-red-200 text-red-600' :
                    'bg-amber-50 border-amber-200 text-amber-600'
                }`}>
                    {getStatusIcon(data.status)}
                    <span className="font-black uppercase tracking-widest text-xs">{data.status}</span>
                </div>
            </div>

            {/* Main Content Grid */}
            <div className="grid lg:grid-cols-3 gap-8">
                {/* Left Column: Information Cards */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Personal Details */}
                    <SectionCard title="Personal Information" icon="👤" iconBg="bg-blue-50" iconColor="text-blue-600">
                        <div className="grid md:grid-cols-3 gap-6">
                            <InfoCard label="First Name" value={data.name.firstName} />
                            <InfoCard label="Middle Name" value={data.name.middleName || "—"} />
                            <InfoCard label="Last Name" value={data.name.lastName} />
                            <InfoCard label="Gender" value={data.gender || "Not provided"} />
                            <InfoCard 
                                label="Date of Birth" 
                                value={`${data.dob.year}-${data.dob.month}-${data.dob.day}`}
                            />
                        </div>
                    </SectionCard>

                    {/* Address */}
                    <SectionCard title="Address Details" icon={<HiOutlineMapPin />} iconBg="bg-indigo-50" iconColor="text-indigo-600">
                        <div className="space-y-6">
                            <div>
                                <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4">Permanent Residence</h3>
                                <div className="grid md:grid-cols-3 gap-4">
                                    <InfoCard label="Country" value={data.address.permanent.country.toUpperCase()} />
                                    <InfoCard label="State" value={data.address.permanent.state} />
                                    <InfoCard label="City" value={data.address.permanent.city.toUpperCase()} />
                                </div>
                            </div>
                            <div className="border-t border-gray-50 pt-6">
                                <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4">Current Residence</h3>
                                <div className="grid md:grid-cols-3 gap-4">
                                    <InfoCard label="Country" value={data.address.temporary.country.toUpperCase()} />
                                    <InfoCard label="State" value={data.address.temporary.state} />
                                    <InfoCard label="City" value={data.address.temporary.city.toUpperCase()} />
                                </div>
                            </div>
                        </div>
                    </SectionCard>

                    {/* Contact Information */}
                    <SectionCard title="Contact Information" icon="📞" iconBg="bg-primary/5" iconColor="text-primary">
                        <div className="grid md:grid-cols-2 gap-6">
                            <ContactItem icon={<HiOutlineEnvelope />} label="Email Address" value={data.contact?.email} />
                            <ContactItem icon={<HiOutlinePhone />} label="Phone Number" value={data.contact?.phoneNumber} />
                        </div>
                    </SectionCard>

                    {/* Document Preview */}
                    <SectionCard title="Identity Document" icon={<HiOutlineDocumentText />} iconBg="bg-purple-50" iconColor="text-purple-600">
                        <div className="grid md:grid-cols-2 gap-8">
                            <div className="space-y-4">
                                <InfoCard label="Document Type" value={data.document.type} />
                                <InfoCard label="Document ID / Number" value={data.document.id} />
                            </div>
                            <div>
                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">Front View Scan</p>
                                <PhotoProvider>
                                    <PhotoView src={`${data.document.url}`}>
                                        <div className="group relative rounded-2xl overflow-hidden border border-gray-100 cursor-zoom-in">
                                            <img
                                                src={`${data.document.url}`}
                                                alt="Identity Document"
                                                className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-500"
                                            />
                                            <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                                <span className="bg-white/90 px-3 py-1.5 rounded-lg text-xs font-bold shadow-xl">Click to Expand</span>
                                            </div>
                                        </div>
                                    </PhotoView>
                                </PhotoProvider>
                            </div>
                        </div>
                    </SectionCard>
                </div>

                {/* Right Column: Sticky Decision Panel */}
                <div className="space-y-6">
                    <div className="sticky top-8 bg-white rounded-2xl p-8 border border-gray-100 shadow-sm space-y-6">
                        <h2 className="text-xl font-black text-gray-900 tracking-tight">Decision Panel</h2>
                        <p className="text-sm text-gray-500 leading-relaxed">Review the documents carefully before confirming the verification status.</p>
                        
                        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Final Status</label>
                                    <Controller
                                        name="selectKyc"
                                        control={control}
                                        render={({ field }) => (
                                            <select
                                                {...field}
                                                disabled={!editStatus}
                                                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl font-bold text-sm focus:bg-white focus:border-primary focus:ring-4 focus:ring-primary/5 transition-all outline-none disabled:opacity-50"
                                            >
                                                <option value="pending">⏳ Pending Review</option>
                                                <option value="verified">✓ Mark as Verified</option>
                                                <option value="failed">✗ Mark as Failed</option>
                                            </select>
                                        )}
                                    />
                                </div>

                                {kycStatus === "failed" && editStatus && (
                                    <div className="space-y-2 animate-slideIn">
                                        <label htmlFor="reason" className="block text-[10px] font-black text-red-400 uppercase tracking-widest">
                                            Reason for Rejection
                                        </label>
                                        <textarea
                                            id="reason"
                                            {...register("reason", {
                                                validate: (value) => !editStatus || value.trim() !== "" || "Required for rejection"
                                            })}
                                            defaultValue={data?.failedReason ?? ""}
                                            className="w-full px-4 py-3 bg-red-50/50 border border-red-100 rounded-xl text-red-900 placeholder-red-300 text-sm focus:bg-white focus:border-red-400 outline-none resize-none min-h-[100px]"
                                            placeholder="Specify rejection details..."
                                        />
                                        {errors.reason && <p className="text-red-500 text-[10px] font-bold uppercase">{errors.reason.message}</p>}
                                    </div>
                                )}
                            </div>

                            <div className="space-y-3 pt-4">
                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className={`w-full py-4 rounded-xl font-black text-sm uppercase tracking-widest transition-all active:scale-95 shadow-lg ${
                                        editStatus
                                            ? "bg-primary text-white hover:bg-primary/90 shadow-primary/20"
                                            : "bg-gray-900 text-white hover:bg-gray-800 shadow-gray-200"
                                    } disabled:opacity-50`}
                                >
                                    {isSubmitting ? "Processing..." : editStatus ? "Commit Changes" : "Modify Status"}
                                </button>

                                {editStatus && (
                                    <button
                                        type="button"
                                        onClick={() => { setEditStatus(false); reset(); }}
                                        className="w-full py-3 text-gray-500 text-xs font-bold uppercase tracking-widest hover:text-gray-900 transition-colors"
                                    >
                                        Cancel Action
                                    </button>
                                )}
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
}

const SectionCard = ({ title, icon, iconBg, iconColor, children }) => (
    <div className="bg-white rounded-2xl p-8 border border-gray-100 shadow-sm">
        <div className="flex items-center gap-4 mb-8">
            <div className={`w-10 h-10 ${iconBg} ${iconColor} rounded-xl flex items-center justify-center text-lg shadow-sm`}>
                {icon}
            </div>
            <h2 className="text-xl font-black text-gray-900 tracking-tight">{title}</h2>
        </div>
        {children}
    </div>
);

const InfoCard = ({ label, value }) => (
    <div>
        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5">{label}</p>
        <p className="text-base font-bold text-gray-900">{value}</p>
    </div>
);

const ContactItem = ({ icon, label, value }) => (
    <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-2xl border border-gray-100">
        <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-gray-400 shadow-sm">
            {icon}
        </div>
        <div className="min-w-0">
            <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">{label}</p>
            <p className="text-sm font-bold text-gray-900 truncate">{value || "—"}</p>
        </div>
    </div>
);

export default SingleKyc;
