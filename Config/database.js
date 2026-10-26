const mongoose = require('mongoose');
require('dotenv').config()

const connectDB = () => {
    return mongoose.connect(process.env.TEST_DB_HOST)
}

module.exports = connectDB