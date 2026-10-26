const ValidationError = require("../Errors/ValidationError");

const validatorMiddleware = (schema, source = "body") => {
    return (req, res, next) => {
        const result = schema.safeParse(req[source]);
        if (result.success) {
            return next();
        }

        const messages = result.error.issues.map(issue => issue.message);

        return next(new ValidationError(messages));
    };
};

module.exports = validatorMiddleware;