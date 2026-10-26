const OTP = require('../Models/otp.model');

const findOtp = async (email, type) => {
    let existOtp = await OTP.find({
        email,
        type
    }).select("lastOtpSend").lean()
    return existOtp;
}

const deleteMany = async(email,type) => {
    let deletedOtps = await OTP.deleteMany({
        email,
        type
    })
    return deletedOtps
}

const create = async(data) => {
    let newOtp = await OTP.create(data);
    return newOtp
}

const findValidOtp = async(email, otp, type) => {
    let existOtp = await OTP.exists({
        email,
        otp,
        type,
        expiresIn: { $gt: new Date() }
    }).lean()
    return existOtp
}

const deleteExpiredOtp = async() => {
    await OTP.deleteMany({
        expiresIn: { $lte: new Date()}
    })
}

module.exports = {
    findOtp,
    deleteMany,
    create,
    findValidOtp,
    deleteExpiredOtp
}