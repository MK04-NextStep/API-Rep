const WorkspaceRepository = require('../Repositories/workspace.repository');
const WorkspaceMemberRepository = require('../Repositories/workspaceMember.repository');
const ReportRepository = require('../Repositories/report.repository')
const logger = require('../Config/logger')
const addCreateReportQueue = require('../Queues/report.queue')
const UnauthorizedError = require('../Errors/UnauthorizedError')
const BadRequestError = require("../Errors/BadRequestError")
const NotFoundError = require("../Errors/NotFoundError")

const createWorkspaceService = async (data, userId) => {
    let newWorkspace = await WorkspaceRepository.create(data);
    await WorkspaceMemberRepository.createMember({
        workspaceId: newWorkspace._id,
        userId: userId,
        role: "owner"
    })

    logger.info("Audit Event", {
        action: "CREATE_WORKSPACE",
        userId,
        resourceId: newWorkspace._id
    })

    logger.info("Audit Event", {
        action: "CREATE_MEMBER",
        userId,
        workspaceId: newWorkspace._id,
        targetUserId: userId
    })
    return newWorkspace;
}

const updateWorkspaceService = async (workspaceId, data, userId) => {
    let updateWorkspace = await WorkspaceRepository.updateById(workspaceId, data);

    logger.info("Audit Event", {
        action: "UPDATE_WORKSPACE",
        userId,
        resourceId: workspaceId
    })
    return updateWorkspace;
}

const deleteWorkspaceService = async (workspaceId, userId) => {
    await WorkspaceMemberRepository.deleteById(workspaceId);
    await WorkspaceRepository.deleteById(workspaceId);

    logger.info("Audit Event", {
        action: "DELETE_WORKSPACE",
        userId,
        resourceId: workspaceId
    })
    return;
}

const getWorkspaceListService = async (userId, input) => {
    let workspaceIds = await WorkspaceRepository.findByUserId(userId);
    if (workspaceIds.length <= 0) {
        return []
    }
    let ids = workspaceIds.map(w => w.workspaceId);
    let data = await WorkspaceRepository.findByIds(ids, input);
    if (data.workspaces.length <= 0) {
        return [];
    }
    return data;
}

const leaveWorkspaceService = async (workspaceId, userId) => {
    await WorkspaceMemberRepository.deleteOne(userId, workspaceId);

    logger.info("Audit Event", {
        action: "LEAVE_WORKSPACE",
        userId,
        workspaceId: workspaceId
    })
    return
}

const getWorkspaceReportService = async(workspaceId, userId) => {
    let data = {
        workspaceId,
        requestedBy: userId,
        status: "PENDING",
    }
    let report = await ReportRepository.create(data);
    await addCreateReportQueue(report._id);
    logger.info("Audit Event", {
        action: "CREATE_REPORT",
        userId: userId,
        workspaceId
    })
    return report
}

const downloadReportService = async(reportId,workspace) =>{
    let report = await ReportRepository.getReport(reportId)
    if(!report){
        throw new NotFoundError("report does not exist")
    }
    if(report.workspaceId !== workspace._id){
        throw new UnauthorizedError("invalid report Id")
    }
    if(report.status !== "COMPLETED"){
        throw new BadRequestError("report is not ready yet")
    }
    if(!report.fileUrl){
        throw new BadRequestError("try again")
    }
    return report
}

module.exports = {
    createWorkspaceService,
    deleteWorkspaceService,
    updateWorkspaceService,
    getWorkspaceListService,
    leaveWorkspaceService,
    getWorkspaceReportService,
    downloadReportService
}