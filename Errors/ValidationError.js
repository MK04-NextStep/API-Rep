const ApiError = require('./ApiError');

class ValidationError extends ApiError{
    constructor (message){
        super(message, 400)
    }
}

module.exports = ValidationError;