const WorkspaceRepository = require('../Repositories/workspace.repository');
const WorkspaceMemberRepository = require('../Repositories/workspaceMember.repository')
const NotFoundError = require('../Errors/NotFoundError');
const ForbiddenError = require('../Errors/ForbiddenError')

const workspaceMiddleware = async(req,res,next) => {
    let userId = req.userId;
    let workspaceId = req.params.workspaceId;
    
    let workspace = await WorkspaceRepository.findById(workspaceId);

    if(!workspace){
        return next(new NotFoundError("workspace not found"))
    }
    let member = await WorkspaceMemberRepository.findByUserIdAndWorkspaceId(userId, workspaceId)
    if(!member){
        return next(new ForbiddenError("user is not part of workspace"))
    }
    req.workspace = workspace;
    req.member = member;
    next();
}

module.exports = workspaceMiddleware;