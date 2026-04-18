import crypto from "crypto";

const secretKey = "8gBm/:&EnhH.1/q";
const total_amount = "17";
const transaction_uuid = "69b2d924ba99815e7bb9f4c4";
const product_code = "EPAYTEST";

const data = `total_amount=${total_amount},transaction_uuid=${transaction_uuid},product_code=${product_code}`;
const signature = crypto.createHmac("sha256", secretKey).update(data).digest("base64");

console.log("Generated Signature:", signature);
console.log("User Signature:", "EIj79gehPJZHyzj1nn496earTH04icPTpbJHvm7+HBY=");
