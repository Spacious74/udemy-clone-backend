const Course = require('../models/Course');
const User = require('../models/User');


const buyNow = async (req, res)=>{

    const userId = req.query.userId;
    const courseId = req.query.courseId;

    try {
        const course = await Course.findOne({_id : courseId})
        const user = await User.findById({_id : userId});

        const purchased = user.playlist.find(co => co.courseId == courseId);
       
        if(purchased){
            res.status(200).send({
                message : "Course already puchased"
            })
            return;
        }

        user.playlist.push({
            courseId  : course._id,
            coursePoster : course.coursePoster.url,
            courseTitle : course.title,
            instructor : course.educator.edname,
        });
        await user.save();

        course.totalStudentsPurchased++;
        await course.save();

        res.status(200).send({
            message : "Course puchased successfully!",
            playlist : user.playlist
        })

        
    } catch (error) {
        res.status(500).send({
            message : "Some internal error occurred!",
            error : error.message
        });
    }
}

module.exports = {
    buyNow
}


