import React from "react";
import { Link } from "react-router";
import { useAuth } from "../stores";

function TransactionListItem({ transactionData }) {
    const { userData } = useAuth();
    const isReceiver = userData?._id === (transactionData.receiver?._id || transactionData.receiver);
    const date = new Date(transactionData.paidTime || transactionData.createdAt);
    
    const formattedDate = date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
    });
    const formattedTime = date.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
    });

    const formatUUID = (uuid) => {
        if (!uuid) return "N/A";
        return `${uuid.slice(0, 8)}...${uuid.slice(-4)}`;
    };

    const status = transactionData.paymentStatus || transactionData.status;
    const isDone = status === "done" || status === "completed";

    return (
        <Link
            to={`/transactions/${transactionData._id}`}
            className="group flex flex-col sm:flex-row justify-between items-start sm:items-center bg-white hover:bg-gray-50/80 p-5 rounded-2xl transition-all duration-300 border border-transparent hover:border-gray-100 hover:shadow-md mb-3"
        >
            <div className="flex items-center gap-5 w-full sm:w-auto">
                {/* Icon/Avatar Placeholder */}
                <div className={`flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center ${isReceiver ? 'bg-blue-50 text-blue-600' : 'bg-emerald-50 text-emerald-600'}`}>
                    {isReceiver ? (
                        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                    ) : (
                        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                        </svg>
                    )}
                </div>

                <div className="flex flex-col gap-1 min-w-0">
                    <div className="flex items-center gap-2">
                        <h3 className="text-lg font-bold text-gray-900 group-hover:text-primary transition-colors">
                            Rs. {transactionData.amount.toLocaleString()}
                        </h3>
                        <span className={`text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded ${isReceiver ? 'bg-blue-100 text-blue-700' : 'bg-emerald-100 text-emerald-700'}`}>
                            {isReceiver ? 'Income' : 'Expense'}
                        </span>
                    </div>
                    <p className="text-gray-600 text-sm font-medium truncate max-w-[200px] sm:max-w-[300px]" title={transactionData.jobId?.title || transactionData.jobTitle || "Project Payment"}>
                        {transactionData.jobId?.title || transactionData.jobTitle || "Project Payment"}
                    </p>
                    <div className="flex flex-col gap-0.5 mt-1 mb-1">
                        <div className="flex items-center gap-1.5 text-[11px]">
                            <span className="font-semibold text-gray-400 w-10">From:</span>
                            <span className="font-bold text-gray-700 truncate">
                                {transactionData.initiator?.name?.firstName ? `${transactionData.initiator.name.firstName} ${transactionData.initiator.name.lastName}` : "Unknown"}
                            </span>
                        </div>
                        <div className="flex items-center gap-1.5 text-[11px]">
                            <span className="font-semibold text-gray-400 w-10">To:</span>
                            <span className="font-bold text-gray-700 truncate">
                                {transactionData.receiver?.name?.firstName ? `${transactionData.receiver.name.firstName} ${transactionData.receiver.name.lastName}` : "Unknown"}
                            </span>
                        </div>
                    </div>
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1">
                        <span className="text-gray-400 text-xs flex items-center gap-1">
                            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            {formattedDate}
                        </span>
                        <span className="text-gray-300 hidden sm:inline">•</span>
                        <span className="text-gray-400 text-xs flex items-center gap-1">
                            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            {formattedTime}
                        </span>
                    </div>
                </div>
            </div>

            <div className="flex flex-row sm:flex-col items-center sm:items-end justify-between sm:justify-center w-full sm:w-auto mt-4 sm:mt-0 gap-3 border-t sm:border-0 pt-4 sm:pt-0 border-gray-50">
                <div className="flex flex-col items-end gap-1">
                    <div className="flex items-center gap-2">
                         <span className="text-[10px] text-gray-400 font-bold tracking-widest leading-none">VIA ESEWA</span>
                         <div className="w-4 h-4 rounded-full bg-[#60bb46] flex items-center justify-center text-[8px] text-white font-bold">e</div>
                    </div>
                    <div className={`px-4 py-1.5 rounded-full text-xs font-bold capitalize tracking-wide shadow-sm flex items-center gap-1.5 ${
                        isDone 
                        ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' 
                        : 'bg-amber-50 text-amber-600 border border-amber-100'
                    }`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${isDone ? 'bg-emerald-500' : 'bg-amber-500'} animate-pulse`}></span>
                        {status || "Pending"}
                    </div>
                </div>
                
                <div className="flex flex-col items-end">
                    <span className="text-[10px] text-gray-400 uppercase font-bold tracking-widest leading-none mb-1">REFERENCE</span>
                    <p className="text-xs font-mono text-gray-500 bg-gray-50 px-2 py-1 rounded">
                        {transactionData.transactionUUID ? formatUUID(transactionData.transactionUUID) : formatUUID(transactionData._id)}
                    </p>
                </div>
            </div>
        </Link>
    );
}

export default TransactionListItem;
