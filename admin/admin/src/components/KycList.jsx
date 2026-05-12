import React from "react";
import { useNavigate } from "react-router";
import { 
    HiOutlineChevronRight, 
    HiOutlineUser, 
    HiOutlineClock, 
    HiOutlineCheckCircle, 
    HiOutlineXCircle, 
    HiOutlineExclamationCircle 
} from "react-icons/hi2";

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
                return "bg-amber-50 text-amber-600 border-amber-200";
            case "verified":
                return "bg-primary/5 text-primary border-primary/20";
            case "failed":
                return "bg-red-50 text-red-600 border-red-200";
            default:
                return "bg-gray-50 text-gray-500 border-gray-200";
        }
    };

    const getStatusIcon = (statusVal) => {
        switch (statusVal) {
            case "pending": return <HiOutlineExclamationCircle className="mr-2 inline" />;
            case "verified": return <HiOutlineCheckCircle className="mr-2 inline" />;
            case "failed": return <HiOutlineXCircle className="mr-2 inline" />;
            default: return <HiOutlineClock className="mr-2 inline" />;
        }
    };

    return (
        <div className="group bg-white rounded-2xl border border-gray-100 hover:border-primary/30 shadow-sm hover:shadow-xl hover:shadow-primary/5 transition-all duration-300 overflow-hidden relative">
            
            {/* Hover Highlight */}
            <div className="absolute left-0 top-0 bottom-0 w-1 bg-transparent group-hover:bg-primary transition-colors"></div>

            <div className="p-5 md:p-6 flex flex-col md:grid md:grid-cols-12 md:items-center gap-6">
                
                {/* 1. Identity */}
                <div className="col-span-4 flex items-center gap-4">
                    <div className="w-12 h-12 bg-gray-50 rounded-xl flex items-center justify-center text-gray-400 group-hover:bg-primary group-hover:text-white transition-all shadow-inner">
                        <HiOutlineUser className="text-xl" />
                    </div>
                    <div>
                        <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest md:hidden mb-1">Identity</p>
                        <strong className="text-base font-black text-gray-900 leading-tight">
                            {name.firstName} {name.middleName ? name.middleName + ' ' : ''}{name.lastName}
                        </strong>
                        <p className="text-[10px] font-bold text-gray-400 mt-1 uppercase tracking-tighter">ID: {(_id || '').substring(0, 10).toUpperCase()}</p>
                    </div>
                </div>

                {/* 2. Submission Date */}
                <div className="col-span-3">
                    <div className="flex items-center gap-2 text-gray-600">
                        <HiOutlineClock className="text-gray-400" />
                        <span className="text-sm font-bold">{formattedDate}</span>
                    </div>
                    <p className="text-[9px] font-black uppercase tracking-widest text-gray-400 mt-1">Registry Entry</p>
                </div>

                {/* 3. Status */}
                <div className="col-span-3">
                    <span className={`inline-flex items-center px-4 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest border ${getStatusStyles(status)}`}>
                        {getStatusIcon(status)}
                        {status}
                    </span>
                </div>

                {/* 4. Action */}
                <div className="col-span-2 flex justify-end">
                    <button
                        onClick={() => navigate(`/kycs/${_id}`)}
                        className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gray-900 text-white hover:bg-primary transition-all shadow-md hover:shadow-primary/20 active:scale-95 group/btn"
                    >
                        <span className="text-[10px] font-black uppercase tracking-widest">View Details</span>
                        <HiOutlineChevronRight className="group-hover/btn:translate-x-0.5 transition-transform" />
                    </button>
                </div>
                
            </div>
        </div>
    );
}

export default KycList;