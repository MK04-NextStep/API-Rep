const workspaceMiddleware = require('../../../Middleware/workspace.middleware')
const WorkspaceRepository = require('../../../Repositories/workspace.repository')
const WorkspaceMemberRepository = require('../../../Repositories/workspaceMember.repository')
const NotFoundError = require('../../../Errors/NotFoundError')
const ForbiddenError = require('../../../Errors/ForbiddenError')
jest.mock('../../../Repositories/workspace.repository')
jest.mock('../../../Repositories/workspaceMember.repository')

describe("workspace middleware", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    let workspace = {
        _id: "1234",
        name: "workspace",
        description: "this is my first workspace",
        type: "personal",
        owner: "9087"
    }
    let member = {
        _id: "6789",
        workspaceId: "1234",
        userId: "9087",
        role: "owner"
    }
    let req = {
        userId: "9087",
        params: {
            workspaceId: "1234"
        }
    }
    let res = {}
    let next = jest.fn()

    it("should give workspace and member correctly", async () => {
        WorkspaceRepository
            .findById
            .mockResolvedValue(workspace)

        WorkspaceMemberRepository
            .findByUserIdAndWorkspaceId
            .mockResolvedValue(member)

        await workspaceMiddleware(req, res, next)

        expect(req.workspace).toEqual(workspace)
        expect(req.member).toEqual(member)
        expect(next).toHaveBeenCalledWith();

        expect(WorkspaceRepository.findById).toHaveBeenCalledWith("1234")
        expect(WorkspaceMemberRepository.findByUserIdAndWorkspaceId).toHaveBeenCalledWith("9087", "1234")
    })

    it("should give null if no workspace found", async () => {
        WorkspaceRepository
            .findById
            .mockResolvedValue(null)

        await workspaceMiddleware(req, res, next)

        expect(next).toHaveBeenCalledWith(
            expect.any(NotFoundError)
        );

        expect(WorkspaceRepository.findById)
            .toHaveBeenCalledWith("1234")

        expect(WorkspaceMemberRepository.findByUserIdAndWorkspaceId)
            .not.toHaveBeenCalled()
    })

    it("should give null if no member found", async() => {
        WorkspaceRepository
            .findById
            .mockResolvedValue(workspace)

        WorkspaceMemberRepository
            .findByUserIdAndWorkspaceId
            .mockResolvedValue(null)

        await workspaceMiddleware(req, res, next)

        expect(req.workspace).toEqual(workspace)
        expect(next).toHaveBeenCalledWith(
            expect.any(ForbiddenError)
        );

        expect(WorkspaceRepository.findById)
        .toHaveBeenCalledWith("1234")
        expect(WorkspaceMemberRepository.findByUserIdAndWorkspaceId)
        .toHaveBeenCalledWith("9087", "1234")
    })
})