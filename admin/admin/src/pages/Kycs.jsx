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
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-primary/5 pb-24">
            {/* Header section with stats */}
            <header className="bg-white border-b border-gray-200 pt-8 pb-8 px-6 md:px-12">
                <div className="max-w-7xl mx-auto space-y-8">
                    <div className="space-y-4">
                        <div className="inline-flex items-center gap-2 px-3 py-1 bg-primary/10 rounded-xl border border-primary/20">
                            <FiShield className="text-primary text-base" />
                            <span className="text-[10px] font-black uppercase tracking-widest text-primary">Verification Hub</span>
                        </div>
                        <div>
                            <h1 className="text-3xl md:text-4xl font-black text-slate-900">KYC Verification</h1>
                            <p className="text-slate-600 font-medium mt-2">Review, verify, and monitor government-issued IDs for platform access.</p>
                        </div>
                    </div>

                    <div className="flex gap-4 overflow-x-auto w-full pb-4 md:pb-0">
                        <StatBadge label="Pending" value={stats.pending} icon={<FiAlertTriangle />} color="amber" />
                        <StatBadge label="Verified" value={stats.verified} icon={<FiCheckCircle />} color="primary" />
                        <StatBadge label="Failed" value={stats.failed} icon={<FiShield />} color="red" />
                    </div>
                </div>
            </header>

            {/* List & Controls */}
            <main className="max-w-7xl mx-auto px-6 md:px-12 py-12 relative z-20">
                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                    
                    {/* Filter Tabs */}
                    <div className="flex flex-col md:flex-row items-center justify-between px-8 pt-8 pb-6 border-b border-gray-200 gap-6">
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
                                    {activeFilter === filter && <div className="absolute bottom-[-2px] left-0 right-0 h-0.5 bg-primary shadow-lg shadow-primary/50"></div>}
                                </button>
                            ))}
                        </div>
                        <div className="flex items-center gap-3 px-6 py-3 bg-gray-50 text-slate-600 rounded-lg border border-gray-200 whitespace-nowrap text-[10px] font-black uppercase tracking-widest">
                            <FiFilter /> Filter
                        </div>
                    </div>

                    {/* Data List */}
                    <div className="p-8 min-h-[500px]">
                        {loading ? (
                            <div className="flex flex-col items-center justify-center py-32 space-y-6">
                                <FiLoader className="text-4xl text-primary animate-spin" />
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest animate-pulse">Loading KYC data...</p>
                            </div>
                        ) : filteredKycs.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-20 text-center space-y-6">
                                <div className="w-24 h-24 bg-gray-100 rounded-2xl flex items-center justify-center text-gray-400">
                                    <FiShield className="text-3xl" />
                                </div>
                                <div className="space-y-2">
                                    <h3 className="text-xl font-black text-slate-900 uppercase">No {activeFilter} Records</h3>
                                    <p className="text-sm font-medium text-slate-500">The queue is currently clear for this status.</p>
                                </div>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {/* Table Header (hidden on mobile) */}
                                <div className="hidden md:grid grid-cols-12 gap-6 px-8 py-3 bg-gray-50 rounded-xl text-[10px] font-black text-slate-400 uppercase tracking-widest">
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
        primary: "bg-primary/10 text-primary border-primary/20",
        amber: "bg-amber-50 text-amber-600 border-amber-200",
        red: "bg-red-50 text-red-600 border-red-200",
    }[color];

    return (
        <div className={`flex items-center gap-4 px-6 py-4 rounded-xl border ${colorStyles}`}>
            <div className="text-2xl">{icon}</div>
            <div>
                <p className="text-[10px] font-black uppercase tracking-widest opacity-70 leading-none mb-1">{label}</p>
                <p className="text-2xl font-black leading-none">{value}</p>
            </div>
        </div>
    );
};

export default Kycs;
