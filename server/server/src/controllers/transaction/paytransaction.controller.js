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
        const totalAmountStr = typeof reqAmount === "string" ? reqAmount : amount;
        const verifyUrl = `${process.env.ESEWA_VERIFY_URL || "https://rc-epay.esewa.com.np/api/epay/transaction/status/"}?product_code=${productCode}&total_amount=${totalAmountStr}&transaction_uuid=${transactionUUID}`;
        
        const response = await fetch(verifyUrl, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
            timeout: 10000 // 10 second timeout
        });
        
        if (!response.ok) {
            console.error(`eSewa verification failed: ${response.status} ${response.statusText}`);
            throw new ApiError(503, true, "Payment gateway is temporarily unavailable. Please try again later.");
        }
        
        const data = await response.json();
        
        if (!data || data.status !== "COMPLETE") {
            throw new ApiError(400, true, "Payment verification failed. Please verify with eSewa and contact support if needed.");
        }
    } catch (error) {
        if (error instanceof ApiError) throw error;
        if (error.name === 'AbortError' || error.message.includes('timeout')) {
            throw new ApiError(503, true, "Payment gateway request timed out. Please try again.");
        }
        console.error('eSewa verification error:', error);
        throw new ApiError(503, true, "Payment gateway service is temporarily unavailable. Your payment may still be processing. Please check your eSewa transaction status.");
    }

    const session = await mongoose.startSession();
    session.startTransaction();

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
            await milestone.save();

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
        await Promise.all([job.save(), receiver.save(), transaction.save()]);
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
        await session.commitTransaction();
        session.endSession();
    } catch (error) {
        await session.abortTransaction();
        session.endSession();
        console.error(error);
        throw new ApiError(500, true, "Something went wrong");
    }

    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                true,
                true,
                "Job transaction paid",
                transaction,
            ),
        );
});
