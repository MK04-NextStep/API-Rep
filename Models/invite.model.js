const mongoose = require('mongoose');

const inviteSchema = new mongoose.Schema({
    workspaceId: {
        type: mongoose.Types.ObjectId,
        required: true
    },
    invitedBy: {
        type: mongoose.Types.ObjectId,
        required: true
    },
    role: {
        type: String,
        default: "member"
    },
    otp: {
        type: String,
        required: true
    },
    expiresIn: {
        type: Date,
        required: true
    }
}, { timestamps: true })

inviteSchema.index({ workspaceId: 1 });
inviteSchema.index({ otp: 1, expiresIn: 1 });
inviteSchema.index({expiresIn: 1}, { expireAfterSeconds: 0 })

const Invite = mongoose.model(
    "Invite",
    inviteSchema
)

module.exports = Invite;