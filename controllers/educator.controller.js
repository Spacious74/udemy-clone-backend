const catchAsyncError = require('../middlewares/catchAsyncError');
const Educator = require('../models/Educator');

const getAllEducator = catchAsyncError(async (req,res,next)=>{
    const educators = await Educator.find();
    res.status(200).send({
        educators
    })
})

const createEducator = catchAsyncError(async (req,res,next)=>{
    const edu = req.body;
    await Educator.create({
        edname : edu.name,
        edProfilePicture : {
            public_id : "temp",
            url : "temp"
        },
        experience : edu.experience,
        proffession : edu.proffession
    });
    res.status(200).send({
        success : true,
        message : "Educator regestired successfully"
    })
})


module.exports = {
    createEducator,
    getAllEducator
}