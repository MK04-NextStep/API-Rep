const Report = require('../Models/report.model')
const Workspace = require('../Models/workspace.model')
const Member = require('../Models/workspaceMember.model')
const Api = require('../Models/api.model')
const File = require('../Models/file.model')

const create = async (data) => {
    let report = await Report.add(data);
    return report
}

const getReport = async (reportId) => {
    let report = await Report.findById(reportId)
    return report
}

const updateStatus = async (reportId, status) => {
    await Report.updateOne(
        { _id: reportId },
        {
            $set: {
                status: "PROCESSING"
            }
        }
    )
}

const updateData = async(reportId, data) => {
    await Report.updateOne(
        { _id: reportId }, 
        {
            $set: {
                status: data.status,
                fileUrl: data.url,
                publicId: data.publicId
            }
        }
    )
}

const createAnalysis = async (workspaceId, reportId) => {
    let query = {
        members: [
            {
                $match: {
                    workspaceId: workspaceId
                }
            }, {
                $group: {
                    _id: "$role",
                    count: {
                        $sum: 1
                    }
                }
            }
        ],
        api: [
            {
                $match: {
                    workspaceId: workspaceId
                }
            },
            {
                $group: {
                    _id: "$method",
                    count: {
                        $sum: 1
                    }
                }
            }
        ],
        files: [
            {
                $match: {
                    workspaceId: workspaceId
                }
            }, {
                $group: {
                    _id: null,
                    totalSize: {
                        $sum: "$size"
                    },
                    totalFiles: {
                        $sum: 1
                    }
                }
            }
        ]
    }

    let workspaceResult = await Workspace.findById(workspaceId)
    let memberResult = await Member.aggregate(query.members)
    let apiResult = await Api.aggregate(query.api)
    let fileResult = await File.aggregate(query.files)

    const totalMembers = memberResult.reduce(
        (total, member) => total + member.count,
        0
    )
    const totalApis = apiResult.reduce(
        (total, api) => total + api.count, 0
    )

    const byRole = Object.fromEntries(
        memberResult.map(member => [member._id, member.count])
    )

    const byMethod = Object.fromEntries(
        apiResult.map(api => [api._id, api.count])
    )

    let reportData = {
        report: {
            id: reportId,
            generatedAt: new Date()
        },
        workspace: {
            id: workspaceResult._id,
            name: workspaceResult.name,
            type: workspaceResult.type
        },
        members: {
            total: totalMembers,
            byRole: byRole
        },
        apis: {
            total: totalApis,
            byMethod: byMethod
        },
        files: {
            total: fileResult[0]?.totalFiles ?? 0,
            totalSize: fileResult[0]?.totalSize ?? 0
        }
    }
    return reportData

}

module.exports = {
    create,
    updateStatus,
    getReport,
    createAnalysis,
    updateData
}