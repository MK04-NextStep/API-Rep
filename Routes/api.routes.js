const express = require('express');
const authMiddleware = require('../Middleware/auth.middleware');
const workspaceMiddleware = require('../Middleware/workspace.middleware');
const apiMiddleware = require('../Middleware/api.middleware');
const { allRole, developerRole } = require('../Middleware/role.middleware');
const asyncHandler = require('../Utils/asynHandler')
const { idSchema } = require('../Validators/workspace.validator');
const { createApiSchema, apiSchema } = require('../Validators/api.validator');
const validatorMiddleware = require('../Middleware/validate.middleware')
const {featureSchema }= require('../Validators/pagination.validator')

const { createApi,
    getApi,
    getListApi,
    deleteApi,
    updateApi } = require('../Controller/api.controller');
const {uploadController} = require('../Controller/file.controller')
const {uploadFile} = require('../Middleware/upload.middleware')

const route = express.Router()

route.use(authMiddleware);


route.get("/:workspaceId/:apiId",
    validatorMiddleware(idSchema, "params"),
    validatorMiddleware(apiSchema, "params"),
    asyncHandler(workspaceMiddleware),
    allRole,
    asyncHandler(apiMiddleware),
    asyncHandler(getApi)
)

route.get("/:workspaceId",
    validatorMiddleware(idSchema, "params"),
    validatorMiddleware(featureSchema, "query"),
    asyncHandler(workspaceMiddleware),
    allRole,
    asyncHandler(getListApi)
)

route.post("/:workspaceId",
    validatorMiddleware(idSchema, "params"),
    validatorMiddleware(createApiSchema),
    asyncHandler(workspaceMiddleware),
    developerRole,
    asyncHandler(createApi)
)

route.patch("/:workspaceId/:apiId",
    validatorMiddleware(idSchema, "params"),
    validatorMiddleware(apiSchema, "params"),
    validatorMiddleware(createApiSchema),
    asyncHandler(workspaceMiddleware),
    developerRole,
    asyncHandler(apiMiddleware),
    asyncHandler(updateApi)
)

route.delete("/:workspaceId/:apiId",
    validatorMiddleware(idSchema, "params"),
    validatorMiddleware(apiSchema, "params"),
    asyncHandler(workspaceMiddleware),
    developerRole,
    asyncHandler(apiMiddleware),
    asyncHandler(deleteApi)
)

module.exports = route;
