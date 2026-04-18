import React from "react";
import { Button, KycForm, Loader, UserCard } from "../components";
import { useAuth } from "../stores";
import { Link } from "react-router";

function Kyc() {
    const { userData } = useAuth();

    if (!userData) {
        return <Loader />;
    }
    // if kyc status is "not_uploaded"
    if (userData.kycStatus === "not_uploaded") {
        return <KycForm />;
    }
    if (userData.kycStatus === "pending") {
        return (
            <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50 py-12 px-4 sm:px-6 lg:px-8">
                <div className="max-w-3xl mx-auto space-y-8">
                    {/* Animated Header Section */}
                    <div className="text-center space-y-6 animate-fade-in">
                        <div className="relative inline-block">
                            <div className="absolute -inset-2 bg-emerald-200/30 rounded-full blur-lg opacity-75 animate-pulse"></div>
                            <div className="relative inline-flex items-center justify-center p-6 bg-white rounded-full shadow-lg">
                                <svg
                                    className="h-20 w-20 text-primary animate-spin"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth="1.5"
                                        d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                                    />
                                </svg>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 tracking-tight">
                                KYC Verification in Progress
                            </h1>
                            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                                We're carefully reviewing your submitted
                                documents. This usually takes{" "}
                                <span className="font-semibold text-primary">
                                    1-2 business days
                                </span>
                                .
                            </p>
                        </div>
                    </div>

                    {/* Submission Details with Watermark */}
                    {userData && (
                        <div className="relative bg-white rounded-xl shadow-lg p-6 border-2 border-emerald-100 overflow-hidden">
                            <div className="absolute -right-20 -top-20 opacity-10">
                                <svg
                                    className="w-64 h-64 text-emerald-400"
                                    fill="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path d="M12 0c-6.627 0-12 5.373-12 12s5.373 12 12 12 12-5.373 12-12-5.373-12-12-12zm-1.959 17l-4.5-4.319 1.395-1.435 3.08 2.937 7.021-7.183 1.422 1.409-8.418 8.591z" />
                                </svg>
                            </div>
                            <h3 className="text-lg font-semibold text-gray-800 mb-4">
                                Submitted Documents
                            </h3>
                            <UserCard userData={userData} />
                        </div>
                    )}

                    {/*Contact Section */}
                    <div className="bg-gradient-to-r from-green-600 to-primary rounded-xl shadow-xl p-8 text-white">
                        <div className="max-w-2xl mx-auto text-center space-y-6">
                            <h2 className="text-2xl font-bold">
                                Need Immediate Assistance?
                            </h2>
                            <p className="text-emerald-100">
                                Our verification team is available 24/7 to
                                answer your questions
                            </p>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <a
                                    href="mailto:support@company.com"
                                    className="group flex items-center justify-center gap-3 p-4 bg-white/10 rounded-lg hover:bg-white/20 transition-all"
                                >
                                    <svg
                                        className="w-6 h-6 text-emerald-200 group-hover:text-white"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth="2"
                                            d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                                        />
                                    </svg>
                                    <span className="font-medium">
                                        Email Support
                                    </span>
                                </a>

                                <a
                                    href="tel:+1234567890"
                                    className="group flex items-center justify-center gap-3 p-4 bg-white/10 rounded-lg hover:bg-white/20 transition-all"
                                >
                                    <svg
                                        className="w-6 h-6 text-emerald-200 group-hover:text-white"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth="2"
                                            d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                                        />
                                    </svg>
                                    <span className="font-medium">
                                        24/7 Hotline
                                    </span>
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
    if (userData.kycStatus === "verified") {
        return (
            <div className="min-h-screen bg-gradient-to-b from-emerald-50 to-white">
                <div className="max-w-4xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
                    {/* Success Header */}
                    <div className="text-center mb-12 space-y-6 animate-fade-in">
                        <div className="inline-flex items-center justify-center gap-4 text-emerald-600">
                            <svg
                                className="h-16 w-16"
                                fill="currentColor"
                                viewBox="0 0 20 20"
                            >
                                <path
                                    fillRule="evenodd"
                                    d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                                    clipRule="evenodd"
                                />
                            </svg>
                            <div>
                                <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">
                                    Identity Verified! 🎉
                                </h1>
                                <p className="mt-3 text-lg text-emerald-700 max-w-2xl mx-auto">
                                    Full platform access unlocked - connect,
                                    collaborate, and grow!
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Glowing User Card */}
                    <div className="relative group">
                        <div className="absolute -inset-1 bg-emerald-200/30 rounded-2xl blur opacity-75 group-hover:opacity-100 transition-all duration-300"></div>
                        <div className="relative">
                            <UserCard userData={userData} />
                        </div>
                    </div>

                    {/* Feature Access Grid */}
                    <div className="mt-8 bg-white rounded-xl shadow-lg p-6 border-2 border-primary">
                        <div className="text-center space-y-6">
                            <h3 className="text-xl font-semibold text-emerald-900">
                                🔓 Unlocked Features
                            </h3>
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 text-emerald-800">
                                {/* Post Jobs */}
                                <div className="feature-card">
                                    <svg
                                        className="w-8 h-8 mx-auto"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth="2"
                                            d="M19 14l-7 7m0 0l-7-7m7 7V3"
                                        />
                                    </svg>
                                    <span className="mt-2 font-medium">
                                        Post Projects
                                    </span>
                                    <p className="text-sm mt-1 text-gray-600">
                                        List new projects and find talent
                                    </p>
                                </div>

                                {/* Hire Freelancers */}
                                <div className="feature-card">
                                    <svg
                                        className="w-8 h-8 mx-auto"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth="2"
                                            d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                                        />
                                    </svg>
                                    <span className="mt-2 font-medium">
                                        Hire Freelancers
                                    </span>
                                    <p className="text-sm mt-1 text-gray-600">
                                        Find and collaborate with experts
                                    </p>
                                </div>

                                {/* Be a Freelancer */}
                                <div className="feature-card">
                                    <svg
                                        className="w-8 h-8 mx-auto"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth="2"
                                            d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                                        />
                                    </svg>
                                    <span className="mt-2 font-medium">
                                        Be a Freelancer
                                    </span>
                                    <p className="text-sm mt-1 text-gray-600">
                                        Offer services and get hired
                                    </p>
                                </div>

                                {/* All Features */}
                                <div className="feature-card">
                                    <svg
                                        className="w-8 h-8 mx-auto"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth="2"
                                            d="M5 13l4 4L19 7"
                                        />
                                    </svg>
                                    <span className="mt-2 font-medium">
                                        All Features
                                    </span>
                                    <p className="text-sm mt-1 text-gray-600">
                                        Complete platform access
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* CTA Section */}
                    <div className="mt-8 text-center space-y-4">
                        <p className="text-primary font-medium">
                            Ready to get started?
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            {userData.role === "client" && (
                                <Link to="/dashboard">
                                    <Button variant="filled" className="text-white">
                                        🚀 Post a Project
                                    </Button>
                                </Link>
                            )}
                            {userData.role === "freelancer" && (
                                <Link to="/dashboard">
                                    <Button variant="filled" className="text-white">
                                        💼 Browse Projects
                                    </Button>
                                </Link>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        );
    }
    if (userData.kycStatus === "failed") {
        return (
            <div className="min-h-screen bg-gradient-to-b from-red-50 to-white">
                <div className="max-w-3xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
                    {/* Failure Header */}
                    <div className="text-center mb-12 space-y-6 animate-fade-in-up">
                        <div className="inline-flex items-center justify-center gap-4 text-red-600">
                            <svg
                                className="h-16 w-16"
                                fill="currentColor"
                                viewBox="0 0 20 20"
                            >
                                <path
                                    fillRule="evenodd"
                                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                                    clipRule="evenodd"
                                />
                            </svg>
                            <div>
                                <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">
                                    KYC Verification Unsuccessful
                                </h1>
                                <p className="mt-3 text-lg text-red-700 max-w-2xl mx-auto">
                                    We encountered issues with your submission.
                                    Please review the details below.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* User Card Container */}
                    <div className="relative group">
                        <div className="absolute -inset-1 bg-red-200/30 rounded-2xl blur opacity-75 group-hover:opacity-100 transition-all duration-300"></div>
                        <div className="relative">
                            <UserCard userData={userData} />
                        </div>
                    </div>

                    {/* Rejection Details */}
                    <div className="mt-8 bg-white rounded-xl shadow-lg p-6 border-2 border-red-200">
                        <div className="flex items-start gap-4">
                            <div className="flex-shrink-0">
                                <svg
                                    className="h-6 w-6 text-red-600"
                                    fill="currentColor"
                                    viewBox="0 0 20 20"
                                >
                                    <path
                                        fillRule="evenodd"
                                        d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                                        clipRule="evenodd"
                                    />
                                </svg>
                            </div>
                            <div>
                                <h3 className="text-lg font-semibold text-red-900 mb-2">
                                    Required Corrections
                                </h3>
                                <div className="prose prose-red">
                                    <p className="text-red-800">
                                        {userData.kyc.failedReason ||
                                            "Specific rejection reasons not provided"}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
                        <Button
                            variant="filled"
                            className="w-full sm:w-auto px-8 py-3 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg transition-all duration-200 transform hover:scale-[1.02] shadow-md hover:shadow-lg border-none"
                        >
                            Resubmit KYC Application
                        </Button>
                        <Button className="w-full sm:w-auto px-8 py-3 bg-white hover:bg-gray-50 text-red-700 font-semibold rounded-lg border-2 border-red-200 transition-all duration-200 transform hover:scale-[1.02] shadow-md hover:shadow-lg">
                            Create Ticket
                        </Button>
                    </div>
                </div>
            </div>
        );
    }
}

export default Kyc;
