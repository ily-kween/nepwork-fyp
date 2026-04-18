import dotenv from "dotenv/config";
import { MailService } from "../src/utils/MailHandler.js";

console.log("Attempting to send OTP mail using MailService...");
MailService.otpMail("workswithbibek@gmail.com", "123456")
    .then((info) => {
        console.log("Mail sent successfully:", info.response);
    })
    .catch((err) => {
        console.error("Failed to send mail:", err);
    });
