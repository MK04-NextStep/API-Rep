const mongoose = require('mongoose');

const workspaceSchema = new mongoose.Schema({
    name: {
        type: String,
        minlength: 3,
        default: "New Collection"
    },
    description: {
        type: String,
        default: "Add Your Description"
    },
    type: {
        type: String,
        enum: ['personal','team'],
        required: true
    },
    owner: {
        type: mongoose.Types.ObjectId,
        required: true,
        ref: "User"
    },
    lastUpdated: {
        type: Date
    }
}, { timestamps: true })

const Workspace = mongoose.model(
    "Workspace",
    workspaceSchema
)

module.exports = Workspace;