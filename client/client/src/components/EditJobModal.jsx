import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useTags } from "../contexts/tagContext";
import api from "../utils/api";
import toast from "react-hot-toast";
import { 
    FiX, 
    FiSearch, 
    FiPlus,
    FiCheck,
    FiInfo
} from "react-icons/fi";

function EditJobModal({ jobData, setModalStatus, refetchJobFn }) {
    const { tags } = useTags();
    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
        setValue,
        reset,
        watch,
    } = useForm();

    const selectedTags = watch("tags", []);
    const [searchQuery, setSearchQuery] = useState("");
    const [resErr, setResErr] = useState(null);
    const [tagErr, setTagErr] = useState(null);

    const filteredTags = tags.filter((tag) =>
        tag.toLowerCase().includes(searchQuery.toLowerCase()),
    );

    useEffect(() => {
        if (jobData) {
            reset({
                title: jobData.title,
                description: jobData.description,
                rate: jobData.hourlyRate,
                status: jobData.status,
                tags: jobData.tags,
            });
        }
    }, [jobData, reset]);

    const toggleTag = (tag) => {
        if (selectedTags.includes(tag)) {
            const updatedTags = selectedTags.filter((t) => t !== tag);
            setValue("tags", updatedTags);
            setTagErr(null);
        } else {
            if (selectedTags.length >= 15) {
                setTagErr("Maximum 15 tags allowed");
                return;
            }
            setValue("tags", [...selectedTags, tag]);
            setTagErr(null);
        }
    };

    const onSubmit = async (data) => {
        if (data.tags.length === 0) {
            setTagErr("At least one tag is required");
            return;
        }

        try {
            setResErr(null);
            const payload = { ...data, id: jobData._id };
            await api.post("/jobs/update-job", payload);
            toast.success("Project updated successfully");
            await refetchJobFn();
            setModalStatus(false);
        } catch (error) {
            setResErr(error.response?.data?.message || "Failed to update project");
        }
    };

    return (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-[1px] flex justify-center items-start md:items-center z-[100] p-4 transition-opacity duration-150 font-['Poppins',_sans-serif]">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl relative max-h-[92vh] flex flex-col overflow-hidden animate-modal-in border border-slate-200">
                {/* Header - Formal & Clean */}
                <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-white">
                    <div>
                        <h1 className="text-lg font-bold text-slate-900">
                            Edit Project Posting
                        </h1>
                        <p className="text-[13px] text-slate-500 font-medium">Update the requirements or status of your active listing.</p>
                    </div>
                    <button
                        onClick={() => setModalStatus(false)}
                        className="p-1.5 hover:bg-slate-100 rounded text-slate-400 transition-colors"
                        aria-label="Close modal"
                    >
                        <FiX className="w-5 h-5" />
                    </button>
                </div>

                {/* Form Content */}
                <div className="flex-1 overflow-y-auto custom-scrollbar p-6 md:p-8">
                    <form id="edit-job-form" onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 lg:grid-cols-12 gap-x-10 gap-y-8">
                        {/* Segment Header */}
                        <div className="lg:col-span-12 lg:mb-2">
                             <h3 className="text-xs font-bold text-primary uppercase tracking-wider">Project Configuration</h3>
                             <div className="h-px bg-slate-100 mt-2"></div>
                        </div>

                        <div className="lg:col-span-7 space-y-6">
                            {/* Project Title */}
                            <div className="space-y-1.5">
                                <label className="text-[13px] font-semibold text-slate-700 flex items-center gap-1.5 cursor-pointer" htmlFor="edit-title">
                                    Project Title <span className="text-red-500 font-bold">*</span>
                                </label>
                                <input
                                    id="edit-title"
                                    type="text"
                                    placeholder="e.g. Senior Backend Engineer"
                                    {...register("title", {
                                        required: "Project Title is required",
                                        minLength: { value: 10, message: "Title must be at least 10 characters" }
                                    })}
                                    className="w-full bg-white border border-slate-300 rounded py-2 px-3.5 text-sm text-slate-900 placeholder-slate-400 focus:border-primary focus:ring-[3px] focus:ring-primary/10 transition-all outline-none"
                                />
                                <p className="text-[11px] text-slate-400 font-medium ml-0.5">Use a concise title that defines the primary role.</p>
                                {errors.title && (
                                    <p className="text-red-600 text-xs mt-1 font-semibold">
                                        {errors.title.message}
                                    </p>
                                )}
                            </div>

                            {/* Job Description */}
                            <div className="space-y-1.5">
                                <label className="text-[13px] font-semibold text-slate-700 flex items-center gap-1.5 cursor-pointer" htmlFor="edit-description">
                                    Project Description <span className="text-red-500 font-bold">*</span>
                                </label>
                                <textarea
                                    id="edit-description"
                                    placeholder="Describe the job in detail..."
                                    {...register("description", {
                                        required: "Project Description is required",
                                        minLength: { value: 50, message: "Description must be at least 50 characters" }
                                    })}
                                    className="h-[260px] w-full bg-white border border-slate-300 rounded py-2.5 px-3.5 text-sm text-slate-900 placeholder-slate-400 focus:border-primary focus:ring-[3px] focus:ring-primary/10 transition-all outline-none resize-none custom-scrollbar"
                                ></textarea>
                                <p className="text-[11px] text-slate-400 font-medium ml-0.5">Include technical stack and expected outcomes.</p>
                                {errors.description && (
                                    <p className="text-red-600 text-xs mt-1 font-semibold">
                                        {errors.description.message}
                                    </p>
                                )}
                            </div>
                        </div>

                        {/* Financials & Skills */}
                        <div className="lg:col-span-5 space-y-6">
                            {/* Budget and Status Row */}
                            <div className="space-y-6">
                                <div className="space-y-1.5">
                                    <label className="text-[13px] font-semibold text-slate-700 flex items-center gap-1.5 cursor-pointer" htmlFor="edit-rate">
                                        Hourly Rate (NRS) <span className="text-red-500 font-bold">*</span>
                                    </label>
                                    <div className="relative">
                                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm font-semibold">Rs.</span>
                                        <input
                                            type="number"
                                            id="edit-rate"
                                            {...register("rate", {
                                                required: "Rate is required",
                                                valueAsNumber: true,
                                                validate: (value) => value > 0 || "Rate must be greater than 0",
                                            })}
                                            className="w-full bg-white border border-slate-300 rounded py-2 px-10 text-sm text-slate-900 focus:border-primary focus:ring-[3px] focus:ring-primary/10 transition-all outline-none"
                                        />
                                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs font-semibold">/hr</span>
                                    </div>
                                    {errors.rate && (
                                        <p className="text-red-600 text-xs mt-1 font-semibold">
                                            {errors.rate.message}
                                        </p>
                                    )}
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-[13px] font-semibold text-slate-700 flex items-center gap-1.5">
                                        Posting Status
                                    </label>
                                    <select
                                        {...register("status")}
                                        className="w-full bg-white border border-slate-300 rounded py-2 px-3.5 text-sm text-slate-900 focus:border-primary focus:ring-[3px] focus:ring-primary/10 transition-all outline-none appearance-none cursor-pointer"
                                    >
                                        <option value="open">Active / Open</option>
                                        <option value="in_progress">Working / In Progress</option>
                                        <option value="closed">Inactive / Closed</option>
                                        <option value="finished">Completed / Finished</option>
                                    </select>
                                    <p className="text-[11px] text-slate-400 font-medium ml-0.5 italic">Visibility changes based on status.</p>
                                </div>
                            </div>

                            {/* Competencies */}
                            <div className="space-y-1.5">
                                <label className="text-[13px] font-semibold text-slate-700 flex items-center gap-1.5">
                                    Required Competencies <span className="text-red-500 font-bold">*</span>
                                </label>
                                
                                <div className="bg-slate-50 border border-slate-200 rounded p-4 space-y-4">
                                    <div className="relative">
                                        <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                                        <input
                                            type="text"
                                            placeholder="Update skills..."
                                            value={searchQuery}
                                            onChange={(e) => setSearchQuery(e.target.value)}
                                            className="w-full bg-white border border-slate-300 rounded py-1.5 pl-9 pr-3 text-[13px] text-slate-900 outline-none focus:border-primary transition-colors"
                                        />
                                    </div>

                                    <div className="flex items-center justify-between text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                                        <span>Allocated: {selectedTags.length}/15</span>
                                    </div>

                                    <div className="h-[180px] overflow-y-auto custom-scrollbar pr-1 space-y-3">
                                        {selectedTags.length > 0 && (
                                            <div className="flex flex-wrap gap-1.5 p-2 bg-white rounded border border-slate-100">
                                                {selectedTags.map(tag => (
                                                    <span key={`edit-selected-${tag}`} className="inline-flex items-center gap-1 px-2 py-0.5 bg-slate-100 text-slate-700 rounded text-[11px] font-semibold border border-slate-200">
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
                                            {filteredTags.slice(0, 30).map((tag) => (
                                                <button
                                                    key={`edit-tag-${tag}`}
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
                                {tagErr && (
                                    <p className="text-red-600 text-xs font-semibold mt-1">
                                        {tagErr}
                                    </p>
                                )}
                            </div>
                        </div>
                    </form>
                </div>

                {/* Footer Actions */}
                <div className="px-6 py-4 border-t border-slate-100 bg-slate-50 flex flex-col md:flex-row items-center justify-between gap-4">
                    <div className="flex items-center gap-2 text-xs text-slate-400 font-medium">
                        <FiInfo className="w-4 h-4 flex-shrink-0" />
                        <span>Applying changes will update the public project listing.</span>
                    </div>
                    
                    <div className="flex items-center gap-3 w-full md:w-auto">
                        <button
                            type="button"
                            onClick={() => setModalStatus(false)}
                            className="flex-1 md:flex-none px-6 py-2 rounded text-sm font-semibold text-slate-500 hover:text-slate-700 transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            form="edit-job-form"
                            type="submit"
                            disabled={isSubmitting}
                            className={`
                                flex-1 md:flex-none flex items-center justify-center gap-2 px-10 py-2 rounded text-sm font-bold transition-all shadow-sm
                                ${isSubmitting 
                                    ? "bg-slate-200 text-slate-400 cursor-not-allowed" 
                                    : "bg-primary text-white hover:brightness-95 active:brightness-90"}
                            `}
                        >
                            {isSubmitting ? (
                                <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                            ) : null}
                            {isSubmitting ? "Saving..." : "Apply Updates"}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default EditJobModal;
