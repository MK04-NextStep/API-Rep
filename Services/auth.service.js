const bcrypt = require('bcrypt');
const crypto = require('crypto');
const ConflictError = require('../Errors/ConflictError');
const NotFoundError = require('../Errors/NotFoundError');
const ForbiddenError = require('../Errors/ForbiddenError')
const UnauthorizedError = require('../Errors/UnauthorizedError');
const UserRepository = require('../Repositories/user.repository');
const TokenRepository = require('../Repositories/token.repository');
const OtpRepository = require('../Repositories/otp.repository');
const generateAccessToken = require('../Utils/generateAccessToken');
const generateRefreshToken = require('../Utils/generateRefreshToken');
const generateOtp = require('../Utils/generateOtp');
const verifyRefreshToken = require('../Utils/verifyRefreshToken');
const logger = require('../Config/logger')
const cloudinary = require('../Config/cloudinary')
const sendEmail = require('../Config/mailer')
const { addEmailQueue, addPasswordQueue } = require('../Queues/email.queue')
const addFileQueue = require('../Queues/file.queue')

const registerService = async (data) => {
    let result = "";
    if (data.path) {
        result = await cloudinary.uploader.upload(data.path);
        newData.profilePic.url = result.secure_url;
        newData.profilePic.publiId = result.public_id
    }
    try {
        let existUser = await UserRepository.findByEmail(data.email);

        if (existUser) {
            throw new ConflictError("User already existed");
        }
        let hasPass = await bcrypt.hash(data.password, 10);

        let newData = {
            name: data.name,
            email: data.email,
            password: hasPass
        }

        let newUser = await UserRepository.createUser(newData);

        logger.info("Audit Event", {
            action: "REGISTER_USER",
            userId: newUser._id
        })
        return newUser;
    } catch (err) {
        if (data.path) {
            await cloudinary.uploader.destroy(result.publicId)
        }
        throw err
    }
}

const loginService = async (email, password) => {
    let existUser = await UserRepository.findByEmail(email);
    if (!existUser) {
        throw new NotFoundError("user not found");
    }

    if (existUser.lockedUntil && existUser.lockedUntil.getTime() > Date.now()) {
        throw new UnauthorizedError("cant login now")
    }

    let comparePass = await bcrypt.compare(password, existUser.password);
    if (!comparePass) {
        let attemps = await UserRepository.failedAttemps(existUser._id);
        if (attemps >= 3) {
            await UserRepository.locked(existUser._id);
        }
        throw new UnauthorizedError("Invalid Email or password");
    }

    if (!existUser.isEmailVerified) {
        throw new ForbiddenError("Verify your email");
    }

    let accessToken = generateAccessToken(existUser._id);
    let refreshToken = generateRefreshToken(existUser._id);

    let hashToken = await bcrypt.hash(refreshToken, 10);

    let data = {
        userId: existUser._id,
        token: hashToken,
        expiresIn: Date.now() + 5 * 24 * 60 * 60 * 1000
    }
    let newToken = await TokenRepository.create(data);

    logger.info("Audit Event", {
        action: "LOGIN_USER",
        userId: existUser._id
    })

    await UserRepository.reset(existUser._id);

    return { existUser, accessToken, refreshToken };
}

const logoutService = async (refreshToken) => {
    let verifyToken = await verifyRefreshToken(refreshToken);

    let tokens = await TokenRepository.findByUserId(verifyToken.id);
    if (tokens.length <= 0) {
        throw new UnauthorizedError("Invalid token");
    }

    for (let token of tokens) {
        let verify = await bcrypt.compare(refreshToken, token.token);
        if (verify) {
            let deletedToken = await TokenRepository.deleteByToken(token.token);
            break;
        }
    }
    return true;
}

const refreshTokenCycleService = async (refreshToken) => {
    let verifytoken = await verifyRefreshToken(refreshToken);
    let accessToken = generateAccessToken(verifytoken.userId);

    return accessToken;
}

