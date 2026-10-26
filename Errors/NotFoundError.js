const ApiError = require('./ApiError');

class NotFoundError extends ApiError{
    constructor (message){
        super(message, 404)
    }
}

module.exports = NotFoundError;