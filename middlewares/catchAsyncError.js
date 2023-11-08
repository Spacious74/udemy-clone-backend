const catchAsyncError = (passedFun)=>{
    return (req,res,next)=>{
        Promise.resolve(passedFun(req,res,next)).catch(next);
    }
}

module.exports = catchAsyncError