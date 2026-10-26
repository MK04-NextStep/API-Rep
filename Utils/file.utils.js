const fs = require('fs/promises');
const BadRequestError = require('../Errors/BadRequestError')

const deleteLocalFile = async (filepath) => {
    try {
        await fs.unlink(filepath)
    } catch (err) {
        if (err.code === "ENOENT") {
            return;
        }
        throw new BadRequestError("cant delete file")
    }
}

module.exports = deleteLocalFile