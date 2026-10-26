const { Worker } = require('bullmq')
const OtpRepository = require('../Repositories/otp.repository')
const InviteRepository = require("../Repositories/invite.repository")
require('dotenv').config()

const worker = new Worker("otp",
    async() =>{
        await OtpRepository.deleteExpiredOtp();
        await InviteRepository.deleteExpiredOtp();
    },{
        connection: {
            host: process.env.QUEUE_HOST,
            "port": process.env.QUEUE_PORT
        }
    }
)

worker.on("completed", (job) => {
    logger.info("Email job Done", {
        jobId: job.id,
        jobName: job.name,
        attempts: job.attemptsMade
    })
})

worker.on("failed", (job, err) => {
    logger.error("Email job failed", {
        jobId: job.id,
        jobName: job.name,
        attempts: job.attempts,
        error: err.message
    })
})

module.exports = worker