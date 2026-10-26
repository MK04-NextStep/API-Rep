const WorkspaceMember = require('../Models/workspaceMember.model');
const redisClient = require('../Config/redis')

const findByUserIdAndWorkspaceId = async (id, workspaceId) => {
    let cacheKey = `workspace:${workspaceId}:member:${id}`
    let cacheMember = await redisClient.get(cacheKey)
    if(cacheMember){
        return JSON.parse(cacheMember)
    }
    let members = await WorkspaceMember.findOne({ workspaceId, userId: id }).lean()
    await redisClient.set(cacheKey,
        JSON.stringify(members),
        { EX: 300 }
    )
    return members;
}

const deleteById = async (id) => {
    let members = await WorkspaceMember.deleteMany(
        { workspaceId: id }
    )
    return members;
}

const deleteOne = async (id, workspaceId) => {
    let member = await WorkspaceMember.deleteOne({ userId: id, workspaceId });
    return member
}

const createMember = async (data) => {
    let newMember = await WorkspaceMember.create(data);
    return newMember
}

const isMember = async (userId, workspaceId) => {
    let member = await WorkspaceMember.exists({ workspaceId, userId }).lean()
    return member
}

const changeRole = async (userId, workspaceId, role) => {
    let newMember = await WorkspaceMember.updateOne(
        { workspaceId, userId }, { $set: { role } }
    )
    let cacheKey = `workspace:${workspaceId}:member:${userId}`
    await redisClient.del(cacheKey)
    return newMember
}

const filterOption = async (workspaceId, input) => {
    let filter = { workspaceId }
    if (input.role) {
        filter.role = input.role
    }
    let sort = {}
    if (input.sort) {
        sort[input.sort] = input.way
    }
    let member = await WorkspaceMember.find(filter).sort(sort)
        .skip(input.skip).limit(input.limit).lean()
    if (input.limit) {
        let total = await WorkspaceMember.countDocuments(filter)
        return { total, member }
    }
    return { member }
}

module.exports = {
    deleteById,
    findByUserIdAndWorkspaceId,
    createMember,
    deleteOne,
    isMember,
    changeRole,
    filterOption
}