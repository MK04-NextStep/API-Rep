const UnauthorizedError = require('../Errors/UnauthorizedError');
const deleteLocalFile = require('../Utils/file.utils');
const ValidationError = require('../Errors/ValidationError')
const {fileTypeFromFile} = require('file-type')

const { registerService,
    loginService,
    logoutService,
    refreshTokenCycleService,
    sendVerifyEmailService,
    verifyEmailOtpService,
    forgotPasswordService,
    resetPasswordService, updateProfilePicService
} = require('../Services/auth.service');

const register = async (req, res, next) => {
    const allowedImageMimeTypes = ["image/png", "image/jpg", "image/jpeg", "image/webp"];
    try {
        let { name, email, password } = req.body;
        email = email.trim().toLowerCase();
        let data = name ?
            { name, email, password } :
            { email, password }
        if (req.file) {
            const type = await fileTypeFromFile(req.file.path);
            const validActualType = type && allowedImageMimeTypes.includes(type.mime);
            if (!validActualType) {
                return next(new ValidationError("invalid file"))
            }
            data.path = req.file.path;
        }
        let userData = await registerService(data);

        if (req.file) {
            await deleteLocalFile(req.file.path);

        }
        res.json({
            success: true,
            message: "User Register Successfully. Verify Your Email"
        })
    } catch (error) {
        if (req.file?.path) {
            await deleteLocalFile(req.file.path);
        }
        next(error)
    }
}

const login = async (req, res, next) => {
    let { email, password } = req.body;
    email = email.trim().toLowerCase();
    let { existUser, accessToken, refreshToken } = await loginService(email, password);

    res.cookie("refreshToken", refreshToken, {
        httpOnly: true,
        secure: true,
        sameSite: "strict",
        maxAge: 5 * 24 * 60 * 60 * 1000
    })

    res.json({
        success: true,
        data: existUser,
        accessToken: accessToken
    })
}

const logout = async (req, res, next) => {
    let refreshToken = req.cookies.refreshToken;
    if (!refreshToken) {
        return next(new UnauthorizedError("Invalid Token"));
    }

    await logoutService(refreshToken);

    res.clearCookie("refreshToken");
    res.json({
        success: true,
        message: "User Logout Successfully"
    })
}

const refreshTokenCycle = async (req, res, next) => {
    let refreshToken = req.cookies.refreshToken;
    if (!refreshToken) {
        return next(new UnauthorizedError("Invalid Token"));
    }
    let accessToken = await refreshTokenCycleService(refreshToken);

    res.json({
        success: true,
        accessToken
    })

}

const sendVerifyEmail = async (req, res, next) => {
    let { email } = req.body;
    let message = await sendVerifyEmailService(email);
    res.json({
        success: true,
        message
    })
}

const verifyEmailOtp = async (req, res, next) => {
    let { email, otp } = req.body;
    let message = await verifyEmailOtpService(email, otp);
    res.json({
        success: true,
        message
    })
}

const forgotPassword = async (req, res, next) => {
    let { email } = req.body;
    let message = await forgotPasswordService(email);
    res.json({
        success: true,
        message
    })
}

const resetPassword = async (req, res, next) => {
    let { email, password, otp } = req.body;
    let message = await resetPasswordService(email, password, otp);
    res.json({
        success: true,
        message
    })
}

const updateProfilePic = async (req, res, next) => {
    try {
        const allowedImageMimeTypes = ["image/png", "image/jpg", "image/jpeg", "image/webp"];
        let userId = req.userId;
        if (!req.file) {
            return next(new ValidationError("invalid file"))
        }
        const type = await fileTypeFromFile(req.file.path);
        const validActualType = type && allowedImageMimeTypes.includes(type.mime);
        if (!validActualType) {
            return next(new ValidationError("invalid file"))
        }
        await updateProfilePicService(userId, req.file);
        await deleteLocalFile(req.file.path);
        res.json({
            success: true,
            message: "Profile pic updated successfully"
        })
    } catch (err) {
        if (req.file?.path) {
            await deleteLocalFile(req.file.path)
        }
        next(err)
    }
}

module.exports = {
    register,
    login,
    logout,
    refreshTokenCycle,
    sendVerifyEmail,
    verifyEmailOtp,
    forgotPassword,
    resetPassword,
    updateProfilePic
}