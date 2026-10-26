const { createApiService,
    getListApiService, deleteApiService,
    updateApiService
} = require('../Services/api.service');

const createApi = async (req, res, next) => {
    let userId = req.userId;
    let workspace = req.workspace;
    let { name, method, endpoint, description, status } = req.body;
    let data = {
        name, workspaceId: workspace._id, method,
        endpoint, description, status, createdBy: userId
    }
    let newApi = await createApiService(data, userId);
    res.json({
        success: true,
        data: newApi
    })
}

const getApi = async (req, res, next) => {
    const api = req.api;
    res.json({
        success: true,
        data: api
    })
}

const getListApi = async (req, res, next) => {
    const workspace = req.workspace;
    const data = req.query;
    let input = {}
    let page = Number(data.page)
    if (data.page && data.limit) {
        let limit = Number(data.limit)
        input.limit = limit
        const skip = (page - 1) * limit;
        input.skip = skip
    }
    if (data.method) {
        input.method = data.method
    }
    if (data.status) {
        input.status = data.status
    }
    if (data.search) {
        input.search = data.search
    }
    if (data.sort) {
        input.sort = data.sort.startsWith("-") ? data.sort.slice(1) : data.sort;
        input.way = data.sort.startsWith("-") ? -1 : 1
    }
    const output = await getListApiService(workspace._id, input);

    let totalPage;
    if (output.total) {
        totalPage = Math.ceil(output.total / input.limit)
    }

    res.json({
        success: true,
        data: output.apis,
        pagination: output.total ? {
            currentPage: page,
            limit: input.limit,
            totalItems: output.total,
            totalPages: totalPage,
            hasNextPage: input.page < totalPage ? true : false,
            hasPreviousPage: input.page > 1 ? true : false
        } : {}
    })
}

const deleteApi = async (req, res, next) => {
    const api = req.api;
    const userId = req.userId
    await deleteApiService(api, userId);
    res.json({
        success: true,
        message: "api deleted successfully"
    })
}

const updateApi = async (req, res, next) => {
    let { name, method, endpoint, description, status } = req.body;
    let api = req.api;
    let userId = req.userId
    let data = {
        name, workspaceId: api.workspaceId, method, endpoint, status, description
    }
    await updateApiService(data, api, userId);
    res.json({
        success: true,
        message: "api updated successfully"
    })
}

module.exports = {
    createApi,
    getApi,
    getListApi,
    deleteApi,
    updateApi
}
