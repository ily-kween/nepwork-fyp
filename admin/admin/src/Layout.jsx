import { Outlet, useLocation } from "react-router";
import { NavBar, Loader } from "./components";
import { Toaster } from "react-hot-toast";
import { api } from "./utils";
import { useAuth, useUser } from "./stores";
import { useEffect, useState } from "react";

function Layout() {
    const location = useLocation();
    const login = useAuth((state) => state.login);
    const setUserData = useUser((state) => state.setUserData);

    const [loading, setLoading] = useState(true);

    useEffect(() => {
        api.get("/admin/verify-token")
            .then((res) => {
                if (res.data.success && res.data.isAuthenticated) {
                    setUserData();
                    login();
                    setLoading(false);
                }
            })
            .catch((_) => {
                setLoading(false);
            })
            .finally(() => setLoading(false));
    }, [location]);

    if (loading) return <Loader />;
    else {
        return (
            <>
                <Toaster />
                <div className="tablet:hidden fixed top-0 left-0 bg-primary h-full w-full flex justify-center items-center">
                    <p className="text-xl text-center">
                        <strong>
                        Admin portal does not support small screen sizes, please
                        use a larger screen
                        </strong>
                    </p>
                </div>
                <div className="hidden tablet:block">
                    <NavBar />
                    <div className="pt-20">
                        <Outlet />
                    </div>
                </div>
            </>
        );
    }
}

export default Layout;
