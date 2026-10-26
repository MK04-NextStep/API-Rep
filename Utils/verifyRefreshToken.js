const jwt = require('jsonwebtoken');
const UnauthorizedError = require('../Errors/UnauthorizedError');
require('dotenv').config()

const verifyRefreshToken = async(refreshToken) => {
    let verifyToken = await jwt.verify(refreshToken, process.env.JWT_SECRET_KEY );
    if(!verifyToken){
        throw new UnauthorizedError("Invalid Token");
    }
    return verifyToken;
}

module.exports = verifyRefreshToken;