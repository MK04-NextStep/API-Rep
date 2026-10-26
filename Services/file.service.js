const cloudinary = require('../Config/cloudinary');
const FileRepository = require('../Repositories/file.repository')
const logger = require('../Config/logger')
const addFileQueue = require('../Queues/file.queue')
const NotFoundError = require('../Errors/NotFoundError')

const uploadFile = async (data, filePath) => {
    let result;
    try {
        result = await cloudinary.uploader.upload(filePath, {
            resource_type: "raw"
        })
        let newData = {
            ...data,
            url: result.secure_url,
            publicId: result.public_id
        }

        let output = await FileRepository.create(newData);

        logger.info("Audit Event", {
            action: "CREATE_FILE",
            workspaceId: data.workspaceId,
            userId: data.userId,
            resourceId: output._id
        })

        return output
    } catch (err) {
        if (result?.public_id) {
            await addFileQueue(result.public_id)
        }
        throw new err
    }
}

const deleteFileService = async (fileId) => {
    let file = await FileRepository.findById(fileId);
    if (!file) {
        throw new NotFoundError("Invalid File")
    }
    await FileRepository.deleteFile(fileId);
    await addFileQueue(file.publicId)

    logger.info("Audit Event", {
        action: "DELETE_FILE",
        workspaceId: file.workspaceId,
        userId: file.uploadedBy,
        resourceId: fileId
    })
}

const updateFileService = async (fileId, data, filePath) => {
    let file = await FileRepository.findById(fileId);
    if (!file) {
        throw new NotFoundError("Invalid File")
    }
    let oldPublic = file?.publicId;
    let result = await cloudinary.uploader.upload(filePath, {
        resource_type: "raw"
    });
    let newData = {
        ...data,
        url: result.secure_url,
        publicId: result.public_id
    }
    try {
        await FileRepository.updateFile(data.workspaceId, fileId, newData);
    } catch (err) {
        await addFileQueue(result.public_id)
        throw new err
    }
    await addFileQueue(oldPublic);

    logger.info("Audit Event", {
        action: "UPDATE_FILE",
        workspaceId: data.workspaceId,
        userId: data.uploadedBy,
        resourceId: fileId
    })
}

const getFileListService = async (input, workspaceId) => {
    let files = await FileRepository.findByWorkspaceId(workspaceId, input);
    return files;
}

const getFileService = async (workspaceId, fileId) => {
    let file = await FileRepository.findByIdFully(fileId, workspaceId);
    if (!file) {
        throw new NotFoundError("invalid file")
    }
    return file
}

module.exports = {
    uploadFile,
    deleteFileService,
    updateFileService,
    getFileListService,
    getFileService
}