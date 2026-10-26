const ForbiddenError = require('../Errors/ForbiddenError')

const roleMiddleware = (roles) => {
    return (req,res,next) => {
        if(!Array.isArray(roles)){
            return next(new TypeError("roles should be in array"))
        }
        let role = req.member.role;
        if(!roles.includes(role)){
            return next(new ForbiddenError("user is not authorized"))
        }
        next();
    }
}

const ownerRole = roleMiddleware(["owner"])
const adminRole = roleMiddleware(["owner","admin"]);
const developerRole = roleMiddleware(["owner", "admin", "developer"])
const allRole = roleMiddleware(["owner","admin","developer","viewer"])

module.exports = {
    ownerRole,
    adminRole,
    developerRole,
    allRole,
    roleMiddleware
};