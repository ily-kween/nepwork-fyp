import jwt from "jsonwebtoken";
import { User } from "../../models/index.js";
import {
    ApiResponse,
    ApiError,
    asyncHandler,
    MailService,
} from "../../utils/index.js";


export const generateAccessToken = async function (id) {
    const user = await User.findById(id);

    return jwt.sign(
        {
            id: user._id,
            firstName: user.name.firstName,
            lastName: user.name.lastName,
            email: user.email,
        },
        process.env.AUTH_ACCESS_TOKEN_SECRET_KEY,
        { expiresIn: process.env.AUTH_ACCESS_TOKEN_EXPIRY },
    );
};

export const generateRefreshToken = async function (id) {
    const user = await User.findById(id);
    return jwt.sign(
        {
            id: user._id,
            firstName: user.name.firstName,
            lastName: user.name.lastName,
            email: user.email,
        },
        process.env.AUTH_REFRESH_TOKEN_SECRET_KEY,
        { expiresIn: process.env.AUTH_REFRESH_TOKEN_EXPIRY },
    );
};

export const signup = asyncHandler(async (req, res) => {
    const data = req.body;

    const firstName = (data.name.firstName || "").trim();
    const middleName = (data.name.middleName || "").trim();
    const lastName = (data.name.lastName || "").trim();
    const email = (data.email || "").trim().toLowerCase();
    const password = data.password || "";
    const confirmPassword = data.confirmPassword || "";
    const role = (data.role || "client").trim().toLowerCase();

    console.log("user signedup", data);

    if (!firstName) {
        return res
            .status(400)
            .json(new ApiError(400, false, "First name is required"));
    }

    if (!lastName) {
        return res
            .status(400)
            .json(new ApiError(400, false, "Last name is required"));
    }

    if (!password) {
        return res
            .status(400)
            .json(new ApiError(400, false, "Password is required"));
    }

    if (!confirmPassword) {
        return res
            .status(400)
            .json(new ApiError(400, false, "Confirm password is required"));
    }

    if (password !== confirmPassword) {
        return res
            .status(400)
            .json(
                new ApiError(
                    400,
                    false,
                    "Password and confirm password did not matched",
                ),
            );
    }

    if (password.length < 8) {
        return res
            .status(400)
            .json(new ApiError(400, false, "Password too short"));
    }

    if (!email) {
        return res
            .status(400)
            .json(new ApiError(400, false, "Email is required"));
    }

    // Validate role
    if (role !== "client" && role !== "freelancer") {
        return res
            .status(400)
            .json(new ApiError(400, false, "Invalid role. Must be 'client' or 'freelancer'"));
    }

    const alreadyExists = await User.findOne({ email });
    if (alreadyExists) {
        return res
            .status(400)
            .json(
                new ApiError(400, false, "User with this email already exists"),
            );
    }

    const user = await User.create({
        name: { firstName, middleName, lastName },
        password,
        email,
        role,
    });

    if (user) {
        // * Successfully created user and sending welcome mail
        MailService.welcomeMail(
            user.email,
            user.name.firstName,
            user.name.lastName,
        );

        return res.status(201).json(
            new ApiResponse(201, true, false, "User created", {
                name: user.name,
                email: user.email,
                role: user.role,
            }),
        );
    } else {
        return res
            .status(500)
            .json(new ApiError(500, false, "Something went wrong"));
    }
});

export const login = asyncHandler(async (req, res) => {
    const data = req.body;
    const email = (data.email || "").trim().toLowerCase();
    const password = data.password || "";

    if (!email) {
        return res
            .status(400)
            .json(new ApiError(400, false, "Email is required"));
    }

    if (!password) {
        return res
            .status(400)
            .json(new ApiError(400, false, "Password is required"));
    }

    const user = await User.findOne({ email });

    if (!user) {
        return res.status(404).json(new ApiError(404, false, "User not found"));
    }

    if (password.toLowerCase() !== user.password.toLowerCase()) {
        return res
            .status(400)
            .json(new ApiError(400, false, "Incorrect Password"));
    }

    const accessToken = await generateAccessToken(user._id);
    const refreshToken = await generateRefreshToken(user._id);
    user.refreshToken = refreshToken;
    user.save();

    return res
        .cookie("accessToken", accessToken)
        .cookie("refreshToken", refreshToken)
        .status(200)
        .json(
            new ApiResponse(200, true, true, "Login successful", {
                name: user.name,
                email: user.email,
                tokens: {
                    accessToken: accessToken,
                    refreshToken: refreshToken,
                },
            }),
        );
});
