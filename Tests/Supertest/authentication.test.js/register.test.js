require('dotenv').config();

const request = require('supertest');
const mongoose = require('mongoose');

const app = require('../../../Routes/app');
const connectDB = require('../../../Config/database');

describe('POST/auth/register', () => {
    beforeAll(async () => {
        await connectDB();
    });

    afterAll(async () => {
        await mongoose.connection.close();
    });

    it('should register user', async () => {
        const response = await request(app)
            .post('/auth/register')
            .send({
                name: 'Integration Tester',
                email: `workspace-test-${Date.now()}@example.com`,
                password: 'test-password-123'
            })

        expect(response.status).toBe(200);
        expect(response.body.success).toBe(true);

        expect(response.body.message).toBe('User Register Successfully. Verify Your Email');

    })
})