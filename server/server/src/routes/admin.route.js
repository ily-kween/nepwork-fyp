import { Router } from "express";
import {
    adminLogin,
    addAdmin,
    verifyAdminToken,
} from "../controllers/index.js";
import { authenticate, authorizeAdmin } from "../middlewares/index.js";

export const adminRouter = Router();

adminRouter.post("/create-admin", addAdmin);
adminRouter.post("/login", adminLogin);
adminRouter.get(
    "/verify-token",
    authenticate,
    authorizeAdmin,
    verifyAdminToken,
);
