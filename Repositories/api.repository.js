const Api = require('../Models/api.model');
const redisClient = require('../Config/redis')
const redis = require('redis')

const invalidateApiCache = async(workspaceId) => {
    let query = `workspace:${workspaceId}:api:*`
    let cursor = 0;
    do{
        let result = await redisClient.scan(cursor, {
            MATCH: query,
            COUNT: 100
        })
        cursor = result.cursor
        await redisClient.del(result.keys)
    }while(cursor !== 0)
}

const findValidApi = async (workspaceId, method, endpoint) => {
    let api = await Api.find({ workspaceId, method, endpoint }).lean();
    return api
}

const filterOption = async (workspaceId, data) => {
    let cacheKey = `workspace:${workspaceId}:api:${JSON.stringify(data)}`
    let cachedApiList = await redisClient.get(cacheKey)
    if (cachedApiList) {
        return JSON.parse(cachedApiList)
    }

    let filter = { workspaceId }
    if (data.method) {
        filter.method = data.method
    }
    if (data.status) {
        filter.status = data.status
    }
    if (data.search) {
        filter.$or = [
            {
                name: {
                    $regex: data.search,
                    $options: "i"
                }
            }, {
                endpoint: {
                    $regex: data.search,
                    $options: "i"
                }
            }, {
                description: {
                    $regex: data.search,
                    $options: "i"
                }
            }
        ]
    }
    let sortOption = {}
    if (data.sort) {
        sortOption[data.sort] = data.way
    }
    let apis = await Api.find(filter).sort(sortOption).skip(data.skip).limit(data.limit).lean()
    if (data.limit !== undefined) {
        let total = await Api.countDocuments(filter)
        let result = {
            apis, total
        }
        await redisClient.set(cacheKey, 
            JSON.stringify(result),
            { EX: 300 }
        )
        return { apis, total }
    }
    let result = {apis}
    await redisClient.set(cacheKey,
        JSON.stringify(result),
        { EX: 300 }
    )
    return { apis }
}

const findByIdAndWorkspaceId = async (id, workspaceId) => {
    let cacheKey = `workspace:${workspaceId}:api:${id}`
    let cacheApi = await redisClient.get(cacheKey)
    if(cacheApi){
        return JSON.parse(cacheApi)
    }
    let api = await Api.findOne({ _id: id, workspaceId }).lean()
    await redisClient.set(cacheKey,
        JSON.stringify(api),
        {
            EX: 300
        }
    )
    return api;
}

const create = async (data) => {
    let api = await Api.create(data);
    await invalidateApiCache(data.workspaceId)
    return api;
}

const deleteById = async (workspaceId, apiId) => {
    let api = await Api.deleteOne({ _id: apiId, workspaceId })
    await invalidateApiCache(workspaceId)
    return api
}

const update = async (data, id) => {
    const api = await Api.updateOne(
        { _id: id, workspaceId: data.workspaceId },
        {
            $set: {
                name: data.name,
                method: data.method,
                endpoint: data.endpoint,
                description: data.description,
                status: data.status,

            }
        }
    )
    await invalidateApiCache(data.workspaceId)
    return api
}

module.exports = {
    findValidApi,
    create,
    deleteById,
    update,
    findByIdAndWorkspaceId,
    filterOption
}