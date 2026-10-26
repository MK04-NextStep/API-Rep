const { z } = require('zod');
const mongoose = require('mongoose')

const nameField = {
    name: z.string().trim()
        .min(3, "Name must be atleast 3 letters")
        .max(50, "Name can be only 50 letters")
        .optional()
}

const descriptionField = {
    descrption: z.string().trim()
        .max(500, "description should be atmost 500 letters")
        .optional()
}

const typeField = {
    type: z.enum(["team", "personal"])
}

const idField = z.string().refine(
    mongoose.Types.ObjectId.isValid,
    {
        message: "Invalid ObjectId"
    }
)

const workspaceDataSchema = z.object({
    ...nameField, ...descriptionField, ...typeField
})

const workspaceUpdateSchema = z.object({
    ...nameField, ...descriptionField, 
    type: z.enum(["team", "personal"]).optional()
})

const idSchema = z.object({
    workspaceId: idField
})

module.exports = {
    workspaceDataSchema,
    idSchema,
    workspaceUpdateSchema,
    idField
}