const ValidationError = require('../Errors/ValidationError')
const fs = require("fs/promises");
const path = require("path")
const YAML = require('yaml')

const fileMiddleware = async (req, res, next) => {
    if (!req.file) {
        return next(new ValidationError("invalid file"))
    }

    const allowedFileMimeTypes = ["application/json", "application/x-yaml", "text/yaml"];
    const allowedFileExtensions = [".json", ".yaml", ".yml"];

    const extension = path.extname(req.file.originalname).toLowerCase();
    let mime = allowedFileMimeTypes.includes(req.file.mimetype);
    if (!mime) {
        return next(new ValidationError("invalid file"))
    }
    let parseFile;
    try {
        const fileContents = await fs.readFile(req.file.path, "utf8");

        if (extension === '.json') {
            parseFile = JSON.parse(fileContents)
        } else if (extension === '.yaml' || extension === '.yml') {
            parseFile = YAML.parse(fileContents)
        }
        if (parseFile === null || parseFile === undefined) {
            return next(new ValidationError("Empty file"));
        }
    } catch (err) {
        return next(new ValidationError("invalid path file"))
    }
    next()
}

module.exports = fileMiddleware