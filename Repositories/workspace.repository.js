const Workspace = require('../Models/workspace.model');
const redisClient = require('../Config/redis')
const Member = require('../Models/workspaceMember.model')

const create = async(data) => {
    let newWorkspace = await Workspace.create(data);
    return newWorkspace;
}

const deleteById = async(id) => {
    let deleteWorkspace = await Workspace.findByIdAndDelete(id);
    return deleteWorkspace;
}

const updateById = async(id, data) => {
    let cacheKey = `workspace:${id}`
    let updateWorkspace = await Workspace.updateOne(
        { _id: id },
        {
            $set: {
                name: data.name,
                description: data.description,
                type: data.type
            }
        }
    )
    await redisClient.del(cacheKey)
    return updateWorkspace
}

const findByUserId = async(id) => {
    let ids = await Member.find({userId: id}).lean()
    return ids
}

const findById = async(id) => {
    const cacheKey = `workspace:${id}`
    const cachedWorkspace = await redisClient.get(cacheKey);
    if(cachedWorkspace){
        return JSON.parse(cachedWorkspace);
    }

    let workspace = await Workspace.findById(id).lean()
    if(!workspace){
        return null
    }

    await redisClient.set(cacheKey,
        JSON.stringify(workspace),
        { EX: 300 }
    )
    return workspace;
}

const findByIds = async(ids, input) => {
    let filter = {_id: { $in: ids }}
    if(input.type){
        filter.type = input.type
    }
    if(input.search){
        filter.$or = [
            {
                name: {
                    $regex: input.search,
                    $options: "i"
                }
            },
            {
                description: {
                    $regex: input.search,
                    $options: "i"
                }
            }
        ]
    }

    let sort = {}
    if(input.sort){
        sort[input.sort] = input.way
    }

    let workspaces = await Workspace.find(filter).sort(sort).limit(input.limit).skip(input.skip).lean()
    if(input.limit){
        let total = await Workspace.countDocuments(filter)
        return { total, workspaces}
    }
    return {workspaces}
} 

module.exports = {
    create,
    deleteById,
    updateById,
    findById,
    findByIds,
    findByUserId
}