import { useForm } from "react-hook-form";
import { useTags } from "../../contexts/tagContext";
import toast from "react-hot-toast";
import api from "../../utils/api";
import { useState } from "react";
import { usePostedJobs } from "../../stores";
import { 
    FiX, 
    FiSearch, 
    FiPlus,
    FiCheck,
    FiInfo
} from "react-icons/fi";

export function PostJobModal({ setShowPostJobModal }) {
    const invalidatePostedJobs = usePostedJobs(
        (state) => state.fetchPostedJobs,
    );
    const {
        register,
        handleSubmit,
        formState: { errors },
        setValue,
        reset,
        watch,
    } = useForm();

    const { tags } = useTags();
    const selectedTags = watch("tags", []);
    const [tagErr, setTagErr] = useState(null);
    const [resErr, setResErr] = useState(null);
    const [uploading, setUploading] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");

    const filteredTags = tags.filter((tag) =>
        tag.toLowerCase().includes(searchQuery.toLowerCase()),
    );

    const onSubmit = (data) => {
        if (selectedTags.length === 0) {
            setTagErr("At least one tag is required");
        } else {
            setUploading(true);
            setTagErr(null);
            setResErr(null);

            const payload = {
                title: data.jobTitle,
                description: data.jobDescription,
                tags: selectedTags,
                rate: data.hourlyRate,
            };

            api.post("/jobs/create-job", payload)
                .then(async (res) => {
                    toast.success(`Project posted: ${res.data.data.title}`, {
                        duration: 5000,
                    });
                    invalidatePostedJobs();
                    reset();
                    setShowPostJobModal(false);
                })
                .catch((err) => {
                    setResErr(
                        err.response?.data?.message || "Failed to post project",
                    );
                })
                .finally(() => {
                    setUploading(false);
                });
        }
    };

    const toggleTag = (tag) => {
        if (selectedTags.includes(tag)) {
            setValue(
                "tags",
                selectedTags.filter((t) => t !== tag),
            );
        } else {
            if (selectedTags.length >= 15) {
                setTagErr("Maximum 15 tags allowed");
                return;
            }
            setValue("tags", [...selectedTags, tag]);
            setTagErr(null);
        }
    };

    return (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-[1px] flex justify-center items-start md:items-center z-[100] p-4 transition-opacity duration-150">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl relative max-h-[92vh] flex flex-col overflow-hidden animate-modal-in border border-slate-200 font-['Poppins',_sans-serif]">
                {/* Header - Formal & Clean */}
                <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-white">
                    <div>
                        <h1 className="text-lg font-bold text-slate-900">
                            Create Project Posting
                        </h1>
                        <p className="text-[13px] text-slate-500 font-medium">Provide the project requirements to attract qualified professionals.</p>
                    </div>
                    <button
                        onClick={() => setShowPostJobModal(false)}
                        className="p-1.5 hover:bg-slate-100 rounded text-slate-400 transition-colors"
                        aria-label="Close modal"
                    >
                        <FiX className="w-5 h-5" />
                    </button>
                </div>

                {/* Form Content */}
                <div className="flex-1 overflow-y-auto custom-scrollbar p-6 md:p-8">
                    <form id="post-job-form" onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 lg:grid-cols-12 gap-x-10 gap-y-8">
                        {/* Primary Details Segment */}
                        <div className="lg:col-span-12 lg:mb-2">
                             <h3 className="text-xs font-bold text-primary uppercase tracking-wider">Project Specification</h3>
                             <div className="h-px bg-slate-100 mt-2"></div>
                        </div>

                        <div className="lg:col-span-7 space-y-6">
                            {/* Job Title */}
                            <div className="space-y-1.5">
                                <label className="text-[13px] font-semibold text-slate-700 flex items-center gap-1.5 cursor-pointer" htmlFor="projectTitle">
                                    Project Title <span className="text-red-500 font-bold">*</span>
                                </label>
                                <input
                                    id="projectTitle"
                                    type="text"
                                    placeholder="Enter a descriptive title for your project"
                                    {...register("jobTitle", {
                                        required: "Project Title is required",
                                        minLength: { value: 10, message: "Title must be at least 10 characters" }
                                    })}
                                    className="w-full bg-white border border-slate-300 rounded py-2 px-3.5 text-sm text-slate-900 placeholder-slate-400 focus:border-primary focus:ring-[3px] focus:ring-primary/10 transition-all outline-none"
                                />
                                <p className="text-[11px] text-slate-400 font-medium ml-0.5">Focus on the key service or objective of the work.</p>
                                {errors.jobTitle && (
                                    <p className="text-red-600 text-xs mt-1 font-semibold flex items-center gap-1">
                                         {errors.jobTitle.message}
                                    </p>
                                )}
                            </div>

                            {/* Job Description */}
                            <div className="space-y-1.5">
                                <label className="text-[13px] font-semibold text-slate-700 flex items-center gap-1.5 cursor-pointer" htmlFor="projectDescription">
                                    Detailed Requirements <span className="text-red-500 font-bold">*</span>
                                </label>
                                <textarea
                                    id="projectDescription"
                                    placeholder="Describe the scope, deliverables, and any specific technical requirements..."
                                    {...register("jobDescription", {
                                        required: "Project Description is required",
                                        minLength: { value: 50, message: "Description must be at least 50 characters" }
                                    })}
                                    className="h-[260px] w-full bg-white border border-slate-300 rounded py-2.5 px-3.5 text-sm text-slate-900 placeholder-slate-400 focus:border-primary focus:ring-[3px] focus:ring-primary/10 transition-all outline-none resize-none custom-scrollbar"
                                ></textarea>
                                <p className="text-[11px] text-slate-400 font-medium ml-0.5">More detail helps candidates provide better proposals.</p>
                                {errors.jobDescription && (
                                    <p className="text-red-600 text-xs mt-1 font-semibold">
                                        {errors.jobDescription.message}
                                    </p>
                                )}
                            </div>
                        </div>

                        {/* Secondary Details & Skills */}
                        <div className="lg:col-span-5 space-y-6">
                             {/* Hourly Rate */}
                             <div className="space-y-1.5">
                                <label className="text-[13px] font-semibold text-slate-700 flex items-center gap-1.5 cursor-pointer" htmlFor="hourlyRate">
                                    Budget / Hourly Rate (NRS) <span className="text-red-500 font-bold">*</span>
                                </label>
                                <div className="relative">
                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm font-semibold">Rs.</span>
                                    <input
                                        type="number"
                                        id="hourlyRate"
                                        placeholder="0.00"
                                        {...register("hourlyRate", {
                                            required: "Budget is required",
                                            valueAsNumber: true,
                                            validate: (value) => value > 0 || "Rate must be greater than 0",
                                        })}
                                        className="w-full bg-white border border-slate-300 rounded py-2 px-10 text-sm text-slate-900 focus:border-primary focus:ring-[3px] focus:ring-primary/10 transition-all outline-none"
                                    />
                                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs font-semibold">/hr</span>
                                </div>
                                {errors.hourlyRate && (
                                    <p className="text-red-600 text-xs mt-1 font-semibold">
                                        {errors.hourlyRate.message}
                                    </p>
                                )}
                            </div>

                            {/* Skills Selector */}
                            <div className="space-y-1.5">
                                <label className="text-[13px] font-semibold text-slate-700 flex items-center gap-1.5">
                                    Required Competencies <span className="text-red-500 font-bold">*</span>
                                </label>
                                
                                <div className="bg-slate-50 border border-slate-200 rounded p-4 space-y-4">
                                    <div className="relative">
                                        <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                                        <input
                                            type="text"
                                            placeholder="Search skills..."
                                            value={searchQuery}
                                            onChange={(e) => setSearchQuery(e.target.value)}
                                            className="w-full bg-white border border-slate-300 rounded py-1.5 pl-9 pr-3 text-[13px] text-slate-900 outline-none focus:border-primary transition-colors"
                                        />
                                    </div>

                                    <div className="flex items-center justify-between text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                                        <span>Max 15 Selections</span>
                                        <span className={selectedTags.length > 0 ? "text-primary" : ""}>Count: {selectedTags.length}</span>
                                    </div>

                                    <div className="h-[280px] overflow-y-auto custom-scrollbar pr-1 space-y-3">
                                        {selectedTags.length > 0 && (
                                            <div className="flex flex-wrap gap-1.5 p-2 bg-white rounded border border-slate-100">
                                                {selectedTags.map(tag => (
                                                    <span key={`selected-${tag}`} className="inline-flex items-center gap-1 px-2 py-0.5 bg-slate-100 text-slate-700 rounded text-[11px] font-semibold border border-slate-200">
                                                        {tag}
                                                        <FiX 
                                                            className="w-3 h-3 cursor-pointer hover:text-red-600 transition-colors" 
                                                            onClick={() => toggleTag(tag)}
                                                        />
                                                    </span>
                                                ))}
                                            </div>
                                        )}

                                        <div className="grid grid-cols-1 gap-1">
                                            {filteredTags.slice(0, 50).map((tag) => (
                                                <button
                                                    key={tag}
                                                    type="button"
                                                    disabled={selectedTags.length >= 15 && !selectedTags.includes(tag)}
                                                    onClick={() => toggleTag(tag)}
                                                    className={`
                                                        flex items-center justify-between px-3 py-1.5 rounded text-[12px] transition-all
                                                        ${selectedTags.includes(tag)
                                                            ? "bg-primary/5 text-primary font-bold border-transparent"
                                                            : "text-slate-600 hover:bg-slate-100 font-medium"
                                                        }
                                                        ${selectedTags.length >= 15 && !selectedTags.includes(tag) ? "opacity-40 grayscale cursor-not-allowed" : "cursor-pointer"}
                                                    `}
                                                >
                                                    <span className="truncate">{tag}</span>
                                                    {selectedTags.includes(tag) ? <FiCheck className="flex-shrink-0 text-primary" /> : <FiPlus className="flex-shrink-0 opacity-20" />}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                                <p className="text-[11px] text-slate-400 font-medium ml-0.5 italic">Tags help match your project with specialized freelancers.</p>
                                {tagErr && (
                                    <p className="text-red-600 text-xs font-semibold mt-1">
                                        {tagErr}
                                    </p>
                                )}
                            </div>
                        </div>
                    </form>
                </div>

                {/* Footer - Formal Actions */}
                <div className="px-6 py-4 border-t border-slate-100 bg-slate-50 flex flex-col md:flex-row items-center justify-between gap-4 font-['Poppins',_sans-serif]">
                    <div className="flex items-center gap-2 text-xs text-slate-400 font-medium">
                        <FiInfo className="w-4 h-4 flex-shrink-0" />
                        <span>Project will be reviewed for compliance before activation.</span>
                    </div>
                    
                    <div className="flex items-center gap-3 w-full md:w-auto">
                        <button
                            type="button"
                            onClick={() => setShowPostJobModal(false)}
                            className="flex-1 md:flex-none px-6 py-2 rounded text-sm font-semibold text-slate-500 hover:text-slate-700 transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            form="post-job-form"
                            type="submit"
                            disabled={uploading}
                            className={`
                                flex-1 md:flex-none flex items-center justify-center gap-2 px-10 py-2 rounded text-sm font-bold transition-all shadow-sm
                                ${uploading 
                                    ? "bg-slate-200 text-slate-400 cursor-not-allowed" 
                                    : "bg-primary text-white hover:brightness-95 active:brightness-90"}
                            `}
                        >
                            {uploading ? (
                                <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                            ) : null}
                            {uploading ? "Processing..." : "Publish Project Posting"}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
