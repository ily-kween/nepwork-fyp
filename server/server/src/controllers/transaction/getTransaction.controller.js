import mongoose, { isValidObjectId } from "mongoose";
import { ApiError, ApiResponse, asyncHandler, generateEsewaSignature } from "../../utils/index.js";
import { Job, Milestone } from "../../models/index.js";
import { Transaction } from "../../models/transaction.model.js";
import { buildContractSnapshot } from "../../utils/contract.js";

export const getTransaction = asyncHandler(async (req, res) => {
    const { jobId } = req.params;
    const userId = req.user.id;
    const stage = (req.query.stage ?? "final").toString().trim().toLowerCase();

    if (!isValidObjectId(jobId)) {
        throw new ApiError(400, true, "Invalid jobId");
    }

    const job = await Job.findOne({
        _id: jobId,
        postedBy: userId,
    });

    if (!job) {
        throw new ApiError(404, true, "Job not found");
    }

    const milestones = await Milestone.find({ projectId: job._id }).sort({ order: 1, createdAt: 1 });
    const snapshot = buildContractSnapshot({ job, milestones });

    if (stage === "initial") {
        if (job.status !== "contract_pending" || !job.contract?.clientApproved || !job.contract?.freelancerApproved) {
            throw new ApiError(400, true, "Contract must be approved by both client and freelancer before the initial payment");
        }

        if (job.contract?.initialPaymentDone) {
            throw new ApiError(400, true, "Initial payment already completed");
        }

        if (job.contract?.initialTransaction) {
            const transaction = await Transaction.findById(job.contract.initialTransaction);

            if (!transaction) {
                throw new ApiError(404, true, "Initial transaction not found");
            }

            const cryptoStr = Math.random().toString(36).substring(2, 8);
            const t_uuid = `${transaction._id.toString()}-${cryptoStr}`;
            const signature = generateEsewaSignature(transaction.amount, t_uuid, process.env.ESEWA_PRODUCT_CODE || "EPAYTEST");

            return res.status(200).json(
                new ApiResponse(200, true, true, "Transaction fetched", {
                    transaction,
                    esewa: {
                        signature,
                        transaction_uuid: t_uuid,
                        amount: Math.round(transaction.amount),
                        product_code: process.env.ESEWA_PRODUCT_CODE || "EPAYTEST",
                    },
                }),
            );
        }
    } else if (job.status !== "completed") {
        throw new ApiError(400, true, "Project must be marked as 'Completed' by the client before payment.");
    }

    const supportsMongoTransactions = () => {
        const topologyType = mongoose.connection?.client?.topology?.description?.type;
        return topologyType === "ReplicaSetWithPrimary" || topologyType === "Sharded";
    };

    if (stage !== "initial" && !job.transaction) {
        let session = null;
        if (supportsMongoTransactions()) {
            try {
                session = await mongoose.startSession();
                session.startTransaction();
            } catch (err) {
                session = null;
            }
        }
        try {
            const totalAmount = Math.round(job.payment.amount || snapshot.totalCost);
            if (session) {
                try {
                    const transaction = await Transaction.create({
                        status: "pending",
                        jobId: job._id,
                        jobTitle: job.title,
                        userId: job.postedBy,
                        freelancerId: job.acceptedFreelancer,
                        paidBy: job.postedBy,
                        paidTo: job.acceptedFreelancer,
                        paymentMethod: "eSewa",
                        purpose: "final",
                        initiator: job.postedBy,
                        receiver: job.acceptedFreelancer,
                        amount: totalAmount,
                    });

                    job.transaction = transaction._id;
                    await job.save();
                    await session.commitTransaction();
                    await session.endSession();

                    const cryptoStr = Math.random().toString(36).substring(2, 8);
                    const t_uuid = `${transaction._id.toString()}-${cryptoStr}`;
                    const signature = generateEsewaSignature(transaction.amount, t_uuid, process.env.ESEWA_PRODUCT_CODE || "EPAYTEST");

                    return res.status(201).json(
                        new ApiResponse(201, true, true, "Transaction created", {
                            transaction,
                            esewa: {
                                signature,
                                transaction_uuid: t_uuid,
                                amount: Math.round(transaction.amount),
                                product_code: process.env.ESEWA_PRODUCT_CODE || "EPAYTEST",
                            },
                        }),
                    );
                } catch (err) {
                    const isTxnError = err?.code === 20 || (err?.message || "").includes("Transaction numbers are only allowed");
                    if (isTxnError) {
                        try {
                            await session.abortTransaction();
                            await session.endSession();
                        } catch (e) {}

                        const transaction = await Transaction.create({
                            status: "pending",
                            jobId: job._id,
                            jobTitle: job.title,
                            userId: job.postedBy,
                            freelancerId: job.acceptedFreelancer,
                            paidBy: job.postedBy,
                            paidTo: job.acceptedFreelancer,
                            paymentMethod: "eSewa",
                            purpose: "final",
                            initiator: job.postedBy,
                            receiver: job.acceptedFreelancer,
                            amount: totalAmount,
                        });

                        job.transaction = transaction._id;
                        await job.save();

                        const cryptoStr = Math.random().toString(36).substring(2, 8);
                        const t_uuid = `${transaction._id.toString()}-${cryptoStr}`;
                        const signature = generateEsewaSignature(transaction.amount, t_uuid, process.env.ESEWA_PRODUCT_CODE || "EPAYTEST");

                        return res.status(201).json(
                            new ApiResponse(201, true, true, "Transaction created", {
                                transaction,
                                esewa: {
                                    signature,
                                    transaction_uuid: t_uuid,
                                    amount: Math.round(transaction.amount),
                                    product_code: process.env.ESEWA_PRODUCT_CODE || "EPAYTEST",
                                },
                            }),
                        );
                    }

                    throw err;
                }
            }

            // Fallback without transactions
            const transaction = await Transaction.create({
                status: "pending",
                jobId: job._id,
                jobTitle: job.title,
                userId: job.postedBy,
                freelancerId: job.acceptedFreelancer,
                paidBy: job.postedBy,
                paidTo: job.acceptedFreelancer,
                paymentMethod: "eSewa",
                purpose: "final",
                initiator: job.postedBy,
                receiver: job.acceptedFreelancer,
                amount: totalAmount,
            });

            job.transaction = transaction._id;
            await job.save();

            const cryptoStr = Math.random().toString(36).substring(2, 8);
            const t_uuid = `${transaction._id.toString()}-${cryptoStr}`;
            const signature = generateEsewaSignature(transaction.amount, t_uuid, process.env.ESEWA_PRODUCT_CODE || "EPAYTEST");

            return res.status(201).json(
                new ApiResponse(201, true, true, "Transaction created", {
                    transaction,
                    esewa: {
                        signature,
                        transaction_uuid: t_uuid,
                        amount: Math.round(transaction.amount),
                        product_code: process.env.ESEWA_PRODUCT_CODE || "EPAYTEST",
                    },
                }),
            );
        } catch (error) {
            if (session) {
                await session.abortTransaction();
                session.endSession();
            }
            console.error(error);
            throw new ApiError(500, true, "Failed to get/create transaction");
        }
    } else if (stage !== "initial") {
        const transactionId = job.transaction?._id || job.transaction;
        const transaction = await Transaction.findById(transactionId);

        if (!transaction) {
            throw new ApiError(404, true, "Transaction not found");
        }

        const cryptoStr = Math.random().toString(36).substring(2, 8);
        const t_uuid = `${transaction._id.toString()}-${cryptoStr}`;
        const signature = generateEsewaSignature(transaction.amount, t_uuid, process.env.ESEWA_PRODUCT_CODE || "EPAYTEST");

        return res.status(200).json(
            new ApiResponse(200, true, true, "Transaction fetched", {
                transaction,
                esewa: {
                    signature,
                    transaction_uuid: t_uuid,
                    amount: Math.round(transaction.amount),
                    product_code: process.env.ESEWA_PRODUCT_CODE || "EPAYTEST",
                },
            }),
        );
    } else {
        let session = null;
        if (supportsMongoTransactions()) {
            try {
                session = await mongoose.startSession();
                session.startTransaction();
            } catch (err) {
                session = null;
            }
        }
        try {
            if (session) {
                const transaction = await Transaction.create({
                    status: "pending",
                    jobId: job._id,
                    jobTitle: job.title,
                    userId: job.postedBy,
                    freelancerId: job.acceptedFreelancer,
                    paidBy: job.postedBy,
                    paidTo: job.acceptedFreelancer,
                    paymentMethod: "eSewa",
                    purpose: "initial",
                    initiator: job.postedBy,
                    receiver: job.acceptedFreelancer,
                    amount: Math.round(job.contract?.initialPaymentAmount || snapshot.initialPaymentAmount),
                });

                job.contract.initialTransaction = transaction._id;
                await job.save();
                await session.commitTransaction();
                await session.endSession();

                const cryptoStr = Math.random().toString(36).substring(2, 8);
                const t_uuid = `${transaction._id.toString()}-${cryptoStr}`;
                const signature = generateEsewaSignature(transaction.amount, t_uuid, process.env.ESEWA_PRODUCT_CODE || "EPAYTEST");

                return res.status(201).json(
                    new ApiResponse(201, true, true, "Initial contract transaction created", {
                        transaction,
                        esewa: {
                            signature,
                            transaction_uuid: t_uuid,
                            amount: Math.round(transaction.amount),
                            product_code: process.env.ESEWA_PRODUCT_CODE || "EPAYTEST",
                        },
                    }),
                );
            }

            const transaction = await Transaction.create({
                status: "pending",
                jobId: job._id,
                jobTitle: job.title,
                userId: job.postedBy,
                freelancerId: job.acceptedFreelancer,
                paidBy: job.postedBy,
                paidTo: job.acceptedFreelancer,
                paymentMethod: "eSewa",
                purpose: "initial",
                initiator: job.postedBy,
                receiver: job.acceptedFreelancer,
                amount: Math.round(job.contract?.initialPaymentAmount || snapshot.initialPaymentAmount),
            });

            job.contract.initialTransaction = transaction._id;
            await job.save();

            const cryptoStr = Math.random().toString(36).substring(2, 8);
            const t_uuid = `${transaction._id.toString()}-${cryptoStr}`;
            const signature = generateEsewaSignature(transaction.amount, t_uuid, process.env.ESEWA_PRODUCT_CODE || "EPAYTEST");

            return res.status(201).json(
                new ApiResponse(201, true, true, "Initial contract transaction created", {
                    transaction,
                    esewa: {
                        signature,
                        transaction_uuid: t_uuid,
                        amount: Math.round(transaction.amount),
                        product_code: process.env.ESEWA_PRODUCT_CODE || "EPAYTEST",
                    },
                }),
            );
        } catch (error) {
            if (session) {
                await session.abortTransaction();
                session.endSession();
            }
            console.error(error);
            throw new ApiError(500, true, "Failed to get/create initial transaction");
        }
    }
});
