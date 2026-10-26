const mongoose = require('mongoose');

const workspaceMemberSchema = new mongoose.Schema({
    workspaceId: {
        type: mongoose.Types.ObjectId,
        required: true,
        ref: "Workspace",
    },
    userId: {
        type: mongoose.Types.ObjectId,
        required: true,
        ref: "User",
    },
    role: {
        type: "String",
        enum: ["owner", "admin", "developer", "viewer"],
        default: "developer"
    }
}, {timestamps: true})

workspaceMemberSchema.index(
    { workspaceId: 1, userId: 1 },
    { unique: true }
);
workspaceMemberSchema.index({userId: 1})

const WorkspaceMember = mongoose.model(
    "WorkspaceMember",
    workspaceMemberSchema
)

module.exports = WorkspaceMember;