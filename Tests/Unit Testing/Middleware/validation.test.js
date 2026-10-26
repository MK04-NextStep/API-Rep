const validatorMiddleware = require('../../../Middleware/validate.middleware')
const ValidationError = require("../../../Errors/ValidationError");
const { z } = require("zod");

const testSchema = z.object({
    name: z.string()
});

describe('validator middleware', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    let res = {}
    let next = jest.fn()

    it("should allow validate input", () => {
        let req = {
            body: {
                name: "hello"
            }
        }
        let middleware = validatorMiddleware(testSchema)
        middleware(req, res, next)

        console.log(next.mock.calls);

        expect(next)
        .toHaveBeenCalledWith()
    })

    it("should not allow invalid input", () => {
        let req = {
            body: {
                name: 12
            }
        }
        let middleware = validatorMiddleware(testSchema)
        middleware(req, res, next)

        expect(next)
            .toHaveBeenCalledWith(
                expect.any(ValidationError)
            )

    })
})