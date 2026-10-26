const Token = require('../Models/refreshToken.model');

const create = async(data) => {
    let newToken = await Token.create(data);
    return newToken;
}

const findByUserId = async(userId) => {
    let existToken = await Token.find({userId: userId}).select("token").lean()
    return existToken
}

const deleteByToken = async(token) => {
    let existToken = await Token.deleteOne({ token: token });
    return existToken;
}

module.exports = {
    create,
    findByUserId,
    deleteByToken
}