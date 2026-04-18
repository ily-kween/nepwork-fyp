import React, { useEffect, useState } from "react";
import { api } from "../utils";
import { KycList } from "../components";
import { FiFilter, FiLoader, FiShield, FiAlertTriangle, FiCheckCircle } from "react-icons/fi";

function Kycs() {
    const [kycs, setKycs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeFilter, setActiveFilter] = useState("Pending");

    const filterConditions = {
        pending: (kyc) => kyc.status === "pending",
        verified: (kyc) => kyc.status === "verified",
        failed: (kyc) => kyc.status === "failed",
        all: () => true,
    };

    const filteredKycs = kycs.filter(
        filterConditions[activeFilter.toLowerCase()] || filterConditions.all
    );

    useEffect(() => {
        const fetchKycs = async () => {
            setLoading(true);
            try {
                const response = await api.get("/kyc/get-all-kyc");
                setKycs(response.data.data || []);
            } catch (error) {
                console.error(error);
            } finally {
                setLoading(false);
            }
        };
        fetchKycs();
    }, []);

    const stats = {
        pending: kycs.filter(k => k.status === 'pending').length,
        verified: kycs.filter(k => k.status === 'verified').length,
        failed: kycs.filter(k => k.status === 'failed').length,
    };

    return (
        <div className="min-h-screen bg-[#F8FAFC] pb-24">
            {/* Header section with stats */}
            <header className="bg-slate-900 pt-8 pb-24 px-6 md:px-12 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-indigo-500/20 rounded-full blur-[120px] -ml-48 -mt-48 pointer-events-none"></div>
                
                <div className="max-w-7xl mx-auto relative z-10 flex flex-col md:flex-row items-end justify-between gap-10">
                    <div className="space-y-4 text-center md:text-left">
                        <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 rounded-xl border border-white/5">
                            <FiShield className="text-emerald-400" />
                            <span className="text-[10px] font-black uppercase tracking-widest text-emerald-400">Verification Hub</span>
                        </div>
                        <h1 className="text-4xl md:text-5xl font-black text-white tracking-tight">KYC Operations</h1>
                        <p className="text-slate-400 font-medium">Review, verify, and monitor government-issued IDs for platform access.</p>
                    </div>

                    <div className="flex gap-4 overflow-x-auto w-full md:w-auto pb-4 md:pb-0">
                        <StatBadge label="Pending" value={stats.pending} icon={<FiAlertTriangle />} color="amber" />
                        <StatBadge label="Verified" value={stats.verified} icon={<FiCheckCircle />} color="emerald" />
                        <StatBadge label="Failed" value={stats.failed} icon={<FiShield />} color="red" />
                    </div>
                </div>
            </header>

            {/* List & Controls */}
            <main className="max-w-7xl mx-auto px-6 md:px-12 -mt-10 relative z-20">
                <div className="bg-white rounded-[40px] shadow-sm border border-slate-100 overflow-hidden">
                    
                    {/* Filter Tabs */}
                    <div className="flex flex-col md:flex-row items-center justify-between px-10 pt-10 pb-6 border-b border-slate-50 gap-6">
                        <div className="flex items-center gap-10 overflow-x-auto w-full pb-2 md:pb-0">
                            {["Pending", "All", "Verified", "Failed"].map((filter) => (
                                <button
                                    key={filter}
                                    onClick={() => setActiveFilter(filter)}
                                    className={`flex gap-3 pb-6 border-b-2 transition-all relative group whitespace-nowrap outline-none ${
                                        activeFilter === filter ? 'border-primary text-slate-900' : 'border-transparent text-slate-400 hover:text-slate-600'
                                    }`}
                                >
                                    <span className="text-sm font-black uppercase tracking-tighter">{filter}</span>
                                    {activeFilter === filter && <div className="absolute bottom-[-2px] left-0 right-0 h-0.5 bg-primary shadow-[0_0_10px_#10b981]"></div>}
                                </button>
                            ))}
                        </div>
                        <div className="flex items-center gap-3 px-6 py-3 bg-slate-50 text-slate-400 rounded-2xl border border-slate-100 whitespace-nowrap text-[10px] font-black uppercase tracking-widest">
                            <FiFilter /> Filter View
                        </div>
                    </div>

                    {/* Data List */}
                    <div className="p-10 min-h-[500px]">
                        {loading ? (
                            <div className="flex flex-col items-center justify-center py-32 space-y-6">
                                <FiLoader className="text-4xl text-primary animate-spin" />
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest animate-pulse">Syncing Cryptographic Data...</p>
                            </div>
                        ) : filteredKycs.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-20 text-center space-y-6">
                                <div className="w-24 h-24 bg-slate-50 rounded-[32px] flex items-center justify-center text-slate-300">
                                    <FiShield className="text-3xl" />
                                </div>
                                <div className="space-y-2">
                                    <h3 className="text-xl font-black text-slate-900 uppercase">No {activeFilter} Records Found</h3>
                                    <p className="text-sm font-medium text-slate-500">The queue is currently clear for this designation.</p>
                                </div>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {/* Table Header (hidden on mobile) */}
                                <div className="hidden md:grid grid-cols-12 gap-6 px-8 py-3 bg-slate-50 rounded-2xl text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                    <div className="col-span-4">User Identity</div>
                                    <div className="col-span-3">Submission Date</div>
                                    <div className="col-span-3">Verification Status</div>
                                    <div className="col-span-2 text-right">Action</div>
                                </div>
                                
                                {filteredKycs.map((elem) => (
                                    <KycList data={elem} key={elem._id} />
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
}

const StatBadge = ({ label, value, icon, color }) => {
    const colorStyles = {
        emerald: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
        amber: "bg-amber-500/10 text-amber-400 border-amber-500/20",
        red: "bg-red-500/10 text-red-400 border-red-500/20",
    }[color];

    return (
        <div className={`flex items-center gap-4 px-6 py-4 rounded-2xl border ${colorStyles} backdrop-blur-md`}>
            <div className="text-2xl opacity-80">{icon}</div>
            <div>
                <p className="text-[10px] font-black uppercase tracking-widest opacity-60 leading-none mb-1">{label}</p>
                <p className="text-2xl font-black leading-none">{value}</p>
            </div>
        </div>
    );
};

export default Kycs;
