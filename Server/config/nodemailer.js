import nodemailer from 'nodemailer'

let transporter;

// Try SMTP first, fallback to API
if (process.env.SMTP_USER && process.env.SMTP_PASS) {
    transporter = nodemailer.createTransport({
        host: 'smtp-relay.brevo.com',
        port: 587,
        secure: false,
        auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS,
        },
        connectionTimeout: 10000,
        socketTimeout: 10000,
    });
} else {
    // Fallback: Use Brevo REST API via nodemailer
    transporter = nodemailer.createTransport({
        host: 'api.brevo.com',
        port: 465,
        secure: true,
        auth: {
            user: 'apikey',
            pass: process.env.BREVO_API_KEY || process.env.SMTP_PASS,
        },
    });
}

export default transporter;