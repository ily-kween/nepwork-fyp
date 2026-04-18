import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { api } from "../utils";
import { 
    FiSearch, 
    FiUsers, 
    FiShield, 
    FiActivity, 
    FiAlertCircle,
    FiCheckCircle,
    FiTrendingUp,
    FiDatabase,
    FiChevronRight,
    FiXCircle
} from "react-icons/fi";

function Dashboard() {
    const navigate = useNavigate();
    const [searchQuery, setSearchQuery] = useState("");
    const [kycs, setKycs] = useState([]);
    const [stats, setStats] = useState({
        total: 0,
        pending: 0,
        verified: 0,
        failed: 0
    });

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                const response = await api.get("/kyc/get-all-kyc");
                const allKycs = response.data.data || [];
                
                const pendingCount = allKycs.filter(k => k.status === 'pending').length;
                const verifiedCount = allKycs.filter(k => k.status === 'verified').length;
                const failedCount = allKycs.filter(k => k.status === 'failed').length;

                setKycs(allKycs);
                setStats({
                    total: allKycs.length,
                    pending: pendingCount,
                    verified: verifiedCount,
                    failed: failedCount
                });
            } catch (error) {
                console.error("Dashboard data sync failed:", error);
            }
        };
        fetchDashboardData();
    }, []);

    return (
        <div className="min-h-screen bg-[#F8FAFC] pb-24">
            {/* Admin Header */}
            <header className="bg-slate-900 pt-8 pb-24 px-6 md:px-12 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/20 rounded-full blur-[120px] -mr-48 -mt-48 pointer-events-none"></div>
                <div className="absolute bottom-0 left-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-[100px] -ml-40 -mb-40 pointer-events-none"></div>
                
                <div className="max-w-7xl mx-auto relative z-10 flex flex-col md:flex-row items-center justify-between gap-10">
                    <div className="space-y-4 text-center md:text-left">
                        <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 rounded-xl border border-white/5">
                            <span className="flex h-2 w-2 rounded-full bg-emerald-400 animate-ping"></span>
                            <span className="text-[10px] font-black uppercase tracking-widest text-emerald-400">System Online</span>
                        </div>
                        <h1 className="text-4xl md:text-5xl font-black text-white tracking-tight">Command Center</h1>
                        <p className="text-slate-400 font-medium">Global platform oversight and administrative controls.</p>
                    </div>

                    <div className="w-full md:w-[480px]">
                        <div className="relative group">
                            <div className="absolute inset-0 bg-primary/20 rounded-[24px] blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                            <div className="relative bg-white/10 backdrop-blur-md border border-white/10 p-2 rounded-[24px] flex items-center shadow-2xl focus-within:bg-white/15 focus-within:border-primary/50 transition-all">
                                <div className="pl-6 text-white/50">
                                    <FiSearch className="text-xl" />
                                </div>
                                <input
                                    type="text"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    placeholder="Search users, IDs, or transactions..."
                                    className="w-full bg-transparent border-none outline-none text-white placeholder-white/40 px-6 py-4 font-medium"
                                />
                                <button className="bg-primary text-white p-4 rounded-xl shadow-lg hover:shadow-primary/50 hover:bg-emerald-400 transition-all active:scale-95">
                                    <FiSearch />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </header>

            {/* Core Metrics Grid */}
            <main className="max-w-7xl mx-auto px-6 md:px-12 -mt-12 relative z-20 space-y-12">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <MetricCard 
                        title="Total Submissions" 
                        value={stats.total} 
                        trend="Total Identity Docs" 
                        icon={<FiDatabase />} 
                        color="blue" 
                    />
                    <MetricCard 
                        title="Pending Reviews" 
                        value={stats.pending} 
                        trend="Requires Validation" 
                        icon={<FiShield />} 
                        color="amber" 
                    />
                    <MetricCard 
                        title="Verified Users" 
                        value={stats.verified} 
                        trend="Cleared Operations" 
                        icon={<FiCheckCircle />} 
                        color="emerald" 
                    />
                    <MetricCard 
                        title="Failed Checks" 
                        value={stats.failed} 
                        trend="Rejected Documents" 
                        icon={<FiXCircle />} 
                        color="indigo" 
                    />
                </div>

                {/* Operations Grid */}
                <div>
                    <div className="flex items-center gap-3 mb-8">
                        <FiDatabase className="text-slate-400 text-xl" />
                        <h2 className="text-xl font-black text-slate-900">Platform Operations</h2>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {/* KYC Management Route */}
                        <div 
                            onClick={() => navigate("/kycs")}
                            className="bg-white rounded-[32px] p-8 border border-slate-100 shadow-sm hover:shadow-2xl hover:border-primary/20 transition-all cursor-pointer group hover:-translate-y-1"
                        >
                            <div className="flex justify-between items-start mb-8">
                                <div className="w-16 h-16 bg-amber-50 rounded-2xl flex items-center justify-center text-amber-500 text-2xl group-hover:scale-110 transition-transform group-hover:bg-amber-100">
                                    <FiAlertCircle />
                                </div>
                                <div className="w-10 h-10 rounded-full border border-slate-100 flex items-center justify-center text-slate-400 group-hover:bg-primary group-hover:text-white group-hover:border-primary transition-all">
                                    <FiChevronRight />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <h3 className="text-xl font-black text-slate-900 group-hover:text-primary transition-colors">KYC Verification</h3>
                                <p className="text-sm font-medium text-slate-500">Review and approve government documents for user onboarding compliance.</p>
                            </div>
                            <div className="mt-8 pt-6 border-t border-slate-50 flex items-center justify-between">
                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Priority Queue</span>
                                <span className="px-3 py-1 bg-amber-100 text-amber-700 rounded-lg text-xs font-black">{stats.pending} Pending</span>
                            </div>
                        </div>

                        <div className="bg-slate-50 rounded-[32px] p-8 border border-slate-100 shadow-inner group relative overflow-hidden">
                            <div className="absolute inset-0 bg-white/50 backdrop-blur-sm z-10 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                <span className="px-4 py-2 bg-slate-900 text-white text-xs font-black tracking-widest uppercase rounded-xl shadow-2xl">Coming Soon</span>
                            </div>
                            <div className="flex justify-between items-start mb-8 opacity-60">
                                <div className="w-16 h-16 bg-slate-200 rounded-2xl flex items-center justify-center text-slate-500 text-2xl">
                                    <FiUsers />
                                </div>
                            </div>
                            <div className="space-y-2 opacity-60">
                                <h3 className="text-xl font-black text-slate-900">User Management</h3>
                                <p className="text-sm font-medium text-slate-500">Ban, suspend, or configure permissions across the talent and client network.</p>
                            </div>
                        </div>

                        <div className="bg-slate-50 rounded-[32px] p-8 border border-slate-100 shadow-inner group relative overflow-hidden">
                            <div className="absolute inset-0 bg-white/50 backdrop-blur-sm z-10 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                <span className="px-4 py-2 bg-slate-900 text-white text-xs font-black tracking-widest uppercase rounded-xl shadow-2xl">Coming Soon</span>
                            </div>
                            <div className="flex justify-between items-start mb-8 opacity-60">
                                <div className="w-16 h-16 bg-slate-200 rounded-2xl flex items-center justify-center text-slate-500 text-2xl">
                                    <FiTrendingUp />
                                </div>
                            </div>
                            <div className="space-y-2 opacity-60">
                                <h3 className="text-xl font-black text-slate-900">Financial Reports</h3>
                                <p className="text-sm font-medium text-slate-500">Monitor platform fees, escrow holdings, and gateway integrity logs.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}

const MetricCard = ({ title, value, trend, icon, color }) => {
    const bgColor = {
        indigo: 'bg-indigo-50 text-indigo-500',
        amber: 'bg-amber-50 text-amber-500',
        emerald: 'bg-emerald-50 text-emerald-500',
        blue: 'bg-blue-50 text-blue-500'
    }[color] || 'bg-slate-50 text-slate-500';

    return (
        <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-xl shadow-slate-900/5 flex items-center gap-6 group hover:-translate-y-1 transition-transform">
            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-2xl ${bgColor} group-hover:scale-110 transition-transform`}>
                {icon}
            </div>
            <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{title}</p>
                <h4 className="text-2xl font-black text-slate-900 tracking-tight leading-loose -mt-1">{value}</h4>
                <p className="text-[10px] font-bold text-slate-500 mt-0.5">{trend}</p>
            </div>
        </div>
    );
};

export default Dashboard;
