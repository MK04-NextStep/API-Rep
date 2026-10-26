const express = require('express');
const authMiddleware = require('../Middleware/auth.middleware');
const workspaceMiddleware = require('../Middleware/workspace.middleware');
const asyncHandler = require('../Utils/asynHandler')
const { idSchema } = require('../Validators/workspace.validator');
const { fileIdSchema } = require('../Validators/file.validator')
const validatorMiddleware = require('../Middleware/validate.middleware')
const fileMiddleware = require('../Middleware/file.middleware')

const { uploadController,
    deleteFile,
    updateFile,
    getFileList, getFile } = require('../Controller/file.controller')

const { uploadFile } = require('../Middleware/upload.middleware')

const route = express.Router()

route.use(authMiddleware);

route.post("/upload/:workspaceId",
    validatorMiddleware(idSchema, "params"),
    asyncHandler(workspaceMiddleware),
    uploadFile.single('file'),
    fileMiddleware,
    uploadController
)

route.get('/:workspaceId/:fileId',
    validatorMiddleware(idSchema, "params"),
    asyncHandler(workspaceMiddleware),
    asyncHandler(getFile)
)

route.get("/:workspaceId",
    validatorMiddleware(idSchema, "params"),
    asyncHandler(workspaceMiddleware),
    getFileList
)

route.patch("/:workspaceId/:fileId",
    validatorMiddleware(idSchema, "params"),
    validatorMiddleware(fileIdSchema, "params"),
    asyncHandler(workspaceMiddleware),
    uploadFile.single('file'),
    fileMiddleware,
    updateFile
)

route.delete("/:workspaceId/:fileId",
    validatorMiddleware(idSchema, "params"),
    validatorMiddleware(fileIdSchema, "params"),
    asyncHandler(workspaceMiddleware),
    deleteFile
)

module.exports = route;