require('dotenv').config();

const request = require('supertest');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');

const app = require('../../../Routes/app');
const connectDB = require('../../../Config/database');

const User = require('../../../Models/user.model');
const Workspace = require('../../../Models/workspace.model');
const WorkspaceMember = require('../../../Models/workspaceMember.model');

describe('POST /workspace/new - create workspace', () => {
    let testUser;
    let token;
    let workspaceId;

    beforeAll(async () => {
        await connectDB();

        testUser = await User.create({
            name: 'Integration Tester',
            email: `workspace-test-${Date.now()}@example.com`,
            password: 'test-password-123'
        });

        token = jwt.sign(
            { id: testUser._id },
            process.env.YOUR_JWT_SECRET,
            { expiresIn: '1h' }
        );
    });

    afterAll(async () => {
        if (workspaceId) {
            await WorkspaceMember.deleteMany({ workspaceId });
            await Workspace.deleteOne({ _id: workspaceId });
        }

        if (testUser?._id) {
            await User.deleteOne({ _id: testUser._id });
        }

        await mongoose.connection.close();
    });

    it('should create a workspace and its owner membership', async () => {
        const response = await request(app)
            .post('/workspace/new')
            .set('Authorization', `Bearer ${token}`)
            .send({
                name: 'Test Workspace',
                description: 'Created during integration testing',
                type: 'personal'
            });

        expect(response.status).toBe(200);
        expect(response.body.success).toBe(true);

        expect(response.body.data).toBeDefined();
        expect(response.body.data.name).toBe('Test Workspace');
        expect(response.body.data.description)
            .toBe('Created during integration testing');
        expect(response.body.data.type).toBe('personal');
        expect(response.body.data.owner).toBe(testUser._id.toString());

        workspaceId = response.body.data._id;

        const savedWorkspace = await Workspace.findById(workspaceId);

        expect(savedWorkspace).not.toBeNull();
        expect(savedWorkspace.name).toBe('Test Workspace');
        expect(savedWorkspace.owner.toString())
            .toBe(testUser._id.toString());

        const savedMembership = await WorkspaceMember.findOne({
            workspaceId: savedWorkspace._id,
            userId: testUser._id
        });

        expect(savedMembership).not.toBeNull();
        expect(savedMembership.role).toBe('owner');
    });
});