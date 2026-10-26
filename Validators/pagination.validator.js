const { z } = require('zod');

const pageField = {
    page: z.string().min(1, "page should not be empty")
        .regex(/^[1-9]\d*$/, "page should be positive number")
        .optional()
}

const limitField = {
    limit: z.string().min(1, "limit should not be empty")
        .max(100, "should be 100")
        .regex(/^[1-9]\d*$/, "limit should be positive number")
        .optional()
}

const methodField = {
    method: z.enum(["POST", "GET", "PATCH", "DELETE", "PUT", "OPTIONS", "HEAD"],
        "enter valid method"
    ).optional()

}

const statusField = {
    status: z.enum(["draft", "active", "deprecated", "archived"],
        "enter valid status"
    ).optional()
}

const searchField = {
    search: z.string().min(3, "search should be atleast 3 chararcter")
        .optional()
}

const roleField = {
    role: z.enum(["owner", "admin", "developer", "viewer"],
        "should have correct role"
    ).optional()
}

const sortField = {
    sort: z.enum(["createdAt", "-createdAt", "name", "-name", "updatedAt", "-updatedAt"])
        .optional()
}

const typeField = {
    type: z.enum(['personal', 'team'],
        "should have accurate type"
    ).optional()
}

const workspaceSortField = {
    sort: z.enum(['createdAt', '-createdAt', '-lastUpdated', 'lastUpdated']).optional()
}

const featureSchema = z.object({
    ...pageField, ...limitField, ...methodField,
    ...statusField, ...searchField, ...sortField
})

const memberSchema = z.object({
    ...pageField, ...limitField,
    ...roleField, ...searchField
})

const workspaceSchema = z.object({
    ...pageField, ...limitField,
    ...typeField, ...searchField, ...workspaceSortField
})

module.exports = {
    featureSchema,
    memberSchema,
    workspaceSchema

}