const sendToken = (res,user,message,statusCode = 200)=>{
    const token = getJWTToken();
    const options = {
        expires : new Date(Date.now() + 15 * 24 * 60 * 60 * 1000),
        httpOnly : true,
        // secure : true,
        sameSite : true
    }
    res.status(statusCode).cookie("user_token", token, options).json({
        success : true,
        message,
        user
    })
}
module.exports = sendToken;