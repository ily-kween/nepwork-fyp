import { ApiError, asyncHandler } from "../utils/index.js";

// NOTE: Only use this middleware after authenticate middleware
// this middleware is also not standalone middleware this just checks if req.user.role is client or not and forward or rejects
export const clientOnly = asyncHandler(async (req, _, next) => {
    if (req.user.role !== "client")
        throw new ApiError(401, true, "Only client is allowed for this");

    next();
});
