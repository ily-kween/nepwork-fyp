import React from "react";
import { FiLoader } from "react-icons/fi";

function Loader() {
    return (
        <>
            <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50">
                <div className="bg-white rounded-2xl shadow-2xl p-8 space-y-6 max-w-sm mx-auto">
                    {/* Animated Spinner */}
                    <div className="flex justify-center">
                        <div className="relative w-16 h-16">
                            <div className="absolute inset-0 rounded-full border-4 border-primary/20"></div>
                            <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-primary border-r-primary animate-spin"></div>
                            <div className="absolute inset-2 rounded-full border-2 border-primary/10 animate-pulse"></div>
                        </div>
                    </div>

                    {/* Loading Text */}
                    <div className="text-center space-y-3">
                        <h3 className="text-lg font-bold text-gray-900">Processing</h3>
                        <p className="text-sm text-gray-600">Please wait while we process your request...</p>
                        
                        {/* Animated Dots */}
                        <div className="flex justify-center gap-1">
                            <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0s' }}></div>
                            <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                            <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                        </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="w-full h-1 bg-gray-200 rounded-full overflow-hidden">
                        <div className="h-full bg-gradient-to-r from-primary to-emerald-500 w-2/3 animate-pulse rounded-full"></div>
                    </div>
                </div>
            </div>
        </>
    );
}

export default Loader;
