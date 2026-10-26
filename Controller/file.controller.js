const { uploadFile, deleteFileService,
    updateFileService, getFileListService, getFileService
} = require('../Services/file.service')
const deleteLocalFile = require('../Utils/file.utils')

const uploadController = async (req, res, next) => {
    try {
        let workspace = req.workspace;
        let userId = req.userId

        let newData = {
            workspaceId: workspace._id,
            uploadedBy: userId,
            originalName: req.file.originalname,
            mimeType: req.file.mimetype,
            size: req.file.size,
        }

        let output = await uploadFile(newData, req.file.path);
        await deleteLocalFile(req.file.path);
        res.json({
            success: true,
            message: "file uploaded successfullly",
            data: output
        })
    } catch (err) {
        await deleteLocalFile(req.file.path);
        next(err)
    }
}

const deleteFile = async (req, res, next) => {
    try {
        let fileId = req.params.fileId;
        await deleteFileService(fileId);

        res.json({
            success: true,
            message: "File deleted Successfully"
        })
    } catch (err) {
        await deleteLocalFile(req.params.fileId)
        next(err)
    }
}

const updateFile = async (req, res, next) => {
    try {
        let workspace = req.workspace
        let userId = req.userId
        let fileId = req.params.fileId;
        let newFile = req.file;
        let data = {
            workspaceId: workspace._id,
            uploadedBy: userId,
            originalName: req.file.originalname,
            mimeType: req.file.mimetype,
            size: req.file.size,
        }
        await updateFileService(fileId, data, newFile.path);
        await deleteLocalFile(newFile.path);
        res.json({
            success: true,
            message: "update file successfully"
        })
    } catch (err) {
        await deleteLocalFile(req.file.path);
        next(err)
    }
}

const getFileList = async (req, res, next) => {
    let workspace = req.workspace;
    let data = req.query;
    let input = {}
    if (data.page && data.limit) {
        let page = Number(data.page);
        let limit = Number(data.limit);
        let skip = (page - 1) * limit
        input.page = page;
        input.limit = limit;
        input.skip = skip;
    }
    if (data.search) {
        input.search = search;
    }
    if (data.sort) {
        input.sort = data.sort.startsWith("-") ? data.sort.split("-") : data.sort;
        input.way = data.sort.startsWith("-") ? -1 : 1
    }

    let output = await getFileListService(input, workspace._id);

    let totalPage = 0;
    if (output.total) {
        totalPage = Math.ceil(output.total / input.limit)
    }
    res.json({
        success: true,
        data: output.files,
        pagination: data.limit ? {
            currentPage: input.page,
            limit: input.limit,
            totalItems: output.total,
            totalPages: totalPage,
            hasNextPage: input.page < output.total ? true : false,
            hasPreviousPage: input.page > 1 ? true : false
        } : {}
    })

}

const getFile = async (req, res, next) => {
    let workspace = req.workspace;
    let fileId = req.params.fileId
    let file = await getFileService(workspace._id, fileId)
    res.json({
        success: true,
        data: file
    })
}

module.exports = {
    uploadController,
    deleteFile,
    updateFile,
    getFileList,
    getFile
}