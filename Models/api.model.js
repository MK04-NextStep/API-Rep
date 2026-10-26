const mongoose = require('mongoose');

const apiSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    workspaceId: {
        type: mongoose.Types.ObjectId,
        required: true,
        ref: "Workspace"
    },
    method: {
        type: String,
        enum: ["POST","GET","PATCH","DELETE","PUT","OPTIONS","HEAD"],
        default: "GET"
    },
    endpoint: {
        type: String,
        required: true
    },
    description: {
        type: String,
        default: ""
    },
    status: {
        type: String,
        enum: ["draft","active","deprecated","archived"],
        default: "active"
    },
    createdBy: {
        type: mongoose.Types.ObjectId,
        ref: "User",
        required: true
    }
}, { timestamps: true})

apiSchema.index({workspaceId: 1, method: 1, endpoint: 1}, {unique: true})

const Api = mongoose.model(
    "Api", apiSchema
)

module.exports = Api