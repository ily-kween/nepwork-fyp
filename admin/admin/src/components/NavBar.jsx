import React from "react";
import { NavLink, useNavigate } from "react-router";
import { useAuth } from "../stores/Auth";
import { 
    HiOutlineArrowLeftOnRectangle, 
    HiOutlineShieldCheck,
    HiOutlineViewColumns
} from "react-icons/hi2";

function NavBar() {
    const isLoggedIn = useAuth((state) => state.isLoggedIn);
    const navigate = useNavigate();

    if (!isLoggedIn) {
        return null;
    }

    return (
        <nav className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-slate-200 shadow-sm">
            <div className="max-w-7xl mx-auto px-6 md:px-12 h-20 flex items-center justify-between">
                {/* Logo & Brand */}
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-primary to-emerald-600 rounded-xl flex items-center justify-center text-white font-black text-lg">
                        A
                    </div>
                    <div className="hidden md:block">
                        <h1 className="text-lg font-black text-slate-900">Admin Panel</h1>
                        <p className="text-[10px] text-slate-600 font-semibold">Management Hub</p>
                    </div>
                </div>

                {/* Navigation Items */}
                <div className="flex items-center gap-8">
                    <NavLink
                        to="/dashboard"
                        className={({ isActive }) =>
                            `flex items-center gap-2 px-4 py-2 rounded-lg transition-all font-semibold text-sm ${
                                isActive
                                    ? "bg-primary text-white shadow-lg"
                                    : "text-slate-600 hover:bg-slate-100"
                            }`
                        }
                    >
                        <HiOutlineViewColumns className="w-5 h-5" />
                        <span>Dashboard</span>
                    </NavLink>

                    <NavLink
                        to="/kycs"
                        className={({ isActive }) =>
                            `flex items-center gap-2 px-4 py-2 rounded-lg transition-all font-semibold text-sm ${
                                isActive
                                    ? "bg-primary text-white shadow-lg"
                                    : "text-slate-600 hover:bg-slate-100"
                            }`
                        }
                    >
                        <HiOutlineShieldCheck className="w-5 h-5" />
                        <span>KYC Verification</span>
                    </NavLink>
                </div>

                {/* Logout */}
                <button
                    onClick={() => navigate("/logout")}
                    className="flex items-center gap-2 px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-all font-semibold text-sm border border-red-200 hover:border-red-300"
                >
                    <HiOutlineArrowLeftOnRectangle className="w-5 h-5" />
                    <span>Logout</span>
                </button>
            </div>
        </nav>
    );
}

export default NavBar;
