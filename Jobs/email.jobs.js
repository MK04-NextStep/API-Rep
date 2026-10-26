const sendEmail = require("../Config/mailer");

const verifyEmail = async (job) => {
    const { email, otp } = job.data;
    await sendEmail(email, "Verify Email",
        `<h3>Verify Your Email </h3>
        <b><h1>${otp}</h1><b>
        <p>It will expires in 1 minutes </p>`
    )
}

const inviteEmail = async (job) => {
    const { email, name, otp } = job.data;
    await sendEmail(email, `Invite to ${name} workspace`,
        `<h3>Invite to ${name} Workspace</h3>
        <h1>${otp}</h1>
        <p>expires in 5 minutes </p>`
    )
}

const passwordEmail = async (job) => {
    let { email, otp } = job.data;
    await sendEmail(email, "Reset Password",
        `<h3>Reset Password</h3>
        <h1>${otp}</h1>
        <p>OTP will expires in 5 minutes</p>`
    )
}

module.exports = {
    verifyEmail,
    inviteEmail,
    passwordEmail
}