const app = require('./Routes/app')
const connectDB = require('./Config/database')
const emailWorker = require('./Worker/email.worker')
const fileWorker = require('./Worker/file.worker')
const otpWorker = require('./Worker/otp.worker')
const reportWorker = require("./Worker/report.worker")
const mongoose = require('mongoose')
const logger = require('./Config/logger')
require('dotenv').config()

let server;
connectDB()
    .then(() => {
        server = app.listen(process.env.HOST, () => {
            console.log("Sever is listening at 5000...")
        })
    })
    .catch((err) => {
        console.log("Database is not connected", err)
    })

let shutdown = async () => {
    await new Promise((resolve) => {
        server.close(() => {
            logger.info("Server shutdown sucessfully")
            resolve()
        })
    })

    try {
        await emailWorker.close()
    } catch (err) {
        logger.error(`email worker didnt shut down correctly err: ${err.message}`)
    }
    try {
        await fileWorker.close()
    } catch (err) {
        logger.error(`file worker didnt shut down correctly err: ${err.message}`)
    }
    try {
        await otpWorker.close()
    } catch (err) {
        logger.error(`otp worker didnt shut down correctly err: ${err.message}`)
    }
    try {
        await reportWorker.close()
    } catch (err) {
        logger.error(`report worker didnt shut down correctly err: ${err.message}`)
    }

    try {
        await mongoose.connection.close()
    } catch (err) {
        logger.error(`mongodb didnt close, err: ${err.message}`)
    }
    
    process.exit(0)
}

process.on("SIGINT", shutdown)
process.on("SIGTERM", shutdown)