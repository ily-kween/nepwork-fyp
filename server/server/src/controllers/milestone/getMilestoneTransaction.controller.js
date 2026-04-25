import mongoose, { isValidObjectId } from "mongoose";
import { ApiError, ApiResponse, asyncHandler, generateEsewaSignature } from "../../utils/index.js";
import { Job, Milestone, Transaction } from "../../models/index.js";

export const getMilestoneTransaction = asyncHandler(async (req, res) => {
    const { milestoneId } = req.params;
    const userId = req.user.id;

    if (!isValidObjectId(milestoneId)) {
        throw new ApiError(400, true, "Invalid milestoneId");
    }

    const milestone = await Milestone.findById(milestoneId).populate("projectId");
    if (!milestone) {
        throw new ApiError(404, true, "Milestone not found");
    }

    const project = milestone.projectId;

    if (project.postedBy.toString() !== userId) {
        throw new ApiError(401, true, "Only the project client can pay for milestones");
    }

    if (milestone.status !== "approved") {
        throw new ApiError(400, true, "Milestone must be approved before payment can be released");
    }

    if (milestone.paymentTransaction) {
        const transaction = await Transaction.findById(milestone.paymentTransaction);
        if (!transaction) {
            throw new ApiError(404, true, "Milestone transaction not found");
        }

        const cryptoStr = Math.random().toString(36).substring(2, 8);
        const t_uuid = `${transaction._id.toString()}-${cryptoStr}`;
        const signature = generateEsewaSignature(transaction.amount, t_uuid, process.env.ESEWA_PRODUCT_CODE || "EPAYTEST");

        return res.status(200).json(
            new ApiResponse(200, true, true, "Milestone transaction fetched", {
                transaction,
                milestone,
                esewa: {
                    signature,
                    transaction_uuid: t_uuid,
                    amount: Math.round(transaction.amount),
                    product_code: process.env.ESEWA_PRODUCT_CODE || "EPAYTEST",
                },
            }),
        );
    }

    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const transaction = await Transaction.create([
            {
                status: "pending",
                jobId: project._id,
                jobTitle: project.title,
                userId: project.postedBy,
                freelancerId: project.acceptedFreelancer,
                milestoneId: milestone._id,
                paidBy: project.postedBy,
                paidTo: project.acceptedFreelancer,
                paymentMethod: "eSewa",
                purpose: "milestone",
                initiator: project.postedBy,
                receiver: project.acceptedFreelancer,
                amount: Math.round(milestone.amount || 0),
            },
        ], { session });

        milestone.paymentTransaction = transaction[0]._id;
        milestone.paymentStatus = "pending_payment";
        await milestone.save({ session });
        await session.commitTransaction();
        session.endSession();

        const cryptoStr = Math.random().toString(36).substring(2, 8);
        const t_uuid = `${transaction[0]._id.toString()}-${cryptoStr}`;
        const signature = generateEsewaSignature(transaction[0].amount, t_uuid, process.env.ESEWA_PRODUCT_CODE || "EPAYTEST");

        return res.status(201).json(
            new ApiResponse(201, true, true, "Milestone payment transaction created", {
                transaction: transaction[0],
                milestone,
                esewa: {
                    signature,
                    transaction_uuid: t_uuid,
                    amount: Math.round(transaction[0].amount),
                    product_code: process.env.ESEWA_PRODUCT_CODE || "EPAYTEST",
                },
            }),
        );
    } catch (error) {
        await session.abortTransaction();
        session.endSession();
        console.error(error);
        throw new ApiError(500, true, "Failed to create milestone transaction");
    }
});