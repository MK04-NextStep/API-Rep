const multer = require('multer');
const path = require('path')

const allowedImageMimeTypes = [ "image/png", "image/jpg", "image/jpeg", "image/webp" ];
const allowedImageExtensions = [".png", ".jpg", ".jpeg", ".webp"];
const allowedFileMimeTypes = [ "application/json","application/x-yaml","text/yaml"];
const allowedFileExtensions = [ ".json",".yaml",".yml"];

const imageFilter = async(req,file,cb) => {
    const extension = path.extname(file.originalname).toLowerCase();
    const validMimeType = allowedImageMimeTypes.includes(file.mimetype);
    const validExtention = allowedImageExtensions.includes(extension);
    if(validMimeType && validExtention){
        cb(null, true)
    }else{
        cb(new Error("invalid file"))
    }
}

const fileFilter = async(req,file,cb) => {
    const extention = path.extname(file.originalname).toLowerCase();
    const validMimeType = allowedFileMimeTypes.includes(file.mimetype);
    const validExtention = allowedFileExtensions.includes(extention);
    if(validMimeType && validExtention ){
        cb(null, true)
    }else{
        cb(new Error("invalid files"))
    }
}

const uploadImage = multer({
    dest: "uploads/",
    fileFilter: imageFilter,
    limits: {
        fileSize : 2 *1024 * 1024 // 2MB
    }
})

const uploadFile = multer({
    dest: "uploads/",
    fileFilter,
    limits: {
        fileSize: 5 * 1024 *1024
    }
})

module.exports = {
    uploadImage,
    uploadFile
}