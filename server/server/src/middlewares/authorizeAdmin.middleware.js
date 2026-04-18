import { ApiError, asyncHandler } from "../utils/index.js";

// NOTE: Only use this middleware after authenticate middleware
// this middleware is not standalone middleware this just checks if req.user.role is admin or not and forward or rejects
export const authorizeAdmin = asyncHandler(async (req, _, next) => {
    if (req.user.role !== "admin")
        throw new ApiError(
            401,
            false,
            "Unauthorized, Required admin privileges",
        );
    next();
});
