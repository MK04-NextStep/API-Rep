const ApiError = require('../Errors/ApiError')
const logger = require('../Config/logger')

const errorMiddleware = (err, req, res, next) => {

    let statusCode = 500;
    let message = "Internal Server Error";

    if(err instanceof ApiError){
        statusCode = err.statusCode;
        message = err.message
    }

    logger.error(message, {
        error: err,
        method: req.method,
        path: req.path,
        statusCode: statusCode
    })

    res.status(statusCode).json({
        success: false,
        message
    })
}

module.exports = errorMiddleware;