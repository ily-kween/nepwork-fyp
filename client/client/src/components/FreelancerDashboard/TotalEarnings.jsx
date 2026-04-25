import React, { useEffect, useState } from "react";
import { Line } from "react-chartjs-2";
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
} from "chart.js";
import { useNavigate } from "react-router";
import api from "../../utils/api";
import Loader from "../Loader";
import { useAuth } from "../../stores";
import {
    applyTransactionFilters,
    loadTransactionFilters,
    toTransactionApiParams,
} from "../../utils/transactionFilters";

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    Filler,
);

function TotalEarnings() {
    const navigate = useNavigate();
    const [fetching, setFetching] = useState(true);
    const [totalEarned, setTotalEarned] = useState(0);
    const { userData } = useAuth();
    const [chartData, setChartData] = useState({
        labels: [],
        datasets: [],
    });

    useEffect(() => {
        const fetchData = async () => {
            try {
                const storedFilters = loadTransactionFilters();
                const response = await api.get("/user/transactions/all", {
                    params: toTransactionApiParams(storedFilters),
                });
                const allTransactions = applyTransactionFilters(response.data.data, storedFilters);
                const userId = userData?._id || JSON.parse(localStorage.getItem("user"))?._id;

                // Filter transactions where user is the receiver (earner)
                const transactions = allTransactions.filter(txn => txn.receiver?._id === userId);

                // Calculate total earnings
                const total = transactions.reduce((sum, txn) => sum + txn.amount, 0);
                setTotalEarned(total);

                // Group by month
                const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "August", "Sept", "Oct", "Nov", "Dec"];
                const now = new Date();
                const last6Months = [];
                for (let i = 5; i >= 0; i--) {
                    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
                    last6Months.push({
                        month: months[d.getMonth()],
                        year: d.getFullYear(),
                        total: 0
                    });
                }

                transactions.forEach(txn => {
                    const date = new Date(txn.createdAt);
                    const monthName = months[date.getMonth()];
                    const year = date.getFullYear();
                    
                    const monthObj = last6Months.find(m => m.month === monthName && m.year === year);
                    if (monthObj) {
                        monthObj.total += txn.amount;
                    }
                });

                setChartData({
                    labels: last6Months.map(m => m.month),
                    datasets: [
                        {
                            label: "Monthly Earnings",
                            data: last6Months.map(m => m.total),
                            borderColor: "#ffffff",
                            backgroundColor: (context) => {
                                const chart = context.chart;
                                const { ctx, chartArea } = chart;
                                if (!chartArea) return null;
                                const gradient = ctx.createLinearGradient(0, chartArea.top, 0, chartArea.bottom);
                                gradient.addColorStop(0, "rgba(255, 255, 255, 0.4)");
                                gradient.addColorStop(1, "rgba(255, 255, 255, 0.05)");
                                return gradient;
                            },
                            fill: true,
                            tension: 0.4,
                            pointRadius: 4,
                            pointHoverRadius: 6,
                            pointBackgroundColor: "#ffffff",
                            pointBorderColor: "rgba(255, 255, 255, 0.8)",
                            pointBorderWidth: 2,
                        },
                    ],
                });
                setFetching(false);
            } catch (error) {
                console.error("Error fetching earnings:", error);
                setFetching(false);
            }
        };

        if (userData?._id || localStorage.getItem("user")) {
            fetchData();
        }
    }, [userData]);

    const options = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                display: false,
            },
            tooltip: {
                backgroundColor: "rgba(255, 255, 255, 0.9)",
                titleColor: "#3b82f6",
                bodyColor: "#1f2937",
                borderColor: "#e5e7eb",
                borderWidth: 1,
                padding: 12,
                displayColors: false,
                callbacks: {
                    label: (context) => `Rs. ${context.raw.toLocaleString()}`,
                },
            },
        },
        scales: {
            x: {
                grid: {
                    display: false,
                },
                ticks: {
                    color: "rgba(255, 255, 255, 0.8)",
                    font: {
                        size: 12,
                        weight: "500",
                    },
                },
            },
            y: {
                display: false,
                grid: {
                    display: false,
                },
            },
        },
    };

    if (fetching) return <Loader />;

    return (
        <div className="bg-gradient-to-br from-indigo-500 via-blue-600 to-indigo-700 text-white p-8 rounded-2xl mb-8 shadow-xl relative overflow-hidden group transition-all duration-300 hover:shadow-indigo-200/50">
            {/* Decorative background elements */}
            <div className="absolute top-0 right-0 -mt-20 -mr-20 w-64 h-64 bg-white/10 rounded-full blur-3xl group-hover:bg-white/20 transition-all duration-500"></div>
            <div className="absolute bottom-0 left-0 -mb-20 -ml-20 w-48 h-48 bg-indigo-400/20 rounded-full blur-2xl"></div>

            <div className="relative z-10">
                <div className="flex flex-col md:flex-row md:justify-between md:items-end mb-8">
                    <div>
                        <p className="text-indigo-100 font-medium mb-1 uppercase tracking-wider text-xs">Total Earnings</p>
                        <h2 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-2">
                            Rs. {totalEarned.toLocaleString()}
                        </h2>
                        <div className="flex items-center gap-2 text-indigo-100 text-sm">
                            <span className="flex items-center justify-center w-5 h-5 bg-indigo-400/30 rounded-full border border-indigo-300/30">
                                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 10l7-7m0 0l7 7m-7-7v18" />
                                </svg>
                            </span>
                            <span>Earning trend for the last 6 months</span>
                        </div>
                    </div>
                    <button
                        onClick={() => navigate("/transactions")}
                        className="mt-6 md:mt-0 bg-white/10 backdrop-blur-md border border-white/20 text-white px-8 py-3 rounded-xl hover:bg-white hover:text-indigo-700 transition-all duration-300 font-bold shadow-lg flex items-center gap-2 group/btn"
                    >
                        Earnings History
                        <svg className="w-4 h-4 transform group-hover/btn:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                        </svg>
                    </button>
                </div>

                <div className="h-48 md:h-64 mt-4">
                    <Line data={chartData} options={options} />
                </div>
            </div>
        </div>
    );
}

export default TotalEarnings;
