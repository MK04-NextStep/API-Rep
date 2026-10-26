const request = require('supertest');
const jwt = require("jsonwebtoken")
const app = require('../../../Routes/app')
const WorkspaceRepository = require('../../../Repositories/workspace.repository')
const WorkspaceMemberRepository = require('../../../Repositories/workspaceMember.repository')
const UserRepository = require('../../../Repositories/user.repository');

jest.mock('../../../Repositories/workspace.repository')
jest.mock('../../../Repositories/workspaceMember.repository')
jest.mock('jsonwebtoken')
jest.mock('../../../Repositories/user.repository')
jest.mock('../../../Docs/loader', () =>
    jest.fn().mockResolvedValue({
        openapi: '3.0.0',
        info: {
            title: 'Test API',
            version: '1.0.0'
        },
        paths: {}
    })
);
jest.mock('file-type', () => ({
    fileTypeFromFile: jest.fn()
}));

describe("/GET/workspace/workspacelist/:workspaceId", () => {
    beforeEach(() => {
        jest.resetAllMocks();
    });
    const userId = '507f1f77bcf86cd799439011';
    const workspaceId = '507f1f77bcf86cd799439012';

    const workspace = {
        _id: workspaceId,
        name: 'Test Workspace',
        description: 'Workspace for Supertest',
        owner: userId,
        type: 'personal'
    };

    const member = {
        userId,
        workspaceId,
        role: 'owner'
    };

    it("should pass", async () => {
        jwt.verify.mockReturnValue({ id: userId });

        UserRepository.findById.mockResolvedValue({
            _id: userId
        });

        WorkspaceRepository.findById.mockResolvedValue(workspace);

        WorkspaceMemberRepository.findByUserIdAndWorkspaceId
            .mockResolvedValue(member);

        const response = await request(app)
            .get(`/workspace/workspacelist/${workspaceId}`)
            .set('Authorization', 'Bearer test-access-token');

        expect(response.status).toBe(200);

        expect(response.body).toEqual({
            success: true,
            data: workspace
        });
    })

    it("Missing or invalid authentication returns the correct HTTP response", async () => {
        jwt.verify.mockReturnValue(null);

        const response = await request(app)
            .get(`/workspace/workspacelist/${workspaceId}`)
            .set('Authorization', null);

        expect(response.status).toBe(401);

        expect(response.body).toEqual({
            success: false,
            message: "Invalid Token"
        });
    })

    it("Workspace doesn't exist", async () => {
        jwt.verify.mockReturnValue({ id: userId });

        UserRepository.findById.mockResolvedValue({
            _id: userId
        });

        WorkspaceRepository.findById.mockResolvedValue(null);

        const response = await request(app)
            .get(`/workspace/workspacelist/${workspaceId}`)
            .set('Authorization', 'Bearer test-access-token');

        expect(response.status).toBe(404);

        expect(response.body).toEqual({
            success: false,
            message: "workspace not found"
        });
    })

    it("User isn't a workspace member", async () => {
        jwt.verify.mockReturnValue({ id: userId });

        UserRepository.findById.mockResolvedValue({
            _id: userId
        });

        WorkspaceRepository.findById.mockResolvedValue(workspace);

        WorkspaceMemberRepository.findByUserIdAndWorkspaceId
            .mockResolvedValue(null);

        const response = await request(app)
            .get(`/workspace/workspacelist/${workspaceId}`)
            .set('Authorization', 'Bearer test-access-token');

        expect(response.status).toBe(403);

        expect(response.body).toEqual({
            success: false,
            message: "user is not part of workspace"
        });
    })

    it("Member has an unauthorized role", async () => {
        const member = {
            userId,
            workspaceId,
            role: 'guest'
        };
        jwt.verify.mockReturnValue({ id: userId });

        UserRepository.findById.mockResolvedValue({
            _id: userId
        });
        WorkspaceRepository.findById.mockResolvedValue(workspace);
        WorkspaceMemberRepository.findByUserIdAndWorkspaceId
            .mockResolvedValue(member);

        const response = await request(app)
            .get(`/workspace/workspacelist/${workspaceId}`)
            .set('Authorization', 'Bearer test-access-token');

        expect(response.status).toBe(403);

        expect(response.body).toEqual({
            success: false,
            message: "user is not authorized"
        });
    })

    it("Invalid workspace ID returns the correct HTTP response", async () => {
        jwt.verify.mockReturnValue({ id: userId });
        UserRepository.findById.mockResolvedValue({
            _id: userId
        });
        const response = await request(app)
            .get(`/workspace/workspacelist/1234`)
            .set('Authorization', 'Bearer test-access-token');
        expect(response.status).toBe(400);
        expect(response.body).toEqual({
            success: false,
            message: "Invalid ObjectId"
        });
    })
})