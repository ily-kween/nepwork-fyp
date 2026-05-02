import mongoose from "mongoose";
import { ApiError, ApiResponse, asyncHandler, sendNotification } from "../../utils/index.js";
import { Job, Milestone, Transaction, User, Notification } from "../../models/index.js";

export const payTransaction = asyncHandler(async (req, res) => {
    const { tId } = req.params;
    const userId = req.user.id;
    const { amount: reqAmount, transactionCode: reqCode, transactionUUID: reqUUID } = req.body;

    let amount, transactionCode, transactionUUID;

    amount = Math.round(typeof reqAmount === "string" ? Number(reqAmount.replace(/,/g, "")) : Number(reqAmount));
    transactionCode = (reqCode ?? "").trim();
    transactionUUID = (reqUUID ?? "").trim();

    if (!mongoose.isValidObjectId(tId)) {
        throw new ApiError(400, true, "Invalid transaction id");
    }

    if (!amount) {
        throw new ApiError(400, true, "Amount is required");
    }

    if (isNaN(amount)) {
        throw new ApiError(400, true, "Amount must be in number");
    }

    if (!transactionCode || !transactionUUID) {
        throw new ApiError(400, true, "Transaction details (code/uuid) are required");
    }

    const transaction = await Transaction.findOne({
        _id: tId,
        initiator: userId,
    });

    if (!transaction) {
        throw new ApiError(404, true, "Transaction not found");
    }

    if (transaction.status === "done") {
        throw new ApiError(400, true, "Transaction already done");
    }

    // Verify transaction details with eSewa
    try {
        const productCode = process.env.ESEWA_PRODUCT_CODE || "EPAYTEST";
        const verifyUrl = `${process.env.ESEWA_VERIFY_URL || "https://rc-epay.esewa.com.np/api/epay/transaction/status/"}?product_code=${productCode}&total_amount=${amount}&transaction_uuid=${transactionUUID}`;
        
        console.log('eSewa Verify Request:', {
            url: verifyUrl,
            amount,
            transactionUUID,
            productCode
        });
        
        // Use AbortController for timeout handling in Node.js fetch
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout
        
        try {
            const response = await fetch(verifyUrl, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
                signal: controller.signal
            });
            
            clearTimeout(timeoutId);
            
            if (!response.ok) {
                console.error(`eSewa verification failed: ${response.status} ${response.statusText}`);
                throw new ApiError(503, true, "Payment gateway is temporarily unavailable. Please try again later.");
            }
            
            const data = await response.json();
            console.log('eSewa Verify Response:', data);
            
            if (!data || data.status !== "COMPLETE") {
                console.error('Payment status not COMPLETE:', data?.status);
                throw new ApiError(400, true, "Payment verification failed. Please verify with eSewa and contact support if needed.");
            }
        } catch (fetchError) {
            clearTimeout(timeoutId);
            console.error('Fetch error details:', fetchError);
            throw fetchError;
        }
    } catch (error) {
        if (error instanceof ApiError) throw error;
        if (error.name === 'AbortError') {
            throw new ApiError(503, true, "Payment gateway request timed out. Please try again.");
        }
        console.error('eSewa verification error:', error);
        throw new ApiError(503, true, "Payment gateway service is temporarily unavailable. Your payment may still be processing. Please check your eSewa transaction status.");
    }

    const supportsMongoTransactions = () => {
        const topologyType = mongoose.connection?.client?.topology?.description?.type;
        return topologyType === "ReplicaSetWithPrimary" || topologyType === "Sharded";
    };

    let session = null;
    const useSession = supportsMongoTransactions();
    if (useSession) {
        try {
            session = await mongoose.startSession();
            session.startTransaction();
        } catch (err) {
            session = null;
        }
    }

    try {
        const job = await Job.findById(transaction.jobId);
        const receiver = await User.findById(transaction.receiver);
        if (transaction.purpose === "initial") {
            job.contract.initialPaymentDone = true;
            job.contract.initialPaymentAt = Date.now();
            job.contract.initialTransaction = transaction._id;
            job.contract.status = "active";
            job.contract.activatedAt = Date.now();
            job.status = "assigned";
            receiver.balance += amount;
        } else if (transaction.purpose === "milestone") {
            const milestone = await Milestone.findById(transaction.milestoneId);
            if (!milestone) {
                throw new ApiError(404, true, "Milestone not found for this transaction");
            }

            if (milestone.status !== "approved") {
                throw new ApiError(400, true, "Milestone must be approved before payment can be released");
            }

            milestone.paymentStatus = "released";
            milestone.paymentReleasedAt = Date.now();
            milestone.paymentTransaction = transaction._id;
            if (session) {
                await milestone.save({ session });
            } else {
                await milestone.save();
            }

            const projectMilestones = await Milestone.find({ projectId: job._id });
            const allReleased = projectMilestones.length > 0 && projectMilestones.every((item) => item.status === "approved" && item.paymentStatus === "released");
            if (allReleased) {
                job.status = "paid";
            }

            receiver.balance += amount;
        } else {
            job.payment.done = true;
            job.status = "paid";
            job.contract.finalTransaction = transaction._id;
            receiver.balance += amount;
        }
        transaction.status = "done";
        transaction.paymentStatus = "completed";
        transaction.paidTime = Date.now();
        transaction.transactionUUID = transactionUUID;
        transaction.transactionCode = transactionCode;
        transaction.transactionId = transactionCode;
        if (session) {
            await Promise.all([job.save({ session }), receiver.save({ session }), transaction.save({ session })]);
        } else {
            await Promise.all([job.save(), receiver.save(), transaction.save()]);
        }
        await sendNotification({
            receiverId: receiver._id,
            senderId: userId,
            projectId: job._id,
            title: transaction.purpose === "initial" ? "Contract Deposit Received" : "Payment Received",
            message: transaction.purpose === "initial"
                ? `You received the contract deposit of Rs. ${amount} for project "${job.title}"`
                : `You received a payment of Rs. ${amount} for project "${job.title}"`,
            type: "payment_received",
            link: `/transactions/${transaction._id}`
        });
        if (session) {
            await session.commitTransaction();
            session.endSession();
        }
    } catch (error) {
        if (session) {
            await session.abortTransaction();
            session.endSession();
        }
        console.error(error);
        throw new ApiError(500, true, error?.message || "Something went wrong");
    }

    const responsePayload = { transaction };
    if (transaction.purpose === "milestone") {
        // attempt to include the updated milestone in the response
        try {
            const updatedMilestone = await Milestone.findById(transaction.milestoneId);
            responsePayload.milestone = updatedMilestone;
        } catch (e) {
            // ignore
        }
    }

    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                true,
                true,
                "Job transaction paid",
                responsePayload,
            ),
        );
});
