//define and export the email queue
//PRODUCER
const {Queue} = require('bullmq')
require('dotenv').config()

const emailQueue = new Queue("email", {
    connection: {
        host: process.env.QUEUE_HOST,
        port: process.env.QUEUE_PORT
    }
})

const addEmailQueue = async(email, otp) => {
    await emailQueue.add("send-verification-email", 
        {email, otp},
        {
            attempts: 3,
            backoff: {
                type: "exponential",
                delay: 1000
            }
        }
    )
}

const addInviteQueue = async(email, name, otp) => {
    await emailQueue.add("send-invite-email",
        { email, name, otp }, {
        attempts: 3,
        backoff: {
            type: "exponential",
            delay: 1000
        }
    })
}

const addPasswordQueue = async(email, otp) => {
    await emailQueue.add("send-forgot-password-email", 
        { email, otp },
        {
            attempts: 3,
            backoff: {
                type: "exponential",
                delay: 1000
            }
        }
    )
}

module.exports = { 
    addEmailQueue,
    addInviteQueue,
    addPasswordQueue
}