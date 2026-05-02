import React, { useEffect, useState } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router";
import api from "../utils/api";
import { Loader } from "../components";
import toast from "react-hot-toast";

function VerifyPayment() {
    const { jobId, milestoneId } = useParams();
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const [verifying, setVerifying] = useState(true);
    const fallbackJobIdRaw = searchParams.get("jobId") || jobId;
    // If `jobId` was passed with an embedded query string (some gateways append
    // `?data=...` to the jobId value) extract the pure id for navigation and
    // leave the raw for possible data extraction.
    const fallbackJobId = typeof fallbackJobIdRaw === "string" && fallbackJobIdRaw.includes("?data=")
        ? fallbackJobIdRaw.split("?data=")[0]
        : fallbackJobIdRaw;

    useEffect(() => {
        const verify = async () => {
            let dataQuery = searchParams.get("data");
            // Some gateways (or redirects) may embed the `data` param inside the
            // `jobId` value (e.g. jobId=123?data=...), so if `data` is missing try
            // to extract it from the raw fallbackJobId value.
            if (!dataQuery && typeof fallbackJobIdRaw === "string" && fallbackJobIdRaw.includes("?data=")) {
                dataQuery = fallbackJobIdRaw.split("?data=")[1] || null;
            }
            console.log("VerifyPayment - Raw query params:", {
                data: dataQuery,
                jobId,
                milestoneId,
                fallbackJobIdRaw,
                fallbackJobId
            });

            if (!dataQuery) {
                toast.error("Invalid verification request.");
                return navigate(fallbackJobId ? `/jobs/${fallbackJobId}` : "/dashboard");
            }

            try {
                const decodedData = JSON.parse(atob(dataQuery));
                console.log("VerifyPayment - Decoded data:", decodedData);
                
                // Extract transaction ID from UUID (format: {transactionId}-{randomCode})
                const originalTxnId = decodedData.transaction_uuid?.split('-')[0];
                
                console.log("VerifyPayment - Extracted txn ID:", originalTxnId);
                
                if (!originalTxnId || !decodedData.transaction_uuid) {
                    toast.error("Invalid transaction data received.");
                    return navigate(fallbackJobId ? `/jobs/${fallbackJobId}` : "/dashboard");
                }
                
                console.log("VerifyPayment - Sending payment request:", {
                    txnId: originalTxnId,
                    transactionCode: decodedData.transaction_code,
                    transactionUUID: decodedData.transaction_uuid,
                    amount: decodedData.total_amount
                });

                await api.post(`/jobs/transaction/${originalTxnId}/pay`, {
                    transactionCode: decodedData.transaction_code,
                    transactionUUID: decodedData.transaction_uuid,
                    amount: decodedData.total_amount
                });
                toast.success("Payment successful!");
                navigate(`/transactions/${originalTxnId}`);
            } catch (error) {
                let errorMsg = "Payment verification failed. ";
                
                console.error("VerifyPayment - Error details:", {
                    message: error.message,
                    status: error.response?.status,
                    data: error.response?.data
                });
                
                if (error.response?.data?.message) {
                    errorMsg += error.response.data.message;
                } else if (error.message === "Network Error" || !error.response) {
                    errorMsg = "Service is currently unavailable. Payment may still be processing. Please check your transaction status later.";
                } else if (error.response?.status >= 500) {
                    errorMsg = "Server error during verification. Payment may still have been processed. Please check your account.";
                } else {
                    errorMsg += "Please try again or contact support.";
                }
                
                toast.error(errorMsg);
                console.error("Payment Error:", error.response?.data || error.message);
                navigate(fallbackJobId ? `/jobs/${fallbackJobId}` : "/dashboard");
            } finally {
                setVerifying(false);
            }
        };

        verify();
    }, [jobId, milestoneId, searchParams, navigate, fallbackJobId]);

    if(verifying) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen">
                <Loader />
                <h2 className="mt-4 text-xl font-bold">Verifying your payment...</h2>
                <p className="text-gray-500">Please don't close this window.</p>
            </div>
        );
    }
    return null;
}

export default VerifyPayment;
