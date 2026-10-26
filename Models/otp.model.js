const mongoose = require('mongoose');

const otpSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        ref: "User"
    },
    otp: {
        type: String,
        required: true,
        unique: true
    },
    expiresIn: {
        type: Date,
        required: true
    },
    type: {
        type: String,
        enum: ["reset", "verify", "invite"],
        default: "reset"
    },
    lastOtpSend: {
        type: Date,
        required: true
    }
}, { timestamps: true})

otpSchema.index({otp: 1, type: 1})
otpSchema.index({email: 1, otp: 1, type: 1})
otpSchema.index({expiresIn: 1}, {expireAfterSeconds: 0})

let OTP = mongoose.model(
    "OTP",
    otpSchema
)

module.exports = OTP;