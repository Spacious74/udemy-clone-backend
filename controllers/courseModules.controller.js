const CourseModule = require("../models/CourseModules");
const CustomErrorHandler = require("../utils/customErrorHandler");
const catchAsyncError = require("../middlewares/catchAsyncError");
const cloudinary = require("cloudinary").v2;


const getAllSections = catchAsyncError(async (req,res)=>{
    const courseId = req.params.courseId;
    const sections = await CourseModule.findOne({courseId: courseId});
    res.status(200).send({
        message : "Course Sections fetched successfully",
        sections : sections.videosArr
    })
})


const addSection = catchAsyncError(async (req, res, next) => {
  const id = req.params.couresId;
  const module = await CourseModule.findOne({ courseId: id });
  module.videosArr.push({
    sectionName: req.body.sectionName,
    videos: [],
  });
  await module.save();

  res.status(200).send({
    message : "Section added successfully..."
  })

});

const deleteSection = catchAsyncError(async (req,res, next)=>{
    const sectionId = req.query.sectionId;
    const courseId = req.query.courseId;
    const module = await CourseModule.findOne({courseId : courseId});

    module.videosArr.pull({_id : sectionId});
    await module.save();
    res.status(200).send({
        message : "Section removed successfully.."
    })
})

const updateSection = catchAsyncError(async (req,res,next) => {

    const sectionId = req.query.sectionId;
    const courseId = req.query.courseId;
    const module = await CourseModule.findOne({courseId : courseId});
    let newName = req.body.sectionName;

    const sectionIndex = module.videosArr.findIndex(section => section._id == sectionId);

    if(!req.body.sectionName){
        newName = module.videosArr[sectionIndex].sectionName
    }

    module.videosArr[sectionIndex].sectionName = newName;

    await module.save();

    res.status(200).send({
        message : "Section name updated successfully",
    })

})

const addVideoToSection = catchAsyncError(async (req,res,next) => {
    const bd = req.body;
    const courseId = req.query.courseId;
    const sectionId = req.query.sectionId;
    if(!bd.url || !bd.name || !bd.publicId){
        return next(new CustomErrorHandler("Missing information", 500));
    }
    // name, url, publicId, setctionId, courseId
    const module = await CourseModule.findOne({courseId : courseId});
    const sectionIndex = module.videosArr.findIndex(section => section._id == sectionId);

    module.videosArr[sectionIndex].videos.push({
        public_id : bd.publicId,
        url : bd.url,
        name : bd.name
    });
    await module.save();

    res.status(200).send({
        message : "Video uploaded successfully",
    })
    
})
const deleteVideo = catchAsyncError(async(req,res,next)=>{
    const courseId = req.query.courseId;
    const sectionId = req.query.sectionId;
    const videoId = req.query.videoId;
    const module = await CourseModule.findOne({courseId : courseId});
    const sectionIndex = module.videosArr.findIndex(section => section._id == sectionId);
    const videoIndex = module.videosArr[sectionIndex].videos.findIndex(video => video._id == videoId);
    let videoPublicId = module.videosArr[sectionIndex].videos[videoIndex].public_id;
    const result = await cloudinary.uploader.destroy(videoPublicId, {resource_type: 'video'});
    module.videosArr[sectionIndex].videos.pull({_id : videoId});
    await module.save();
    res.status(200).send({
        message : "Video deleted successfully!!!",
        result : result.result
    });
});

const updateVideoTitle = catchAsyncError(async (req,res,next)=>{

    const courseId = req.query.courseId;
    const sectionId = req.query.sectionId;
    const videoId = req.query.videoId;
    let newName = req.body.videoTitle;

    const module = await CourseModule.findOne({courseId : courseId});
    const sectionIndex = module.videosArr.findIndex(section => section._id == sectionId);
    const videoIndex = module.videosArr[sectionIndex].videos.findIndex(video => video._id == videoId);
    if(!req.body.videoTitle){
        newName = module.videosArr[sectionIndex].videos[videoIndex].name
    }
    module.videosArr[sectionIndex].videos[videoIndex].name = newName;

    await module.save();

    res.status(200).send({
        message : "Video name updated successfully",
    });

})

module.exports = {
    addSection,
    deleteSection,
    getAllSections,
    updateSection,
    addVideoToSection,
    updateVideoTitle,
    deleteVideo
}