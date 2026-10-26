const ForbiddenError = require('../../../Errors/ForbiddenError')
const { roleMiddleware,
    ownerRole, adminRole, allRole, developerRole
} = require('../../../Middleware/role.middleware')

describe("role middleware error group", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });
    let req = {
        member: {
            role: "developer"
        }
    }
    let res = {}
    let next = jest.fn()

    it("should provide TypeError if roles are not in array", () => {
        let middleware = roleMiddleware("owner")
        middleware(req, res, next)
        expect(next)
            .toHaveBeenCalledWith(
                expect.any(TypeError)
            )
    })

    it("should provide ForbiddenError if role is not in allowed", () => {
        let middleware = roleMiddleware(["owner", "admin"])
        middleware(req, res, next)
        expect(next)
            .toHaveBeenCalledWith(
                expect.any(ForbiddenError)
            )
    })
})

describe("variations of role middleware", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });
    let req = {
        member: {
            role: "owner"
        }
    }
    let res = {}
    let next = jest.fn()
    it("should accept user with owner role", () => {
        let middleware = ownerRole
        middleware(req, res, next)
        expect(next)
            .toHaveBeenCalledWith()
    })

    it("should accept user with admin and owner role", () => {
        req.member.role ="admin"
        let middleware = adminRole
        middleware(req, res, next)
        expect(next)
            .toHaveBeenCalledWith()
    })

    it("should accept user with admin,owner and developer role", () => {
        req.member.role ="developer"
        let middleware = developerRole
        middleware(req, res, next)
        expect(next)
            .toHaveBeenCalledWith()
    })

    it("should accept user with admin, owner, developer and view role", () => {
        req.member.role ="viewer"
        let middleware = allRole
        middleware(req, res, next)
        expect(next)
            .toHaveBeenCalledWith()
    })

    it("should not accept user without owner role", () => {
        req.member.role = "admin"
        let middleware = ownerRole
        middleware(req, res, next)
        expect(next)
            .toHaveBeenCalledWith(
                expect.any(ForbiddenError)
            )
    })

    it("should not accept user without owner and admin role", () => {
        req.member.role ="viewer"
        let middleware = adminRole
        middleware(req, res, next)
        expect(next)
            .toHaveBeenCalledWith(
                expect.any(ForbiddenError)
            )
    })

    it("should not accept user without owner, admin and developer role", () => {
        req.member.role ="viewer"
        let middleware = developerRole
        middleware(req, res, next)
        expect(next)
            .toHaveBeenCalledWith(
                expect.any(ForbiddenError)
            )
    })

    it("should not accept user without owner, admin, developer or viewer", () => {
        req.member.role ="guest"
        let middleware = allRole
        middleware(req, res, next)
        expect(next)
            .toHaveBeenCalledWith(
                expect.any(ForbiddenError)
            )
    })
})