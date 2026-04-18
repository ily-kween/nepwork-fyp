import mongoose from "mongoose";
import { Job, JobApplication } from "../../models/index.js";
import { ApiResponse, asyncHandler } from "../../utils/index.js";

export const getFreelancerJobs = asyncHandler(async (req, res) => {
    const userId = req.user._id;

    // 1. Get IDs of jobs the user has applied to
    const applications = await JobApplication.find({ appliedBy: userId }).select("appliedTo");
    const appliedJobIds = applications.map(app => app.appliedTo);

    // 2. Find jobs that are either assigned to the user OR they have applied to
    const jobs = await Job.find({
        $or: [
            { acceptedFreelancer: userId },
            { _id: { $in: appliedJobIds } }
        ]
    })
    .populate({
        path: "postedBy",
        select: "name avatar"
    })
    .populate("acceptedFreelancer", "name avatar")
    .sort({ updatedAt: -1 });

    return res.status(200).json(
        new ApiResponse(200, true, true, "Freelancer jobs fetched successfully", jobs)
    );
});
