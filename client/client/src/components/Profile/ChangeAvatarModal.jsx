import React, { useState } from "react";
import { useForm } from "react-hook-form";
import Button from "../Button";
import api from "../../utils/api";
import toast from "react-hot-toast";

function ChangeAvatarModal({ setModal, refetchProfile }) {
    const [uploading, setUploading] = useState(false);
    const [resErr, setResErr] = useState(null);
    const [preview, setPreview] = useState(null);
    const {
        register,
        handleSubmit,
        formState: { errors },
        watch,
    } = useForm();

    const newAvatar = watch("newAvatar");
    if (newAvatar && newAvatar[0] && !preview) {
        const reader = new FileReader();
        reader.onload = (e) => setPreview(e.target.result);
        reader.readAsDataURL(newAvatar[0]);
    }

    const onSubmit = async (data) => {
        setUploading(true);
        const payload = new FormData();
        payload.append("newAvatar", data.newAvatar[0]);

        try {
            await api.post("/user/update-avatar", payload);
            refetchProfile();
            setModal(false);
            toast.success("Avatar updated successfully");
        } catch (error) {
            console.error(error);
            setResErr(error.response?.data?.message || "An error occurred");
        } finally {
            setUploading(false);
        }
    };

    const handleClose = () => {
        if (!uploading) {
            setModal(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-md flex items-center justify-center p-4 z-50">
            <form
                onSubmit={handleSubmit(onSubmit)}
                className="bg-tertiary rounded-2xl shadow-xl p-6 w-full max-w-md transform transition-all"
                encType="multipart/form-data"
            >
                {/* Header */}
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-semibold text-secondaryText">
                        Change Avatar
                    </h2>
                    <button
                        type="button"
                        onClick={handleClose}
                        disabled={uploading}
                        className="text-secondaryText hover:bg-secondary rounded-full p-2 transition-colors duration-200"
                    >
                        <svg
                            className="w-6 h-6"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M6 18L18 6M6 6l12 12"
                            />
                        </svg>
                    </button>
                </div>

                {/* Preview & Upload Area */}
                <div className="mb-6">
                    <label
                        htmlFor="avatarInput" // Add this
                        className="block mb-4 cursor-pointer" // Ensure cursor-pointer is here
                    >
                        <div
                            className={`border-2 border-dashed border-secondary rounded-2xl p-6 text-center 
            hover:border-primary transition-all duration-200 ${errors.newAvatar ? "border-danger" : ""}`}
                        >
                            {preview ? (
                                <img
                                    src={preview}
                                    alt="Preview"
                                    className="w-32 h-32 rounded-full object-cover mx-auto mb-4 shadow-md"
                                />
                            ) : (
                                <div className="space-y-2">
                                    <div className="mx-auto text-secondaryText">
                                        <svg
                                            className="w-12 h-12 mx-auto"
                                            fill="none"
                                            stroke="currentColor"
                                            viewBox="0 0 24 24"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth={2}
                                                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                                            />
                                        </svg>
                                    </div>
                                    <p className="text-secondaryText font-medium">
                                        Click to upload or drag and drop
                                    </p>
                                    <p className="text-sm text-secondaryText/80">
                                        PNG, JPG up to 5MB
                                    </p>
                                </div>
                            )}
                        </div>
                        <input
                            id="avatarInput" // Add matching ID
                            type="file"
                            accept="image/*"
                            {...register("newAvatar", {
                                required: "Please select an image file",
                                validate: {
                                    fileSize: (value) =>
                                        value[0]?.size <= 5_000_000 ||
                                        "File size must be less than 5MB",
                                    fileType: (value) =>
                                        ["image/jpeg", "image/png"].includes(
                                            value[0]?.type,
                                        ) || "Only JPG/PNG files are allowed",
                                },
                            })}
                            className="hidden"
                            disabled={uploading}
                        />
                    </label>

                    {(errors.newAvatar || resErr) && (
                        <div className="text-center px-4 py-2 rounded-lg bg-danger/10 text-danger">
                            {errors.newAvatar?.message || resErr}
                        </div>
                    )}
                </div>

                {/* Actions */}
                <div className="flex justify-end gap-3">
                    <Button
                        type="button"
                        disabled={uploading}
                        onClick={handleClose}
                        variant="filled"
                        className="bg-secondary text-secondaryText hover:bg-secondary/80 px-6 py-2"
                    >
                        Cancel
                    </Button>
                    <Button
                        type="submit"
                        disabled={uploading || !newAvatar}
                        loading={uploading}
                        variant="filled"
                        className="bg-primary text-primaryText border-primary/90 hover:bg-primary/90 px-6 py-2 disabled:opacity-70"
                    >
                        {uploading ? "Uploading..." : "Save Changes"}
                    </Button>
                </div>
            </form>
        </div>
    );
}

export default ChangeAvatarModal;
