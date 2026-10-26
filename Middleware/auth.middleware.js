const UserRepository = require('../Repositories/user.repository');
const jwt = require('jsonwebtoken');
const UnauthorizedError = require('../Errors/UnauthorizedError');
const NotFoundError = require('../Errors/NotFoundError');
require('dotenv').config()

const authMiddleware = async(req,res,next) => {
    let token = req.headers.authorization;
    if(!token || !token.startsWith("Bearer")){
        return next(new UnauthorizedError("Invalid Token"))
    }

    let accessToken = token.split(" ")[1];

    let verifyToken = jwt.verify(accessToken, process.env.JWT_SECRET_KEY);
    if(!verifyToken){
        return next(new UnauthorizedError("Invalid Token"))
    }

    let existUser = await UserRepository.findById(verifyToken.id);
    if(!existUser){
        return next(new NotFoundError("User not found"))
    }

    req.userId = verifyToken.id;
    next();
}

module.exports = authMiddleware;