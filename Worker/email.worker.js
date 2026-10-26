//WORKER

const { Worker } = require('bullmq')
const logger = require('../Config/logger')
const { verifyEmail, inviteEmail, passwordEmail } = require('../Jobs/email.jobs')
require('dotenv').config()

const handlers = {
    "send-verification-email": verifyEmail,
    "send-invite-email": inviteEmail,
    "send-forgot-password-email": passwordEmail
}

const worker = new Worker(
    "email",
    async (job) => {
        const handler = handlers[job.name];
        if (!handler) {
            throw new Error(`Unknown job: ${job.name}`);
        }
        await handler(job);
    },
    {
        connection: {
            host: process.env.QUEUE_HOST,
            port: process.env.QUEUE_PORT
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