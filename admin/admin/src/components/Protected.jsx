import { useEffect, useState } from "react";
import { useAuth } from "../stores";
import { useNavigate } from "react-router";
import Loader from "./Loader";

function Protected({ children }) {
    const navigate = useNavigate();
    const isLoggedIn = useAuth((state) => state.isLoggedIn);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!isLoggedIn) {
            navigate("/login");
        }

        setLoading(false);
    }, [isLoggedIn, navigate]);

    return loading ? <Loader /> : <>{children}</>;
}

export default Protected;

