import fs from "fs";
import multer from "multer";
import {
    ApiResponse,
    ApiError,
    asyncHandler,
    cloudinary,
} from "../../utils/index.js";
import { User, Kyc } from "../../models/index.js";

export const upload = multer({ dest: "uploads/" });

export const uploadKyc = asyncHandler(async (req, res) => {
    const body = req.body;
    const documentPath = req.file.path;

    // Get KYC type from user's role
    const user = await User.findById(req.user.id);
    if (!user) {
        return res
            .status(404)
            .json(new ApiError(404, true, "User not found"));
    }

    const kycType = user.role === "freelancer" ? "freelancer" : "user";

    //Name
    const firstName = (body.firstName || "").trim();
    const middleName = (body.middleName || "").trim();
    const lastName = (body.lastName || "").trim();

    if (!firstName) {
        return res
            .status(400)
            .json(new ApiError(400, true, "First name not provided"));
    }

    if (!lastName) {
        return res
            .status(400)
            .json(new ApiError(400, true, "Last name not provided"));
    }

    const gender = (body.gender ?? "").trim();

    if (!gender) throw new ApiError(400, true, "Gender is required");

    const allowedGenders = ["male", "female", "others"];

    if (!allowedGenders.includes(gender))
        throw new ApiError(
            400,
            true,
            "Invalid gender, [male,female,others] only",
        );

    // Date of birth
    const year = body.dobYear || 0;
    const month = body.dobMonth || 0;
    const day = body.dobDay || 0;

    if (!year) {
        return res
            .status(400)
            .json(new ApiError(400, true, "DOB: year not provided"));
    }
    if (!month) {
        return res
            .status(400)
            .json(new ApiError(400, true, "DOB: month not provided"));
    }

    if (!day) {
        return res
            .status(400)
            .json(new ApiError(400, true, "DOB: day not provided"));
    }

    const phoneNumber = Number(body.phoneNumber);
    if (isNaN(phoneNumber))
        throw new ApiError(
            400,
            true,
            "Phone number is invalid or not provided",
        );

    /*
     * Validation for document
     * */

    const documentIdNumber = body.documentId || 0;
    const documentType = (body.documentType || "").trim().toLowerCase();
    let documentUrl;

    if (!documentIdNumber) {
        return res
            .status(400)
            .json(new ApiError(400, true, "DocumentId not provided"));
    }

    if (!documentType) {
        return res
            .status(400)
            .json(new ApiError(400, true, "Document type not provided"));
    }

    const allowedDocTypes = ["citizenship", "passport", "driving_license"];

    if (!allowedDocTypes.includes(documentType)) {
        return res
            .status(400)
            .json(
                new ApiError(
                    400,
                    true,
                    "Invalid document type, it must be 'citizenship' or 'passport' or 'driving_license'",
                ),
            );
    }

    /*
     * Validation for temporary address
     * */

    const tempCountry = (body.temporaryCountry || "").trim().toLowerCase();

    const tempState = body.temporaryState || 0;

    const tempCity = (body.temporaryCity || "").trim().toLowerCase();

    if (!tempCountry) {
        return res
            .status(400)
            .json(new ApiError(400, true, "Temporary country not provided"));
    }

    if (!tempState) {
        return res
            .status(400)
            .json(new ApiError(400, true, "Temporary state not provided"));
    }
    if (!tempCity) {
        return res
            .status(400)
            .json(new ApiError(400, true, "Temporary city not provided"));
    }

    /*
     * Validation for permanent address
     * */

    const permanCountry = (body.permanentCountry || "").trim().toLowerCase();

    const permanState = body.permanentState || 0;

    const permanCity = (body.permanentCity || "").trim().toLowerCase();

    if (!permanCountry) {
        return res
            .status(400)
            .json(new ApiError(400, true, "Permanent country not provided"));
    }

    if (!permanState) {
        return res
            .status(400)
            .json(new ApiError(400, true, "Permanent state not provided"));
    }

    if (!permanCity) {
        return res
            .status(400)
            .json(new ApiError(400, true, "Permanent city not provided"));
    }

    const alreadySubmittedKyc = await Kyc.findOne({ user });

    if (alreadySubmittedKyc) {
        if (!alreadySubmittedKyc.verified) {
            return res
                .status(400)
                .json(
                    new ApiError(
                        400,
                        true,
                        "Your kyc is pending, Please wait or contact officials",
                    ),
                );
        }

        return res
            .status(400)
            .json(new ApiError(400, true, "Your kyc is already verified"));
    }

    if (!documentPath) {
        return res
            .status(400)
            .json(
                new ApiError(
                    400,
                    true,
                    "Something wen wrong while image was uploading, Try again",
                ),
            );
    }

    try {
        const response = await cloudinary.uploader.upload(documentPath);
        documentUrl = response.url;

        fs.unlink(documentPath, (err) => {
            if (err) {
                console.log(
                    "Error removing file from local system after uploading to cloudinary",
                );
            } else {
                console.log(
                    "Removed file from local system after uploading to cloudinary",
                );
            }
        });
    } catch (error) {
        fs.unlink(documentPath, (err) => {
            if (err) {
                console.log(
                    "Error removing file from local system after failed upload to cloudinary",
                );
            } else {
                console.log(
                    "Removed file from local system after failed upload to cloudinary",
                );
            }
        });

        return res
            .status(400)
            .json(
                new ApiError(400, true, "Failed to upload document, Try again"),
            );
    }

    const kyc = await Kyc.create({
        user: user,
        type: kycType,
        name: { firstName, middleName, lastName },
        gender: gender,
        contact: {
            email: user.email,
            phoneNumber,
        },
        dob: { year, month, day },
        document: {
            url: documentUrl,
            id: documentIdNumber,
            type: documentType,
        },
        address: {
            temporary: {
                country: tempCountry,
                state: tempState,
                city: tempCity,
            },
            permanent: {
                country: permanCountry,
                state: permanState,
                city: permanCity,
            },
        },
    });

    //after successfull validations change kyc status to pending
    user.kycStatus = "pending";
    user.kyc = kyc;
    await user.save();

    return res.status(200).json(
        new ApiResponse(200, true, true, "Kyc uploaded successfully", {
            name: kyc.name,
            email: kyc.user.email,
        }),
    );
});
