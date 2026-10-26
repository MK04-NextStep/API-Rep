const jwt = require('jsonwebtoken');
require('dotenv').config()

const generateRefreshToken = (id) => {
    const refreshToken = jwt.sign({id}, process.env.JWT_SECRET_KEY, {expiresIn: "5d" });
    return refreshToken;
}

module.exports = generateRefreshToken;