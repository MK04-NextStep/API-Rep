require('dotenv').config();

const request = require('supertest');
const mongoose = require('mongoose');

const app = require('../../../Routes/app');
const connectDB = require('../../../Config/database');

const User = require('../../../Models/user.model');

describe('POST/auth/login', () => {
    let testUser;

    beforeAll(async () => {
        await connectDB();
        testUser = await User.create({
            name: 'Integration Tester',
            email: `workspace-test-${Date.now()}@example.com`,
            password: 'test-password-123',
            isVerified: true
        });
    });

    afterAll(async () => {
        if (testUser?._id) {
            await User.deleteOne({ _id: testUser._id });
        }
        await mongoose.connection.close();
    });

    it('should login user', async () => {
        let email = `workspace-test-${Date.now()}@example.com`

        const response = await request(app)
            .post('/auth/login')
            .send({
                email: email,
                password: 'test-password-123'
            })

        expect(response.status).toBe(200);
        expect(response.body.success).toBe(true);

        expect(response.body.data).toBeDefined();
        expect(response.body.data.name).toBe('Integration Tester');

        let userId = response.body.data._id

        const user = await User.findById(userId)

        expect(user).not.toBeNull();
        expect(user.name).toBe('Integration Tester');
        expect(user.email).toBe(email)
        expect(user.isVerified).toBe(true)
    })
})