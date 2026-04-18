import React from "react";
import { useEffect } from "react";
import { useNavigate } from "react-router";
import toast from "react-hot-toast";
import { useAuth, useUser } from "../stores";

function Logout() {
    const logout = useAuth((state) => state.logout);
    const clearUserData = useUser((state) => state.clearUserData);
    const navigate = useNavigate();
    useEffect(() => {
        // clear cookies from local storage
        localStorage.clear();
        // clear user state from store
        clearUserData();
        // set user loggedin status to false in auth store
        logout();
        // send notification
        toast("Logged Out");
        //navigate to homepage
        navigate("/");
    }, []);

    return <div>Logging out</div>;
}

export default Logout;

