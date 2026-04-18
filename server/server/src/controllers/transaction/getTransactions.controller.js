import { isValidObjectId } from "mongoose";
import { Transaction } from "../../models/index.js";
import { ApiError, ApiResponse, asyncHandler } from "../../utils/index.js";

export const getAllTransaction = asyncHandler(async (req, res) => {
    const userId = req.user.id;

    const transactions = await Transaction.find({
        $or: [{ initiator: userId }, { receiver: userId }],
        status: "done",
    })
        .sort({ createdAt: -1 })
        .populate("jobId", "title payment _id")
        .populate("receiver", "name _id")
        .populate("initiator", "name _id");

    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                true,
                true,
                "Fetched all transactions",
                transactions,
            ),
        );
});

export const getRecentTransaction = asyncHandler(async (req, res) => {
    const userId = req.user.id;

    const transactions = await Transaction.find({
        $or: [{ initiator: userId }, { receiver: userId }],
        status: "done",
    })
        .sort({ createdAt: -1 })
        .limit(5)
        .populate("jobId", "title payment _id")
        .populate("receiver", "name _id")
        .populate("initiator", "name _id");

    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                true,
                true,
                "Fetched 5 recent transaction",
                transactions,
            ),
        );
});

export const getSingleTransaction = asyncHandler(async (req, res) => {
    const { tId } = req.params;
    const userId = req.user.id;

    if (!isValidObjectId(tId)) {
        throw new ApiError(400, true, "Invalid transaction id");
    }

    const transaction = await Transaction.findOne({
        _id: tId,
        $or: [{ initiator: userId }, { receiver: userId }],
    })
        .populate("receiver", "name _id avatar")
        .populate("initiator", "name _id avatar")
        .populate("jobId", "title _id");

    if (!transaction) {
        throw new ApiError(404, true, "Transaction not found");
    }

    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                true,
                true,
                "Fetched transaction detail",
                transaction,
            ),
        );
});
