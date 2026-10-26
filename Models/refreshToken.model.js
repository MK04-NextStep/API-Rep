const mongoose = require('mongoose');

const refreshTokenSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Types.ObjectId,
        required: true,
        ref: "User"
    },
    token: {
        type: String,
        required: true
    },
    expiresIn: {
        type: Date,
        required: true
    },
    
})

refreshTokenSchema.index({ userId: 1 });
refreshTokenSchema.index({ token: 1 });
refreshTokenSchema.index({expiresIn: 1}, { expireAfterSeconds: 0 })

const Token = mongoose.model(
    "Token",
    refreshTokenSchema
)

module.exports = Token;