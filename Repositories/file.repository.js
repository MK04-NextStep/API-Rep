const File = require('../Models/file.model');

const create = async(data) => {
    const file = await File.create(data);
    return file
}

const deleteFile = async(fileId) => {
    await File.findByIdAndDelete(fileId);
    return;
}

const findByIdFully = async(fileId, workspaceId) => {
    let file = await File.findOne({
        _id: fileId,
        workspaceId
    }).lean()
    return file
}

const findById = async(fileId) => {
    let file = await File.findById(fileId).select("workspaceId publicId uploadedBy").lean()
    return file;
}

const updateFile = async(workspaceId, fileId, data) => {
    const file = await File.updateOne(
        { _id: fileId, workspaceId: workspaceId},
        {
            $set: {
                originalName: data.originalName,
                mimeType: data.mimeType,
                size: data.size,
                url: data.url,
                publicId: data.publicId
            }
        }
    )
    return file;
}

const findByWorkspaceId = async(workspaceId, input) => {
    let filterData = {workspaceId}
    if(input.search){
        filterData.originalName = { $regex: input.search, $options: "i"}
    }

    let sort = {}
    if(input.sort){
        sort[input.sort] = input.way
    }
    let files = await File.find(filterData).skip(input.skip).limit(input.limit).sort(sort).lean()
    if(input.limit){
        let total = await File.countDocuments(filterData);
        return {files, total}
    }
    return {files}
}

module.exports = {
    create,
    deleteFile,
    findByIdFully,
    findById,
    updateFile,
    findByWorkspaceId
}