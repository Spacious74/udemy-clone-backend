export const authorizeRoles = (...allowedRoles)  => {
    return (req, res, next)=>{
        if(!allowedRoles.includes(req.user.role)){
            return res.status(403).send({
                message : "Forbidden! Given feature is not allowed to the Logged In user",
                success : false
            })
        }
        next();
    }
}