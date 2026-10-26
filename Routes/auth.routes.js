const express = require('express');
const { register, login, logout, refreshTokenCycle, sendVerifyEmail,
    verifyEmailOtp, forgotPassword, resetPassword, updateProfilePic
} = require('../Controller/auth.controller');
const { registerSchema, loginSchema, EmailSchema,
    verifyEmailSchema, resetPasswordSchema
} = require('../Validators/auth.validator');
const { uploadImage } = require('../Middleware/upload.middleware')
const validatorMiddleware = require('../Middleware/validate.middleware')
const asyncHandler = require('../Utils/asynHandler');
const { authLimiter } = require('../Config/rateLimit');
const authMiddleware = require('../Middleware/auth.middleware');

const route = express.Router();

route.post("/register", 
    uploadImage.single('file'),
    validatorMiddleware(registerSchema), 
    register
);

route.post("/login",
    authLimiter,
    validatorMiddleware(loginSchema),
    asyncHandler(login)
)

route.post("/logout",
    authMiddleware,
    asyncHandler(logout)
);

route.post("/refresh",
    authMiddleware,
    asyncHandler(refreshTokenCycle)
);

route.post("/send-verification-email",
    authLimiter,
    validatorMiddleware(EmailSchema),
    asyncHandler(sendVerifyEmail)
)

route.post("/verify-email",
    authLimiter,
    validatorMiddleware(verifyEmailSchema),
    asyncHandler(verifyEmailOtp)
);

route.post("/forgot-password",
    authLimiter,
    validatorMiddleware(EmailSchema),
    asyncHandler(forgotPassword)
);

route.post("/reset-password",
    authLimiter,
    validatorMiddleware(resetPasswordSchema),
    asyncHandler(resetPassword)
)

route.patch("/profile-pic", 
    authMiddleware,
    uploadImage.single('file'),
    updateProfilePic
)

module.exports = route;