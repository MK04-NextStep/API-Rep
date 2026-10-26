const { Queue } = require('bullmq')
require('dotenv').config()

const reportQueue = new Queue("report", {
    connection: {
        host: process.env.QUEUE_HOST,
        port: process.env.QUEUE_PORT
    }
})

const addCreateReportQueue = async( reportId ) => {
    await reportQueue.add("create-report", 
        { reportId },{
            attempts: 3,
            backoff: {
                type: "exponential",
                delay: 1000
            }
        }
    )
}

module.exports = addCreateReportQueue