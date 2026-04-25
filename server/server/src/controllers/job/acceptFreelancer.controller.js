import mongoose from "mongoose";
import { ApiError, ApiResponse, asyncHandler, sendNotification } from "../../utils/index.js";
import { Job, JobApplication, Milestone } from "../../models/index.js";
import { Notification } from "../../models/index.js";
import { buildContractSnapshot } from "../../utils/contract.js";

export const acceptFreelancer = asyncHandler(async (req, res) => {
    const { jobId } = req.params;

    const userId = req.user.id;

    const acceptedFreelancerId = (req.body.acceptedFreelancerId ?? "").trim();

    if (!acceptedFreelancerId)
        throw new ApiError(400, true, "Accepted Freelancer id is required");

    if (!mongoose.isValidObjectId(acceptedFreelancerId))
        throw new ApiError(400, true, "Invaid freelancer id");

    if (!mongoose.isValidObjectId(jobId))
        throw new ApiError(400, true, "Invalid job id");

    const job = await Job.findOne({ _id: jobId, postedBy: userId });

    if (!job) throw new ApiError(404, true, "Job not found");

    if (job.acceptedFreelancer)
        throw new ApiError(400, true, "Job has already a freelancer");

    if (job.status !== "open") {
        throw new ApiError(
            400,
            true,
            "Job must be open to select a freelancer",
        );
    }

    const application = await JobApplication.findOne({
        appliedBy: acceptedFreelancerId,
        appliedTo: job._id,
    });

    if (!application)
        throw new ApiError(400, true, "Freelancer has not applied yet");

    const milestones = await Milestone.find({ projectId: job._id }).sort({ order: 1, createdAt: 1 });
    const snapshot = buildContractSnapshot({ job, milestones });

    job.acceptedFreelancer = acceptedFreelancerId;
    job.acceptedApplication = application;
    job.status = "contract_pending";
    job.contract = {
        status: "pending_signature",
        totalCost: snapshot.totalCost,
        initialPaymentAmount: snapshot.initialPaymentAmount,
        paymentTerms: snapshot.paymentTerms,
        timelineStart: snapshot.timelineStart,
        timelineEnd: snapshot.timelineEnd,
        clientApproved: false,
        freelancerApproved: false,
        clientApprovedAt: null,
        freelancerApprovedAt: null,
        activatedAt: null,
        initialPaymentDone: false,
        initialPaymentAt: null,
        initialTransaction: null,
        finalTransaction: null,
        milestones: snapshot.milestones,
    };

    await job.save();

    await sendNotification({
        receiverId: acceptedFreelancerId,
        senderId: userId,
        projectId: job._id,
        title: "Project Contract Ready",
        message: "Your application was accepted. Please review and approve the contract before work starts.",
        type: "job_accepted",
        link: `/jobs/${job._id}`
    });

    return res.status(200).json(
        new ApiResponse(200, true, true, `Freelancer accepted for job`, {
            application,
        }),
    );
});
