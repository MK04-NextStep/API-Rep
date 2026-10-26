const User = require('../Models/user.model');

const findByEmail = async (email) => {
    let user = await User.findOne({ email: email }).select("+password").lean()
    return user;
}

const findById = async (id) => {
    let user = await User.findById(id).select("profilePic.publicId").lean()
    return user;
}

const createUser = async (data) => {
    let user = await User.create(data)
    return user;
}

const deleteById = async (id) => {
    let deleteUser = await User.findByIdAndDelete(id);
    return deleteUser;
}

const userVerified = async (email) => {
    let existUser = await User.updateOne(
        { email }, { $set: { isEmailVerified: true } }
    )
    return existUser;
}

const userResetPassword = async (email, password) => {
    let existUser = await User.updateOne(
        { email }, { $set: { password: password } }
    )
    return existUser
}

const profilePicUpdate = async (userId, url, publicId) => {
    const user = await User.updateOne(
        { _id: userId },
        {
            $set: {
                profilePic: {
                    url,
                    publicId
                }
            }
        }
    )
    return;
}

const failedAttemps = async (userId) => {
    let user = await User.updateOne(
        { _id: userId }, { $inc: { failedAttempts: 1 } }, { new: true }
    )
    return user.failedAttemps
}

const locked = async (userId) => {
    const lockedUntil = new Date(Date.now() + 15 * 60 * 1000);

    return await User.findByIdAndUpdate(
        userId,
        { lockedUntil },
        { new: true }
    );
}

const reset = async( userId) => {
    const user = await User.findByIdAndUpdate(
        userId,
        { failedAttemps: 0, lockedUntil: null },
        { new: true }
    )   
    return user;
}

module.exports = {
    findByEmail,
    findById,
    createUser,
    deleteById,
    userVerified,
    userResetPassword,
    profilePicUpdate,
    failedAttemps,
    locked,
    reset
}