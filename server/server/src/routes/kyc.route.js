import { Router } from "express";
import { authenticate, authorizeAdmin } from "../middlewares/index.js";
import {
    getAllKyc,
    getKycById,
    updateKycStatus,
} from "../controllers/index.js";

export const kycRouter = Router();

kycRouter.get("/get-all-kyc", authenticate, authorizeAdmin, getAllKyc);
kycRouter.get("/get-kyc/:id", authenticate, authorizeAdmin, getKycById);
kycRouter.post(
    "/update-status/:id",
    authenticate,
    authorizeAdmin,
    updateKycStatus,
);
