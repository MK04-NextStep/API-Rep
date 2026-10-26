const Invite = require('../Models/invite.model');

const create = async(data) => {
    let invite = await Invite.create(data);
    return invite;
}

const findInviteOtp = async(otp) => {
    let invite = await Invite.findOne(
        { otp, expiresIn: { $gt: Date.now() }}
    ).lean()
    return invite;
}

const deleteByWorkspaceId = async(workspaceId) => {
    let invites = await Invite.deleteMany({workspaceId})
    return invites
}

const deleteExpiredOtp = async() =>{
    await Invite.deleteMany({
        expiresIn: { $lte: new Date() }
    })
}

module.exports = {
    create,
    findInviteOtp,
    deleteByWorkspaceId,
    deleteExpiredOtp
}