import React from "react";
import { useLocation } from "react-router";
import { FiMail, FiMapPin, FiGlobe } from "react-icons/fi";

const Footer = () => {
    const location = useLocation();
    if (location.pathname === "/inbox") return null;

    return (
        <footer className="bg-slate-950 text-slate-400 pt-16 pb-10 border-t border-slate-900 font-['Poppins',_sans-serif]">
            <div className="max-w-[1400px] mx-auto px-6 lg:px-10">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12 mb-12">
                    {/* Brand Section */}
                    <div className="space-y-6">
                        <div className="flex items-center gap-3">
                            <img
                                src="src/assets/logo.svg"
                                alt="NepWork Logo"
                                className="w-12 h-12"
                            />
                            <span className="text-2xl font-bold text-white tracking-tight">Nepwork</span>
                        </div>
                        <p className="text-[13px] leading-relaxed font-medium text-slate-400 max-w-sm">
                            The premier talent marketplace for verified professionals in Nepal. Connecting local elite expertise with global project demands.
                        </p>
                    </div>

                    {/* Quick Links */}
                    <div className="space-y-4">
                        <h4 className="text-[11px] font-bold text-slate-300 uppercase tracking-widest">Quick Links</h4>
                        <div className="flex flex-col gap-3">
                            <a href="/home" className="text-[13px] text-slate-400 hover:text-white transition-colors">Browse Projects</a>
                            <a href="/jobs" className="text-[13px] text-slate-400 hover:text-white transition-colors">Available Jobs</a>
                            <a href="/dashboard" className="text-[13px] text-slate-400 hover:text-white transition-colors">Dashboard</a>
                            <a href="/settings" className="text-[13px] text-slate-400 hover:text-white transition-colors">Settings</a>
                        </div>
                    </div>

                    {/* Contact Info */}
                    <div className="space-y-4">
                        <h4 className="text-[11px] font-bold text-slate-300 uppercase tracking-widest">Contact</h4>
                        <div className="space-y-3">
                            <div className="flex items-center gap-3 text-[13px] text-slate-400">
                                <FiMapPin className="w-4 h-4 text-primary/70" />
                                <span>Kathmandu, Nepal</span>
                            </div>
                            <div className="flex items-center gap-3 text-[13px] text-slate-400">
                                <FiMail className="w-4 h-4 text-primary/70" />
                                <span>ops@nepwork.io</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Divider */}
                <div className="border-t border-slate-900 pt-8">
                    {/* Payment Methods & Copyright */}
                    <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                        <p className="text-[11px] text-slate-500 font-medium">
                            © {new Date().getFullYear()} Nepwork. All rights reserved.
                        </p>
                        
                        <div className="flex items-center gap-6">
                            <div className="flex items-center gap-2 px-3 py-1 bg-slate-900 rounded border border-slate-800">
                                <FiGlobe className="w-3 h-3 text-slate-500" />
                                <span className="text-[10px] font-bold uppercase tracking-widest text-slate-300">English (NRS)</span>
                            </div>
                            <div className="flex items-center gap-4">
                                <span className="text-[10px] text-slate-600 uppercase font-semibold">Accepted:</span>
                                <img src="/esewa_logo.png" className="h-4 grayscale hover:grayscale-0 transition-all" alt="esewa" title="eSewa Payment" />
                                <img src="/khalti_logo.png" className="h-4 grayscale hover:grayscale-0 transition-all" alt="khalti" title="Khalti Payment" />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    );
}

export default Footer;

