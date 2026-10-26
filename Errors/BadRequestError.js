const ApiError = require('./ApiError');

class BadRequestError extends ApiError{
    constructor (message){
        super(message, 400)
    }
}

module.exports = BadRequestError;