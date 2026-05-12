import { NavLink, useNavigate } from "react-router";
import { 
    HiOutlineViewColumns, 
    HiOutlineShieldCheck, 
    HiOutlineArrowLeftOnRectangle,
    HiOutlineUserCircle
} from "react-icons/hi2";
import { useAuth, useUser } from "../stores";

function Sidebar() {
    const navigate = useNavigate();
    const isLoggedIn = useAuth((state) => state.isLoggedIn);
    const user = useUser((state) => state.user);

    if (!isLoggedIn) return null;

    const navItems = [
        { path: "/dashboard", label: "Dashboard", icon: HiOutlineViewColumns },
        { path: "/kycs", label: "KYC Verification", icon: HiOutlineShieldCheck },
    ];

    const activeNavItemStyle =
        "bg-gradient-to-r from-primary/15 to-primary/5 text-primary border-l-4 border-primary font-semibold shadow-sm";
    const inactiveNavItemStyle =
        "text-gray-600 hover:bg-gray-100/60 hover:text-primary/80 border-l-4 border-transparent transition-all duration-200";

    return (
        <aside className="fixed left-0 top-0 h-screen w-64 bg-white border-r border-gray-100 z-40 flex flex-col shadow-lg">
            {/* Logo Section */}
            <div className="p-6 border-b border-gray-50 flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-primary to-emerald-600 rounded-xl flex items-center justify-center text-white font-black text-lg shadow-md">
                    A
                </div>
                <div>
                    <h1 className="text-lg font-black text-gray-900 leading-none">Admin</h1>
                    <p className="text-[10px] text-primary font-bold uppercase tracking-widest mt-1">Management</p>
                </div>
            </div>

            {/* Navigation */}
            <nav className="flex-1 px-3 py-6 space-y-1">
                {navItems.map((item) => {
                    const Icon = item.icon;
                    return (
                        <NavLink
                            key={item.path}
                            to={item.path}
                            className={({ isActive }) =>
                                `flex items-center gap-3 px-4 py-3 rounded-lg transition-all text-sm ${
                                    isActive ? activeNavItemStyle : inactiveNavItemStyle
                                }`
                            }
                        >
                            <Icon className="text-xl" />
                            <span className="font-medium">{item.label}</span>
                        </NavLink>
                    );
                })}
            </nav>

            {/* Footer Section */}
            <div className="p-4 border-t border-gray-50 space-y-2">
                <div className="p-3 bg-gray-50 rounded-xl border border-gray-100 mb-4">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                            <HiOutlineUserCircle className="text-primary text-lg" />
                        </div>
                        <div className="overflow-hidden">
                            <p className="text-xs font-bold text-gray-900 truncate">{user?.name || "Administrator"}</p>
                            <p className="text-[10px] text-gray-500 truncate">{user?.email}</p>
                        </div>
                    </div>
                </div>

                <button
                    onClick={() => navigate("/logout")}
                    className="w-full flex items-center gap-3 px-4 py-3 text-red-600 hover:bg-red-50 rounded-lg transition-all text-sm font-semibold border border-transparent hover:border-red-100"
                >
                    <HiOutlineArrowLeftOnRectangle className="text-xl" />
                    <span>Logout</span>
                </button>
            </div>
        </aside>
    );
}

export default Sidebar;
