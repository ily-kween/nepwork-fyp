import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    sender: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
    },
    project: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Job",
    },
    title: {
        type: String,
        required: true,
    },
    message: {
        type: String,
        required: true,
    },
    type: {
        type: String,
        enum: [
            "payment_received",
            "job_accepted",
            "job_applied",
            "job_started",
            "job_completed",
            "progress_update",
            "new_project",
            "general"
        ],
        default: "general",
    },
    link: {
        type: String,
    },
    isRead: {
        type: Boolean,
        default: false,
    }
}, { timestamps: true });

export const Notification = mongoose.model("Notification", notificationSchema);
