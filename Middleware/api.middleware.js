const ApiRepository = require('../Repositories/api.repository');
const NotFoundError = require('../Errors/NotFoundError');
const UnauthorizedError = require('../Errors/UnauthorizedError')

const apiMiddleware = async(req,res,next) => {
    const workspace = req.workspace;
    const {apiId} = req.params;
    
    let existApi = await ApiRepository.findByIdAndWorkspaceId(apiId, workspace._id);
    if(!existApi) {
        return next(new NotFoundError("invalid api"))
    }

    req.api = existApi;
    next();
}

module.exports = apiMiddleware;