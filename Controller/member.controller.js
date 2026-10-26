const {getMembersService, inviteMemberService,
    acceptInviteService, deleteMemberService,
    updateMemberRoleService
} = require('../Services/member.service');

const getMembers = async(req, res, next) => {
    let workspace = req.workspace;
    let data = req.query;
    let input = {}
    if(data.limit && data.page){
        let page = Number(data.page)
        let limit = Number(data.limit)
        let skip = (page - 1) * limit
        input.page = page;
        input.limit = limit;
        input.skip = skip
    }
    if(data.role){
        input.role = data.role
    }
    if(data.sort){
        input.sort = data.sort.startsWith("-")? data.sort.slice("-") : data.sort;
        input.way = data.sort.startsWith("-") ? -1 : 1
    }
    let output = await getMembersService(workspace._id, input);
    let totalPage;
    if(output.total){
        totalPage = Math.ceil(output.total/input.limit)
    }
    res.json({
        success: true,
        data: output.member,
        pagination: output.total ? {
            currentPage: input.page,
            limit: input.limit,
            totalItems: output.total,
            totalPages: totalPage,
            hasNextPage: input.page < output.total ? true:false,
            hasPreviousPage: input.page > 1 ? true : false
        } : {}
    })
}

const inviteMember = async(req,res,next) => {
    let userId = req.userId;
    let workspace = req.workspace;
    let {email, role} = req.body;
    await inviteMemberService(userId, workspace, email, role);
    res.json({
        success: true,
        message: `Invitation has been send to ${email}`
    })
}

const acceptInvite = async(req,res,next) => {
    let {otp} = req.body;
    let userId = req.userId
    await acceptInviteService(otp, userId);
    res.json({
        success: true,
        message: "user accepted successfully"
    })
}

const deleteMember = async(req,res,next) => {
    let {memberId} = req.body;
    let userId = req.userId
    let workspace = req.workspace;
    await deleteMemberService(memberId, workspace._id, userId);
    res.json({
        success: true,
        message: "member delete successfully"
    })
}

const updateMemberRole = async(req,res,next) => {
    let {memberId, role} = req.body;
    let userId = req.userId;
    let workspace = req.workspace;
    await updateMemberRoleService(memberId, role, workspace._id, userId);
    res.json({
        success: true,
        message: "user updated successfully"
    })
}

module.exports = {
    getMembers,
    inviteMember,
    acceptInvite,
    deleteMember,
    updateMemberRole
}