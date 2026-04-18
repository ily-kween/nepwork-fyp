import React, { useState, useEffect } from "react";
import Button from "../Button";
import { useTags } from "../../contexts/tagContext";
import api from "../../utils/api";
import toast from "react-hot-toast";
import Tag from "../Tag";

function EditTagsModal({ setModalFn, profileData, refetchProfileFn }) {
    const { tags } = useTags();
    const [isUpdating, setIsUpdating] = useState(false);
    const [currentTags, setCurrentTags] = useState(profileData.tags);
    const [searchQuery, setSearchQuery] = useState("");
    const [err, setErr] = useState(null);

    const filteredTags = tags.filter((tag) =>
        tag.toLowerCase().includes(searchQuery.toLowerCase()),
    );

    const toggleTagSelection = (tag) => {
        setCurrentTags((prev) =>
            prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag],
        );
    };

    const handleCloseModal = () => {
        if (!isUpdating) setModalFn(false);
    };

    const handleSubmit = async () => {
        if (JSON.stringify(profileData.tags) === JSON.stringify(currentTags)) {
            setModalFn(false);
            return;
        }

        setIsUpdating(true);
        setErr(null);

        try {
            await api.post("/user/update-profile-tags", {
                newTags: currentTags,
            });
            await refetchProfileFn();
            toast.success("Tags updated successfully");
            setModalFn(false);
        } catch (error) {
            setErr(error.response?.data?.message || "Failed to update tags");
        } finally {
            setIsUpdating(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-tertiary rounded-xl shadow-xl p-8 w-full max-w-2xl transform transition-all">
                {/* Header */}
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h2 className="text-2xl font-bold text-primaryText">
                            Update Professional Tags
                        </h2>
                        <p className="text-secondaryText mt-2">
                            Select up to 15 relevant skills (
                            {currentTags.length}/15 selected)
                        </p>
                    </div>
                    <button
                        onClick={handleCloseModal}
                        className="text-secondaryText hover:text-primaryText text-2xl transition-colors duration-200 p-2 -m-2"
                    >
                        ✕
                    </button>
                </div>

                {/* Search Input */}
                <div className="mb-6">
                    <input
                        type="text"
                        placeholder="Search tags..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full p-3 rounded-lg border border-secondary focus:border-primary focus:ring-2 focus:ring-primary/20 text-primaryText placeholder-secondaryText transition-all duration-200"
                    />
                </div>

                {/* Tags Grid */}
                <div className="mb-8">
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 max-h-[400px] overflow-y-auto p-2">
                        {filteredTags.map((tag) => (
                            <button
                                key={tag}
                                onClick={() => toggleTagSelection(tag)}
                                className={`p-2 rounded-lg border transition-all duration-200 flex items-center justify-center
                                    ${
                                        currentTags.includes(tag)
                                            ? "bg-primary/10 border-primary text-primary font-semibold"
                                            : "border-secondary hover:border-primary/50 text-secondaryText"
                                    }
                                    ${
                                        currentTags.length >= 15 &&
                                        !currentTags.includes(tag)
                                            ? "opacity-50 cursor-not-allowed"
                                            : ""
                                    }
                                `}
                                disabled={
                                    currentTags.length >= 15 &&
                                    !currentTags.includes(tag)
                                }
                            >
                                <span className="text-sm">{tag}</span>
                            </button>
                        ))}
                    </div>

                    {filteredTags.length === 0 && (
                        <p className="text-center text-secondaryText py-6">
                            No tags found matching "{searchQuery}"
                        </p>
                    )}
                </div>

                {/* Error & Actions */}
                <div className="space-y-4">
                    {err && (
                        <div className="flex items-center bg-danger/10 p-3 rounded-lg">
                            <svg
                                className="w-5 h-5 text-danger mr-2"
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
                            onClick={handleSubmit}
                            variant="filled"
                            loading={isUpdating}
                            disabled={isUpdating}
                            className={""}
                        >
                            {isUpdating ? "Saving..." : "Save Changes"}
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default EditTagsModal;
