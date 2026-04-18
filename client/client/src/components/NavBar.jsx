import React, { useState } from "react";
import { NavLink, useLocation, useNavigate } from "react-router";
import { GoHome } from "react-icons/go";
import { MdOutlineSpaceDashboard } from "react-icons/md";
import { LuUserRound } from "react-icons/lu";

import { IoMdNotificationsOutline } from "react-icons/io";
import { Button, NotificationDropdown } from "../components";
import { HiOutlineChatAlt2 } from "react-icons/hi";
import { FiBriefcase } from "react-icons/fi";
import nepwork_logo from "../assets/nepwork_logo.svg";
import default_avatar from "../assets/default_avatar.svg";
import { useAuth, useNotification } from "../stores";
import { useEffect } from "react";
import toast from "react-hot-toast";

function NavBar() {
    const location = useLocation();
    const [rotation, setRotation] = useState(0);
    const [showNotifications, setShowNotifications] = useState(false);
    const navigate = useNavigate();
    const { isLoggedIn, userData, socket } = useAuth();
    const { notifications, unreadCount, fetchNotifications, addNotification } = useNotification();

    useEffect(() => {
        if (isLoggedIn && userData) {
            fetchNotifications();
        }
    }, [isLoggedIn, userData]);

    useEffect(() => {
        if (socket) {
            socket.on("notification", (notification) => {
                addNotification(notification);
            });
            return () => socket.off("notification");
        }
    }, [socket]);

    const activeNavItemStyle = "text-primary font-semibold";
    const inactiveNavItemStyle = "text-secondaryText hover:text-primary";
    const navItemStyle = "flex items-center gap-2 relative p-2 sm:px-3 group";

    if (isLoggedIn) {
        return (
            <nav
                className={`bg-tertiary shadow-sm w-full top-0 z-50 border-b border-secondary ${location.pathname === "/inbox" ? "static" : "sticky"}`}
            >
                <div className=" mx-auto px-3 sm:px-6 h-14 sm:h-16 flex items-center justify-between">
                    {/* Logo */}
                    <div className="flex items-center flex-shrink-0">
                        <img
                            src={nepwork_logo}
                            alt="logo"
                            className="h-8 sm:h-10 cursor-pointer transform transition-transform hover:scale-105"
                            onClick={() => navigate("/")}
                        />
                    </div>

                    {/* Spacer - Center */}
                    <div className="flex-1"></div>

                    {/* Right-aligned Icons */}
                    <div className="flex items-center gap-2 sm:gap-3 ml-auto">
                        {/* Notifications */}
                        <div className="relative">
                            <button
                                onClick={() => setShowNotifications(!showNotifications)}
                                className="p-1.5 sm:p-2 rounded-full hover:bg-secondary transition-colors duration-200 relative"
                            >
                                <IoMdNotificationsOutline className="text-2xl text-secondaryText hover:text-primary" />
                                {unreadCount > 0 && (
                                    <span className="absolute top-1 right-1 bg-red-500 text-white text-[10px] font-bold rounded-full w-5 h-5 flex items-center justify-center">
                                        {unreadCount > 9 ? "9+" : unreadCount}
                                    </span>
                                )}
                            </button>
                            {showNotifications && (
                                <div className="absolute top-12 right-0 z-50">
                                    <NotificationDropdown notifications={notifications} setShowNotifications={setShowNotifications} />
                                </div>
                            )}
                        </div>

                        {/* Profile */}
                        <button
                            onClick={() => {
                                if (userData?._id) {
                                    navigate(`/profile/${userData._id}`);
                                } else {
                                    toast.error("Profile data not available");
                                }
                            }}
                            className="p-1.5 sm:p-2 rounded-full hover:bg-secondary transition-colors duration-200"
                        >
                            <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-full overflow-hidden border border-secondaryText hover:border-primary transition-colors">
                                <img
                                    src={userData?.avatar || default_avatar}
                                    alt="profile"
                                    className="w-full h-full object-cover"
                                />
                            </div>
                        </button>


                    </div>
                </div>
            </nav>
        );
    } else {
        return (
            <nav className="bg-tertiary shadow-sm sticky w-full top-0 z-50 border-b border-secondary">
                <div className="max-w-7xl mx-auto px-3 sm:px-6 h-14 sm:h-16 flex items-center justify-between">
                    {/* Logo */}
                    <div className="flex items-center flex-shrink-0">
                        <img
                            src={nepwork_logo}
                            alt="logo"
                            className="h-8 sm:h-10 cursor-pointer transform transition-transform hover:scale-105"
                            onClick={() => navigate("/")}
                        />
                    </div>

                    {/* Navigation Items */}
                    <div className="flex items-center gap-2 sm:gap-4">
                        <NavLink
                            to="/"
                            className={({ isActive }) =>
                                `px-3 py-1.5 rounded-full text-sm sm:text-base ${isActive
                                    ? "text-primary font-semibold bg-secondary"
                                    : "text-secondaryText hover:text-primary hover:bg-secondary"
                                } transition-colors duration-200`
                            }
                        >
                            Home
                        </NavLink>

                        <div className="flex gap-2 sm:gap-3">
                            <Button
                                variant="filled"
                                onClick={() => navigate("/signup")}
                                className="px-3 sm:px-5 py-1.5 text-xs sm:text-sm rounded-full bg-primary hover:bg-primary/90 transition-colors shadow-md"
                            >
                                Join Now
                            </Button>
                            <Button
                                variant="outline"
                                onClick={() => navigate("/login")}
                                className="px-3 sm:px-5 py-1.5 text-xs sm:text-sm rounded-full border-2 border-primary text-primary hover:bg-secondary transition-colors"
                            >
                                Sign In
                            </Button>
                        </div>
                    </div>
                </div>
            </nav>
        );
    }
}

export default NavBar;
