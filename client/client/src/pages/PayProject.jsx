import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router";
import api from "../utils/api";
import { Button, Loader } from "../components";
import toast from "react-hot-toast";

function PayProject() {
    const { jobId } = useParams();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [txnData, setTxnData] = useState(null);
    const [esewaData, setEsewaData] = useState(null);

    useEffect(() => {
        const fetchTransaction = async () => {
            try {
                const response = await api.get(`/jobs/transaction/${jobId}`);
                setTxnData(response.data.data.transaction);
                setEsewaData(response.data.data.esewa);
            } catch (error) {
                toast.error(error.response?.data?.message || "Failed to initiate payment");
                navigate(`/jobs/${jobId}`);
            } finally {
                setLoading(false);
            }
        };

        fetchTransaction();
    }, [jobId, navigate]);

    const fields = esewaData ? {
        amount: esewaData.amount,
        tax_amount: "0",
        total_amount: esewaData.amount,
        transaction_uuid: esewaData.transaction_uuid,
        product_code: esewaData.product_code,
        product_service_charge: "0",
        product_delivery_charge: "0",
        success_url: `${window.location.origin}/jobs/${jobId}/pay/verify`,
        failure_url: `${window.location.origin}/jobs/${jobId}`,
        signed_field_names: "total_amount,transaction_uuid,product_code",
        signature: esewaData.signature,
    } : null;

    if (loading) return <Loader />;

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
            <div className="bg-white rounded-lg shadow-xl p-8 max-w-md w-full text-center">
                <img 
                    src="https://esewa.com.np/common/images/esewa_logo.png" 
                    alt="eSewa Logo" 
                    className="h-16 mx-auto mb-6"
                />
                <h2 className="text-2xl font-bold text-gray-800 mb-2">Checkout</h2>
                <p className="text-gray-600 mb-6">Complete your payment securely with eSewa.</p>
                
                <div className="bg-gray-50 rounded p-4 mb-6 border text-left flex flex-col gap-2">
                    <div className="flex justify-between border-b pb-2">
                        <span className="text-gray-600">Total Amount</span>
                        <span className="font-bold text-lg">Rs. {txnData?.amount}</span>
                    </div>
                </div>

                {txnData?.status === "done" ? (
                    <div className="text-center space-y-4">
                        <div className="mx-auto w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-600">
                            <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                        </div>
                        <h3 className="text-lg font-bold text-gray-900">Payment Already Completed</h3>
                        <p className="text-sm text-gray-500">This transaction was successfully settled.</p>
                        <Button
                            onClick={() => navigate(`/transactions/${txnData._id}`)}
                            variant="filled"
                            className="w-full mt-4 font-bold bg-primary border-primary"
                        >
                            View Receipt
                        </Button>
                    </div>
                ) : fields && (
                    <form action="https://rc-epay.esewa.com.np/api/epay/main/v2/form" method="POST">
                        {Object.entries(fields).map(([key, value]) => (
                            <input key={key} type="hidden" name={key} value={value} />
                        ))}
                        <Button 
                            type="submit"
                            variant="filled" 
                            className="w-full font-bold bg-[#60bb46] hover:bg-[#4d9f36] border-[#60bb46]"
                        >
                            Pay Rs. {txnData?.amount} with eSewa
                        </Button>
                    </form>
                )}
                
                <button 
                    onClick={() => navigate(`/jobs/${jobId}`)}
                    className="mt-4 text-gray-500 hover:text-gray-800 underline px-4 py-2"
                >
                    Cancel
                </button>
            </div>
        </div>
    );
}

export default PayProject;
