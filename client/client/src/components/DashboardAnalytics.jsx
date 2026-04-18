import React, { useEffect, useState } from "react";
import { Line, Doughnut, Bar } from "react-chartjs-2";
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    Filler,
    ArcElement,
    BarElement,
} from "chart.js";
import { 
    FiDollarSign,
    FiBriefcase,
    FiCheck,
    FiTrendingUp,
    FiArrowUpRight
} from "react-icons/fi";
import api from "../utils/api";
import Loader from "./Loader";
import { useAuth } from "../stores";

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    Filler,
    ArcElement,
    BarElement,
);

const DashboardAnalytics = ({ role }) => {
    const { userData } = useAuth();
    const [fetching, setFetching] = useState(true);
    const [timeRange, setTimeRange] = useState("Monthly");
    const [stats, setStats] = useState({
        activeProjects: 0,
        monthlyTotal: 0,
        completedJobs: 0,
        avgValue: 0,
    });
    const [mainChartData, setMainChartData] = useState({ labels: [], datasets: [] });
    const [doughnutData, setDoughnutData] = useState({ labels: [], datasets: [] });
    const [barChartData, setBarChartData] = useState({ labels: [], datasets: [] });
    const [transactions, setTransactions] = useState([]);

    useEffect(() => {
        const fetchAllData = async () => {
            setFetching(true);
            try {
                const [txnRes, jobsRes] = await Promise.all([
                    api.get("/user/transactions/all"),
                    api.get(role === 'freelancer' ? "/jobs/freelancer-jobs" : "/jobs/get-jobs-posted-by-current-user")
                ]);

                const txns = Array.isArray(txnRes.data?.data) ? txnRes.data.data : [];
                const jobs = Array.isArray(jobsRes.data?.data) ? jobsRes.data.data : [];
                const userId = userData?._id;

                const userTxns = txns.filter(t => 
                    role === 'freelancer' ? (t.receiver?._id || t.receiver) === userId : (t.initiator?._id || t.initiator) === userId
                ).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
                
                setTransactions(userTxns.slice(0, 8));

                // Time Range Filtering Logic
                const now = new Date();
                let filterDate = new Date();
                if (timeRange === "Monthly") filterDate.setMonth(now.getMonth() - 1);
                else if (timeRange === "Quarterly") filterDate.setMonth(now.getMonth() - 3);
                else if (timeRange === "Annual") filterDate.setFullYear(now.getFullYear() - 1);

                const filteredTxns = userTxns.filter(t => new Date(t.createdAt) >= filterDate);
                const filteredJobs = jobs.filter(j => new Date(j.createdAt) >= filterDate);

                const totalInPeriod = filteredTxns.reduce((sum, t) => sum + t.amount, 0);
                const activeJobs = filteredJobs.filter(j => ['assigned', 'in_progress'].includes(j.status)).length;
                const completed = filteredJobs.filter(j => ['completed', 'paid'].includes(j.status)).length;
                const avgJobValue = filteredJobs.length > 0 ? (filteredJobs.reduce((sum, j) => sum + (j.hourlyRate || 0), 0) / filteredJobs.length) : 0;

                setStats({
                    activeProjects: activeJobs,
                    monthlyTotal: totalInPeriod,
                    completedJobs: completed,
                    avgValue: avgJobValue,
                });

                // Financial Chart Data Preparation
                const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
                let rangeSize = 6;
                if (timeRange === "Quarterly") rangeSize = 3;
                if (timeRange === "Annual") rangeSize = 12;

                const historicalData = [];
                for (let i = rangeSize - 1; i >= 0; i--) {
                    const d = new Date();
                    d.setMonth(now.getMonth() - i);
                    historicalData.push({ month: months[d.getMonth()], year: d.getFullYear(), count: 0 });
                }

                userTxns.forEach(t => {
                    const tDate = new Date(t.createdAt);
                    const mName = months[tDate.getMonth()];
                    const yVal = tDate.getFullYear();
                    const obj = historicalData.find(m => m.month === mName && m.year === yVal);
                    if (obj) obj.count += t.amount;
                });

                setMainChartData({
                    labels: historicalData.map(m => m.month),
                    datasets: [
                        {
                            label: role === 'freelancer' ? 'Earnings (Rs)' : 'Spending (Rs)',
                            data: historicalData.map(m => m.count),
                            fill: true,
                            borderColor: role === 'freelancer' ? '#10b981' : '#6366f1',
                            backgroundColor: (context) => {
                                const chart = context.chart;
                                const {ctx, chartArea} = chart;
                                if (!chartArea) return null;
                                const gradient = ctx.createLinearGradient(0, chartArea.top, 0, chartArea.bottom);
                                const baseColor = role === 'freelancer' ? '16, 185, 129' : '99, 102, 241';
                                gradient.addColorStop(0, `rgba(${baseColor}, 0.1)`);
                                gradient.addColorStop(1, `rgba(${baseColor}, 0)`);
                                return gradient;
                            },
                            tension: 0.3,
                            pointRadius: 4,
                            pointBackgroundColor: '#fff',
                            pointBorderWidth: 2,
                            borderWidth: 3,
                            yAxisID: 'y',
                        },
                        {
                            label: 'Volume (Txns)',
                            data: historicalData.map(m => {
                                // Calculate how many txns happened in this month
                                return userTxns.filter(t => {
                                    const tD = new Date(t.createdAt);
                                    return months[tD.getMonth()] === m.month && tD.getFullYear() === m.year;
                                }).length;
                            }),
                            borderColor: '#94a3b8',
                            borderDash: [5, 5],
                            borderWidth: 2,
                            fill: false,
                            tension: 0.3,
                            pointRadius: 0,
                            yAxisID: 'y1',
                        }
                    ]
                });

                const statusCounts = {
                    completed: jobs.filter(j => ['completed', 'paid'].includes(j.status)).length,
                    ongoing: jobs.filter(j => ['assigned', 'in_progress', 'open', 'pending_review'].includes(j.status)).length,
                    archived: jobs.filter(j => j.status === 'closed').length,
                };

                setDoughnutData({
                    labels: ['Completed', 'Active', 'Archived'],
                    datasets: [{
                        data: [statusCounts.completed, statusCounts.ongoing, statusCounts.archived],
                        backgroundColor: ['#10b981', '#3b82f6', '#94a3b8'],
                        hoverOffset: 4,
                        borderWidth: 0,
                    }]
                });

                // Bar Chart Data - Top Spending/Earning Categories
                const categoryBreakdown = {};
                userTxns.forEach(txn => {
                    const category = txn.jobId?.title || txn.jobTitle || 'Other';
                    if (!categoryBreakdown[category]) {
                        categoryBreakdown[category] = 0;
                    }
                    categoryBreakdown[category] += txn.amount;
                });

                const sortedCategories = Object.entries(categoryBreakdown)
                    .sort((a, b) => b[1] - a[1])
                    .slice(0, 6);

                setBarChartData({
                    labels: sortedCategories.map(([name]) => name.substring(0, 15) + (name.length > 15 ? '...' : '')),
                    datasets: [{
                        label: role === 'freelancer' ? 'Earnings (Rs)' : 'Spending (Rs)',
                        data: sortedCategories.map(([_, amount]) => amount),
                        backgroundColor: [
                            'rgba(16, 185, 129, 0.8)',
                            'rgba(59, 130, 246, 0.8)',
                            'rgba(139, 92, 246, 0.8)',
                            'rgba(249, 115, 22, 0.8)',
                            'rgba(236, 72, 153, 0.8)',
                            'rgba(6, 182, 212, 0.8)',
                        ],
                        borderRadius: 8,
                        borderSkipped: false,
                    }]
                });

                setFetching(false);
            } catch (error) {
                console.error("Error fetching analytics:", error);
                // Reset state on error
                setStats({
                    activeProjects: 0,
                    monthlyTotal: 0,
                    completedJobs: 0,
                    avgValue: 0,
                });
                setTransactions([]);
                setMainChartData({ labels: [], datasets: [] });
                setBarChartData({ labels: [], datasets: [] });
                setDoughnutData({ labels: [], datasets: [] });
                setFetching(false);
            }
        };

        fetchAllData();
    }, [userData, role, timeRange]);

    // Helper functions for transactions
    const getUserName = (user) => {
        if (!user) return "Unknown";
        const firstName = user.firstName || user.name?.firstName || "";
        const lastName = user.lastName || user.name?.lastName || "";
        return `${firstName} ${lastName}`.trim() || "Unknown";
    };

    const getTransactionPartner = (txn) => {
        const isInitiator = (txn.initiator?._id || txn.initiator) === userData?._id;
        const partner = isInitiator ? txn.receiver : txn.initiator;
        return getUserName(partner);
    };

    const getTransactionType = (txn) => {
        const isInitiator = (txn.initiator?._id || txn.initiator) === userData?._id;
        return isInitiator ? "Paid to" : "Received from";
    };

    return (
        <div className="space-y-8 font-['Poppins',_sans-serif]">
            {fetching && <Loader />}
            
            {/* Header Section */}
            <div className="flex flex-col justify-between gap-4 pb-6 border-b md:flex-row md:items-end border-slate-100">
                <div className="space-y-0.5">
                    <h2 className="text-3xl font-black tracking-tight text-slate-900">Dashboard</h2>
                    <p className="text-sm font-medium text-slate-500">Monitor your {role === 'freelancer' ? 'earnings' : 'spending'} and project performance</p>
                </div>
                <div className="flex items-center gap-2">
                    <div className="flex items-center bg-slate-50 border border-slate-200 rounded p-0.5 shadow-sm">
                        {["Monthly", "Quarterly", "Annual"].map(range => (
                            <button 
                                key={range}
                                onClick={() => setTimeRange(range)}
                                className={`px-4 py-2 text-xs font-bold uppercase tracking-wider rounded transition-all duration-200 ${timeRange === range ? 'bg-white text-slate-900 shadow-md border border-slate-200' : 'text-slate-400 hover:text-slate-600'}`}
                            >
                                {range}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Metrics Section with Enhanced Grid */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <MetricTile 
                    label={role === 'freelancer' ? 'Total Earnings' : 'Total Spent'} 
                    value={`Rs. ${Math.round(stats.monthlyTotal).toLocaleString()}`} 
                    subValue="+12% from previous period"
                    icon={<FiTrendingUp />}
                    trend="neutral"
                />
                <MetricTile 
                    label="Active Projects" 
                    value={stats.activeProjects} 
                    subValue={`${stats.completedJobs} completed`}
                    icon={<FiBriefcase />}
                    trend="neutral"
                />
                <MetricTile 
                    label="Completed Projects" 
                    value={stats.completedJobs} 
                    subValue="Successfully delivered"
                    icon={<FiCheck />}
                    trend="neutral"
                />
                <MetricTile 
                    label="Average Value" 
                    value={`Rs. ${Math.round(stats.avgValue).toLocaleString()}`} 
                    subValue="Per project average"
                    icon={<FiDollarSign />}
                    trend="neutral"
                />
            </div>

            {/* Main Content with Sidebar Layout */}
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                {/* Left Content - Main Visualizations */}
                <div className="space-y-6 lg:col-span-2">
                {/* Financial Chart */}
                <div className="p-6 transition-shadow duration-300 bg-white border rounded-lg shadow-sm border-slate-200 hover:shadow-md">
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h3 className="text-base font-black leading-none tracking-wider uppercase text-slate-900">Financial Performance</h3>
                            <p className="mt-2 text-xs font-medium text-slate-400">{role === 'freelancer' ? 'Your earnings' : 'Your spending'} over time</p>
                        </div>
                        <div className="flex items-center gap-4">
                             <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-50 rounded-full border border-emerald-200">
                                 <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                                 <span className="text-xs font-bold tracking-wider uppercase text-emerald-600">Live Data</span>
                             </div>
                        </div>
                    </div>
                    <div className="p-2 rounded-lg h-80 bg-gradient-to-b from-slate-50/50 to-white">
                         <Line 
                            data={mainChartData} 
                            options={{
                                responsive: true,
                                maintainAspectRatio: false,
                                plugins: { 
                                    legend: { display: false },
                                    tooltip: {
                                        mode: 'index',
                                        intersect: false,
                                        backgroundColor: '#1e293b',
                                        titleFont: { family: 'Poppins', size: 13, weight: 'bold' },
                                        bodyFont: { family: 'Poppins', size: 12 },
                                        padding: 14,
                                        cornerRadius: 10,
                                        displayColors: true,
                                    }
                                },
                                scales: {
                                    y: { 
                                        beginAtZero: true,
                                        border: { display: false }, 
                                        grid: { color: '#f1f5f9', drawTicks: false }, 
                                        ticks: { 
                                            font: { size: 11, family: 'Poppins', weight: '500' }, 
                                            color: '#94a3b8',
                                            callback: (v) => v >= 1000 ? `Rs.${(v/1000).toFixed(1)}k` : `Rs.${v}`,
                                            padding: 12
                                        } 
                                    },
                                    y1: {
                                        beginAtZero: true,
                                        position: 'right',
                                        display: true,
                                        grid: { display: false },
                                        ticks: {
                                            font: { size: 10, family: 'Poppins', weight: '500' },
                                            color: '#cbd5e1',
                                            callback: (v) => `${v}x`
                                        }
                                    },
                                    x: { 
                                        grid: { display: false }, 
                                        ticks: { font: { size: 11, family: 'Poppins', weight: '500' }, color: '#94a3b8', padding: 12 } 
                                    }
                                }
                            }} 
                         />
                    </div>
                </div>

                {/* Project Distribution */}
                <div className="p-6 transition-shadow duration-300 bg-white border rounded-lg shadow-sm border-slate-200 hover:shadow-md">
                    <div className="space-y-6">
                        <div>
                            <h3 className="text-base font-black leading-none tracking-wider uppercase text-slate-900">Project Status</h3>
                            <p className="mt-2 text-xs font-medium text-slate-400">Distribution across categories</p>
                        </div>
                        
                        <div className="relative flex items-center justify-center h-48">
                            {mainChartData.labels.length > 0 ? (
                                <>
                                    <Doughnut 
                                        data={doughnutData}
                                        options={{
                                            cutout: '72%',
                                            plugins: { legend: { display: false } },
                                            maintainAspectRatio: false
                                        }}
                                    />
                                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                                        <span className="text-3xl font-black leading-none text-slate-900">{stats.activeProjects + stats.completedJobs}</span>
                                        <span className="mt-2 text-xs font-bold tracking-wider uppercase text-slate-400">Projects</span>
                                    </div>
                                </>
                            ) : (
                                <div className="flex flex-col items-center justify-center h-full">
                                    <p className="text-sm text-slate-400">No projects yet</p>
                                </div>
                            )}
                        </div>

                        <div className="pt-4 space-y-3 border-t border-slate-100">
                            <LegendItem label="Completed" color="bg-emerald-500" value={stats.completedJobs} />
                            <LegendItem label="Active" color="bg-blue-500" value={stats.activeProjects} />
                            <LegendItem label="Archived" color="bg-slate-300" value="Old" />
                        </div>
                    </div>
                </div>

                {/* Category Breakdown */}
                <div className="p-6 transition-shadow duration-300 bg-white border rounded-lg shadow-sm border-slate-200 hover:shadow-md">
                    <div className="mb-6">
                        <h3 className="text-base font-black leading-none tracking-wider uppercase text-slate-900">Category Breakdown</h3>
                        <p className="mt-2 text-xs font-medium text-slate-400">Top {role === 'freelancer' ? 'earning' : 'spending'} categories by value</p>
                    </div>
                    <div className="p-2 rounded-lg h-80 bg-gradient-to-b from-slate-50/50 to-white">
                        {barChartData.labels.length > 0 ? (
                            <Bar 
                                data={barChartData}
                                options={{
                                    indexAxis: 'y',
                                    responsive: true,
                                    maintainAspectRatio: false,
                                    plugins: {
                                        legend: { display: false },
                                        tooltip: {
                                            backgroundColor: '#1e293b',
                                            titleFont: { family: 'Poppins', size: 13, weight: 'bold' },
                                            bodyFont: { family: 'Poppins', size: 12 },
                                            padding: 14,
                                            cornerRadius: 10,
                                            callbacks: {
                                                label: (context) => `Rs. ${context.parsed.x.toLocaleString()}`
                                            }
                                        }
                                    },
                                    scales: {
                                        x: {
                                            beginAtZero: true,
                                            border: { display: false },
                                            grid: { color: '#f1f5f9', drawTicks: false },
                                            ticks: {
                                                font: { size: 11, family: 'Poppins', weight: '500' },
                                                color: '#94a3b8',
                                                callback: (v) => v >= 1000 ? `${(v/1000).toFixed(1)}k` : v,
                                                padding: 12
                                            }
                                        },
                                        y: {
                                            border: { display: false },
                                            grid: { display: false },
                                            ticks: {
                                                font: { size: 11, family: 'Poppins', weight: '500' },
                                                color: '#64748b',
                                                padding: 12
                                            }
                                        }
                                    }
                                }}
                            />
                        ) : (
                            <div className="flex items-center justify-center h-full">
                                <p className="text-sm text-slate-400">No transaction data available</p>
                            </div>
                        )}
                    </div>
                </div>
                </div>

                {/* Right Sidebar - Transactions Only */}
                <div className="space-y-6">
                    {/* Top Categories */}
                    <div className="p-6 transition-all duration-300 bg-white border rounded-lg shadow-md border-slate-200 hover:shadow-lg">
                        <div className="mb-4">
                            <h3 className="text-base font-black tracking-wider uppercase text-slate-900">📊 Top Projects</h3>
                            <p className="mt-1 text-xs font-medium text-slate-500">{role === 'freelancer' ? 'Highest earnings' : 'Top spending'}</p>
                        </div>
                        
                        <div className="space-y-2">
                            {barChartData.labels && barChartData.labels.length > 0 ? (
                                barChartData.labels.slice(0, 3).map((label, idx) => {
                                    const amount = barChartData.datasets[0].data[idx] || 0;
                                    const maxAmount = Math.max(...(barChartData.datasets[0].data || [1]));
                                    const percentage = maxAmount > 0 ? (amount / maxAmount) * 100 : 0;
                                    const colorSchemes = [
                                        { bg: 'bg-emerald-50', text: 'text-emerald-700', gradient: 'from-emerald-500 to-emerald-600', bar: 'bg-emerald-500' },
                                        { bg: 'bg-blue-50', text: 'text-blue-700', gradient: 'from-blue-500 to-blue-600', bar: 'bg-blue-500' },
                                        { bg: 'bg-purple-50', text: 'text-purple-700', gradient: 'from-purple-500 to-purple-600', bar: 'bg-purple-500' }
                                    ];
                                    const scheme = colorSchemes[idx];
                                    
                                    return (
                                        <div key={idx} className={`p-3 rounded-lg ${scheme.bg} border border-slate-100 hover:border-slate-200 transition-all duration-200 group cursor-pointer`}>
                                            <div className="flex items-center justify-between gap-2">
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-xs font-bold leading-tight truncate text-slate-900">{label.substring(0, 20)}</p>
                                                    <p className={`text-xs font-semibold mt-1 ${scheme.text}`}>Rs. {Math.round(amount).toLocaleString()}</p>
                                                </div>
                                                <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${scheme.gradient} flex items-center justify-center flex-shrink-0 text-white group-hover:scale-105 transition-transform`}>
                                                    <span className="text-sm font-bold">{idx + 1}</span>
                                                </div>
                                            </div>
                                            <div className="h-1 mt-2 overflow-hidden rounded-full bg-slate-200">
                                                <div 
                                                    className={`h-full rounded-full transition-all duration-300 ${scheme.bar}`}
                                                    style={{ width: `${percentage}%` }}
                                                ></div>
                                            </div>
                                        </div>
                                    );
                                })
                            ) : (
                                <div className="flex flex-col items-center justify-center py-6">
                                    <div className="flex items-center justify-center w-10 h-10 mb-2 rounded-full bg-slate-100">
                                        <FiBriefcase className="text-base text-slate-400" />
                                    </div>
                                    <p className="text-sm font-medium text-slate-500">No data available</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Recent Transactions */}
                    <div className="p-6 transition-all duration-300 bg-white border rounded-lg shadow-md border-slate-200 hover:shadow-lg">
                        <div className="flex items-center justify-between mb-5">
                            <div>
                                <h3 className="text-lg font-black tracking-wider uppercase text-slate-900">💳 Recent Transactions</h3>
                                <p className="mt-2 text-xs font-medium text-slate-400">Latest {role === 'freelancer' ? 'earnings' : 'payments'}</p>
                            </div>
                        </div>
                        
                        <div className="space-y-2 overflow-y-auto max-h-96">
                            {transactions.slice(0, 6).length > 0 ? (
                                transactions.slice(0, 6).map((txn) => (
                                    <div
                                        key={txn._id}
                                        className="flex items-center justify-between p-3 transition-all duration-200 border rounded-lg cursor-pointer bg-gradient-to-r from-slate-50 to-white border-slate-100 hover:border-slate-200 hover:shadow-md group"
                                    >
                                        <div className="flex items-center flex-1 min-w-0 gap-3">
                                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-white text-xs flex-shrink-0 ${
                                                txn.status === 'completed' || txn.status === 'success' ? 'bg-gradient-to-br from-emerald-500 to-emerald-600' :
                                                txn.status === 'pending' ? 'bg-gradient-to-br from-amber-500 to-amber-600' :
                                                'bg-gradient-to-br from-slate-400 to-slate-500'
                                            }`}>
                                                {txn.remarks?.charAt(0)?.toUpperCase() || 'T'}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-xs font-bold truncate text-slate-900">{txn.remarks || 'Transaction'}</p>
                                                <p className="text-xs text-slate-500 mt-0.5 truncate">{getTransactionType(txn)} {getTransactionPartner(txn)}</p>
                                            </div>
                                        </div>
                                        <div className="flex-shrink-0 ml-2 text-right">
                                            <p className="text-xs font-bold text-slate-900">Rs. {txn.amount?.toLocaleString() || 0}</p>
                                            <span className={`text-xs font-bold uppercase tracking-wider mt-1 inline-block px-1.5 py-0.5 rounded-full ${
                                                txn.status === 'completed' || txn.status === 'success' ? 'bg-emerald-100 text-emerald-700' :
                                                txn.status === 'pending' ? 'bg-amber-100 text-amber-700' :
                                                'bg-slate-100 text-slate-700'
                                            }`}>
                                                {txn.status}
                                            </span>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="flex flex-col items-center justify-center py-8">
                                    <div className="flex items-center justify-center w-12 h-12 mb-3 rounded-full bg-slate-100">
                                        <FiDollarSign className="text-lg text-slate-400" />
                                    </div>
                                    <p className="text-sm font-medium text-slate-500">No transactions</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Full Width Recent Transactions - Bottom Section */}
   
        </div>
    );
}


const MetricTile = ({ label, value, subValue, icon, color = "text-slate-900", trend = "neutral" }) => {
    const getTrendColor = () => {
        if (trend === 'up') return 'text-emerald-600';
        if (trend === 'down') return 'text-rose-600';
        return 'text-slate-600';
    };

    const getTrendIcon = () => {
        if (trend === 'up') return <FiArrowUpRight className="text-emerald-600" />;
        if (trend === 'down') return <FiArrowUpRight className="transform rotate-180 text-rose-600" />;
        return null;
    };

    return (
        <div className="p-6 transition-all duration-300 border rounded-lg cursor-pointer group bg-gradient-to-br from-slate-50 to-white border-slate-200 hover:border-slate-300 hover:shadow-lg">
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center justify-center transition-all duration-300 border rounded-lg shadow-sm w-11 h-11 bg-primary/10 border-primary/20 group-hover:bg-primary/15 group-hover:border-primary/30">
                    {React.cloneElement(icon, { size: 20, className: "text-primary" })}
                </div>
                {trend !== 'neutral' && (
                    <div className={`p-1.5 rounded-full ${trend === 'up' ? 'bg-emerald-100' : 'bg-rose-100'}`}>
                        {getTrendIcon()}
                    </div>
                )}
            </div>
            <div>
                <p className="mb-2 text-xs font-bold tracking-widest uppercase text-primary/60">{label}</p>
                <div className="flex items-baseline gap-2 mb-3">
                    <h3 className={`text-2xl font-black tracking-tight group-hover:text-primary transition-colors ${color}`}>{value}</h3>
                </div>
                <p className={`text-xs font-semibold flex items-center gap-1.5 ${getTrendColor()}`}>
                    <span className={`inline-block w-1.5 h-1.5 rounded-full ${trend === 'up' ? 'bg-emerald-500' : trend === 'down' ? 'bg-rose-500' : 'bg-slate-400'}`}></span>
                    {subValue}
                </p>
            </div>
        </div>
    );
};

const LegendItem = ({ label, color, value }) => (
    <div className="flex items-center justify-between p-3 transition-all duration-200 rounded-lg bg-slate-50 hover:bg-slate-100 group">
        <div className="flex items-center gap-3">
            <div className={`w-2.5 h-2.5 rounded-full ${color} shadow-sm`}></div>
            <span className="text-xs font-bold tracking-tight uppercase text-slate-700">{label}</span>
        </div>
        <span className="text-xs font-black transition-colors text-slate-900 group-hover:text-primary">{value}</span>
    </div>
);

export default DashboardAnalytics;
