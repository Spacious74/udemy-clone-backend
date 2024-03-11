const catchAsyncError = require('../middlewares/catchAsyncError');
const Educator = require('../models/Educator');

const getAllEducator = catchAsyncError(async (req,res,next)=>{
    const educators = await Educator.find();
    res.status(200).send({
        educators
    })
})

const createEducator = catchAsyncError(async (req,res,next)=>{
    const {name, email, password, experience, proffession} = req.body;

    if(!name || !email || !password || !experience || !proffession){
        res.status(400).send({
            message : "Incomplete information request."
        })
    }

    const edu = await Educator.findOne({edEmail : email})
    if(edu){
        res.status(400).send({
            message : "Educator already exists with this email address. Login to continue!"
        })
    }

    const created = await Educator.create({
        edname : name,
        edEmail : email,
        edPassword : password,
        edProfilePicture : {
            public_id : "temp",
            url : "temp"
        },
        experience : experience,
        proffession : proffession
    });

    const token = jwt.sign({uid : created._id, email : created.email}, SECRET_KEY, {expiresIn : 7*24*60*60*1000} );
    res.cookie('token', token, { httpOnly: true, secure: true, sameSite: 'strict' });

    res.status(200).send({
        success : true,
        message : "Educator regestired successfully"
    });

})


module.exports = {
    createEducator,
    getAllEducator
}