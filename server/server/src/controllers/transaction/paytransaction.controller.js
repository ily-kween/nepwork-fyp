import mongoose from "mongoose";
import { ApiError, ApiResponse, asyncHandler, sendNotification } from "../../utils/index.js";
import { Job, Transaction, User, Notification } from "../../models/index.js";

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
        const response = await fetch(verifyUrl);
        const data = await response.json();
        
        if (data.status !== "COMPLETE") {
            throw new ApiError(400, true, "Payment verification failed with eSewa");
        }
    } catch (error) {
        if (error instanceof ApiError) throw error;
        throw new ApiError(500, true, "Failed to verify transaction with payment gateway");
    }

    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const job = await Job.findById(transaction.jobId);
        const receiver = await User.findById(transaction.receiver);
        job.payment.done = true;
        job.status = "paid";
        receiver.balance += amount;
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
            title: "Payment Received",
            message: `You received a payment of Rs. ${amount} for project "${job.title}"`,
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
