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
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-primary/5 pb-24">
            {/* Admin Header */}
            <header className="bg-white border-b border-gray-200 pt-8 pb-8 px-6 md:px-12">
                <div className="max-w-7xl mx-auto space-y-8">
                    <div className="space-y-4">
                        <div className="inline-flex items-center gap-2 px-3 py-1 bg-primary/10 rounded-xl border border-primary/20">
                            <span className="flex h-2 w-2 rounded-full bg-primary animate-pulse"></span>
                            <span className="text-[10px] font-black uppercase tracking-widest text-primary">System Online</span>
                        </div>
                        <div>
                            <h1 className="text-3xl md:text-4xl font-black text-slate-900">Dashboard</h1>
                            <p className="text-slate-600 font-medium mt-2">Manage and oversee all KYC verification submissions.</p>
                        </div>
                    </div>

                    {/* Search Bar */}
                    <div className="w-full max-w-md">
                        <div className="relative group">
                            <div className="absolute inset-0 bg-primary/20 rounded-xl blur-lg opacity-0 group-focus-within:opacity-100 transition-opacity duration-300"></div>
                            <div className="relative bg-white border border-gray-300 p-2 rounded-xl flex items-center shadow-sm focus-within:shadow-md focus-within:border-primary transition-all">
                                <div className="pl-4 text-gray-400">
                                    <FiSearch className="text-lg" />
                                </div>
                                <input
                                    type="text"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    placeholder="Search users or submissions..."
                                    className="w-full bg-transparent border-none outline-none text-slate-900 placeholder-gray-400 px-4 py-3 font-medium"
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </header>

            {/* Core Metrics Grid */}
            <main className="max-w-7xl mx-auto px-6 md:px-12 py-12 space-y-12">
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
                        color="primary" 
                    />
                    <MetricCard 
                        title="Failed Checks" 
                        value={stats.failed} 
                        trend="Rejected Documents" 
                        icon={<FiXCircle />} 
                        color="red" 
                    />
                </div>

                {/* Operations Grid */}
                <div>
                    <div className="flex items-center gap-3 mb-8">
                        <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center text-primary">
                            <FiDatabase className="text-xl" />
                        </div>
                        <h2 className="text-2xl font-black text-slate-900">Platform Operations</h2>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {/* KYC Management Route */}
                        <div 
                            onClick={() => navigate("/kycs")}
                            className="bg-white rounded-2xl p-8 border border-gray-200 shadow-sm hover:shadow-md hover:border-primary/30 transition-all cursor-pointer group hover:-translate-y-1"
                        >
                            <div className="flex justify-between items-start mb-8">
                                <div className="w-16 h-16 bg-amber-50 rounded-2xl flex items-center justify-center text-amber-600 text-2xl group-hover:scale-110 transition-transform group-hover:bg-amber-100">
                                    <FiAlertCircle />
                                </div>
                                <div className="w-10 h-10 rounded-full border border-gray-200 flex items-center justify-center text-gray-400 group-hover:bg-primary group-hover:text-white group-hover:border-primary transition-all">
                                    <FiChevronRight />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <h3 className="text-xl font-black text-slate-900 group-hover:text-primary transition-colors">KYC Verification</h3>
                                <p className="text-sm font-medium text-slate-500">Review and approve government documents for user onboarding compliance.</p>
                            </div>
                            <div className="mt-8 pt-6 border-t border-gray-200 flex items-center justify-between">
                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Priority Queue</span>
                                <span className="px-3 py-1 bg-amber-100 text-amber-700 rounded-lg text-xs font-black">{stats.pending} Pending</span>
                            </div>
                        </div>

                        {/* User Management - Coming Soon */}
                        <div className="bg-gray-50 rounded-2xl p-8 border border-gray-200 shadow-sm group relative overflow-hidden">
                            <div className="absolute inset-0 bg-white/50 backdrop-blur-sm z-10 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                <span className="px-4 py-2 bg-slate-900 text-white text-xs font-black tracking-widest uppercase rounded-lg shadow-lg">Coming Soon</span>
                            </div>
                            <div className="flex justify-between items-start mb-8 opacity-60">
                                <div className="w-16 h-16 bg-gray-200 rounded-2xl flex items-center justify-center text-gray-500 text-2xl">
                                    <FiUsers />
                                </div>
                            </div>
                            <div className="space-y-2 opacity-60">
                                <h3 className="text-xl font-black text-slate-900">User Management</h3>
                                <p className="text-sm font-medium text-slate-500">Ban, suspend, or configure permissions across the talent and client network.</p>
                            </div>
                        </div>

                        {/* Financial Reports - Coming Soon */}
                        <div className="bg-gray-50 rounded-2xl p-8 border border-gray-200 shadow-sm group relative overflow-hidden">
                            <div className="absolute inset-0 bg-white/50 backdrop-blur-sm z-10 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                <span className="px-4 py-2 bg-slate-900 text-white text-xs font-black tracking-widest uppercase rounded-lg shadow-lg">Coming Soon</span>
                            </div>
                            <div className="flex justify-between items-start mb-8 opacity-60">
                                <div className="w-16 h-16 bg-gray-200 rounded-2xl flex items-center justify-center text-gray-500 text-2xl">
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
    const styles = {
        blue: {
            bg: 'bg-blue-50',
            text: 'text-blue-600',
            border: 'border-blue-100'
        },
        amber: {
            bg: 'bg-amber-50',
            text: 'text-amber-600',
            border: 'border-amber-100'
        },
        primary: {
            bg: 'bg-primary/10',
            text: 'text-primary',
            border: 'border-primary/20'
        },
        red: {
            bg: 'bg-red-50',
            text: 'text-red-600',
            border: 'border-red-100'
        }
    }[color] || { bg: 'bg-gray-50', text: 'text-gray-600', border: 'border-gray-100' };

    return (
        <div className={`bg-white rounded-2xl p-6 border border-gray-200 shadow-sm flex items-center gap-6 group hover:shadow-md hover:border-primary/20 transition-all`}>
            <div className={`w-14 h-14 rounded-xl flex items-center justify-center text-2xl ${styles.bg} ${styles.text} group-hover:scale-110 transition-transform`}>
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
