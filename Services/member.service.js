const WorkspaceMemberRepository = require('../Repositories/workspaceMember.repository');
const UserRepository = require('../Repositories/user.repository');
const InviteRepository = require('../Repositories/invite.repository')
const NotFoundError = require('../Errors/NotFoundError');
const ForbiddenError = require('../Errors/ForbiddenError');
const ConflictError = require('../Errors/ConflictError')
const UnauthorizedError = require('../Errors/UnauthorizedError');
const generateOtp = require('../Utils/generateOtp');
const logger = require('../Config/logger')
const { addInviteQueue } = require('../Queues/email.queue')
const sendEmail = require("../Config/mailer");
const crypto = require('crypto')

const getMembersService = async(workspaceId, input) => {
    let data = await WorkspaceMemberRepository.filterOption(workspaceId, input)
    if(data.member.length <= 0){
        return []
    }
    return data
}

const inviteMemberService = async(userId, workspace, email, role) => {
    let targetUser = await UserRepository.findByEmail(email);
    if(!targetUser){
        throw new NotFoundError("Please register first")
    }
    if(targetUser._id.toString() === userId.toString()){
        throw new ForbiddenError("user cant invite themselves")
    }
    let member = await WorkspaceMemberRepository.findByUserIdAndWorkspaceId(targetUser._id, workspace._id)
    if(member> 0){
        throw new ConflictError("user is already workspace member");
    }
    await InviteRepository.deleteByWorkspaceId(workspace._id);
    let {otp, hashedOtp} = generateOtp();
    let data = {
        workspaceId: workspace._id,
        invitedBy: userId,
        role: role,
        otp: hashedOtp,
        expiresIn: Date.now() + 30 * 24 * 60 * 60 * 1000
    }
    await InviteRepository.create(data);
    await addInviteQueue(email, workspace.name, otp)
    logger.info("Audit Event", {
        action: "INVITE_MEMBER",
        userId,
        workspaceId: workspace._id,
        targetUserId: targetUser._id
    })
    return;
}

const acceptInviteService = async(otp, userId)=> {
    let hashedOtp = crypto.createHash('sha256').update(otp).digest('hex');
    let existOtp = await InviteRepository.findInviteOtp(hashedOtp);
    if(!existOtp){
        throw new UnauthorizedError("invalid otp")
    }
    await WorkspaceMemberRepository.createMember({
        workspaceId: existOtp.workspaceId,
        userId: userId,
        role: existOtp.role
    })
    await InviteRepository.deleteByWorkspaceId(existOtp.workspaceId);

    logger.info("Audit Event", {
        action: "ACCEPT_INVITE",
        userId,
        workspaceId: existOtp.workspaceId,
        targetUserId: userId
    })
    return;
}

const deleteMemberService = async(memberId, workspaceId, userId) => {
    let isMember = await WorkspaceMemberRepository.isMember(memberId, workspaceId)
    if(isMember.length <= 0){
        throw new NotFoundError("member not found")
    }
    await WorkspaceMemberRepository.deleteOne(memberId, workspaceId);

    logger.info("Audit Event", {
        action: "DELETE_MEMBER",
        userId,
        workspaceId: workspaceId,
        targetUserId: memberId
    })
    return;
}

const updateMemberRoleService = async(memberId, role, workspaceId, userId) => {
    let member = await WorkspaceMemberRepository.isMember(memberId, workspaceId);
    if(member.length <= 0) {
        throw new NotFoundError("user not found");
    }
    await WorkspaceMemberRepository.changeRole(memberId, workspaceId, role);

    logger.info("Audit Event", {
        action: "UPDATE_MEMBER",
        userId,
        workspaceId,
        targetUserId: memberId
    })
    return;
}

module.exports = {
    getMembersService,
    inviteMemberService,
    acceptInviteService,
    deleteMemberService,
    updateMemberRoleService
}