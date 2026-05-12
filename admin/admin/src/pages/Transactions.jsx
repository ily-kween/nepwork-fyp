import React, { useEffect, useState } from "react";
import { api } from "../utils";
import { 
    HiOutlineBanknotes, 
    HiOutlineClock, 
    HiOutlineCheckCircle, 
    HiOutlineExclamationCircle, 
    HiOutlineArrowRight, 
    HiOutlineArrowPath, 
    HiOutlineFunnel, 
    HiOutlineArrowTrendingUp 
} from "react-icons/hi2";
import toast from "react-hot-toast";

function Transactions() {
    const [transactions, setTransactions] = useState([]);
    const [stats, setStats] = useState({ totalAdminCommission: 0 });
    const [loading, setLoading] = useState(true);
    const [activeFilter, setActiveFilter] = useState("all");

    useEffect(() => {
        const fetchTransactions = async () => {
            setLoading(true);
            try {
                const response = await api.get("/admin/transactions", {
                    params: { purpose: activeFilter }
                });
                if (response.data.success) {
                    setTransactions(response.data.data.transactions);
                    setStats({ totalAdminCommission: response.data.data.totalAdminCommission });
                }
            } catch (error) {
                console.error("Error fetching transactions:", error);
                toast.error("Failed to load transactions");
            } finally {
                setLoading(false);
            }
        };

        fetchTransactions();
    }, [activeFilter]);

    return (
        <div className="space-y-12">
            {/* Page Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 pb-8 border-b border-gray-100">
                <div>
                    <div className="inline-flex items-center gap-2 px-3 py-1 bg-primary/10 rounded-full border border-primary/20 mb-4">
                        <HiOutlineBanknotes className="text-primary text-sm" />
                        <span className="text-[10px] font-black uppercase tracking-widest text-primary">Financial Records</span>
                    </div>
                    <h1 className="text-4xl font-black text-gray-900 tracking-tight">Platform Revenue</h1>
                    <p className="text-gray-500 font-medium mt-2">Monitor transaction history and commission earnings.</p>
                </div>

                <div className="flex gap-3 overflow-x-auto pb-2 md:pb-0">
                    <div className="flex items-center gap-4 px-6 py-4 bg-gray-900 text-white rounded-2xl border border-gray-800 shadow-xl">
                        <div className="w-12 h-12 bg-primary/20 rounded-xl flex items-center justify-center text-primary text-2xl shadow-inner">
                            <HiOutlineArrowTrendingUp />
                        </div>
                        <div>
                            <p className="text-[9px] font-black uppercase tracking-widest text-gray-400 mb-1">Total Admin Earnings</p>
                            <p className="text-2xl font-black leading-none tracking-tight">Rs. {stats.totalAdminCommission.toLocaleString()}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* List & Controls */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                {/* Filter Tabs */}
                <div className="flex flex-col md:flex-row items-center justify-between px-8 pt-8 pb-6 border-b border-gray-50 gap-6">
                    <div className="flex items-center gap-10 overflow-x-auto w-full pb-2 md:pb-0">
                        {["all", "initial", "milestone", "final"].map((filter) => (
                            <button
                                key={filter}
                                onClick={() => setActiveFilter(filter)}
                                className={`flex gap-3 pb-6 border-b-2 transition-all relative group whitespace-nowrap outline-none ${
                                    activeFilter === filter ? 'border-primary text-gray-900' : 'border-transparent text-gray-400 hover:text-gray-600'
                                }`}
                            >
                                <span className="text-sm font-black uppercase tracking-tighter">{filter}</span>
                                {activeFilter === filter && <div className="absolute bottom-[-2px] left-0 right-0 h-0.5 bg-primary shadow-lg shadow-primary/50"></div>}
                            </button>
                        ))}
                    </div>
                    <div className="flex items-center gap-3 px-6 py-3 bg-gray-50 text-gray-600 rounded-lg border border-gray-100 whitespace-nowrap text-[10px] font-black uppercase tracking-widest hover:bg-gray-100 transition-colors cursor-pointer">
                        <HiOutlineFunnel /> Filter History
                    </div>
                </div>

                {/* Data List */}
                <div className="p-8 min-h-[500px]">
                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-32 space-y-6">
                            <HiOutlineArrowPath className="text-4xl text-primary animate-spin" />
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest animate-pulse">Synchronizing Ledger...</p>
                        </div>
                    ) : transactions.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-20 text-center space-y-6">
                            <div className="w-24 h-24 bg-gray-50 rounded-2xl flex items-center justify-center text-gray-300">
                                <HiOutlineBanknotes className="text-3xl" />
                            </div>
                            <div className="space-y-2">
                                <h3 className="text-xl font-black text-gray-900 uppercase">No Transactions Found</h3>
                                <p className="text-sm font-medium text-gray-500">There are no completed payments matching your criteria.</p>
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {/* Table Header */}
                            <div className="hidden md:grid grid-cols-12 gap-6 px-8 py-3 bg-gray-50 rounded-xl text-[10px] font-black text-gray-400 uppercase tracking-widest">
                                <div className="col-span-4">Transaction Context</div>
                                <div className="col-span-3 text-center">Amount (Total)</div>
                                <div className="col-span-3 text-center">Admin Commission</div>
                                <div className="col-span-2 text-right">Timestamp</div>
                            </div>
                            
                            {transactions.map((transaction) => (
                                <TransactionItem key={transaction._id} transaction={transaction} />
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

function TransactionItem({ transaction }) {
    const formattedDate = new Date(transaction.paidTime || transaction.createdAt).toLocaleDateString("en-US", {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });

    return (
        <div className="group bg-white rounded-2xl border border-gray-100 hover:border-primary/30 shadow-sm hover:shadow-xl hover:shadow-primary/5 transition-all duration-300 overflow-hidden relative">
            <div className="absolute left-0 top-0 bottom-0 w-1 bg-transparent group-hover:bg-primary transition-colors"></div>

            <div className="p-5 md:p-6 flex flex-col md:grid md:grid-cols-12 md:items-center gap-6">
                
                {/* Context */}
                <div className="col-span-4 flex items-center gap-4">
                    <div className="w-12 h-12 bg-gray-50 rounded-xl flex items-center justify-center text-gray-400 group-hover:bg-primary group-hover:text-white transition-all shadow-inner">
                        <HiOutlineBanknotes className="text-xl" />
                    </div>
                    <div>
                        <strong className="text-base font-black text-gray-900 leading-tight">
                            {transaction.jobId?.title || "Platform Transaction"}
                        </strong>
                        <div className="flex items-center gap-2 mt-1">
                            <span className="text-[10px] font-black text-primary bg-primary/5 px-2 py-0.5 rounded border border-primary/10 uppercase tracking-widest">
                                {transaction.purpose}
                            </span>
                            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter">ID: {transaction._id.substring(0, 10).toUpperCase()}</span>
                        </div>
                    </div>
                </div>

                {/* Amount */}
                <div className="col-span-3 text-center">
                    <p className="text-lg font-black text-gray-900">Rs. {transaction.amount.toLocaleString()}</p>
                    <p className="text-[9px] font-black uppercase tracking-widest text-gray-400 mt-1">Gross Payment</p>
                </div>

                {/* Commission */}
                <div className="col-span-3 text-center">
                    <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-50 text-emerald-600 rounded-lg border border-emerald-100">
                        <span className="text-base font-black">Rs. {transaction.adminCommission?.toLocaleString() || 0}</span>
                    </div>
                    <p className="text-[9px] font-black uppercase tracking-widest text-emerald-400 mt-1">10% Admin Fee</p>
                </div>

                {/* Timestamp */}
                <div className="col-span-2 text-right">
                    <div className="flex items-center justify-end gap-2 text-gray-600">
                        <HiOutlineClock className="text-gray-400" />
                        <span className="text-[11px] font-bold">{formattedDate}</span>
                    </div>
                    <p className="text-[9px] font-black uppercase tracking-widest text-gray-400 mt-1">Settled At</p>
                </div>
            </div>
        </div>
    );
}

export default Transactions;
