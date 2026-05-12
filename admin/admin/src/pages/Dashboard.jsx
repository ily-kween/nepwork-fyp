import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { api } from "../utils";
import {
    HiOutlineMagnifyingGlass,
    HiOutlineUsers,
    HiOutlineShieldCheck,
    HiOutlinePresentationChartLine,
    HiOutlineExclamationCircle,
    HiOutlineCheckBadge,
    HiOutlineCircleStack,
    HiOutlineChevronRight,
    HiOutlineXCircle
} from "react-icons/hi2";
import { HiOutlineUserGroup } from "react-icons/hi2";

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
        <div className="space-y-12">
            {/* Admin Welcome Section */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 pb-8 border-b border-gray-100">
                <div>
                    <div className="inline-flex items-center gap-2 px-3 py-1 bg-primary/10 rounded-full border border-primary/20 mb-4">
                        <span className="flex h-2 w-2 rounded-full bg-primary animate-pulse"></span>
                        <span className="text-[10px] font-black uppercase tracking-widest text-primary">System Monitoring Active</span>
                    </div>
                    <h1 className="text-4xl font-black text-gray-900 tracking-tight">Admin Console</h1>
                    <p className="text-gray-500 font-medium mt-2">Overseeing platform integrity and verification pipelines.</p>
                </div>

                <div className="relative group w-full md:w-80">
                    <div className="absolute inset-0 bg-primary/20 rounded-xl blur-lg opacity-0 group-focus-within:opacity-100 transition-opacity duration-300"></div>
                    <div className="relative bg-white border border-gray-200 p-1.5 rounded-xl flex items-center shadow-sm focus-within:shadow-md focus-within:border-primary transition-all">
                        <div className="pl-3 text-gray-400">
                            <HiOutlineMagnifyingGlass />
                        </div>
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Search submissions..."
                            className="w-full bg-transparent border-none outline-none text-gray-900 placeholder-gray-400 px-3 py-2 text-sm font-medium"
                        />
                    </div>
                </div>
            </div>

            {/* Core Metrics Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <MetricCard
                    title="Total Submissions"
                    value={stats.total}
                    trend="Identity Documents"
                    icon={<HiOutlineCircleStack />}
                    color="primary"
                />
                <MetricCard
                    title="Pending Reviews"
                    value={stats.pending}
                    trend="Requires Attention"
                    icon={<HiOutlineShieldCheck />}
                    color="amber"
                />
                <MetricCard
                    title="Verified Users"
                    value={stats.verified}
                    trend="Platform Trusted"
                    icon={<HiOutlineCheckBadge />}
                    color="primary"
                />
                <MetricCard
                    title="Failed Audits"
                    value={stats.failed}
                    trend="Registry Cleanups"
                    icon={<HiOutlineXCircle />}
                    color="red"
                />
            </div>

            {/* Operations Grid */}
            <div>
                <div className="flex items-center gap-3 mb-8">
                    <div className="w-10 h-10 bg-primary text-white rounded-xl flex items-center justify-center shadow-lg shadow-primary/20">
                        <HiOutlinePresentationChartLine className="text-lg" />
                    </div>
                    <h2 className="text-2xl font-black text-gray-900 tracking-tight">Platform Operations</h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {/* KYC Management Route */}
                    <div
                        onClick={() => navigate("/kycs")}
                        className="bg-white rounded-2xl p-8 border border-gray-200 shadow-sm hover:shadow-xl hover:border-primary/30 transition-all cursor-pointer group hover:-translate-y-1 relative overflow-hidden"
                    >
                        <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                            <HiOutlineShieldCheck size={120} />
                        </div>

                        <div className="flex justify-between items-start mb-8">
                            <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center text-primary text-2xl group-hover:scale-110 transition-transform group-hover:bg-primary group-hover:text-white group-hover:shadow-lg group-hover:shadow-primary/30">
                                <HiOutlineExclamationCircle />
                            </div>
                            <div className="w-10 h-10 rounded-full border border-gray-100 flex items-center justify-center text-gray-300 group-hover:bg-primary group-hover:text-white group-hover:border-primary transition-all">
                                <HiOutlineChevronRight />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <h3 className="text-xl font-black text-gray-900 group-hover:text-primary transition-colors">KYC Verification</h3>
                            <p className="text-sm font-medium text-gray-500 leading-relaxed">Validate government documents to maintain platform trust and security standards.</p>
                        </div>
                        <div className="mt-8 pt-6 border-t border-gray-50 flex items-center justify-between">
                            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Active Queue</span>
                            <span className="px-3 py-1 bg-amber-50 text-amber-700 rounded-lg text-xs font-black border border-amber-100">{stats.pending} Pending</span>
                        </div>
                    </div>



                </div>
            </div>
        </div>
    );
}

const MetricCard = ({ title, value, trend, icon, color }) => {
    const styles = {
        primary: {
            bg: 'bg-primary/10',
            text: 'text-primary',
            border: 'border-primary/20',
            glow: 'shadow-primary/10'
        },
        amber: {
            bg: 'bg-amber-50',
            text: 'text-amber-600',
            border: 'border-amber-100',
            glow: 'shadow-amber-100'
        },
        red: {
            bg: 'bg-red-50',
            text: 'text-red-600',
            border: 'border-red-100',
            glow: 'shadow-red-100'
        }
    }[color] || { bg: 'bg-gray-50', text: 'text-gray-600', border: 'border-gray-100', glow: '' };

    return (
        <div className={`bg-white rounded-2xl p-6 border border-gray-100 shadow-sm flex items-center gap-6 group hover:shadow-xl hover:border-primary/20 transition-all duration-300 relative overflow-hidden`}>
            <div className={`absolute -right-4 -bottom-4 text-gray-50 opacity-0 group-hover:opacity-100 transition-opacity duration-500`}>
                {React.cloneElement(icon, { size: 80 })}
            </div>
            <div className={`w-14 h-14 rounded-xl flex items-center justify-center text-2xl ${styles.bg} ${styles.text} group-hover:scale-110 transition-transform shadow-inner`}>
                {icon}
            </div>
            <div className="relative z-10">
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{title}</p>
                <h4 className="text-3xl font-black text-gray-900 tracking-tight mt-1">{value}</h4>
                <p className="text-[10px] font-bold text-gray-500 mt-1 flex items-center gap-1.5">
                    <span className={`w-1.5 h-1.5 rounded-full ${styles.text.replace('text-', 'bg-')} animate-pulse`}></span>
                    {trend}
                </p>
            </div>
        </div>
    );
};

export default Dashboard;
