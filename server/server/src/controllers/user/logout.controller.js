import { asyncHandler, ApiResponse } from "../../utils/index.js";

export const logout = asyncHandler(async (req, res) => {
    // Since we're using JWT tokens, logout is primarily handled on the client side
    // The client clears their tokens from localStorage
    // This endpoint can be used to perform any server-side cleanup if needed
    
    return res
        .status(200)
        .json(new ApiResponse(200, {}, "User logged out successfully"));
});
