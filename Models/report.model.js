const mongoose = require('mongoose');

const reportSchema = new mongoose.Schema({
    workspaceId: {
        type: mongoose.Types.ObjectId,
        required: true,
        ref: "Workspace"
    },
    requestedBy: {
        type: mongoose.Types.ObjectId,
        required: true,
        ref: "User"
    },
    status: {
        type: String,
        enum: ["CREATED","PENDING","PROCESSING","COMPLETED","FAILED"],
        default: "CREATED"
    },
    fileUrl: {
        type: String
    },
    publicId: {
        type: String
    },
    completedAt: {
        type: Date
    }
}, { timestamps: true})

const Report = mongoose.model(
    "Report", reportSchema
)

module.exports = Report