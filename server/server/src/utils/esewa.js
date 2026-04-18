import crypto from "crypto";

export const generateEsewaSignature = (total_amount, transaction_uuid, product_code) => {
    const secretKey = process.env.ESEWA_SECRET_KEY || "8gBm/:&EnhH.1/q";
    const roundedAmount = Math.round(total_amount);
    const data = `total_amount=${roundedAmount},transaction_uuid=${transaction_uuid},product_code=${product_code}`;
    const hash = crypto.createHmac("sha256", secretKey).update(data).digest("base64");
    return hash;
};
