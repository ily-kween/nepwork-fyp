import { ApiResponse, asyncHandler } from "../../utils/index.js";

export const verifyAdminToken = asyncHandler(async (req, res) => {
    const user = req.user;

    return res.status(200).json(
        new ApiResponse(200, true, true, "Admin Token verified", {
            name: user.name,
            email: user.email,
        }),
    );
});
