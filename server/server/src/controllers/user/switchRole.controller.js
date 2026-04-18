import { User } from "../../models/index.js";
import { asyncHandler, ApiResponse, ApiError } from "../../utils/index.js";

const canChangeRole = (lastChangedDate) => {
    if (!lastChangedDate)
        return {
            canChange: true,
            message: "You can change role, its first time",
        };
    const daysSinceLastChange = Math.floor(
        (Date.now() - lastChangedDate.getTime()) / (1000 * 60 * 60 * 24),
    );
    const daysRemaining = 14 - daysSinceLastChange;

    if (daysRemaining <= 0) {
        return { canChange: true, message: "You can change your role now!" };
    } else {
        return {
            canChange: false,
            message: `You need to wait ${daysRemaining} more days to change your role`,
        };
    }
};

export const switchRole = asyncHandler(async (req, res) => {
    const role = (req.body.role ?? "").trim();

    if (!role) throw new ApiError(400, true, "Role not provided");

    if (role !== "client" && role !== "freelancer")
        throw new ApiError(400, true, "Invalid role");

    const user = await User.findById(req.user._id);

    const { canChange, message } = canChangeRole(user.lastRoleChange);

    if (!canChange) throw new ApiError(400, true, message);

    if (user.role === role)
        throw new ApiError(400, true, `You're already ${role}`);

    user.lastRoleChange = new Date();
    user.role = role;
    await user.save();

    return res.status(200).json(
        new ApiResponse(200, true, true, `Role changed to ${role}`, {
            lastRoleChange: user.lastRoleChange,
        }),
    );
});
