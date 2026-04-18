import Button from "./Button";

function ConfirmModal({
    setShowModalFn,
    onConfirmFn,
    loading,
    title,
    isDelete = false,
    err,
}) {
    const handleConfirm = () => {
        onConfirmFn();
    };

    return (
        <div
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
            onClick={() => !loading && setShowModalFn(false)}
            role="dialog"
            aria-modal="true"
        >
            <div
                className="bg-white rounded-xl shadow-lg w-full max-w-md p-6 mx-4"
                onClick={(e) => e.stopPropagation()}
            >
                <h3 className="text-xl font-semibold text-gray-800 mb-4">
                    {title}
                </h3>

                {err && (
                    <div className="mb-4 p-3 bg-red-50 text-red-600 text-sm rounded-lg text-center">
                        {err || "An error occurred. Please try again."}
                    </div>
                )}

                <div className="flex justify-end space-x-4">
                    <Button
                        onClick={() => !loading && setShowModalFn(false)}
                        disabled={loading}
                        type="button"
                        aria-label="Cancel"
                    >
                        Cancel
                    </Button>
                    <Button
                        onClick={handleConfirm}
                        disabled={loading}
                        loading={loading}
                        variant="filled"
                        className={`${isDelete ? "bg-red-500 border-red-500" : ""}`}
                        type="button"
                        aria-label={isDelete ? "Confirm deletion" : "Confirm"}
                    >
                        {loading ? "Confirming" : "Confirm"}
                    </Button>
                </div>
            </div>
        </div>
    );
}

export default ConfirmModal;
