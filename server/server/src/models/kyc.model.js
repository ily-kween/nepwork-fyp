import mongoose from "mongoose";

const kycSchema = new mongoose.Schema(
    {
        user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        type: {
            type: String,
            enum: ["user", "freelancer"],
            required: true,
        },
        name: {
            firstName: { type: String, required: true },
            middleName: { type: String },
            lastName: {
                type: String,
                required: true,
            },
        },
        gender: {
            type: String,
            required: true,
        },
        contact: {
            phoneNumber: {
                type: Number,
                required: true,
            },
            email: {
                type: String,
                required: true,
            },
        },
        dob: {
            year: { type: Number, required: true },
            month: { type: Number, required: true },
            day: { type: Number, required: true },
        },
        document: {
            url: {
                type: String,
                required: true,
            },
            id: {
                type: Number,
                required: true,
            },
            type: {
                type: String,
                enum: ["citizenship", "passport", "driving_license"],
                required: true,
            },
        },

        address: {
            temporary: {
                country: {
                    type: String,
                    required: true,
                },
                state: {
                    type: Number,
                    required: true,
                },
                city: {
                    type: String,
                    required: true,
                },
            },
            permanent: {
                country: {
                    type: String,
                    required: true,
                },
                state: {
                    type: Number,
                    required: true,
                },
                city: {
                    type: String,
                    required: true,
                },
            },
        },

        verified: {
            type: Boolean,
            default: false,
        },

        status: {
            type: String,
            enum: ["pending", "verified", "failed"],
            default: "pending",
        },
        failedReason: {
            type: String,
            default: "",
        },
    },
    { timestamps: true },
);

export const Kyc = mongoose.model("Kyc", kycSchema);
