const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        minlength: 3,
        trim: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true
    },
    password: {
        type: String,
        required: true,
        select: false
    },
    isEmailVerified: {
        type: Boolean,
        default: false
    },
    profilePic: {
        url: String,
        publicId: String
    },
    failedAttemps: {
        type: Number,
        default: 0
    },
    lockedUntil: {
        type: Date,
        default: null
    }
}, { timestamps: true })

let userModel = mongoose.model(
    "User",
    userSchema
)

module.exports = userModel;