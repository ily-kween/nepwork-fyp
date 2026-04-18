import nodemailer from "nodemailer";
import dns from "dns";
import dotenv from "dotenv";
dotenv.config();

dns.setServers(['8.8.8.8']);

const transporter = nodemailer.createTransport({
    host: "192.178.211.109",
    port: 465,
    secure: true, // true for 465, false for other ports
    auth: {
        user: process.env.EMAIL_ADDRESS,
        pass: process.env.EMAIL_APP_PASSWORD,
    },
    tls: {
        rejectUnauthorized: false
    }
});

const mailOptions = {
    from: process.env.EMAIL_ADDRESS,
    to: "workswithbibek@gmail.com",
    subject: "Test Mail",
    text: "This is a test mail from Nepwork Server",
};

console.log("Attempting to send mail...");
transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
        console.error("Error occurred:", error);
    } else {
        console.log("Email sent:", info.response);
    }
});
