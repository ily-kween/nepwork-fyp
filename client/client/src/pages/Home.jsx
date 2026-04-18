import React from "react";
import { useAuth } from "../stores";
import { ClientHomepage, FreelancerHomePage, Loader } from "../components";

function Home() {
    const { userData, isLoggedIn } = useAuth();

    if (isLoggedIn && !userData) {
        return <Loader />;
    }

    if (!isLoggedIn || userData?.role === "client") {
        return <ClientHomepage isLoggedIn={isLoggedIn} userData={userData} />;
    }

    if (isLoggedIn && userData?.role === "freelancer") {
        return <FreelancerHomePage userData={userData} />;
    }

    return <div>Something went wrong!</div>;
}

export default Home;
