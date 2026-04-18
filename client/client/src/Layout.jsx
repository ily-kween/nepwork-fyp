import { Outlet, useLocation, useNavigate } from "react-router";
import { Sidebar, Footer, Loader, SettingSlide, NavBar } from "./components";
import { Toaster } from "react-hot-toast";
import api from "./utils/api";
import { useAuth, useSetting } from "./stores";
import { useEffect, useState } from "react";

function Layout() {
    const location = useLocation();
    const navigate = useNavigate();
    const { login, logout, isLoggedIn, setUserData } = useAuth();
    const settingVisible = useSetting((state) => state.visible);

    const [loading, setLoading] = useState(true);

    // Token verification on mount
    useEffect(() => {
        const hasAccessToken = localStorage.getItem("accessToken");
        if (hasAccessToken) {
            api.get("/user/verify-token")
                .then((res) => {
                    if (res.data.success && res.data.isAuthenticated) {
                        if (!isLoggedIn) {
                            setUserData();
                        }
                        login();
                    } else {
                        logout();
                        localStorage.clear();
                    }
                })
                .catch((_) => {
                    logout();
                    localStorage.clear();
                })
                .finally(() => setLoading(false));
        } else {
            logout();
            setLoading(false);
        }
    }, []);

    // Scroll to top when route changes
    useEffect(() => {
        window.scrollTo(0, 0);
    }, [location]);

    // Check if page requires login and redirect if needed
    useEffect(() => {
        const publicPages = ["/", "/login", "/signup"];
        const isPublicPage = publicPages.includes(location.pathname);
        
        if (!loading && !isLoggedIn && !isPublicPage) {
            navigate("/login", { replace: true });
        }
    }, [isLoggedIn, location.pathname, navigate, loading]);

    if (loading) return <Loader />;
    
    // If not logged in, render without sidebar
    if (!isLoggedIn) {
        return (
            <>
                <NavBar />
                {settingVisible && <SettingSlide />}
                <Toaster />
                <Outlet />
            </>
        );
    }

    // If logged in, render with sidebar
    return (
        <>
            <NavBar />
            {settingVisible && <SettingSlide />}
            <Toaster />
            <div className="flex min-h-screen">
                <Sidebar />
                <main className="flex-1 md:ml-0 w-full">
                    <Outlet />
                </main>
            </div>
            <Footer />
        </>
    );
}

export default Layout;
