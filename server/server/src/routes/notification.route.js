import { Router } from "express";
import { authenticate } from "../middlewares/index.js";
import {
    getNotifications,
    markAsRead,
    createNotification,
    deleteNotification,
} from "../controllers/index.js";

export const notificationRouter = Router();

// All notification routes require authentication
notificationRouter.use(authenticate);

notificationRouter.post("/create", createNotification);
notificationRouter.get("/user/:userId", getNotifications);
notificationRouter.patch("/read/:notificationId", markAsRead);
notificationRouter.delete("/:notificationId", deleteNotification);
notificationRouter.get("/", getNotifications); // Optional: get current user's notifications

export default notificationRouter;
