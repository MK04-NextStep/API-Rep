const {createWorkspaceService, deleteWorkspaceService,
    updateWorkspaceService, getWorkspaceListService,
    leaveWorkspaceService
} = require('../Services/workspace.service');

const createWorkspace = async(req, res, next) => {
    let userId = req.userId;
    let {name, description, type} = req.body;
    let data = {
        name: name,
        description: description,
        type, owner: userId, 
        lastUpdated: Date.now()
    }

    let newWorkspace = await createWorkspaceService(data, userId);
    res.json({
        success: true,
        data: newWorkspace
    })
}

const getWorkspaceList = async(req,res,next) => {
    let userId = req.userId;
    let data = req.query;
    let input = {}
    if(data.page && data.limit){
        let page = Number(data.page)
        let limit = Number(data.limit)
        let skip = (page - 1)* limit
        input.page = page;
        input.limit = limit
        input.skip = skip
    }
    if(data.type){
        input.type = data.type
    }
    if(data.search){
        input.search = data.search
    }
    if(data.sort){
        input.sort = data.sort.startsWith("-")? data.sort.slice("-") : data.sort;
        input.way = data.sort.startsWith("-")? -1 : 1
    }

    let output = await getWorkspaceListService(userId, input);
    let totalPage;
    if(output.total){
        totalPage = Math.ceil(output.total/input.limit)
    }
    return res.json({
        success: true,
        data: output.workspaces,
        pagination: output.total ? {
            currentPage: input.page,
            limit: input.limit,
            totalItems: output.total,
            totalPages: totalPage,
            hasNextPage: input.page < output.total ? true : false,
            hasPreviousPage: input.page > 1 ? true : false
        } : {}
    })
}

const getWorkspace = async(req,res,next) => {
    let workspace = req.workspace;
    res.json({
        success: true,
        data: workspace
    })
}

const updateWorkspace = async(req,res,next) => {
    let workspace = req.workspace;
    let userId = req.userId
    let {name, description, type} = req.body;
    let data = {
        name, description, type
    }
    await updateWorkspaceService(workspace._id, data, userId);
    res.json({
        success: true,
        message: "workspace updated successfully"
    })
}

const deleteWorkspace = async(req,res,next) => {
    let workspace = req.workspace;
    let userId = req.userId
    await deleteWorkspaceService( workspace._id, userId);
    res.json({
        success: true,
        message: "workspace deleted successfully"
    })
}

const leaveWorkspace = async(req,res,next) => {
    let workspace = req.workspace;
    let userId = req.userId;
    await leaveWorkspaceService(workspace._id, userId);
    res.json({
        success: true,
        message: "user leave the workspace"
    })
}

const getWorkspaceReport = async(req,res,next) => {
    let userId = req.userId;
    let workspace = req.workspace;
    let report = await getWorkspaceReportService(workspace._id, userId)
    res.json({
        success: true,
        message: "Report genearation started Successfully",
        data: report
    })
}

const downloadReport = async(req,res, next) => {
    let workspace = req.workspace;
    let reportId = req.params.reportId;

    let report = await downloadReportService(reportId, workspace)
    res.json({
        success: true,
        data: report
    })
}

module.exports = {
    createWorkspace,
    getWorkspace,
    updateWorkspace,
    deleteWorkspace,
    getWorkspaceList,
    leaveWorkspace,
    getWorkspaceReport,
    downloadReport
}
