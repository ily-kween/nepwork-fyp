// ── MUST BE FIRST: Set DNS servers before nodemailer creates any internal resolver ──
import dns from "dns";
dns.setServers(['8.8.8.8', '8.8.4.4']);
// ──────────────────────────────────────────────────────────────────

// dns.setServers() globally changes the default DNS servers used by all internal
// dns.Resolver instances created after this point — including smtp-connection's.
import nodemailer from "nodemailer";
import tls from "tls";

// ── SMTP FIX ────────────────────────────────────────────────────────────────
// System DNS cannot resolve smtp.gmail.com on this machine (ETIMEOUT).
// We resolve the IP via Google DNS, then connect via a pre-built TLS socket
// so nodemailer's smtp-connection never needs to resolve any hostname itself.
const _resolver = new dns.Resolver();
_resolver.setServers(['8.8.8.8', '8.8.4.4']);

function resolveSmtpIp() {
    return new Promise((resolve, reject) => {
        _resolver.resolve4('smtp.gmail.com', (err, addresses) => {
            if (err) return reject(err);
            resolve(addresses[0]);
        });
    });
}
// ───────────────────────────────────────────────────────────────────────────

class Mail {
    constructor(senderAddress, password) {
        this.senderAddress = senderAddress;
        this.password = password;
    }

    welcomeMail = async function(to, firstName, lastName) {
        const ip = await resolveSmtpIp();
        const transporter = nodemailer.createTransport({
            host: ip,
            port: 465,
            secure: true,
            auth: { user: this.senderAddress, pass: this.password },
            tls: { servername: 'smtp.gmail.com' },
        });
        await transporter.sendMail({
            from: this.senderAddress, to,
            subject: "Welcome to Nepwork",
            text: `We warmly welcome you to Nepwork, ${firstName} ${lastName}`,
        });
    };

    otpMail = async function(to, otpCode) {
        const ip = await resolveSmtpIp();
        const transporter = nodemailer.createTransport({
            host: ip,
            port: 465,
            secure: true,
            auth: { user: this.senderAddress, pass: this.password },
            tls: { servername: 'smtp.gmail.com' },
        });
        return transporter.sendMail({
            from: this.senderAddress, to,
            subject: "OTP for Email verification",
            text: `Dear, ${to} your OTP for Email Verification is  ${otpCode}\n This OTP will expire after 5 minutes  `,
        });
    };
}

export const MailService = new Mail(
    process.env.EMAIL_ADDRESS,
    process.env.EMAIL_APP_PASSWORD,
);
