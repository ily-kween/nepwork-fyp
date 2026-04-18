import React, { useState, useRef, useEffect } from "react";
import Button from "./Button";
import api from "../utils/api";
import toast from "react-hot-toast";
import { useNavigate } from "react-router";
function EnterEmailOtp({ email, setShowOtpModal }) {
    const navigate = useNavigate();
    const [otp, setOtp] = useState(new Array(6).fill(""));
    const inputNames = ["one", "two", "three", "four", "five", "six"];

    const [errMsg, setErrMsg] = useState(null);

    const inputRefs = useRef([]);

    const handleInputChange = (e, i) => {
        const value = e.target.value.trim();
        if (!isNaN(value)) {
            const newOtp = [...otp];
            newOtp[i] = value.substring(value.length - 1);
            setOtp(newOtp);

            if (value && i < 5 && inputRefs.current[i]) {
                inputRefs.current[i + 1].focus();
            }
        }
    };

    const onInputClick = (i) => {
        inputRefs.current[i].setSelectionRange(1, 1);
    };

    const handleKeyDown = (e, i) => {
        if (
            e.key === "Backspace" &&
            !otp[i] &&
            i > 0 &&
            inputRefs.current[i - 1]
        ) {
            inputRefs.current[i - 1].focus();
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        const payload = {
            email: email,
            otpCode: otp.join(""),
        };
        if (payload.otpCode.length != 6) {
            setErrMsg("Otp is required");
            return;
        }
        setErrMsg(null);

        api.post("/user/verify-email", payload)
            .then((res) => {
                if (res.data.success) {
                    toast.success("Email verified");
                    navigate("/settings");
                }
            })
            .catch((err) => {
                setErrMsg(err.response.data.message)
            });
    };

    useEffect(() => {
        if (inputRefs.current[0]) {
            inputRefs.current[0].focus();
        }
    }, []);

    return (
        <div className="fixed inset-0 z-50  w-full h-full bg-black bg-opacity-50 flex items-center justify-center">
            <div className="bg-white p-4 rounded-md shadow-md w-[320px] min-h-[200px] tablet:w-[450px]">
                <form onSubmit={handleSubmit}>
                    <h2 className="text-lg tablet:text-2xl font-bold text-center">
                        Enter OTP sent to {email.slice(0, 2)}
                        *****
                        {email.slice(length - 4)}
                    </h2>
                    <div
                        id="otpInputs"
                        className="mt-6 w-full flex justify-evenly items-center"
                    >
                        {otp.map((value, i) => {
                            return (
                                <input
                                    type="text"
                                    ref={(field) =>
                                        (inputRefs.current[i] = field)
                                    }
                                    key={i}
                                    name={inputNames[i]}
                                    className="w-[40px] h-[40px] tablet:w-[60px] tablet:h-[60px] border border-primary rounded-lg text-xl text-center"
                                    value={value}
                                    onChange={(e) => handleInputChange(e, i)}
                                    onClick={() => onInputClick(i)}
                                    onKeyDown={(e) => handleKeyDown(e, i)}
                                />
                            );
                        })}
                    </div>
                    <div className="h-4">
                    {errMsg && (
                        <p className="text-red-500 text-center mt-1">
                            {errMsg}
                        </p>
                    )}
                    </div>
                    <div className="flex justify-evenly mt-6 gap-x-2">
                        <Button variant="filled" type="submit">
                            Submit
                        </Button>
                        <Button
                            onClick={() => setShowOtpModal(false)}
                            variant="outline"
                        >
                            Cancel
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default EnterEmailOtp;
