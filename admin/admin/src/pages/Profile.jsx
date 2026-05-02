import React, { useState, useEffect } from "react";
import { useAuth } from "../stores";
import { api } from "../utils";
import { Button } from "../components";
import PageHeader from "../components/PageHeader";
import toast from "react-hot-toast";
import { 
    FiMail, 
    FiUser, 
    FiPhone, 
    FiMapPin, 
    FiCalendar, 
    FiShield,
    FiCheck,
    FiX,
    FiSave,
    FiEdit2
} from "react-icons/fi";

function Profile() {
    const { userData } = useAuth();
    const [isEditing, setIsEditing] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [formData, setFormData] = useState({
        name: userData?.name || "",
        email: userData?.email || "",
        phone: userData?.phone || "",
        location: userData?.location || "",
        joinDate: userData?.createdAt ? new Date(userData.createdAt).toLocaleDateString() : "",
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSave = async () => {
        setIsSaving(true);
        try {
            const response = await api.put("/admin/profile", {
                name: formData.name,
                phone: formData.phone,
                location: formData.location,
            });
            toast.success("Profile updated successfully!");
            setIsEditing(false);
        } catch (error) {
            console.error(error);
            toast.error("Failed to update profile");
        } finally {
            setIsSaving(false);
        }
    };

    const handleCancel = () => {
        setFormData({
            name: userData?.name || "",
            email: userData?.email || "",
            phone: userData?.phone || "",
            location: userData?.location || "",
            joinDate: userData?.createdAt ? new Date(userData.createdAt).toLocaleDateString() : "",
        });
        setIsEditing(false);
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-primary/5 pb-24">
            <PageHeader
                title="Admin Profile"
                subtitle="Manage your account information and security settings"
                statusBadge="Administrator"
                showSearch={false}
            />

            <main className="max-w-4xl mx-auto px-6 md:px-12 py-12 relative z-20 space-y-8">
                {/* Profile Card */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                    {/* Header with Avatar */}
                    <div className="bg-gradient-to-r from-primary/10 to-emerald-500/10 p-12 text-center relative">
                        <div className="absolute top-0 right-0 w-40 h-40 bg-primary/5 rounded-full -mr-20 -mt-20"></div>
                        <div className="absolute bottom-0 left-0 w-32 h-32 bg-primary/5 rounded-full -ml-16 -mb-16"></div>
                        
                        <div className="relative z-10 flex flex-col items-center gap-6">
                            <div className="w-24 h-24 bg-gradient-to-br from-primary to-emerald-600 rounded-2xl flex items-center justify-center text-white text-4xl shadow-lg">
                                <FiShield />
                            </div>
                            <div>
                                <h2 className="text-3xl font-black text-slate-900">{userData?.name || "Admin"}</h2>
                                <p className="text-slate-600 font-medium mt-2">Platform Administrator</p>
                            </div>
                        </div>
                    </div>

                    {/* Form Content */}
                    <div className="p-12 space-y-8">
                        {/* Status Info */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-8 bg-primary/10 rounded-2xl border border-primary/20">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-primary/20 rounded-xl flex items-center justify-center text-primary text-xl">
                                    <FiCheck />
                                </div>
                                <div>
                                    <p className="text-sm text-slate-600 font-medium">Account Status</p>
                                    <p className="text-lg font-black text-primary">Active & Verified</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-primary/20 rounded-xl flex items-center justify-center text-primary text-xl">
                                    <FiCalendar />
                                </div>
                                <div>
                                    <p className="text-sm text-slate-600 font-medium">Member Since</p>
                                    <p className="text-lg font-black text-slate-900">{formData.joinDate}</p>
                                </div>
                            </div>
                        </div>

                        {/* Profile Information */}
                        <div>
                            <div className="flex items-center justify-between mb-8">
                                <h3 className="text-2xl font-black text-slate-900">Account Information</h3>
                                <button
                                    onClick={() => setIsEditing(!isEditing)}
                                    className="flex items-center gap-2 px-6 py-3 bg-primary/10 text-primary rounded-xl hover:bg-primary/20 transition-colors font-bold"
                                >
                                    <FiEdit2 />
                                    {isEditing ? "Cancel" : "Edit"}
                                </button>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                {/* Name Field */}
                                <div className="space-y-3">
                                    <label className="block text-sm font-bold text-slate-700 uppercase tracking-wide">Full Name</label>
                                    {isEditing ? (
                                        <input
                                            type="text"
                                            name="name"
                                            value={formData.name}
                                            onChange={handleChange}
                                            className="w-full px-6 py-4 bg-white border-2 border-gray-300 rounded-xl focus:border-primary focus:outline-none transition-colors font-medium"
                                            placeholder="Enter your name"
                                        />
                                    ) : (
                                        <div className="flex items-center gap-3 px-6 py-4 bg-gray-50 rounded-xl border border-gray-200">
                                            <FiUser className="text-gray-400 text-xl" />
                                            <p className="font-medium text-slate-900">{formData.name}</p>
                                        </div>
                                    )}
                                </div>

                                {/* Email Field */}
                                <div className="space-y-3">
                                    <label className="block text-sm font-bold text-slate-700 uppercase tracking-wide">Email Address</label>
                                    <div className="flex items-center gap-3 px-6 py-4 bg-gray-50 rounded-xl border border-gray-200 cursor-not-allowed">
                                        <FiMail className="text-gray-400 text-xl" />
                                        <p className="font-medium text-slate-900">{formData.email}</p>
                                        <span className="ml-auto text-[10px] font-black text-gray-500 uppercase">Read-Only</span>
                                    </div>
                                </div>

                                {/* Phone Field */}
                                <div className="space-y-3">
                                    <label className="block text-sm font-bold text-slate-700 uppercase tracking-wide">Phone Number</label>
                                    {isEditing ? (
                                        <input
                                            type="tel"
                                            name="phone"
                                            value={formData.phone}
                                            onChange={handleChange}
                                            className="w-full px-6 py-4 bg-white border-2 border-gray-300 rounded-xl focus:border-primary focus:outline-none transition-colors font-medium"
                                            placeholder="Enter phone number"
                                        />
                                    ) : (
                                        <div className="flex items-center gap-3 px-6 py-4 bg-gray-50 rounded-xl border border-gray-200">
                                            <FiPhone className="text-gray-400 text-xl" />
                                            <p className="font-medium text-slate-900">{formData.phone || "Not provided"}</p>
                                        </div>
                                    )}
                                </div>

                                {/* Location Field */}
                                <div className="space-y-3">
                                    <label className="block text-sm font-bold text-slate-700 uppercase tracking-wide">Location</label>
                                    {isEditing ? (
                                        <input
                                            type="text"
                                            name="location"
                                            value={formData.location}
                                            onChange={handleChange}
                                            className="w-full px-6 py-4 bg-white border-2 border-gray-300 rounded-xl focus:border-primary focus:outline-none transition-colors font-medium"
                                            placeholder="Enter location"
                                        />
                                    ) : (
                                        <div className="flex items-center gap-3 px-6 py-4 bg-gray-50 rounded-xl border border-gray-200">
                                            <FiMapPin className="text-gray-400 text-xl" />
                                            <p className="font-medium text-slate-900">{formData.location || "Not provided"}</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Security Section */}
                        <div className="border-t border-gray-200 pt-8">
                            <h3 className="text-2xl font-black text-slate-900 mb-8">Security Settings</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="p-6 bg-primary/10 rounded-2xl border border-primary/20 space-y-3">
                                    <p className="text-sm font-bold text-primary uppercase tracking-wide">Two-Factor Authentication</p>
                                    <p className="text-slate-600">Enhanced security for your account</p>
                                    <button className="w-full px-4 py-2 bg-primary text-white rounded-lg font-bold hover:bg-primary/90 transition-colors">
                                        Enable 2FA
                                    </button>
                                </div>
                                <div className="p-6 bg-emerald-50 rounded-2xl border border-emerald-200 space-y-3">
                                    <p className="text-sm font-bold text-emerald-700 uppercase tracking-wide">Change Password</p>
                                    <p className="text-slate-600">Update your password regularly</p>
                                    <button className="w-full px-4 py-2 bg-emerald-600 text-white rounded-lg font-bold hover:bg-emerald-700 transition-colors">
                                        Update Password
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Action Buttons */}
                        {isEditing && (
                            <div className="flex gap-4 pt-8 border-t border-gray-200">
                                <button
                                    onClick={handleSave}
                                    disabled={isSaving}
                                    className="flex-1 flex items-center justify-center gap-2 px-8 py-4 bg-primary text-white font-bold rounded-xl hover:bg-primary/90 transition-colors disabled:opacity-50"
                                >
                                    <FiSave />
                                    {isSaving ? "Saving..." : "Save Changes"}
                                </button>
                                <button
                                    onClick={handleCancel}
                                    className="flex-1 px-8 py-4 bg-gray-100 text-slate-900 font-bold rounded-xl hover:bg-gray-200 transition-colors"
                                >
                                    Cancel
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
}

export default Profile;
