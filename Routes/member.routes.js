const express = require('express');
const asyncHandler = require('../Utils/asynHandler');
const authMiddleware = require('../Middleware/auth.middleware');
const workspaceMiddleware = require('../Middleware/workspace.middleware');
const { getMembers,
    inviteMember,
    acceptInvite, deleteMember,
    updateMemberRole } = require('../Controller/member.controller')
const validatorMiddleware = require('../Middleware/validate.middleware');
const { inviteSchema, acceptSchema, memberIdSchema } = require('../Validators/member.validator');
const { idSchema } = require('../Validators/workspace.validator')
const { ownerRole, adminRole } = require('../Middleware/role.middleware')
const { memberSchema } = require('../Validators/pagination.validator')

const route = express.Router();

route.use(asyncHandler(authMiddleware));

route.get("/:workspaceId",
    validatorMiddleware(idSchema, "params"),
    validatorMiddleware(memberSchema, 'query'),
    asyncHandler(workspaceMiddleware),
    asyncHandler(getMembers));

route.post("/invite/:workspaceId",
    validatorMiddleware(idSchema, "params"),
    validatorMiddleware(inviteSchema),
    asyncHandler(workspaceMiddleware),
    adminRole,
    asyncHandler(inviteMember));

route.post("/accept",
    validatorMiddleware(acceptSchema),
    asyncHandler(acceptInvite))

route.patch("/update-member-role/:workspaceId",
    validatorMiddleware(idSchema, "params"),
    validatorMiddleware(memberIdSchema, "body"),
    asyncHandler(workspaceMiddleware),
    ownerRole,
    asyncHandler(updateMemberRole)
)

route.delete("/delete-member/:workspaceId",
    validatorMiddleware(idSchema, "params"),
    validatorMiddleware(memberIdSchema, "body"),
    asyncHandler(workspaceMiddleware),
    ownerRole,
    asyncHandler(deleteMember)
)

module.exports = route;