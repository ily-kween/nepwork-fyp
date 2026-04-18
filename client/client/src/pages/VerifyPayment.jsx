import React, { useEffect, useState } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router";
import api from "../utils/api";
import { Loader } from "../components";
import toast from "react-hot-toast";

function VerifyPayment() {
    const { jobId } = useParams();
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const [verifying, setVerifying] = useState(true);

    useEffect(() => {
        const verify = async () => {
            const dataQuery = searchParams.get("data");
            if (!dataQuery) {
                toast.error("Invalid verification request.");
                return navigate(`/jobs/${jobId}`);
            }

            try {
                const decodedData = JSON.parse(atob(dataQuery));
                const originalTxnId = decodedData.transaction_uuid.split('-')[0];
                
                await api.post(`/jobs/transaction/${originalTxnId}/pay`, {
                    transactionCode: decodedData.transaction_code,
                    transactionUUID: decodedData.transaction_uuid,
                    amount: decodedData.total_amount
                });
                toast.success("Payment successful!");
                navigate(`/transactions/${originalTxnId}`);
            } catch (error) {
                const apiMsg = error.response?.data?.message || "Payment verification failed.";
                toast.error(apiMsg);
                console.error("Payment Error:", error.response?.data || error.message);
                navigate(`/jobs/${jobId}`);
            } finally {
                setVerifying(false);
            }
        };

        verify();
    }, [jobId, searchParams, navigate]);

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
