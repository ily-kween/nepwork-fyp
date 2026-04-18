import React from "react";
import { FiArrowRight, FiStar, FiCheckCircle, FiClock } from "react-icons/fi";
import Tag from "./Tag";
import default_avatar from "../assets/default_avatar.svg";
import { Link } from "react-router";
import capitalize from "../utils/capitalize";

function FreelancerCard({ userData }) {
    const {
        avatar,
        rating = 4.9, // Fallback for aesthetic
        name,
        kycVerified,
        available,
        tags = [],
        hourlyRate,
        _id,
    } = userData;

    return (
        <div className="group w-72 bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-xl hover:border-primary/20 transition-all duration-500 overflow-hidden flex flex-col">
            {/* Top Branding Strip */}
            <div className="h-2 bg-gradient-to-r from-primary to-indigo-600 w-0 group-hover:w-full transition-all duration-700"></div>
            
            <div className="p-6 space-y-5 flex-1 flex flex-col">
                {/* Profile Header */}
                <div className="flex items-start justify-between">
                    <div className="relative">
                        <div className="w-16 h-16 rounded-2xl overflow-hidden border-2 border-gray-50 shadow-sm group-hover:shadow-md transition-shadow">
                            <img
                                src={avatar || default_avatar}
                                alt={`${name.firstName}`}
                                className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700"
                            />
                        </div>
                        {kycVerified && (
                            <div className="absolute -bottom-1 -right-1 bg-white rounded-full p-0.5 shadow-sm">
                                <FiCheckCircle className="text-primary text-sm fill-primary/10" />
                            </div>
                        )}
                    </div>
                    
                    <div className="flex flex-col items-end">
                        <div className="flex items-center gap-1 text-amber-500 bg-amber-50 px-2 py-1 rounded-lg text-xs font-bold">
                            <FiStar className="fill-current" />
                            <span>{rating}</span>
                        </div>
                        <span className={`text-[10px] font-black uppercase tracking-widest mt-2 ${available ? 'text-emerald-500' : 'text-red-400'}`}>
                            {available ? 'Available Now' : 'Busy'}
                        </span>
                    </div>
                </div>

                {/* Info Section */}
                <div className="space-y-1">
                    <h3 className="text-lg font-bold text-gray-900 leading-tight group-hover:text-primary transition-colors">
                        {capitalize(name.firstName)} {capitalize(name.lastName)}
                    </h3>
                    <div className="flex items-center gap-2 text-gray-400 text-[10px] font-bold uppercase tracking-widest">
                        <FiClock className="text-xs" />
                        <span>Active 2h ago</span>
                    </div>
                </div>

                {/* Skills Section */}
                <div className="flex flex-wrap gap-2">
                    {tags.slice(0, 3).map((tag) => (
                        <span key={tag} className="text-[10px] font-bold text-gray-500 bg-gray-50 border border-gray-100 px-2 py-1 rounded-md">
                            {tag}
                        </span>
                    ))}
                    {tags.length > 3 && (
                        <span className="text-[10px] font-bold text-gray-400 py-1">+{tags.length - 3}</span>
                    )}
                </div>

                {/* Bottom Stats & Action */}
                <div className="pt-4 border-t border-gray-50 mt-auto flex items-center justify-between">
                    <div className="flex flex-col">
                        <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Rate</span>
                        <div className="flex items-baseline gap-1">
                            <span className="text-lg font-black text-gray-900">Rs. {hourlyRate}</span>
                            <span className="text-[10px] font-bold text-gray-400">/hr</span>
                        </div>
                    </div>
                    
                    <Link to={`/profile/${_id}`}>
                        <button className="p-3 bg-gray-50 text-gray-400 rounded-xl group-hover:bg-primary group-hover:text-white transition-all duration-300">
                            <FiArrowRight className="text-xl" />
                        </button>
                    </Link>
                </div>
            </div>
        </div>
    );
}

export default FreelancerCard;
