import mongoose from "mongoose";

const otpSchema = new mongoose.Schema(
    {
        email: {
            type: String,
            required: true,
        },

        otpCode: {
            required: true,
            type: Number,
        },

        expireAt: {
            type: Date,
            required: true,
            expires: 0,
        },
    },
    { timestamps: true },
);

export const Otp = mongoose.model("Otp", otpSchema);
