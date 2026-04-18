import React, { useState, useEffect } from "react";
import { NavLink, useNavigate } from "react-router";
import { GoHome } from "react-icons/go";
import { MdOutlineSpaceDashboard } from "react-icons/md";
import { LuUserRound } from "react-icons/lu";
import { IoSettingsOutline } from "react-icons/io5";
import { HiOutlineChatAlt2 } from "react-icons/hi";
import { FiBriefcase, FiLogOut, FiMenu, FiX, FiChevronDown, FiDollarSign } from "react-icons/fi";
import { useAuth, useSetting } from "../stores";
import api from "../utils/api";
import toast from "react-hot-toast";

function Sidebar() {
    const navigate = useNavigate();
    const { isLoggedIn, userData, clearUserData, logout, disconnectSocket } = useAuth();
    const openSetting = useSetting((state) => state.open);
    const [isOpen, setIsOpen] = useState(false);
    const [rotation, setRotation] = useState(0);
    const [transactions, setTransactions] = useState([]);
    const [transactionsLoading, setTransactionsLoading] = useState(false);
    const [expandTransactions, setExpandTransactions] = useState(false);

    // Fetch transactions
    const fetchTransactions = async () => {
        try {
            setTransactionsLoading(true);
            const response = await api.get("/user/transactions/all");
            let txns = response.data.data || [];
            // Ensure txns is always an array
            txns = Array.isArray(txns) ? txns : [];
            setTransactions(txns);
        } catch (error) {
            console.error("Failed to fetch transactions:", error);
            setTransactions([]); // Ensure we default to empty array on error
        } finally {
            setTransactionsLoading(false);
        }
    };

    useEffect(() => {
        if (isLoggedIn && userData) {
            fetchTransactions();
        }
    }, [isLoggedIn, userData]);

    // Categorize transactions
    const getCategorizedTransactions = () => {
        // Ensure transactions is an array before filtering
        const txnArray = Array.isArray(transactions) ? transactions : [];
        
        const now = new Date();
        const threeDaysAgo = new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000);
        
        const pending = txnArray.filter(t => t.status === "pending" || t.status === "processing");
        const completed = txnArray.filter(t => t.status === "completed" || t.status === "success");
        const past = txnArray.filter(t => new Date(t.createdAt) < threeDaysAgo);
        
        return { pending, completed, past };
    };

    // Helper function to safely get user name
    const getUserName = (user) => {
        if (!user) return "Unknown";
        const firstName = user.firstName || user.name?.firstName || "";
        const lastName = user.lastName || user.name?.lastName || "";
        return `${firstName} ${lastName}`.trim() || "Unknown";
    };

    // Helper function to get role-specific transaction partner
    const getTransactionPartner = (txn) => {
        const isInitiator = (txn.initiator?._id || txn.initiator) === userData?._id;
        const partner = isInitiator ? txn.receiver : txn.initiator;
        return getUserName(partner);
    };

    const getTransactionType = (txn) => {
        const isInitiator = (txn.initiator?._id || txn.initiator) === userData?._id;
        return isInitiator ? "Paid to" : "Received from";
    };

    const { pending, completed, past } = getCategorizedTransactions();

    const handleLogout = () => {
        // Navigate to logout page which handles all cleanup
        navigate("/logout");
    };

    const activeNavItemStyle =
        "bg-gradient-to-r from-primary/15 to-primary/5 text-primary border-l-4 border-primary font-semibold shadow-sm";
    const inactiveNavItemStyle =
        "text-gray-600 hover:bg-gray-100/60 hover:text-primary/80 border-l-4 border-transparent transition-all duration-200";

    const navItems = [
        { path: "/", label: "Home", icon: GoHome },
        { path: "/dashboard", label: "Dashboard", icon: MdOutlineSpaceDashboard },
        { path: "/projects-workspace", label: "Projects", icon: FiBriefcase },
        { path: `/profile/${userData?._id}`, label: "Profile", icon: LuUserRound },
        { path: "/inbox", label: "Inbox", icon: HiOutlineChatAlt2 },
    ];

    if (!isLoggedIn) {
        return null;
    }

    return (
        <>
            {/* Mobile Toggle Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="fixed z-40 p-2 text-white transition rounded-lg left-4 top-4 md:hidden bg-primary hover:bg-primary/90"
            >
                {isOpen ? <FiX size={24} /> : <FiMenu size={24} />}
            </button>

            {/* Sidebar Backdrop (Mobile) */}
            {isOpen && (
                <div
                    className="fixed inset-0 z-30 bg-black/50 md:hidden"
                    onClick={() => setIsOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside
                className={`fixed md:sticky top-0 left-0 h-screen w-72 sm:w-64 md:w-64 lg:w-72 bg-white border-r border-gray-100 z-40 transform transition-transform duration-300 ease-in-out overflow-y-auto shadow-lg md:shadow-none ${
                    isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
                }`}
            >
                {/* Navigation Items */}
                <nav className="flex flex-col gap-0.5 p-3 sm:p-4 mt-2">
                    {navItems.map((item) => {
                        const Icon = item.icon;
                        return (
                            <NavLink
                                key={item.path}
                                to={item.path}
                                onClick={() => setIsOpen(false)}
                                className={({ isActive }) =>
                                    `flex items-center gap-3 px-3 sm:px-4 py-2.5 sm:py-3 rounded-lg transition-colors text-sm sm:text-base ${
                                        isActive ? activeNavItemStyle : inactiveNavItemStyle
                                    }`
                                }
                            >
                                {({ isActive }) => (
                                    <>
                                        <Icon
                                            className={`text-lg sm:text-xl flex-shrink-0 ${
                                                isActive
                                                    ? "text-primary"
                                                    : "text-gray-500"
                                            }`}
                                        />
                                        <span className="font-medium">
                                            {item.label}
                                        </span>
                                    </>
                                )}
                            </NavLink>
                        );
                    })}
                </nav>

                {/* Transactions Section */}
                <div className="px-3 sm:px-4 py-2">
                    <div className="space-y-2">
                        <button
                            onClick={() => setExpandTransactions(!expandTransactions)}
                            className="flex items-center justify-between w-full px-3 sm:px-4 py-2.5 sm:py-3 font-semibold text-gray-700 transition-all border border-transparent rounded-lg hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200 text-sm sm:text-base"
                        >
                            <div className="flex items-center gap-3">
                                <div className="flex-shrink-0 text-lg sm:text-xl p-1.5 rounded-lg bg-gradient-to-br from-blue-100 to-blue-50">
                                    <FiDollarSign className="text-blue-600" />
                                </div>
                                <span className="font-bold">Transactions</span>
                            </div>
                            <FiChevronDown
                                className={`text-gray-400 transition-transform duration-300 flex-shrink-0 ${
                                    expandTransactions ? "rotate-180" : ""
                                }`}
                            />
                        </button>
                        
                        {/* Quick View All Transactions Button */}
                        <button
                            onClick={() => {
                                navigate("/all-transactions");
                                setIsOpen(false);
                            }}
                            className="w-full px-3 sm:px-4 py-2 sm:py-2.5 bg-gradient-to-r from-blue-500 via-blue-600 to-indigo-600 text-white text-xs sm:text-sm font-bold rounded-lg hover:from-blue-600 hover:via-blue-700 hover:to-indigo-700 transition-all duration-300 text-center shadow-md hover:shadow-blue-300/50 transform hover:scale-105"
                        >
                            💳 View All Transactions →
                        </button>
                    </div>

                    {/* Expanded Transactions */}
                    {expandTransactions && (
                        <div className="p-2 sm:p-3 mt-2 space-y-2 rounded-lg bg-gray-50">
                            {/* Pending Transactions */}
                            {pending.length > 0 && (
                                <div className="space-y-1">
                                    <div className="flex items-center gap-2 px-2 py-1">
                                        <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                                        <span className="text-xs font-semibold text-gray-700">
                                            Pending ({pending.length})
                                        </span>
                                    </div>
                                    {pending.slice(0, 3).map((txn) => (
                                        <div
                                            key={txn._id}
                                            className="p-2 text-xs transition-colors bg-white border-l-2 border-yellow-500 rounded cursor-pointer hover:bg-yellow-50"
                                            onClick={() => {
                                                navigate("/all-transactions");
                                                setIsOpen(false);
                                            }}
                                        >
                                            <p className="font-semibold text-gray-900 truncate text-xs">
                                                {txn.remarks || "Transaction"}
                                            </p>
                                            <p className="text-gray-600 text-[10px] sm:text-[11px] mt-0.5">
                                                {getTransactionType(txn)} {getTransactionPartner(txn)}
                                            </p>
                                            <p className="mt-1 font-semibold text-gray-700 text-xs">
                                                Rs. {txn.amount?.toLocaleString() || 0}
                                            </p>
                                        </div>
                                    ))}
                                    {pending.length > 3 && (
                                        <button
                                            onClick={() => {
                                                navigate("/all-transactions");
                                                setIsOpen(false);
                                            }}
                                            className="w-full py-1 text-xs font-semibold text-primary hover:underline"
                                        >
                                            +{pending.length - 3} more
                                        </button>
                                    )}
                                </div>
                            )}

                            {/* Completed Transactions */}
                            {completed.length > 0 && (
                                <div className="pt-2 sm:pt-3 mt-2 sm:mt-3 space-y-1 border-t border-gray-200">
                                    <div className="flex items-center gap-2 px-2 py-1">
                                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                        <span className="text-xs font-semibold text-gray-700">
                                            Completed ({completed.length})
                                        </span>
                                    </div>
                                    {completed.slice(0, 3).map((txn) => (
                                        <div
                                            key={txn._id}
                                            className="p-2 text-xs transition-colors bg-white border-l-2 border-green-500 rounded cursor-pointer hover:bg-green-50"
                                            onClick={() => {
                                                navigate("/all-transactions");
                                                setIsOpen(false);
                                            }}
                                        >
                                            <p className="font-semibold text-gray-900 truncate text-xs">
                                                {txn.remarks || "Transaction"}
                                            </p>
                                            <p className="text-gray-600 text-[10px] sm:text-[11px] mt-0.5">
                                                {getTransactionType(txn)} {getTransactionPartner(txn)}
                                            </p>
                                            <p className="mt-1 font-semibold text-gray-700 text-xs">
                                                Rs. {txn.amount?.toLocaleString() || 0}
                                            </p>
                                        </div>
                                    ))}
                                    {completed.length > 3 && (
                                        <button
                                            onClick={() => {
                                                navigate("/all-transactions");
                                                setIsOpen(false);
                                            }}
                                            className="w-full py-1 text-xs font-semibold text-primary hover:underline"
                                        >
                                            +{completed.length - 3} more
                                        </button>
                                    )}
                                </div>
                            )}

                            {/* Past Transactions */}
                            {past.length > 0 && (
                                <div className="pt-2 sm:pt-3 mt-2 sm:mt-3 space-y-1 border-t border-gray-200">
                                    <div className="flex items-center gap-2 px-2 py-1">
                                        <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                                        <span className="text-xs font-semibold text-gray-700">
                                            Past ({past.length})
                                        </span>
                                    </div>
                                    {past.slice(0, 3).map((txn) => (
                                        <div
                                            key={txn._id}
                                            className="p-2 text-xs transition-colors bg-white border-l-2 border-gray-400 rounded cursor-pointer hover:bg-gray-100"
                                            onClick={() => {
                                                navigate("/all-transactions");
                                                setIsOpen(false);
                                            }}
                                        >
                                            <p className="font-semibold text-gray-900 truncate text-xs">
                                                {txn.remarks || "Transaction"}
                                            </p>
                                            <p className="text-gray-600 text-[10px] sm:text-[11px] mt-0.5">
                                                {getTransactionType(txn)} {getTransactionPartner(txn)}
                                            </p>
                                            <p className="mt-1 font-semibold text-gray-700 text-xs">
                                                Rs. {txn.amount?.toLocaleString() || 0}
                                            </p>
                                        </div>
                                    ))}
                                    {past.length > 3 && (
                                        <button
                                            onClick={() => {
                                                navigate("/all-transactions");
                                                setIsOpen(false);
                                            }}
                                            className="w-full py-1 text-xs font-semibold text-primary hover:underline"
                                        >
                                            +{past.length - 3} more
                                        </button>
                                    )}
                                </div>
                            )}

                            {transactions.length === 0 && (
                                <div className="py-4 text-xs text-center text-gray-500">
                                    No transactions yet
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Settings & Logout */}
                <div className="flex flex-col gap-2 p-3 sm:p-4">
                    <button
                        onClick={() => {
                            openSetting();
                            setIsOpen(false);
                        }}
                        onMouseEnter={() =>
                            setRotation((prev) => prev + 90)
                        }
                        className="flex items-center w-full gap-3 px-3 sm:px-4 py-2.5 sm:py-3 text-left text-gray-600 transition-colors rounded-lg hover:bg-gray-50 hover:text-primary text-sm sm:text-base"
                    >
                        <IoSettingsOutline
                            className="flex-shrink-0 text-lg sm:text-xl text-gray-500"
                            style={{
                                transform: `rotate(${rotation}deg)`,
                                transition: "transform 300ms",
                            }}
                        />
                        <span className="font-medium">Settings</span>
                    </button>

                    <button
                        onClick={handleLogout}
                        className="flex items-center w-full gap-3 px-3 sm:px-4 py-2.5 sm:py-3 text-left text-red-600 transition-colors rounded-lg hover:bg-red-50 text-sm sm:text-base"
                    >
                        <FiLogOut className="flex-shrink-0 text-lg sm:text-xl" />
                        <span className="font-medium">Logout</span>
                    </button>
                </div>

                {/* User Info */}
                <div className="absolute bottom-4 left-4 right-4 p-2.5 sm:p-3.5 bg-gradient-to-br from-primary/10 to-primary/5 rounded-xl border border-primary/20 hover:border-primary/40 transition-all duration-300">
                    <p className="text-xs sm:text-sm font-bold text-gray-900">
                        {userData?.firstName} {userData?.lastName}
                    </p>
                    <p className="mt-1 text-xs font-semibold capitalize text-primary/70">
                        {userData?.role}
                    </p>
                </div>
            </aside>
        </>
    );
}

export default Sidebar;
