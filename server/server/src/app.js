import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import { errorHandler } from "./utils/ApiError.js";

const app = express();

/**
 * Basic middlewares
 */

const allowlist = [process.env.CLIENT_URL, process.env.ADMIN_URL];

// const corsOption = {
//     credentials: true,
//     origin: process.env.CLIENT_URL,
// };

const corsOptionsDelegate = function(req, callback) {
    let corsOptions;
    const origin = req.header("Origin");
    if (allowlist.indexOf(origin) !== -1) {
        corsOptions = { origin: true, credentials: true };
    } else {
        corsOptions = { origin: false };
    }
    callback(null, corsOptions);
};

app.use(cors(corsOptionsDelegate));
app.use(express.json());
app.use(express.urlencoded({ extended: true, limit: "16kb" }));
app.use(cookieParser());

/**
 *
 *
 *
 *
 *
 *
 ** Routes
 */

//* User Route
import { userRoute } from "./routes/user.route.js";
app.use("/api/v1/user", userRoute);

// Admin Route
import { adminRouter } from "./routes/admin.route.js";
app.use("/api/v1/admin", adminRouter);

import { kycRouter } from "./routes/kyc.route.js";
app.use("/api/v1/kyc", kycRouter);

import { jobRouter } from "./routes/jobs.route.js";
app.use("/api/v1/jobs", jobRouter);

import { milestoneRouter } from "./routes/milestone.route.js";
app.use("/api/v1/milestones", milestoneRouter);

import { chatRouter } from "./routes/chat.route.js";
app.use("/api/v1/chats", chatRouter);

import notificationRouter from "./routes/notification.route.js";
app.use("/api/v1/notifications", notificationRouter);

import { reviewRoute } from "./routes/review.route.js";
app.use("/api/v1/reviews", reviewRoute);

import { tags } from "./constants.js";
app.get("/api/v1/tags", (_, res) => {
    return res.status(200).json({ tags });
});

//* Error handling
app.use(errorHandler);

export { app };
