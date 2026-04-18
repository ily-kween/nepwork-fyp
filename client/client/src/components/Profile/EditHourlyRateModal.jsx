import React, { useState } from "react";
import Button from "../Button";
import api from "../../utils/api";
import toast from "react-hot-toast";

function EditHourlyRateModal({ setModalFn, profileData, refetchProfileFn }) {
    const [isUpdating, setIsUpdating] = useState(false);
    const [newHourlyRate, setNewHourlyRate] = useState(profileData.hourlyRate || "");
    const [err, setErr] = useState(null);

    const handleNewHourlyChange = (e) => {
        const value = e.target.value;
        // Allow only numbers and one decimal point
        const filtered = value.replace(/[^\d.]/g, "");
        // Prevent multiple decimal points
        const parts = filtered.split(".");
        const formatted = parts.length > 2 ? parts[0] + "." + parts[1] : filtered;
        setNewHourlyRate(formatted);
    };

    const handleCloseModal = () => {
        if (!isUpdating) setModalFn(false);
    };

    const handleSubmit = async () => {
        if (newHourlyRate === profileData.hourlyRate) {
            setModalFn(false);
            return;
        }

        setIsUpdating(true);
        setErr(null);

        if (newHourlyRate <= 0) {
            setErr("Hourly rate must be greater than 0");
            setIsUpdating(false);
            return;
        }

        try {
            await api.post("/user/update-hourly-rate", {
                newHourlyRate: newHourlyRate,
            });
            await refetchProfileFn();
            toast.success("Hourly rate updated successfully");
            setModalFn(false);
        } catch (error) {
            setErr(error.response?.data?.message || "An error occurred");
        } finally {
            setIsUpdating(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-tertiary rounded-xl shadow-xl p-8 w-full max-w-md transform transition-all">
                {/* Header */}
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h2 className="text-2xl font-bold text-primaryText">
                            Update Hourly Rate
                        </h2>
                        <p className="text-secondaryText mt-1">
                            Set your preferred hourly rate
                        </p>
                    </div>
                    <button
                        onClick={handleCloseModal}
                        className="text-secondaryText hover:text-primaryText text-2xl transition-colors duration-200 p-2 -m-2"
                    >
                        ✕
                    </button>
                </div>

                {/* Input Section */}
                <div className="mb-8">
                    <div className="relative">
                        <div className="flex items-center border border-secondary rounded-lg focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20 transition-all duration-200">
                            <span className="pl-4 pr-2 text-2xl text-secondaryText">
                                RS
                            </span>
                            <input
                                type="text"
                                inputMode="numeric"
                                pattern="[0-9]*"
                                value={newHourlyRate}
                                onChange={handleNewHourlyChange}
                                className="w-full py-4 pr-4 bg-transparent text-2xl font-semibold text-primaryText outline-none"
                                placeholder="00.00"
                                disabled={isUpdating}
                            />
                        </div>

                        {err && (
                            <div className="mt-3 flex items-center space-x-2">
                                <svg
                                    className="w-5 h-5 text-danger"
                                    fill="currentColor"
                                    viewBox="0 0 20 20"
                                >
                                    <path
                                        fillRule="evenodd"
                                        d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                                        clipRule="evenodd"
                                    />
                                </svg>
                                <p className="text-sm text-danger font-medium">
                                    {err}
                                </p>
                            </div>
                        )}
                    </div>

                    <p className="mt-4 text-sm text-secondaryText">
                        Current rate: Rs. {profileData.hourlyRate}
                    </p>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-4 justify-end">
                    <Button
                        onClick={handleCloseModal}
                        variant="filled"
                        disabled={isUpdating}
                        className={"bg-red-400 border-red-400"}
                    >
                        Cancel
                    </Button>
                    <Button
                        variant="filled"
                        onClick={handleSubmit}
                        loading={isUpdating}
                        disabled={isUpdating}
                    >
                        {isUpdating ? "Updating" : "Update"}
                    </Button>
                </div>
            </div>
        </div>
    );
}

export default EditHourlyRateModal;
