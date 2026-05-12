import axios from "axios";
import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { useAuth, useUser } from "../stores";
import { useNavigate } from "react-router";
import toast from "react-hot-toast";
import { 
    HiOutlineEnvelope, 
    HiOutlineLockClosed, 
    HiOutlineEye, 
    HiOutlineEyeSlash, 
    HiOutlineArrowRight 
} from "react-icons/hi2";

function Login() {
    const navigate = useNavigate();
    const login = useAuth((state) => state.login);
    const setUserData = useUser((state) => state.setUserData);

    const [resMsg, setResMsg] = useState(null);
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const {
        register,
        handleSubmit,
        reset,
        formState: { errors },
    } = useForm();

    const onSubmit = (data) => {
        setIsLoading(true); 
        const payload = {
            email: data.email,
            password: data.password,
        };

        axios
            .post(`${import.meta.env.VITE_API_ENDPOINT}/admin/login`, payload)
            .then((res) => {
                const accessToken = res.data.data.tokens.accessToken;
                const refreshToken = res.data.data.tokens.refreshToken;

                localStorage.setItem("accessToken", JSON.stringify(accessToken));
                localStorage.setItem("refreshToken", JSON.stringify(refreshToken));

                login();
                reset();
                setUserData();
                toast.success(res.data.message || "Login successful!");
                if (resMsg) setResMsg(null);
                navigate("/");
            })
            .catch((err) => {
                let errorMessage = "Login failed. Please try again.";
                if (err.response?.data?.message) {
                    errorMessage = err.response.data.message;
                } else if (!err.response) {
                    errorMessage = "Service is currently unavailable. Please check your connection.";
                }
                setResMsg(errorMessage);
                toast.error(errorMessage);
            })
            .finally(() => {
                setIsLoading(false);
            });
    };

    return (
        <div className="flex items-center justify-center min-h-screen p-4 bg-gradient-to-br from-gray-50 via-white to-primary/5">
            <div className="w-full max-w-lg">
                {/* Header Section */}
                <div className="mb-12 space-y-4 text-center">
                    <div className="inline-flex items-center justify-center w-20 h-20 shadow-lg bg-gradient-to-br from-primary to-emerald-600 rounded-2xl">
                        <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    </div>
                    <div>
                        <h1 className="text-4xl font-bold lg:text-5xl text-slate-900">
                            Admin <span className="text-primary">Portal</span>
                        </h1>
                        <p className="mt-2 font-medium text-slate-600">Secure access to platform controls</p>
                    </div>
                </div>

                {/* Login Card */}
                <div className="p-8 space-y-8 bg-white border border-gray-200 shadow-lg rounded-2xl lg:p-10">
                    
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                        {/* Email Field */}
                        <div className="space-y-3">
                            <label htmlFor="email" className="block text-sm font-bold tracking-widest uppercase text-slate-900">
                                Email Address
                            </label>
                            <div className="relative">
                                <HiOutlineEnvelope className="absolute text-lg text-gray-400 transform -translate-y-1/2 left-4 top-1/2" />
                                <input
                                    type="email"
                                    id="email"
                                    {...register("email", {
                                        required: "Email address is required",
                                        pattern: {
                                            value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                                            message: "Invalid email address",
                                        },
                                    })}
                                    placeholder="admin@example.com"
                                    className="w-full py-3 pl-12 pr-4 font-medium placeholder-gray-400 transition-all border border-gray-300 bg-gray-50 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-slate-900"
                                />
                            </div>
                            {errors.email && (
                                <p className="flex items-center gap-2 text-sm font-medium text-red-600">
                                    ⚠️ {errors.email.message}
                                </p>
                            )}
                        </div>

                        {/* Password Field */}
                        <div className="space-y-3">
                            <label htmlFor="password" className="block text-sm font-bold tracking-widest uppercase text-slate-900">
                                Password
                            </label>
                            <div className="relative">
                                <HiOutlineLockClosed className="absolute text-lg text-gray-400 transform -translate-y-1/2 left-4 top-1/2" />
                                <input
                                    type={showPassword ? "text" : "password"}
                                    id="password"
                                    {...register("password", {
                                        required: "Password is required",
                                        minLength: {
                                            value: 6,
                                            message: "Password must be at least 6 characters",
                                        },
                                    })}
                                    placeholder="Enter your password"
                                    className="w-full py-3 pl-12 pr-12 font-medium placeholder-gray-400 transition-all border border-gray-300 bg-gray-50 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-slate-900"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute text-gray-400 transition-colors transform -translate-y-1/2 right-4 top-1/2 hover:text-gray-600"
                                >
                                    {showPassword ? <HiOutlineEyeSlash className="text-lg" /> : <HiOutlineEye className="text-lg" />}
                                </button>
                            </div>
                            {errors.password && (
                                <p className="flex items-center gap-2 text-sm font-medium text-red-600">
                                    ⚠️ {errors.password.message}
                                </p>
                            )}
                        </div>

                        {/* Error Message */}
                        {resMsg && (
                            <div className="p-4 space-y-2 border border-red-200 bg-red-50 rounded-xl">
                                <p className="text-sm font-bold text-red-700">❌ Error</p>
                                <p className="text-sm text-red-600">{resMsg}</p>
                            </div>
                        )}

                        {/* Submit Button */}
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="flex items-center justify-center w-full gap-2 px-6 py-3 font-bold text-white transition-all duration-300 shadow-md bg-gradient-to-r from-primary to-emerald-600 hover:from-primary/90 hover:to-emerald-600/90 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-lg active:scale-95"
                        >
                            {isLoading ? (
                                <>
                                    <div className="w-5 h-5 border-2 rounded-full border-white/30 border-t-white animate-spin"></div>
                                    Signing in...
                                </>
                            ) : (
                                <>
                                    Sign In
                                    <HiOutlineArrowRight className="text-lg" />
                                </>
                            )}
                        </button>
                    </form>

                    {/* Divider */}
                    <div className="border-t border-gray-200"></div>

                    {/* Security Note */}
                    <p className="text-xs font-medium tracking-widest text-center text-gray-500 uppercase">
                        🔒 Secure encrypted connection • Administrator access only
                    </p>
                </div>

                {/* Footer */}
                <p className="mt-8 font-medium text-center text-gray-600">
                    Need help? <span className="font-semibold cursor-pointer text-primary hover:underline">Contact support</span>
                </p>
            </div>
        </div>
    );
}

export default Login;
