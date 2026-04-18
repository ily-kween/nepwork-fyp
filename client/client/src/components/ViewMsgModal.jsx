import React from "react";
import Button from "./Button";
import { FaTimes } from "react-icons/fa";

function ViewMsgModal({ message, setModalFn }) {
    return (
        <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="modal-title"
            aria-describedby="modal-description"
            className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm transition-opacity duration-300 flex items-center justify-center p-4 z-[1000]"
            onClick={() => setModalFn(false)}
        >
            <div
                className="bg-white rounded-xl shadow-xl w-full max-w-2xl mx-4 relative transform transition-all duration-300 scale-95 opacity-0 animate-modal-in"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="p-8">
                    {/* Modal Header */}
                    <div className="flex justify-between items-center mb-6">
                        <h2 
                            id="modal-title"
                            className="text-2xl font-semibold text-gray-800"
                        >
                            Freelancer Message
                        </h2>
                        <button
                            onClick={() => setModalFn(false)}
                            className="p-2 rounded-lg hover:bg-gray-50 transition-colors"
                            aria-label="Close modal"
                        >
                            <FaTimes className="w-6 h-6 text-gray-600" />
                        </button>
                    </div>

                    {/* Modal Content */}
                    <div className="space-y-6">
                        <div className="bg-gray-50 rounded-lg p-6">
                            <p 
                                id="modal-description"
                                className="text-gray-700 leading-relaxed whitespace-pre-wrap"
                            >
                                {message || (
                                    <span className="text-gray-400 italic">
                                        This applicant hasn't provided a message
                                    </span>
                                )}
                            </p>
                        </div>

                        <div className="flex justify-end space-x-4">
                            <Button
                                variant="outline"
                                onClick={() => setModalFn(false)}
                                className="px-6 py-3"
                            >
                                Close
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default ViewMsgModal;
