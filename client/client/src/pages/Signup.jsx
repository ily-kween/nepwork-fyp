import axios from "axios";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { useNavigate } from "react-router";
import { Button } from "../components";
import { FaRegEye, FaRegEyeSlash } from "react-icons/fa";
import { useState } from "react";

function Signup() {
    const navigate = useNavigate();
    const {
        register,
        handleSubmit,
        reset,
        watch,
        formState: { errors },
    } = useForm();

    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [selectedRole, setSelectedRole] = useState("client"); // "client" or "freelancer"

    const [loading, setLoading] = useState(false);

    const handleShowPassword = () => {
        setShowPassword((prev) => !prev);
    };

    const handleConfirmShowPassword = () => {
        setShowConfirmPassword((prev) => !prev);
    };

    const password = watch("password", ""); // create structured payload and hit endpoint

    const onSubmit = (data) => {
        setLoading(true);
        const payload = {
            name: {
                firstName: data.firstName,
                middleName: data.middleName || "",
                lastName: data.lastName,
            },
            email: data.email,
            password: data.password,
            confirmPassword: data.confirmPassword,
            role: selectedRole,
        };

        axios
            .post(`${import.meta.env.VITE_API_ENDPOINT}/user/signup`, payload)
            .then((res) => {
                toast.success(`${res.data.message}, Please proceed to Login`, {
                    duration: 3000,
                });
                reset();
                navigate("/login");
            })
            .catch((err) => {
                toast.error(err.response.data.message);
            })
            .finally(() => setLoading(false));
    };

    return (
        <div className="min-h-screen bg-white flex items-center justify-center relative overflow-hidden py-8 sm:py-12">
            {/* Animated background elements */}
            <div className="absolute w-96 h-96 bg-green-100 rounded-full blur-3xl -top-40 -right-40 opacity-30"></div>
            <div className="absolute w-96 h-96 bg-green-50 rounded-full blur-3xl -bottom-40 -left-40 opacity-20"></div>

            <div className="w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
                    {/* Left side - Branding with Green theme (hidden on mobile) */}
                    <div className="hidden lg:flex flex-col justify-center items-center bg-gradient-to-br from-green-600 via-green-500 to-emerald-600 text-white space-y-8 p-12 rounded-3xl shadow-xl min-h-[600px]">
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
                                    Join NepWork
                                </h1>
                                <p className="text-lg text-green-50 leading-relaxed max-w-lg">
                                    Start your freelancing journey or find expert talent today
                                </p>
                            </div>
                        </div>

                        {/* Benefits list */}
                        <div className="space-y-4 w-full">
                            {[
                                { icon: "⚡", text: "Get started in minutes" },
                                { icon: "🌍", text: "Access global opportunities" },
                                { icon: "🔒", text: "Secure & verified" },
                                { icon: "🎯", text: "Find your perfect match" },
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

                    {/* Right side - Signup form */}
                    <div className="w-full">
                        <div className="bg-white rounded-2xl shadow-xl p-8 sm:p-10 border border-gray-100 max-h-[90vh] overflow-y-auto">
                            {/* mobile logo */}
                            <div className="lg:hidden flex justify-center mb-4">
                                <img
                                    src="src/assets/logo.svg"
                                    alt="NepWork Logo"
                                    className="w-28"
                                />
                            </div>

                            {/* Form header */}
                            <div className="text-center mb-6">
                                <h2 className="text-3xl sm:text-4xl font-black text-gray-900 mb-2">
                                    Create Account
                                </h2>
                                <p className="text-gray-600 text-sm sm:text-base">
                                    Join thousands of freelancers and clients
                                </p>
                            </div>

                            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                        <div>
                            <label
                                htmlFor="firstName"
                                className="block text-sm font-semibold text-gray-700 mb-2"
                            >
                                First Name
                            </label>
                            <input
                                type="text"
                                id="firstName"
                                {...register("firstName", {
                                    required: "First name is required",
                                    pattern: {
                                        value: /^[A-Za-z]+$/,

                                        message:
                                            "First name should only contain letters",
                                    },
                                })}
                                className="w-full px-4 py-3 rounded-lg border border-gray-300 bg-gray-50 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors"
                            />
                            {errors.firstName && (
                                <p className="text-sm text-red-500 mt-2 flex items-center gap-1">
                                    ⚠️ {errors.firstName.message}
                                </p>
                            )}
                        </div>
                        <div>
                            <label
                                htmlFor="middleName"
                                className="block text-sm font-semibold text-gray-700 mb-2"
                            >
                                Middle Name
                            </label>
                            <input
                                type="text"
                                id="middleName"
                                {...register("middleName", {
                                    pattern: {
                                        value: /^[A-Za-z]+$/,
                                        message: "Middle name should only contain letters",
                                    },
                                })}
                                className="w-full px-4 py-3 rounded-lg border border-gray-300 bg-gray-50 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors"
                            />
                            {errors.middleName && (
                                <p className="text-sm text-red-500 mt-2 flex items-center gap-1">
                                    ⚠️ {errors.middleName.message}
                                </p>
                            )}
                        </div>
                        <div>
                            <label
                                htmlFor="lastName"
                                className="block text-sm font-semibold text-gray-700 mb-2"
                            >
                                Last Name
                            </label>
                            <input
                                type="text"
                                id="lastName"
                                {...register("lastName", {
                                    required: "Last name is required",
                                    pattern: {
                                        value: /^[A-Za-z]+$/,

                                        message:
                                            "Last name should only contain letters",
                                    },
                                })}
                                className="w-full px-4 py-3 rounded-lg border border-gray-300 bg-gray-50 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors"
                            />
                            {errors.lastName && (
                                <p className="text-sm text-red-500 mt-2 flex items-center gap-1">
                                    ⚠️ {errors.lastName.message}
                                </p>
                            )}
                        </div>
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
                                    pattern: {
                                        value: /\b[\w\.-]+@[\w\.-]+\.\w{2,4}\b/,
                                        message: "Invalid email address format",
                                    },
                                })}
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
                                        minLength: {
                                            value: 8,

                                            message:
                                                "Password must be at least 8 characters long",
                                        },
                                        maxLength: {
                                            value: 16,

                                            message:
                                                "Password must be below 16 characters",
                                        },
                                        validate: (value) =>
                                            value.trim() !== "" ||
                                            "Password cannot contain only spaces",
                                    })}
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
                        <div>
                            <label
                                htmlFor="confirmPassword"
                                className="block text-sm font-semibold text-gray-700 mb-2"
                            >
                                Confirm Password
                            </label>
                            <div className="relative flex items-center">
                                <input
                                    type={showConfirmPassword ? "text" : "password"}
                                    id="confirmPassword"
                                    {...register("confirmPassword", {
                                        required: "Confirm password is required",
                                        validate: (value) =>
                                            value === password ||
                                            "Passwords do not match",
                                    })}
                                    className="w-full px-4 py-3 rounded-lg border border-gray-300 bg-gray-50 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors pr-12"
                                />
                                <button
                                    type="button"
                                    className="absolute right-3 text-gray-500 hover:text-gray-700 transition-colors"
                                    onClick={handleConfirmShowPassword}
                                >
                                    {showConfirmPassword ? (
                                        <FaRegEye size={20} />
                                    ) : (
                                        <FaRegEyeSlash size={20} />
                                    )}
                                </button>
                            </div>
                            {errors.confirmPassword && (
                                <p className="text-sm text-red-500 mt-2 flex items-center gap-1">
                                    ⚠️ {errors.confirmPassword.message}
                                </p>
                            )}
                        </div>

                        {/* Role Selection */}
                        <div className="mt-8 pt-6 border-t border-gray-200">
                            <label className="block text-sm font-semibold text-gray-900 mb-4">
                                🎯 Choose your role:
                            </label>
                            <div className="space-y-3">
                                <div className="flex items-center p-3 rounded-lg border-2 border-gray-300 hover:border-green-600 hover:bg-green-50 transition-colors cursor-pointer" onClick={() => setSelectedRole("client")}>
                                    <input
                                        type="radio"
                                        id="roleClient"
                                        name="role"
                                        value="client"
                                        checked={selectedRole === "client"}
                                        onChange={(e) => setSelectedRole(e.target.value)}
                                        className="cursor-pointer w-5 h-5 accent-green-600"
                                    />
                                    <label htmlFor="roleClient" className="ml-3 flex-1 text-sm font-medium text-gray-900 cursor-pointer">
                                        <span className="block">💼 I'm a Client</span>
                                        <span className="text-xs text-gray-500 font-normal">Looking for skilled freelancers</span>
                                    </label>
                                </div>
                                <div className="flex items-center p-3 rounded-lg border-2 border-gray-300 hover:border-green-600 hover:bg-green-50 transition-colors cursor-pointer" onClick={() => setSelectedRole("freelancer")}>
                                    <input
                                        type="radio"
                                        id="roleFreelancer"
                                        name="role"
                                        value="freelancer"
                                        checked={selectedRole === "freelancer"}
                                        onChange={(e) => setSelectedRole(e.target.value)}
                                        className="cursor-pointer w-5 h-5 accent-green-600"
                                    />
                                    <label htmlFor="roleFreelancer" className="ml-3 flex-1 text-sm font-medium text-gray-900 cursor-pointer">
                                        <span className="block">⭐ I'm a Freelancer</span>
                                        <span className="text-xs text-gray-500 font-normal">Looking for exciting projects</span>
                                    </label>
                                </div>
                            </div>
                        </div>

                        <Button
                            type="submit"
                            variant="filled"
                            className="mt-8 w-full py-3 text-base font-semibold bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white border-0"
                            disabled={loading}
                            loading={loading}
                        >
                            {loading ? "Creating Account..." : "Create Account"}
                        </Button>

                        {/* Divider */}
                        <div className="mt-6 flex items-center gap-4">
                            <div className="flex-1 h-px bg-gray-300"></div>
                            <span className="text-sm text-gray-500 font-medium">Or</span>
                            <div className="flex-1 h-px bg-gray-300"></div>
                        </div>

                        <button
                            type="button"
                            onClick={() => navigate("/login")}
                            className="mt-6 w-full px-4 py-3 rounded-lg border-2 border-green-600 bg-white text-green-600 font-semibold hover:bg-green-50 transition-colors"
                        >
                            Already have an account? Sign In
                        </button>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Signup;
