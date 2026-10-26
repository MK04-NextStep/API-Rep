const { z } = require('zod');

const emailField = {
    email: z.string().trim().min(1, "Email is required").email("Please enter valid Email")
}

const passwordField = {
    password: z.string().min(8, "Password is required")
        .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
            "Password must be at least 8 characters long and include an uppercase letter, a lowercase letter, a number, and a special character."
        )
}

const otpField = {
    otp: z
        .string()
        .trim()
        .length(6, "OTP must be 6 digits.")
        .regex(/^\d{6}$/, "OTP must contain exactly 6 digits.")
};

const nameField = {
    name: z.string().trim().min(3, "Name must be atleast 3 letters")
}

const registerSchema = z.object({
    ...nameField, ...emailField, ...passwordField
})

const loginSchema = z.object({
    ...emailField, ...passwordField
})

const EmailSchema = z.object({
    ...emailField
})

const verifyEmailSchema = z.object({
    ...emailField, ...otpField
})

const resetPasswordSchema = z.object({
    ...emailField,
    ...passwordField,
    ...otpField
})

module.exports = {
    nameField,
    emailField,
    otpField,
    registerSchema,
    loginSchema,
    EmailSchema,
    verifyEmailSchema,
    resetPasswordSchema
}