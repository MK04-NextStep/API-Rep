const { Queue } = require('bullmq')
require('dotenv').config()

const deleteOtp = new Queue("otp",
    {
        connection: {
            host: process.env.QUEUE_HOST,
            port: process.env.QUEUE_PORT
        }
    }
)

await deleteOtp.upsertJobScheduler(
    "delete-expired-otp-schedular",
    {
        every: 24 * 60 * 60 * 1000
    },{
        name: "delete-expired-otp",
        data: {}
    }
)