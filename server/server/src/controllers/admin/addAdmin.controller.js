    import { User } from "../../models/user.model.js";
    import { ApiError, ApiResponse, asyncHandler } from "../../utils/index.js";

    export const addAdmin = asyncHandler(async (req, res) => {
        const email = (req.body.email || "").trim().toLowerCase();
        const secret_key = req.body.secret_key || "";
        const ADMIN_SECRET_KEY = process.env.ADMIN_SECRET_KEY;

        if (!email) throw new ApiError(400, false, "Email not provided");
        if (!secret_key) throw new ApiError(400, false, "Secret key not provided");
        if (secret_key !== ADMIN_SECRET_KEY)
            throw new ApiError(400, false, "Invalid secret_key");

        const user = await User.findOne({ email });
        if (!user) {
            throw new ApiError(404, false, "No any user with this email");
        }

        if (user.role === "admin")
            throw new ApiError(400, false, "This account is already admin");

        if (!user.emailVerified)
            throw new ApiError(400, false, "Need to verify Email to continue");
        if (!user.kycVerified)
            throw new ApiError(400, false, "Need to verify Kyc to continue");

        user.role = "admin";
        await user.save();

        return res.status(201).json(
            new ApiResponse(201, true, false, `${user.email} Added as admin`, {
                email: user.email,
            }),
        );
    });
