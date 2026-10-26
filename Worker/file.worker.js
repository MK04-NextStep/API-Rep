const { Worker } = require('bullmq')
const cloudinary = require('../Config/cloudinary')
require('dotenv').config()

const worker = new Worker("file",
    async (job) => {
        const  { publicId } = job.data
        await cloudinary.uploader.destroy(publicId);
    }, {
    connection: {
        host: process.env.QUEUE_HOST,
        port: process.env.QUEUE_PORT
    }
})

worker.on("completed", (job) => {
    logger.info("Email job Done", {
        jobId: job.id,
        jobName: job.name,
        attempts: job.attemptsMade
    })
})

worker.on("active", (job) => {
    logger.info("Email Job is active", {
        jobId: job.id,
        jobName: job.name
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