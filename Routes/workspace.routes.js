const express = require('express');
const asyncHandler = require('../Utils/asynHandler');
const authMiddleware = require('../Middleware/auth.middleware');
const workspaceMiddleware = require('../Middleware/workspace.middleware');
const {
    createWorkspace,
    getWorkspace,
    updateWorkspace,
    deleteWorkspace, getWorkspaceList, leaveWorkspace,
    getWorkspaceReport,
    downloadReport
} = require('../Controller/workspace.controller')
const validatorMiddleware = require('../Middleware/validate.middleware')
const {
    workspaceDataSchema,
    idSchema, workspaceUpdateSchema
} = require('../Validators/workspace.validator')
const { ownerRole,
    adminRole,
    allRole } = require('../Middleware/role.middleware')
const { workspaceSchema } = require('../Validators/pagination.validator')

const route = express.Router();

route.use(authMiddleware);

route.get('/workspacelist/:workspaceId',
    validatorMiddleware(idSchema, "params"),
    asyncHandler(workspaceMiddleware),
    allRole,
    asyncHandler(getWorkspace));

route.get('/workspacelist',
    validatorMiddleware(workspaceSchema, 'query'),
    asyncHandler(getWorkspaceList))

route.post('/new',
    validatorMiddleware(workspaceDataSchema),
    asyncHandler(createWorkspace));

route.patch('/update/:workspaceId',
    validatorMiddleware(idSchema, "params"),
    validatorMiddleware(workspaceUpdateSchema),
    asyncHandler(workspaceMiddleware),
    adminRole,
    asyncHandler(updateWorkspace))

route.delete('/delete/:workspaceId',
    validatorMiddleware(idSchema, "params"),
    asyncHandler(workspaceMiddleware),
    ownerRole,
    asyncHandler(deleteWorkspace))

route.post('/leave/:workspaceId',
    validatorMiddleware(idSchema, "params"),
    asyncHandler(workspaceMiddleware),
    allRole,
    asyncHandler(leaveWorkspace)
)

route.get('/generate-report/:workspaceId',
    validatorMiddleware(idSchema, "params"),
    asyncHandler(workspaceMiddleware),
    allRole,
    asyncHandler(getWorkspaceReport)
)

route.get('/download-report/:workspaceId/:reportId',
    validatorMiddleware(idSchema, "params"),
    asyncHandler(workspaceMiddleware),
    allRole,
    asyncHandler(downloadReport)
)

module.exports = route;