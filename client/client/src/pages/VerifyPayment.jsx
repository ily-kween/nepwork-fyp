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
    const fallbackJobId = searchParams.get("jobId") || jobId;

    useEffect(() => {
        const verify = async () => {
            const dataQuery = searchParams.get("data");
            if (!dataQuery) {
                toast.error("Invalid verification request.");
                return navigate(fallbackJobId ? `/jobs/${fallbackJobId}` : "/dashboard");
            }

            try {
                const decodedData = JSON.parse(atob(dataQuery));
                // Extract transaction ID from UUID (format: {transactionId}-{randomCode})
                const originalTxnId = decodedData.transaction_uuid?.split('-')[0];
                
                if (!originalTxnId || !decodedData.transaction_uuid) {
                    toast.error("Invalid transaction data received.");
                    return navigate(fallbackJobId ? `/jobs/${fallbackJobId}` : "/dashboard");
                }
                
                await api.post(`/jobs/transaction/${originalTxnId}/pay`, {
                    transactionCode: decodedData.transaction_code,
                    transactionUUID: decodedData.transaction_uuid,
                    amount: decodedData.total_amount
                });
                toast.success("Payment successful!");
                navigate(`/transactions/${originalTxnId}`);
            } catch (error) {
                let errorMsg = "Payment verification failed. ";
                
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
