const mongoose = require('mongoose');
const { required } = require('zod/mini');

const fileSchema = new mongoose.Schema({
    workspaceId: {
        type: mongoose.Types.ObjectId,
        required: true,
        ref: "Workspace"
    },
    uploadedBy: {
        type: mongoose.Types.ObjectId,
        required: true,
        ref: "User"
    },
    originalName: {
        type: String
    },
    mimeType: {
        type: String
    },
    size: {
        type: Number
    },
    url: {
        type: String
    },
    publicId: {
        type: String
    }
}, {timestamps: true})

fileSchema.index({workspaceId: 1})

const File = mongoose.model(
    "File", fileSchema
)

module.exports = File