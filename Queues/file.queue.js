const { Queue } = require('bullmq')
require('dotenv').config()

const fileQueue = new Queue("file", {
    connection: {
        host: process.env.QUEUE_HOST,
        port: process.env.QUEUE_PORT
    }
})

const addFileQueue = async( publicId ) => {
    await fileQueue.add("delete-file", 
        { publicId },{
            attempts: 3,
            backoff: {
                type: "exponential",
                delay: 1000
            }
        }
    )
}

module.exports = addFileQueue