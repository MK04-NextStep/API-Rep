const jwt = require('jsonwebtoken');
require('dotenv').config()

const generateAccessToken = (id) => {
    const accessToken = jwt.sign({id}, process.env.JWT_SECRET_KEY, {expiresIn: "1d" });
    return accessToken;
}

module.exports = generateAccessToken;