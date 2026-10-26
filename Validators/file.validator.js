const {z} = require('zod');
const {idField} = require('./workspace.validator')

const fileIdSchema = z.object({
    fileId: idField
})

module.exports = { 
    fileIdSchema
}