const sendVerifyEmailService = async (email) => {
    let existUser = await UserRepository.findByEmail(email);
    if (!existUser) {
        throw new NotFoundError("Invalid Email");
    }
    if (existUser.isEmailVerified) {
        return "Email already verified"
    }

    let existOtp = await OtpRepository.findOtp(email, "verify");
    if (existOtp && Date.now() - existOtp.lastOtpSend < 60 * 1000) {
        throw new ConflictError("Please try after sometime")
    }

    await OtpRepository.deleteMany(email, "verify");

    let { otp, hashedOtp } = generateOtp();

    let data = {
        email,
        otp: hashedOtp,
        type: "verify",
        expiresIn: Date.now() + 5 * 60 * 1000,
        lastOtpSend: Date.now()
    }
    await OtpRepository.create(data)

    await addEmailQueue(email, otp)
    logger.info("Audit Event", {
        action: "SEND_VERIFY_EMAIL",
        userId: existUser._id
    })

    return "Otp has been send to your Email"
}

const verifyEmailOtpService = async (email, otp) => {
    let hashedOtp = crypto.createHash('sha256').update(otp).digest('hex');
    let existOtp = await OtpRepository.findValidOtp(
        email, hashedOtp, "verify"
    )
    if (!existOtp) {
        throw new NotFoundError("otp expires or invalid otp");
    }
    let existUser = await UserRepository.findByEmail(email);
    if (!existUser) {
        throw new NotFoundError("user not found");
    }
    await UserRepository.userVerified(email);
    await OtpRepository.deleteMany(email, "verify");

    logger.info("Audit Event", {
        action: "USER_VERIFIED",
        userId: existUser._id
    })
    return "Email verified Successfully"
}

const forgotPasswordService = async (email) => {
    let existUser = await UserRepository.findByEmail(email);
    if (!existUser) {
        throw new NotFoundError("Invalid Email");
    }
    let existOtp = await OtpRepository.findOtp(email, "reset");
    if (existOtp && Date.now() - existOtp.lastOtpSend < 60 * 1000) {
        throw new ConflictError("Please try after sometime")
    }
    await OtpRepository.deleteMany(email, "reset");
    let { otp, hashedOtp } = generateOtp();
    let data = {
        email, otp: hashedOtp, expiresIn: Date.now() + 5 * 60 * 1000,
        type: "reset", lastOtpSend: Date.now()
    }
    await OtpRepository.create(data);
    await addPasswordQueue(email, otp);
    logger.info("Audit Event", {
        action: "FORGOT_PASSWORD",
        userId: existUser._id
    })
    return "OTP send successfully"
}

const resetPasswordService = async (email, password, otp) => {
    let existUser = await UserRepository.findByEmail(email);
    if (!existUser) {
        throw new NotFoundError("Invalid Credentials")
    }
    let hashOtp = crypto.createHash('sha256').update(otp).digest("hex");
    let existOtp = await OtpRepository.findValidOtp(
        email, hashOtp, "reset"
    )
    if (!existOtp) {
        throw new UnauthorizedError("Invalid Otp");
    }
    let hashPass = await bcrypt.hash(password, 10);
    await UserRepository.userResetPassword(email, hashPass);
    OtpRepository.deleteMany(email, "reset");
    logger.info("Audit Event", {
        action: "RESET_PASSWORD",
        userId: existUser._id
    })
    return "Password Reset Successfully"
}

const updateProfilePicService = async (userId, file) => {
    let user = await UserRepository.findById(userId);
    let oldPhoto = user.profilePic?.publicId
    let result = await cloudinary.uploader.upload(file.path);

    try {
        await UserRepository.profilePicUpdate(userId, result.secure_url, result.public_id);
    } catch (err) {
        await addFileQueue(result.public_id)
        throw err
    }
    if (oldPhoto) {
       await addFileQueue(oldPhoto)
    }
    return;
}

module.exports = {
    registerService,
    loginService,
    logoutService,
    refreshTokenCycleService,
    sendVerifyEmailService,
    verifyEmailOtpService,
    forgotPasswordService,
    resetPasswordService,
    updateProfilePicService
}