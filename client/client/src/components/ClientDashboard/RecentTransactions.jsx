import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import api from "../../utils/api";
import Loader from "../Loader";
import { useNavigate } from "react-router";
import { useAuth } from "../../stores";
import { FiActivity, FiDollarSign } from "react-icons/fi";
import {
    applyTransactionFilters,
    loadTransactionFilters,
    toTransactionApiParams,
} from "../../utils/transactionFilters";

function RecentTransactions({ role }) {
    const { userData } = useAuth();
    const [data, setData] = useState([]);
    const [fetching, setFetching] = useState(true);
    const navigate = useNavigate();

    const fetchSetRecentTxns = async () => {
        setFetching(true);
        try {
            const storedFilters = loadTransactionFilters();
            const response = await api.get("/user/transactions/all", {
                params: toTransactionApiParams(storedFilters),
            });
            let txns = response.data.data || [];
            const userId = userData?._id;

            const userTxns = applyTransactionFilters(txns, storedFilters).filter(t => 
                role === 'freelancer' ? (t.receiver?._id || t.receiver) === userId : (t.initiator?._id || t.initiator) === userId
            ).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

            setData(userTxns.slice(0, 8));
            setFetching(false);
        } catch (error) {
            toast.error("Failed to sync financial records");
            setFetching(false);
        }
    };

    useEffect(() => {
        if (userData) fetchSetRecentTxns();
    }, [role, userData]);

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between px-2">
                <div className="space-y-1">
                    <h3 className="text-xl font-bold text-gray-900 tracking-tight">
                        Money History
                    </h3>
                    <p className="text-xs text-gray-500 font-medium tracking-tight">Records of your latest payments</p>
                </div>
                <button 
                    onClick={() => navigate("/all-transactions")}
                    className="px-5 py-2.5 bg-white border border-gray-200 text-gray-900 rounded-lg text-xs font-bold uppercase tracking-widest hover:bg-gray-900 hover:text-white transition-all shadow-sm"
                >
                    See All
                </button>
            </div>

            {fetching ? (
                <div className="py-20 flex justify-center"><Loader /></div>
            ) : data.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {data.map((txn) => {
                        const paidByName = txn.initiator?.name?.firstName ? `${txn.initiator.name.firstName} ${txn.initiator.name.lastName}` : "Unknown";
                        const paidToName = txn.receiver?.name?.firstName ? `${txn.receiver.name.firstName} ${txn.receiver.name.lastName}` : "Unknown";

                        return (
                            <div key={txn._id} className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm space-y-4 group hover:border-primary/20 hover:shadow-xl hover:shadow-primary/5 transition-all">
                                <div className="flex items-center justify-between">
                                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                                        {new Date(txn.createdAt).toLocaleDateString()}
                                    </span>
                                    <div className={`px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${role === 'freelancer' ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'}`}>
                                        {role === 'freelancer' ? 'Received' : 'Paid'}
                                    </div>
                                </div>

                                <div className="space-y-1">
                                    <h4 className="text-sm font-bold text-gray-900 truncate group-hover:text-primary transition-colors" title={txn.remarks || 'Project Payment'}>
                                        {txn.remarks || 'Project Payment'}
                                    </h4>
                                    <div className="flex flex-col gap-0.5 mt-2">
                                        <div className="flex items-center gap-1.5 text-[11px]">
                                            <span className="font-semibold text-gray-400 w-10">From:</span>
                                            <span className="font-bold text-gray-700 truncate">{paidByName}</span>
                                        </div>
                                        <div className="flex items-center gap-1.5 text-[11px]">
                                            <span className="font-semibold text-gray-400 w-10">To:</span>
                                            <span className="font-bold text-gray-700 truncate">{paidToName}</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center justify-between pt-4 border-t border-gray-50">
                                    <span className="text-[10px] font-black text-gray-300 uppercase tracking-widest">
                                        {txn.provider || 'eSewa'} {txn.paymentMethod ? `(${txn.paymentMethod})` : ''}
                                    </span>
                                    <span className={`text-base font-black tracking-tight ${role === 'freelancer' ? 'text-emerald-600' : 'text-gray-900'}`}>
                                        Rs. {txn.amount?.toLocaleString() || 0}
                                    </span>
                                </div>
                            </div>
                        );
                    })}
                </div>
            ) : (
                <div className="bg-white rounded-3xl border-2 border-dashed border-gray-100 py-20 flex flex-col items-center justify-center text-center space-y-4 opacity-50">
                    <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center">
                        <FiActivity className="text-3xl text-gray-300" />
                    </div>
                    <div>
                        <p className="text-xs font-bold text-gray-900 uppercase tracking-widest">No Activity Records</p>
                        <p className="text-[10px] text-gray-400 font-medium">Your financial statements will appear here.</p>
                    </div>
                </div>
            )}
        </div>
    );
}

export default RecentTransactions;
