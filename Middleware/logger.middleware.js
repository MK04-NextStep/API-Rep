const logger = require('../Config/logger')

const loggerMiddleware = (req,res,next) => {

    let startTime = Date.now()

    let method = req.method;
    let ip = req.ip;
    let path = req.path
    
    res.on("finish", () => {
        let statusCode = res.statusCode;
        let responseTime = Date.now() - startTime;

        logger.info(
            "HTTP request",
            {
                method,
                path,
                responseTime,
                statusCode,
                ip
            }
        )
    })

    next();
}

module.exports = loggerMiddleware