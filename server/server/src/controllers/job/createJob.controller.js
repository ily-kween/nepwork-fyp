import { tags } from "../../constants.js";
import { Job, User } from "../../models/index.js";
import { ApiError, ApiResponse, asyncHandler, sendNotification } from "../../utils/index.js";

const validateTags = (sentTags) => {
    for (let i = 0; i < sentTags.length; i++) {
        if (!tags.includes(sentTags[i])) {
            return false;
        }
    }
    return true;
};

export const createJob = asyncHandler(async (req, res) => {
    const data = req.body;

    const jobPostedBy = req.user._id;
    const jobTitle = (data.title ?? "").trim();
    const jobDescription = (data.description ?? "").trim();
    const hourlyRate = Number(data.rate);
    const jobTags = data.tags ?? [];

    // KYC Check - strict requirement for posting jobs
    if (!req.user.kycVerified) {
        throw new ApiError(403, true, "Hiring privileges restricted: Please complete your KYC verification to initiate new project postings.");
    }

    if (!jobTitle) throw new ApiError(400, true, "Job title is required");
    if (!jobDescription)
        throw new ApiError(400, true, "Job description is required");

    // validating tags
    if (!Array.isArray(jobTags))
        throw new ApiError(400, true, "Invalid tags format, send in array");
    if (jobTags.length == 0)
        throw new ApiError(400, true, "Atleast one tag is required");
    if (!validateTags(jobTags))
        throw new ApiError(400, true, "Tags contains invalid tags");

    if (!data.rate) throw new ApiError(400, true, "Hourly rate is required");
    if (isNaN(hourlyRate) || hourlyRate <= 0)
        throw new ApiError(
            400,
            true,
            "Invalid hourly rate, must be a positive number",
        );

    // creating job after all passed
    const job = await Job.create({
        title: jobTitle,
        description: jobDescription,
        postedBy: jobPostedBy,
        hourlyRate,
        tags: jobTags,
    });

    // notifying freelancers with relevant tags
    const matchingFreelancers = await User.find({
        role: "freelancer",
        tags: { $in: jobTags },
        _id: { $ne: jobPostedBy }
    });

    for (const freelancer of matchingFreelancers) {
        await sendNotification({
            receiverId: freelancer._id,
            senderId: jobPostedBy,
            projectId: job._id,
            title: "New Project Posted",
            message: `A new project matching your skills has been posted: "${jobTitle}"`,
            type: "new_project",
            link: `/jobs/${job._id}`
        });
    }

    return res
        .status(200)
        .json(
            new ApiResponse(200, true, true, `Job created: ${job.title}`, job),
        );
});
