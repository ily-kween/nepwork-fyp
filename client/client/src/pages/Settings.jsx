import { Link, useNavigate } from "react-router";
import { Button, Loader } from "../components";
import { TbLogout } from "react-icons/tb";
import { useAuth, useSetting } from "../stores";
import React from "react";


function Settings() {
    const { userData } = useAuth();
    const navigate = useNavigate()

    React.useEffect(()=>{
        navigate("/")
        useSetting.getState().open()

    },[])

    if (!userData) return <Loader />;
    return (
        <div className="min-h-screen bg-secondary">
            <h1>This is Settings</h1>
            <div className="h-72 w-[400px] flex flex-col justify-evenly">
                <Link to={"/settings/verify-email"} className="">
                    <Button className="w-full">Verify Email</Button>
                </Link>
                <Link to={"/settings/kyc"} className="">
                    <Button className="w-full">Kyc</Button>
                </Link>

                <Link to="/logout" className="">
                    <Button
                        variant="filled"
                        theme="danger"
                        className="w-full flex justify-center items-center gap-1 bg-danger hover:bg-danger border-danger"
                    >
                        <TbLogout className="inline-block text-xl" /> Logout
                    </Button>
                </Link>
            </div>
        </div>
    );
}

export default Settings;
