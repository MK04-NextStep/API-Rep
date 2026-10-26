const crypto = require('crypto');

const generateOtp = () => {
    let otp = crypto.randomInt(100000, 999999).toString();
    let hashedOtp = crypto.createHash('sha256').update(otp).digest('hex');
    return {otp, hashedOtp}
}

module.exports = generateOtp;