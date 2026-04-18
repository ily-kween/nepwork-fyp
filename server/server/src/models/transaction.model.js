import mongoose from "mongoose";

const transactionSchema = new mongoose.Schema(
    {
        jobId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Job",
            required: true,
        },
        transactionCode: {
            type: String,
        },
        transactionUUID: {
            type: String,
        },
        jobTitle: {
            type: String,
        },
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
        },
        freelancerId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
        },
        paidBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
        },
        paidTo: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
        },
        paymentMethod: {
            type: String,
            default: "eSewa",
        },
        transactionId: {
            type: String,
        },
        paymentStatus: {
            type: String,
            enum: ["pending", "verified", "failed", "completed", "not_created", "done"],
            default: "pending",
        },
        status: {
            type: String,
            enum: ["pending", "done"],
            default: "pending",
        },
        receiver: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
        },
        initiator: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
        },
        amount: {
            type: Number,
            default: 0,
        },
        paidTime: {
            type: Date,
            default: null,
        },
    },
    { timestamps: true },
);

export const Transaction = mongoose.model("Transaction", transactionSchema);
