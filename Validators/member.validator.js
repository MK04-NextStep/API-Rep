const {z} = require('zod');
const {emailField, otpField, idField} = require('./auth.validator');

const inviteSchema = z.object({
    ...emailField
})

const acceptSchema = z.object({
    ...otpField
})

const memberIdSchema = z.object({
    memberId: idField
})

module.exports = {
    inviteSchema,
    acceptSchema,
    memberIdSchema
}