import axios from "axios";
import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { useAuth } from "../stores";
import { useNavigate } from "react-router";
import toast from "react-hot-toast";
import { FaRegEye, FaRegEyeSlash } from "react-icons/fa";
import { Button } from "../components";

function Login() {
    const navigate = useNavigate();
    const { login, setUserData } = useAuth();
    const [resMsg, setResMsg] = useState(null);
    const [showPassword, setShowPassword] = useState(false);
    const handleShowPassword = () => {
        setShowPassword((prev) => !prev);
    };

    const {
        register,
        handleSubmit,
        reset,
        formState: { errors },
    } = useForm();

    const onSubmit = (data) => {
        const payload = {
            email: data.email,
            password: data.password,
        };

        axios
            .post(`${import.meta.env.VITE_API_ENDPOINT}/user/login`, payload)
            .then((res) => {
                /*
                 * If login success
                 * Handling tokens, keeping them at local storage
                 * */
                const accessToken = res.data.data.tokens.accessToken;
                const refreshToken = res.data.data.tokens.refreshToken;

                localStorage.setItem(
                    "accessToken",
                    JSON.stringify(accessToken),
                );

                localStorage.setItem(
                    "refreshToken",
                    JSON.stringify(refreshToken),
                );

                login(); // reset form values after logged in

                reset();

                navigate("/"); //set user data after successfull login

                setUserData(); //send notification after login

                toast.success(
                    res.data.message,
                ); /*if login success and there was resMsg ,

        * setting it to null
        * */
                if (resMsg) setResMsg(null);
            })
            .catch((err) => {
                console.error(err.message);
                let errorMessage = "Login failed. Please try again.";
                
                if (err.response?.data?.message) {
                    errorMessage = err.response.data.message;
                } else if (err.message === "Network Error" || !err.response) {
                    errorMessage = "Service is currently unavailable. Please check your connection and try again.";
                } else if (err.response?.status >= 500) {
                    errorMessage = "Server is temporarily unavailable. Please try again later.";
                }
                
                setResMsg(errorMessage);
                toast.error(errorMessage);
            });
    };

    return (
        <div className="min-h-screen bg-white flex items-center justify-center relative overflow-hidden py-8 sm:py-12">
            {/* Animated background elements */}
            <div className="absolute w-96 h-96 bg-green-100 rounded-full blur-3xl -top-40 -left-40 opacity-30"></div>
            <div className="absolute w-96 h-96 bg-green-50 rounded-full blur-3xl -bottom-40 -right-40 opacity-20"></div>

            <div className="w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
                    {/* Left side - Branding with Green theme (hidden on mobile) */}
                    <div className="hidden lg:flex flex-col justify-center items-center bg-gradient-to-br from-green-600 via-green-500 to-emerald-600 text-white space-y-8 p-12 rounded-3xl shadow-xl">
                        <div className="text-center space-y-6">
                            <div className="inline-flex items-center justify-center w-24 h-24 bg-white/20 backdrop-blur rounded-2xl shadow-2xl">
                                <img
                                    src="src/assets/logo.svg"
                                    alt="NepWork Logo"
                                    className="w-16"
                                />
                            </div>
                            <div className="space-y-3">
                                <h1 className="text-5xl font-black tracking-tight">
                                    Welcome Back!
                                </h1>
                                <p className="text-lg text-green-50 leading-relaxed max-w-lg">
                                    Connect with skilled freelancers and clients in your network
                                </p>
                            </div>
                        </div>

                        {/* Benefits list */}
                        <div className="space-y-4 w-full">
                            {[
                                { icon: "🚀", text: "Quick and secure login" },
                                { icon: "💼", text: "Manage your projects" },
                                { icon: "👥", text: "Connect with professionals" },
                                { icon: "⭐", text: "Build your success" },
                            ].map((benefit, idx) => (
                                <div
                                    key={idx}
                                    className="flex items-center gap-4 text-green-50 hover:text-white transition-colors"
                                >
                                    <span className="text-3xl">{benefit.icon}</span>
                                    <span className="text-lg font-medium">{benefit.text}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Right side - Login form */}
                    <div className="w-full">
                        <div className="bg-white rounded-2xl shadow-xl p-8 sm:p-10 border border-gray-100">
                            {/* Mobile logo */}
                            <div className="lg:hidden flex justify-center mb-4">
                                <img
                                    src="src/assets/logo.svg"
                                    alt="NepWork Logo"
                                    className="w-28"
                                />
                            </div>

                            {/* Form header */}
                            <div className="text-center mb-8">
                                <h2 className="text-3xl sm:text-4xl font-black text-gray-900 mb-2">
                                    Sign In
                                </h2>
                                <p className="text-gray-600 text-sm sm:text-base">
                                    Access your account to continue
                                </p>
                            </div>

                            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                                <div>
                                    <label
                                        htmlFor="email"
                                        className="block text-sm font-semibold text-gray-700 mb-2"
                                    >
                                        Email
                                    </label>
                                    <input
                                        type="text"
                                        id="email"
                                        {...register("email", {
                                            required: "Email address is required",
                                        })}
                                        placeholder="you@example.com"
                                        className="w-full px-4 py-3 rounded-lg border border-gray-300 bg-gray-50 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors"
                                    />
                                    {errors.email && (
                                        <p className="text-sm text-red-500 mt-2 flex items-center gap-1">
                                            ⚠️ {errors.email.message}
                                        </p>
                                    )}
                                </div>

                                <div>
                                    <label
                                        htmlFor="password"
                                        className="block text-sm font-semibold text-gray-700 mb-2"
                                    >
                                        Password
                                    </label>
                                    <div className="relative flex items-center">
                                        <input
                                            type={showPassword ? "text" : "password"}
                                            id="password"
                                            {...register("password", {
                                                required: "Password is required",
                                            })}
                                            placeholder="••••••••"
                                            className="w-full px-4 py-3 rounded-lg border border-gray-300 bg-gray-50 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors pr-12"
                                        />
                                        <button
                                            type="button"
                                            className="absolute right-3 text-gray-500 hover:text-gray-700 transition-colors"
                                            onClick={handleShowPassword}
                                        >
                                            {showPassword ? (
                                                <FaRegEye size={20} />
                                            ) : (
                                                <FaRegEyeSlash size={20} />
                                            )}
                                        </button>
                                    </div>
                                    {errors.password && (
                                        <p className="text-sm text-red-500 mt-2 flex items-center gap-1">
                                            ⚠️ {errors.password.message}
                                        </p>
                                    )}
                                </div>

                                {resMsg && (
                                    <p className="text-sm text-red-500 mt-2 flex items-center gap-1">
                                        ⚠️ {resMsg}
                                    </p>
                                )}

                                <Button
                                    type="submit"
                                    variant="filled"
                                    className="mt-6 w-full py-3 text-base font-semibold bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white border-0"
                                >
                                    Sign In
                                </Button>
                            </form>

                            {/* Divider */}
                            <div className="mt-6 flex items-center gap-4">
                                <div className="flex-1 h-px bg-gray-300"></div>
                                <span className="text-sm text-gray-500 font-medium">Or</span>
                                <div className="flex-1 h-px bg-gray-300"></div>
                            </div>

                            <button
                                type="button"
                                onClick={() => navigate("/signup")}
                                className="mt-6 w-full px-4 py-3 rounded-lg border-2 border-green-600 bg-white text-green-600 font-semibold hover:bg-green-50 transition-colors"
                            >
                                Don't have an account? Sign Up
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Login;
