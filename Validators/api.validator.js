const {z} = require('zod');
const {idField, idSchema} = require('./workspace.validator')
const {nameField} = require('./auth.validator');

const methodField = {
    method: z.enum(["POST","GET","PATCH","DELETE","PUT","OPTIONS","HEAD"],
        "invalid method"
    )
}

const descriptionField = {
    description: z.string().trim().min(3, "invalid description").optional()
}

const endpointField = {
    endpoint: z.string().trim().startsWith("/")
}

const statusField = {
    status: z.enum(["draft","active","deprecated","archived"],
        "invalid status"
    )
}

const apiSchema = z.object({
    apiId: idField
})

const createApiSchema = z.object({
    ...nameField, ...methodField,
    ...endpointField, ...descriptionField, ...statusField, 
})

module.exports = {
    createApiSchema,
    apiSchema
}