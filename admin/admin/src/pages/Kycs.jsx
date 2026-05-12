import React, { useEffect, useState } from "react";
import { api } from "../utils";
import { KycList } from "../components";
import { 
    HiOutlineFunnel, 
    HiOutlineArrowPath, 
    HiOutlineShieldCheck, 
    HiOutlineExclamationTriangle, 
    HiOutlineCheckCircle 
} from "react-icons/hi2";

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
        <div className="space-y-12">
            {/* Page Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 pb-8 border-b border-gray-100">
                <div>
                    <div className="inline-flex items-center gap-2 px-3 py-1 bg-primary/10 rounded-full border border-primary/20 mb-4">
                        <HiOutlineShieldCheck className="text-primary text-sm" />
                        <span className="text-[10px] font-black uppercase tracking-widest text-primary">Verification Hub</span>
                    </div>
                    <h1 className="text-4xl font-black text-gray-900 tracking-tight">KYC Verification</h1>
                    <p className="text-gray-500 font-medium mt-2">Manage government document submissions and user trust levels.</p>
                </div>

                <div className="flex gap-3 overflow-x-auto pb-2 md:pb-0">
                    <StatBadge label="Pending" value={stats.pending} icon={<HiOutlineExclamationTriangle />} color="amber" />
                    <StatBadge label="Verified" value={stats.verified} icon={<HiOutlineCheckCircle />} color="primary" />
                    <StatBadge label="Failed" value={stats.failed} icon={<HiOutlineShieldCheck />} color="red" />
                </div>
            </div>

            {/* List & Controls */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                {/* Filter Tabs */}
                <div className="flex flex-col md:flex-row items-center justify-between px-8 pt-8 pb-6 border-b border-gray-50 gap-6">
                    <div className="flex items-center gap-10 overflow-x-auto w-full pb-2 md:pb-0">
                        {["Pending", "All", "Verified", "Failed"].map((filter) => (
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
                        <HiOutlineFunnel /> Filter List
                    </div>
                </div>

                {/* Data List */}
                <div className="p-8 min-h-[500px]">
                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-32 space-y-6">
                            <HiOutlineArrowPath className="text-4xl text-primary animate-spin" />
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest animate-pulse">Synchronizing Records...</p>
                        </div>
                    ) : filteredKycs.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-20 text-center space-y-6">
                            <div className="w-24 h-24 bg-gray-50 rounded-2xl flex items-center justify-center text-gray-300">
                                <HiOutlineShieldCheck className="text-3xl" />
                            </div>
                            <div className="space-y-2">
                                <h3 className="text-xl font-black text-gray-900 uppercase">No {activeFilter} Applications</h3>
                                <p className="text-sm font-medium text-gray-500">The verification queue is currently empty for this category.</p>
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {/* Table Header */}
                            <div className="hidden md:grid grid-cols-12 gap-6 px-8 py-3 bg-gray-50 rounded-xl text-[10px] font-black text-gray-400 uppercase tracking-widest">
                                <div className="col-span-4">User Identity</div>
                                <div className="col-span-3">Submission Date</div>
                                <div className="col-span-3">Status</div>
                                <div className="col-span-2 text-right">Action</div>
                            </div>
                            
                            {filteredKycs.map((elem) => (
                                <KycList data={elem} key={elem._id} />
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

const StatBadge = ({ label, value, icon, color }) => {
    const colorStyles = {
        primary: "bg-primary/5 text-primary border-primary/10 shadow-primary/5",
        amber: "bg-amber-50 text-amber-600 border-amber-100 shadow-amber-100/20",
        red: "bg-red-50 text-red-600 border-red-100 shadow-red-100/20",
    }[color];

    return (
        <div className={`flex items-center gap-4 px-5 py-3 rounded-xl border shadow-sm ${colorStyles}`}>
            <div className="text-xl">{icon}</div>
            <div>
                <p className="text-[9px] font-black uppercase tracking-widest opacity-60 leading-none mb-1">{label}</p>
                <p className="text-xl font-black leading-none">{value}</p>
            </div>
        </div>
    );
};

export default Kycs;
