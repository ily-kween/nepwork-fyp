import React from "react";
import { useNavigate } from "react-router";
import { FiChevronRight, FiUser, FiClock, FiCheckCircle, FiXCircle, FiAlertCircle } from "react-icons/fi";

function KycList({ data }) {
    const { name, status, createdAt, _id } = data;
    const navigate = useNavigate();

    const formattedDate = new Date(createdAt).toLocaleDateString("en-US", {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });

    // Helper functions for status styling
    const getStatusStyles = (statusVal) => {
        switch (statusVal) {
            case "pending":
                return "bg-amber-50 text-amber-500 border-amber-200";
            case "verified":
                return "bg-emerald-50 text-emerald-500 border-emerald-200";
            case "failed":
                return "bg-red-50 text-red-500 border-red-200";
            default:
                return "bg-slate-50 text-slate-500 border-slate-200";
        }
    };

    const getStatusIcon = (statusVal) => {
        switch (statusVal) {
            case "pending": return <FiAlertCircle className="mr-2 inline" />;
            case "verified": return <FiCheckCircle className="mr-2 inline" />;
            case "failed": return <FiXCircle className="mr-2 inline" />;
            default: return <FiClock className="mr-2 inline" />;
        }
    };

    return (
        <div className="group bg-white rounded-3xl border border-slate-100 hover:border-primary/30 shadow-sm hover:shadow-2xl hover:shadow-primary/5 transition-all duration-300 overflow-hidden relative">
            
            {/* Hover Highlight */}
            <div className="absolute left-0 top-0 bottom-0 w-1 bg-transparent group-hover:bg-primary transition-colors"></div>

            <div className="p-6 md:p-8 flex flex-col md:grid md:grid-cols-12 md:items-center gap-6">
                
                {/* 1. Identity (4 cols) */}
                <div className="col-span-4 flex items-center gap-4">
                    <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-400 group-hover:bg-primary/10 group-hover:text-primary transition-colors shadow-sm">
                        <FiUser className="text-xl" />
                    </div>
                    <div>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest md:hidden mb-1">Identity</p>
                        <strong className="text-base font-black text-slate-900 leading-tight">
                            {name.firstName} {name.middleName ? name.middleName + ' ' : ''}{name.lastName}
                        </strong>
                        <p className="text-xs font-medium text-slate-500 mt-0.5">ID: {_id.substring(0, 8).toUpperCase()}</p>
                    </div>
                </div>

                {/* 2. Submission (3 cols) */}
                <div className="col-span-3">
                    <div className="flex items-center gap-2 text-slate-600">
                        <FiClock className="text-slate-400" />
                        <span className="text-sm font-bold">{formattedDate}</span>
                    </div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mt-1">Registry Entry</p>
                </div>

                {/* 3. Status (3 cols) */}
                <div className="col-span-3">
                    <span className={`inline-flex items-center px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border ${getStatusStyles(status)}`}>
                        {getStatusIcon(status)}
                        {status}
                    </span>
                </div>

                {/* 4. Action (2 cols) */}
                <div className="col-span-2 flex justify-end">
                    <button
                        onClick={() => navigate(`/kycs/${_id}`)}
                        className="w-12 h-12 rounded-2xl bg-slate-50 text-slate-400 hover:bg-primary hover:text-white flex items-center justify-center transition-all shadow-sm focus:ring-4 focus:ring-primary/20 active:scale-95"
                    >
                        <FiChevronRight className="text-xl" />
                    </button>
                </div>
                
            </div>
        </div>
    );
}

export default KycList;