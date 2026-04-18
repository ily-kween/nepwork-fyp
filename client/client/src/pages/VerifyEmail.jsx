import React, { useState } from "react";
import { Loader, EnterEmailOtp } from "../components";
import { useAuth } from "../stores";
import { useForm } from "react-hook-form";
import api from "../utils/api";
import toast from "react-hot-toast";
import { IoMdCheckmarkCircleOutline } from "react-icons/io";

function VerifyEmail() {
    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm();

    const onSubmit = (data) => {
        setSending(true);
        const payload = {
            email: data.email,
        };
        api.post("/user/request-otp", payload)
            .then((_) => {
                toast.success("OTP was sent");
                setShowOtpModal(true);
                setResErrMsg(null);
            })
            .catch((err) => {
                setResErrMsg(err.response.data.message);
            })
            .finally(() => setSending(false));
    };

    const { userData } = useAuth();
    const [showOtpModal, setShowOtpModal] = useState(false);
    const [sending, setSending] = useState(false);
    const [resErrMsg, setResErrMsg] = useState(null);

    const animationStyle = {
        animation: "scaleUp 1s ease-in-out forwards",
    };

    if (!userData) {
        return <Loader />;
    }

    if (userData.emailVerified) {
        return (
            <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white flex items-center justify-center p-6">
                <div className="bg-white rounded-3xl shadow-lg border border-slate-200 p-12 max-w-md w-full text-center">
                    <style>
                        {`
                            @keyframes scaleUp {
                                0% { transform: scale(0.5); opacity: 0; }
                                100% { transform: scale(1.5); opacity: 1; }
                            }
                        `}
                    </style>
                    <IoMdCheckmarkCircleOutline
                        style={animationStyle}
                        className="text-6xl text-green-500 mx-auto mb-6"
                    />
                    <h1 className="text-3xl font-bold text-slate-900 mb-3">
                        Email Verified!
                    </h1>
                    <p className="text-slate-600 leading-relaxed">
                        Your email address has been successfully verified. You can now enjoy all features of the platform.
                    </p>
                </div>
            </div>
        );
    }

    return (
        <>
            {showOtpModal && (
                <EnterEmailOtp
                    email={userData?.email}
                    setShowOtpModal={setShowOtpModal}
                />
            )}
            <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white flex items-center justify-center p-6">
                <div className="bg-white rounded-3xl shadow-lg border border-slate-200 p-12 max-w-md w-full">
                    <div className="mb-8">
                        <h1 className="text-3xl font-bold text-slate-900 mb-3">
                            Verify Email
                        </h1>
                        <p className="text-slate-600 text-sm">
                            Enter your email address and we'll send you an OTP to verify it.
                        </p>
                    </div>

                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                        <div>
                            <label htmlFor="email" className="block text-sm font-semibold text-slate-900 mb-2">
                                Email Address
                            </label>
                            <input
                                id="email"
                                type="email"
                                {...register("email", {
                                    required: "Email address is required",
                                    pattern: {
                                        value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                                        message: "Invalid email address"
                                    }
                                })}
                                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 font-medium focus:bg-white focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all outline-none"
                                placeholder="you@example.com"
                            />
                            {errors.email && (
                                <p className="text-red-500 text-xs font-medium mt-2">
                                    {errors.email.message}
                                </p>
                            )}
                        </div>

                        {resErrMsg && (
                            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                                <p className="text-red-600 text-sm font-medium">{resErrMsg}</p>
                            </div>
                        )}

                        <div className="flex gap-3 pt-2">
                            <button
                                type="submit"
                                disabled={sending}
                                className={`flex-1 px-6 py-3 rounded-lg font-semibold text-sm transition-all active:scale-95 ${
                                    sending
                                        ? "bg-slate-200 text-slate-400 cursor-not-allowed"
                                        : "bg-gradient-to-r from-green-600 to-emerald-600 text-white hover:shadow-lg"
                                }`}
                            >
                                {sending ? "Sending..." : "Send OTP"}
                            </button>
                            <button
                                type="button"
                                onClick={() => setShowOtpModal(true)}
                                className="flex-1 px-6 py-3 rounded-lg font-semibold text-sm border-2 border-primary text-primary hover:bg-primary/5 transition-all active:scale-95"
                            >
                                Enter OTP
                            </button>
                        </div>
                    </form>

                    <p className="text-xs text-slate-500 text-center mt-6">
                        Haven't received the OTP? Check your spam folder or try again.
                    </p>
                </div>
            </div>
        </>
    );
}

export default VerifyEmail;
