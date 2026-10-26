const ApiRepository = require('../Repositories/api.repository');
const ConflictError = require('../Errors/ConflictError')
const logger = require('../Config/logger')

const createApiService = async(data, userId) => {
    let existApi = await ApiRepository.findValidApi(data.workspaceId, data.method, data.endpoint);
    if(existApi.length > 0){
        throw new ConflictError("api already existed");
    }
    let newApi = await ApiRepository.create(data);

    logger.info("Audit Event", {
        action: "CREATE_API",
        userId,
        workspaceId: data.workspaceId,
        resourceId: newApi._id
    })

    return newApi;
}

const getListApiService = async(workspaceId, data) => {
    let output = await ApiRepository.filterOption(workspaceId, data);
    return output;
}

const deleteApiService = async(api, userId) => {
    await ApiRepository.deleteById(api.workspaceId, api._id);
    
    logger.info("Audit Event", {
        action: "DELETE_API",
        userId,
        workspaceId: api.workspaceId,
        resourceId: api._id
    })
    return;
}

const updateApiService = async(data, api, userId) => {
    let existApi = await ApiRepository.findValidApi(data.workspaceId, data.method, data.endpoint)
    if(existApi.length > 0 && existApi[0]._id.toString() !== api._id.toString()){
        throw new ConflictError("api already existed")
    }
    await ApiRepository.update(data,api._id);

    logger.info("Audit Event", {
        action: "UPDATE_API",
        userId,
        workspaceId: data.workspaceId,
        resourceId: api._id
    })
    return;
}

module.exports = {
    createApiService,
    getListApiService,
    deleteApiService,
    updateApiService,
}