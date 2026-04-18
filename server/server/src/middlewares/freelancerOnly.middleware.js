import { asyncHandler, ApiError } from "../utils/index.js";

// NOTE: Only use this middleware after authenticate middleware
// this middleware is also not standalone middleware this just checks if req.user.role is freelancer or not and forward or rejects
export const freelancerOnly = asyncHandler(async (req, _, next) => {
    if (!req.user.role === "freelancer")
        throw new ApiError(401, true, "Only freelancer is allowed for this");

    next();
});
