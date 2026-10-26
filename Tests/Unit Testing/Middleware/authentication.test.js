const UserRepository = require('../../../Repositories/user.repository');
const jwt = require('jsonwebtoken');
const UnauthorizedError = require('../../../Errors/UnauthorizedError');
const NotFoundError = require('../../../Errors/NotFoundError');
const authMiddleware = require('../../../Middleware/auth.middleware');
require('dotenv').config()

jest.mock('jsonwebtoken')
jest.mock('../../../Repositories/user.repository')

describe("authentication middleware", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });
    let token = "Bearer 1234567"
    let user = {
        _id: "8097",
        email: "abc@gmail.com",
        password: "123rty",
        isVerified: false
    }

    let res = {}
    let next = jest.fn()

    it("should attach userId to req when the user exists", async () => {
        let req = {
            headers: {
                authorization: token
            }
        }
        jwt.verify
            .mockReturnValue({ id: "8097" })

        UserRepository
            .findById
            .mockResolvedValue(user)

        await authMiddleware(req, res, next)

        expect(jwt.verify)
            .toHaveBeenCalledWith("1234567", process.env.JWT_SECRET_KEY)

        expect(req.userId).toEqual("8097")
        expect(next)
        .toHaveBeenCalledWith()

        expect(UserRepository.findById)
            .toHaveBeenCalledWith("8097")

    })

    it("should give Unauthorized Error if token is null", async () => {
        let req = {
            headers: {
                authorization: null
            }
        }
        await authMiddleware(req, res, next)

        expect(next)
        .toHaveBeenCalledWith(
            expect.any(UnauthorizedError)
        )

        expect(jwt.verify)
            .not.toHaveBeenCalled()

        expect(UserRepository.findById)
            .not.toHaveBeenCalled()
    })

    it("should give Unauthorized Error if token is not starts with Bearer", async () => {
        let req = {
            headers: {
                authorization: "1234567"
            }
        }
        await authMiddleware(req, res, next)

        expect(jwt.verify)
            .not.toHaveBeenCalled()

        expect(UserRepository.findById)
            .not.toHaveBeenCalled()
    })

    it("should expect Unauthorized Error if token is not verified", async () => {
        let req = {
            headers: {
                authorization: token
            }
        }
        jwt.verify
            .mockReturnValue(null)

        await authMiddleware(req, res, next)

        expect(next)
        .toHaveBeenCalledWith(
            expect.any(UnauthorizedError)
        )

        expect(jwt.verify)
        .toHaveBeenCalledWith("1234567", process.env.JWT_SECRET_KEY)

        expect(UserRepository.findById)
        .not.toHaveBeenCalled()
    })

    it("should expect NotFoundError if user is not available", async () => {
        let req = {
            headers: {
                authorization: token
            }
        }
        jwt.verify
            .mockReturnValue({ id: "8097"})

        UserRepository
        .findById
        .mockResolvedValue(null)

        await authMiddleware(req,res,next)

        expect(jwt.verify)
        .toHaveBeenCalledWith("1234567", process.env.JWT_SECRET_KEY )

        expect(UserRepository.findById)
        .toHaveBeenCalledWith("8097")

        expect(next)
        .toHaveBeenCalledWith(
            expect.any(NotFoundError)
        )
    })
})