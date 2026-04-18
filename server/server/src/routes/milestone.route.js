import { Router } from "express";
import { authenticate, verified, clientOnly, freelancerOnly } from "../middlewares/index.js";
import {
    createMilestone,
    getMilestones,
    getMilestoneById,
    completeMilestone,
    approveMilestone,
    rejectMilestone,
    updateMilestone,
    deleteMilestone,
} from "../controllers/index.js";

export const milestoneRouter = Router();

// Get all milestones for a project
milestoneRouter.get(
    "/project/:projectId",
    authenticate,
    verified,
    getMilestones
);

// Get single milestone by ID
milestoneRouter.get(
    "/:milestoneId",
    authenticate,
    verified,
    getMilestoneById
);

// Create a new milestone (Client only)
milestoneRouter.post(
    "/",
    authenticate,
    verified,
    clientOnly,
    createMilestone
);

// Mark milestone as completed (Freelancer only)
milestoneRouter.patch(
    "/:milestoneId/complete",
    authenticate,
    verified,
    freelancerOnly,
    completeMilestone
);

// Approve milestone (Client only)
milestoneRouter.patch(
    "/:milestoneId/approve",
    authenticate,
    verified,
    clientOnly,
    approveMilestone
);

// Reject milestone (Client only)
milestoneRouter.patch(
    "/:milestoneId/reject",
    authenticate,
    verified,
    clientOnly,
    rejectMilestone
);

// Update milestone (Client only)
milestoneRouter.patch(
    "/:milestoneId",
    authenticate,
    verified,
    clientOnly,
    updateMilestone
);

// Delete milestone (Client only)
milestoneRouter.delete(
    "/:milestoneId",
    authenticate,
    verified,
    clientOnly,
    deleteMilestone
);
