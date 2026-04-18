import React, { useState } from "react";
import Button from "../Button";
import api from "../../utils/api";
import toast from "react-hot-toast";

function EditAboutModal({ setModalFn, profileData, refetchProfileFn }) {
    const [isUpdating, setIsUpdating] = useState(false);
    const [err, setErr] = useState(null);
    const [aboutData, setAboutData] = useState(profileData.about || "");

    const handleCloseModal = () => {
        if (!isUpdating) {
            setModalFn(false);
        }
    };


    const handleSubmit = async () => {
        if (aboutData === profileData.about) {
            setModalFn(false);
            return;
        }
        setIsUpdating(true);
        if (err) setErr(null);
        try {
            await api.post("/user/update-about", {
                newAbout: aboutData,
            });
            await refetchProfileFn();
            toast.success("About updated");
            setModalFn(false);
        } catch (error) {
            setErr(error.response.data.message);
        } finally {
            setIsUpdating(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            {/* Modal Container - Responsive sizing */}
            <div className="bg-tertiary rounded-xl shadow-xl p-6 w-full max-w-2xl transform transition-all">
                {/* Header Section */}
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl md:text-3xl font-semibold text-black">
                        Edit About
                    </h2>
                    <button
                        onClick={handleCloseModal}
                        className="text-secondaryText hover:text-black text-2xl transition-colors duration-200"
                    >
                        ✕
                    </button>
                </div>

                {/* Textarea Section */}
                <div className="mb-6">
                    <textarea
                        name="newAbout"
                        id="newAbout"
                        value={aboutData}
                        onChange={(e) => setAboutData(e.target.value)}
                        className={`
                            w-full min-h-[200px] md:min-h-[250px] p-4 rounded-lg border
                            focus:ring-2 focus:ring-primary focus:border-primary
                            border-secondary bg-tertiary text-black
                            placeholder-secondaryText resize-none
                            transition-all duration-200 overflow-y-auto
                            ${err ? "border-danger" : "border-secondary"}
                        `}
                        placeholder="Tell others about yourself..."
                        maxLength={1500}
                    />
                    <div className="mt-2 flex justify-between items-center">
                        {err && (
                            <p className="text-sm md:text-base text-danger font-medium">
                                {err}
                            </p>
                        )}
                        <span className="text-sm md:text-base text-secondaryText ml-auto">
                            {aboutData.length}/1500
                        </span>
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3 justify-end">
                    <Button
                        onClick={handleCloseModal}
                        variant="filled"
                        disabled={isUpdating}
                        className={"bg-red-400 border-red-400 text-white"}
                    >
                        Cancel
                    </Button>
                    <Button
                        variant="filled"
                        onClick={handleSubmit}
                        loading={isUpdating}
                        disabled={isUpdating}
                    >
                        {isUpdating ? "Saving" : "Save"}
                    </Button>
                </div>
            </div>
        </div>
    );
}

export default EditAboutModal;
