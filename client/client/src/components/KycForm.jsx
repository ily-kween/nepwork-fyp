import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { useForm } from "react-hook-form";
import api from "../utils/api";
import toast from "react-hot-toast";
import { useAuth } from "../stores";
import { Loader } from "./index";
import Button from "./Button";

function KycForm() {
    const navigate = useNavigate();
    const { userData } = useAuth();
    const [userRole, setUserRole] = useState(null);
    const {
        register,
        handleSubmit,
        watch,
        formState: { errors },
    } = useForm();
    const documentFile = watch("documentFile");
    const [resErrMsg, setResErrMsg] = useState(null);
    const currentYear = new Date().getFullYear() + 57;
    const [uploading, setUploading] = useState(false);

    useEffect(() => {
        if (userData) {
            setUserRole(userData.role);
        }
    }, [userData]);

    const inputStyling = `mt-2 p-3 w-full border-2 border-secondary rounded-lg focus:ring-2 focus:ring-primary focus:border-primary transition-colors duration-200 bg-tertiary text-secondaryText placeholder-gray-400`;
    const headerStyle =
        "text-2xl font-semibold text-primaryText bg-primary px-4 py-3 rounded-lg";
    const sectionHeaderStyle =
        "text-xl font-semibold text-primary border-l-4 border-primary pl-3 mb-6";
    const gridCols = "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6";

    const onSubmit = (data) => {
        setUploading(true);
        const payload = new FormData();
        //loading name
        payload.append("firstName", data.firstName);
        payload.append("middleName", data.middleName || "");
        payload.append("lastName", data.lastName);
        payload.append("gender", data.gender);
        payload.append("phoneNumber", data.phone);

        //loading dob
        payload.append("dobYear", data.year);
        payload.append("dobMonth", data.month);
        payload.append("dobDay", data.day);

        // loading address
        payload.append("temporaryCountry", data.temporaryCountry);
        payload.append("temporaryState", data.temporaryState);
        payload.append("temporaryCity", data.temporaryCity);

        payload.append("permanentCountry", data.permanentCountry);
        payload.append("permanentState", data.permanentState);
        payload.append("permanentCity", data.permanentCity);

        // loading documenttemporarys
        payload.append("documentId", data.documentId);
        payload.append("documentType", data.documentType);
        payload.append("documentFile", data.documentFile[0]);

        api.post("/user/upload-kyc", payload)
            .then((res) => {
                toast.success(res.data.message);
                navigate("/settings");
            })
            .catch((err) => {
                setResErrMsg(err.response.data.message);
            })
            .finally(() => {
                setUploading(false);
            });
    };

    if (!userRole) return <Loader />;

    const roleTitle =
        userRole === "freelancer"
            ? "Freelancer KYC Form"
            : "Client KYC Form";
    const roleDescription =
        userRole === "freelancer"
            ? "Complete your KYC verification to unlock freelancing features and increase client trust."
            : "Complete your KYC verification to unlock client features and hire freelancers.";

    return (
        <div className="min-h-screen bg-secondary py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto bg-tertiary rounded-2xl shadow-xl p-8">
                <h1 className={headerStyle}>{roleTitle}</h1>
                <p className="text-sm text-secondaryText mt-3 mb-6">
                    {roleDescription}
                </p>

                <form
                    onSubmit={handleSubmit(onSubmit)}
                    className="space-y-12 mt-10"
                >
                    {/* Personal Information Section */}
                    <div className="space-y-8">
                        <h2 className={sectionHeaderStyle}>
                            Personal Information
                        </h2>
                        <div className={gridCols}>
                            <div>
                                <label
                                    htmlFor="firstName"
                                    className="block text-sm font-medium text-secondaryText mb-2"
                                >
                                    First name
                                </label>
                                <input
                                    type="text"
                                    id="firstName"
                                    {...register("firstName", {
                                        required: "First name is required",
                                        pattern: {
                                            value: /^[A-Za-z]+$/,
                                            message: "Letters only",
                                        },
                                    })}
                                    className={inputStyling}
                                />
                                {errors.firstName && (
                                    <p className="text-danger text-sm mt-1">
                                        {errors.firstName.message}
                                    </p>
                                )}
                            </div>

                            <div>
                                <label
                                    htmlFor="middleName"
                                    className="block text-sm font-medium text-secondaryText mb-2"
                                >
                                    Middle name
                                </label>
                                <input
                                    type="text"
                                    id="middleName"
                                    {...register("middleName", {
                                        pattern: {
                                            value: /^[A-Za-z]+$/,
                                            message: "Letters only",
                                        },
                                    })}
                                    className={inputStyling}
                                />
                                {errors.middleName && (
                                    <p className="text-danger text-sm mt-1">
                                        {errors.middleName.message}
                                    </p>
                                )}
                            </div>

                            <div>
                                <label
                                    htmlFor="lastName"
                                    className="block text-sm font-medium text-secondaryText mb-2"
                                >
                                    Last name
                                </label>
                                <input
                                    type="text"
                                    id="lastName"
                                    {...register("lastName", {
                                        required: "Last name is required",
                                        pattern: {
                                            value: /^[A-Za-z]+$/,
                                            message: "Letters only",
                                        },
                                    })}
                                    className={inputStyling}
                                />
                                {errors.lastName && (
                                    <p className="text-danger text-sm mt-1">
                                        {errors.lastName.message}
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Date of Birth Section */}
                    <div className="space-y-8">
                        <h2 className={sectionHeaderStyle}>
                            Date of Birth (BS)
                        </h2>
                        <div className={gridCols}>
                            {["year", "month", "day"].map((field) => (
                                <div key={field}>
                                    <label className="block text-sm font-medium text-secondaryText mb-2 capitalize">
                                        {field}
                                    </label>
                                    <input
                                        type="number"
                                        id={field}
                                        {...register(field, {
                                            required: `${field} is required`,
                                            valueAsNumber: true,
                                            ...(field === "year" && {
                                                min: {
                                                    value: 1980,
                                                    message: "Minimum 1980",
                                                },
                                                max: {
                                                    value: currentYear,
                                                    message: `Maximum ${currentYear}`,
                                                },
                                            }),
                                            ...(field === "month" && {
                                                validate: (v) =>
                                                    (v >= 1 && v <= 12) ||
                                                    "Invalid month",
                                            }),
                                            ...(field === "day" && {
                                                min: {
                                                    value: 1,
                                                    message: "Minimum 1",
                                                },
                                                max: {
                                                    value: 32,
                                                    message: "Maximum 32",
                                                },
                                            }),
                                        })}
                                        className={inputStyling}
                                    />
                                    {errors[field] && (
                                        <p className="text-danger text-sm mt-1">
                                            {errors[field].message}
                                        </p>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Contact Information */}
                    <div className="space-y-8">
                        <h2 className={sectionHeaderStyle}>
                            Contact Information
                        </h2>
                        <div className={gridCols}>
                            <div className="space-y-2">
                                <label className="block text-sm font-medium text-secondaryText">
                                    Gender
                                </label>
                                <select
                                    id="gender"
                                    {...register("gender", {
                                        validate: (v) =>
                                            v !== "not_selected" ||
                                            "Please select gender",
                                    })}
                                    className={`${inputStyling} cursor-pointer`}
                                >
                                    <option value="not_selected">
                                        Select Gender
                                    </option>
                                    <option value="male">Male</option>
                                    <option value="female">Female</option>
                                    <option value="others">Others</option>
                                </select>
                                {errors.gender && (
                                    <p className="text-danger text-sm mt-1">
                                        {errors.gender.message}
                                    </p>
                                )}
                            </div>
                            <div className="space-y-2">
                                <label className="block text-sm font-medium text-secondaryText">
                                    Phone Number
                                </label>
                                <input
                                    type="number"
                                    id="phone"
                                    {...register("phone", {
                                        required: "Phone number is required",
                                    })}
                                    className={inputStyling}
                                />
                                {errors.phone && (
                                    <p className="text-danger text-sm mt-1">
                                        {errors.phone.message}
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Address Sections */}
                    <div className="space-y-8">
                        <div className="space-y-6 bg-secondary/20 p-6 rounded-xl">
                            <h3 className={sectionHeaderStyle}>
                                Permanent Address
                            </h3>
                            <div className={gridCols}>
                                <div>
                                    <label className="block text-sm font-medium text-secondaryText mb-2">
                                        Country
                                    </label>
                                    <input
                                        type="text"
                                        id="permanentCountry"
                                        {...register("permanentCountry", {
                                            required: "Country is required",
                                            pattern: {
                                                value: /^[A-Za-z]+$/,
                                                message: "Letters only",
                                            },
                                        })}
                                        className={inputStyling}
                                    />
                                    {errors.permanentCountry && (
                                        <p className="text-danger text-sm mt-1">
                                            {errors.permanentCountry.message}
                                        </p>
                                    )}
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-secondaryText mb-2">
                                        State
                                    </label>
                                    <input
                                        type="text"
                                        id="permanentState"
                                        {...register("permanentState", {
                                            required: "State is required",
                                            pattern: {
                                                value: /^[0-9]+$/,
                                                message:
                                                    "Can only contain number",
                                            },
                                        })}
                                        className={inputStyling}
                                    />
                                    {errors.permanentState && (
                                        <p className="text-danger text-sm mt-1">
                                            {errors.permanentState.message}
                                        </p>
                                    )}
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-secondaryText mb-2">
                                        City
                                    </label>
                                    <input
                                        type="text"
                                        id="permanentCity"
                                        {...register("permanentCity", {
                                            required: "City is required",
                                            pattern: {
                                                value: /^[A-Za-z]+$/,
                                                message: "Letters only",
                                            },
                                        })}
                                        className={inputStyling}
                                    />
                                    {errors.permanentCity && (
                                        <p className="text-danger text-sm mt-1">
                                            {errors.permanentCity.message}
                                        </p>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="space-y-6 bg-secondary/20 p-6 rounded-xl">
                            <h3 className={sectionHeaderStyle}>
                                Temporary Address
                            </h3>
                            <div className={gridCols}>
                                <div>
                                    <label className="block text-sm font-medium text-secondaryText mb-2">
                                        Country
                                    </label>
                                    <input
                                        type="text"
                                        id="temporaryCountry"
                                        {...register("temporaryCountry", {
                                            required: "Country is required",
                                            pattern: {
                                                value: /^[A-Za-z]+$/,
                                                message: "Letters only",
                                            },
                                        })}
                                        className={inputStyling}
                                    />
                                    {errors.temporaryCountry && (
                                        <p className="text-danger text-sm mt-1">
                                            {errors.temporaryCountry.message}
                                        </p>
                                    )}
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-secondaryText mb-2">
                                        State
                                    </label>
                                    <input
                                        type="text"
                                        id="temporaryState"
                                        {...register("temporaryState", {
                                            required: "State is required",
                                            pattern: {
                                                value: /^[0-9]+$/,
                                                message:
                                                    "Can only contain number",
                                            },
                                        })}
                                        className={inputStyling}
                                    />
                                    {errors.temporaryState && (
                                        <p className="text-danger text-sm mt-1">
                                            {errors.temporaryState.message}
                                        </p>
                                    )}
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-secondaryText mb-2">
                                        City
                                    </label>
                                    <input
                                        type="text"
                                        id="temporaryCity"
                                        {...register("temporaryCity", {
                                            required: "City is required",
                                            pattern: {
                                                value: /^[A-Za-z]+$/,
                                                message: "Letters only",
                                            },
                                        })}
                                        className={inputStyling}
                                    />
                                    {errors.temporaryCity && (
                                        <p className="text-danger text-sm mt-1">
                                            {errors.temporaryCity.message}
                                        </p>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Document Section */}
                    <div className="space-y-8">
                        <h2 className={sectionHeaderStyle}>
                            Document Verification
                        </h2>
                        <div className="space-y-8">
                            <div className={gridCols}>
                                <div className="space-y-2">
                                    <label className="block text-sm font-medium text-secondaryText">
                                        Document Type
                                    </label>
                                    <select
                                        id="documentType"
                                        {...register("documentType", {
                                            required: "Type is required",
                                        })}
                                        className={`${inputStyling} cursor-pointer`}
                                    >
                                        <option value="citizenship">
                                            Citizenship
                                        </option>
                                        <option value="driving_license">
                                            Driving License
                                        </option>
                                        <option value="passport">
                                            Passport
                                        </option>
                                    </select>
                                    {errors.documentType && (
                                        <p className="text-danger text-sm mt-1">
                                            {errors.documentType.message}
                                        </p>
                                    )}
                                </div>
                                <div className="space-y-2">
                                    <label className="block text-sm font-medium text-secondaryText">
                                        Document ID
                                    </label>
                                    <input
                                        type="text"
                                        id="documentId"
                                        {...register("documentId", {
                                            required: "Document ID required",
                                            pattern: {
                                                value: /^[0-9]+$/,
                                                message: "Numbers only",
                                            },
                                        })}
                                        className={inputStyling}
                                    />
                                    {errors.documentId && (
                                        <p className="text-danger text-sm mt-1">
                                            {errors.documentId.message}
                                        </p>
                                    )}
                                </div>
                            </div>
                            <div className="space-y-4">
                                <label className="block text-sm font-medium text-secondaryText">
                                    Upload Document
                                </label>
                                <div className="flex items-center justify-center w-full">
                                    <label className="flex flex-col w-full cursor-pointer group">
                                        <div
                                            className={`border-2 border-dashed rounded-lg p-8 text-center transition-all 
                                            ${errors.documentFile ? "border-danger" : "border-secondary group-hover:border-primary"}`}
                                        >
                                            <div className="flex flex-col items-center space-y-2">
                                                <svg
                                                    className={`w-12 h-12 ${errors.documentFile ? "text-danger" : "text-primary"}`}
                                                    fill="none"
                                                    stroke="currentColor"
                                                    viewBox="0 0 24 24"
                                                >
                                                    <path
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                        strokeWidth={2}
                                                        d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                                                    />
                                                </svg>
                                                <p
                                                    className={`text-sm ${errors.documentFile ? "text-danger" : "text-secondaryText"}`}
                                                >
                                                    {documentFile?.[0]?.name ||
                                                        "Click to upload document (JPG, PNG)"}
                                                </p>
                                            </div>
                                        </div>
                                        <input
                                            type="file"
                                            id="documentFile"
                                            {...register("documentFile", {
                                                required: "Document required",
                                                validate: (file) =>
                                                    file?.[0]?.type.startsWith(
                                                        "image/",
                                                    ) ||
                                                    "Unsupported file format",
                                            })}
                                            className="hidden"
                                            accept="image/*"
                                        />
                                    </label>
                                </div>
                                {errors.documentFile && (
                                    <p className="text-danger text-sm mt-2">
                                        {errors.documentFile.message}
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Submit Section */}
                    <div className="pt-8 border-t-2 border-secondary">
                        {resErrMsg && (
                            <p className="text-danger mb-6 text-center font-medium">
                                {resErrMsg}
                            </p>
                        )}
                        <Button
                            type="submit"
                            variant="filled"
                            disabled={uploading}
                            loading={uploading}
                            className="w-full py-4 font-semibold text-lg bg-primary hover:bg-primary/90 text-white rounded-xl transition-all"
                        >
                            {uploading ? "Submitting..." : "Submit"}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default KycForm;
