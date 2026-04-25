import { isValidObjectId } from "mongoose";
import { Transaction } from "../../models/index.js";
import { ApiError, ApiResponse, asyncHandler } from "../../utils/index.js";

const buildTransactionFilter = (userId, query) => {
    const {
        status,
        purpose,
        startDate,
        endDate,
        minAmount,
        maxAmount,
    } = query;

    const dbFilter = {
        $or: [{ initiator: userId }, { receiver: userId }],
    };

    if (status && status !== "all") {
        const statuses = String(status)
            .split(",")
            .map((item) => item.trim())
            .filter(Boolean);

        if (statuses.length > 0) {
            dbFilter.paymentStatus = statuses.length === 1 ? statuses[0] : { $in: statuses };
        }
    } else {
        dbFilter.status = "done";
    }

    if (purpose && purpose !== "all") {
        const purposes = String(purpose)
            .split(",")
            .map((item) => item.trim())
            .filter(Boolean);

        if (purposes.length > 0) {
            dbFilter.purpose = purposes.length === 1 ? purposes[0] : { $in: purposes };
        }
    }

    const parsedMin = Number(minAmount);
    const parsedMax = Number(maxAmount);
    if (!Number.isNaN(parsedMin) || !Number.isNaN(parsedMax)) {
        dbFilter.amount = {};
        if (!Number.isNaN(parsedMin)) {
            dbFilter.amount.$gte = parsedMin;
        }
        if (!Number.isNaN(parsedMax)) {
            dbFilter.amount.$lte = parsedMax;
        }
    }

    if (startDate || endDate) {
        dbFilter.createdAt = {};
        if (startDate) {
            const parsedStart = new Date(startDate);
            if (!Number.isNaN(parsedStart.getTime())) {
                dbFilter.createdAt.$gte = parsedStart;
            }
        }
        if (endDate) {
            const parsedEnd = new Date(endDate);
            if (!Number.isNaN(parsedEnd.getTime())) {
                parsedEnd.setHours(23, 59, 59, 999);
                dbFilter.createdAt.$lte = parsedEnd;
            }
        }
        if (Object.keys(dbFilter.createdAt).length === 0) {
            delete dbFilter.createdAt;
        }
    }

    return dbFilter;
};

export const getAllTransaction = asyncHandler(async (req, res) => {
    const userId = req.user.id;

    const dbFilter = buildTransactionFilter(userId, req.query);

    const transactions = await Transaction.find(dbFilter)
        .sort({ createdAt: -1 })
        .populate("jobId", "title payment _id")
        .populate("milestoneId", "title amount status _id")
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

    const dbFilter = buildTransactionFilter(userId, req.query);
    const parsedLimit = Number(req.query.limit);
    const limit = Number.isNaN(parsedLimit) ? 5 : Math.max(1, Math.min(parsedLimit, 50));

    const transactions = await Transaction.find(dbFilter)
        .sort({ createdAt: -1 })
        .limit(limit)
        .populate("jobId", "title payment _id")
        .populate("milestoneId", "title amount status _id")
        .populate("receiver", "name _id")
        .populate("initiator", "name _id");

    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                true,
                true,
                "Fetched recent transactions",
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
        .populate("jobId", "title _id")
        .populate("milestoneId", "title amount status _id");

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
