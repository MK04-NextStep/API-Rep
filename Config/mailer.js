const { Resend } = require('resend');
require('dotenv').config()

const resend = new Resend(process.env.RESEND_API);

const sendEmail = async ( to, subject, html ) => {
    let send = await resend.emails.send({
        from: process.env.EMAIL_FROM,
        to: to,
        subject: subject,
        html: html
    });

    return send;
}

module.exports = sendEmail;