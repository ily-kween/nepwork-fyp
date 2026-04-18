import mongoose from "mongoose";

const ticketSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: true,
        },
        description: {
            type: String,
            required: true,
        },
        issuedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        status: {
            type: String,
            enum: ["open", "closed", "resolved"],
            default: "open",
        },
        replies: [
            {
                repliedBy: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: "User",
                    required: true, 
                },
                replierRole: {
                    type: String,
                    enum: ["admin", "client"],
                    required: true, 
                },
                message: {
                    type: String,
                    required: true,
                },
                timestamp: {
                    type: Date,
                    default: Date.now,
                },
            },
        ],
    },
    { timestamps: true },
);

export const Ticket = mongoose.model("Ticket", ticketSchema);
