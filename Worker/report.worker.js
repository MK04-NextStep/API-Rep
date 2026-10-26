const { Worker } = require('bullmq')
const cloudinary = require('../Config/cloudinary')
const ReportRepository = require('../Repositories/report.repository')
const fs = require('node:fs/promises')
const path = require('node:path')
const deleteLocalFile = require('../Utils/file.utils')
require('dotenv').config()

const worker = new Worker("report",
    async (job) => {
        const { reportId } = job.data
        let report = await ReportRepository.getReport(reportId);
        if (report.status !== "COMPLETED") {
            await ReportRepository.updateStatus(reportId, "PROCESSING")
            let analysis = await ReportRepository.createAnalysis(report.workspaceId, report._id);
            let json = JSON.stringify(analysis, null, 2);
            let filePath = path.join(__dirname, "..", "File", `${report._id}.json`)
            await fs.writeFile(filePath, json, "utf-8")
            let result;
            try {
                result = await cloudinary.uploader.upload(filePath, {
                    resource_type: "raw",
                    public_id: `reports/${report._id}`,
                    overwrite: true
                })
                let data = {
                    status: "COMPLETED",
                    fileUrl: result.secure_url,
                    publicId: result.public_id
                }
                await ReportRepository.updateData(report._id, data);
            } catch (err) {
                if (result) {
                    await cloudinary.uploader.destroy(result?.public_id, { resource_type: "raw"})
                }
                await deleteLocalFile(filePath)
                await ReportRepository.updateStatus(report._id, "FAILED")
                throw err
            }
            await deleteLocalFile(filePath)
        }
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