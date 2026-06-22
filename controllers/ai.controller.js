const CourseChat = require('../models/CourseChat');
const DailyAILimit = require('../models/DailyAILimit');
const Course = require('../models/Course');
const DraftedCourse = require('../models/DraftedCourse');
const UserProgress = require('../models/UserProgress');
const User = require('../models/User');
const { generateChatResponse } = require('../services/gemini.service');
const catchAsyncError = require('../middlewares/catchAsyncError');

const getTodayDateString = () => {
    const today = new Date();
    return today.toISOString().split('T')[0];
};

const checkAndIncrementLimit = async (identifier, limit) => {
    const date = getTodayDateString();
    let record = await DailyAILimit.findOne({ identifier, date });
    
    if (!record) {
        record = new DailyAILimit({ identifier, date, totalQuestions: 1 });
        await record.save();
        return true;
    }
    
    if (record.totalQuestions >= limit) {
        return false;
    }
    
    record.totalQuestions += 1;
    await record.save();
    return true;
};

exports.chat = catchAsyncError(async (req, res, next) => {
    const { message, courseId, isCourseMode } = req.body;
    
    if (!message || message.length > 2000) {
        return res.status(400).json({ success: false, message: "Message is required and must be less than 2000 characters." });
    }

    const isGuest = !req.user;
    const identifier = isGuest ? req.ip : req.user.uid;
    const limit = isGuest ? 5 : 1000;

    const canProceed = await checkAndIncrementLimit(identifier, limit);
    if (!canProceed) {
        return res.status(429).json({ success: false, message: `Daily limit of ${limit} questions reached. Please try again tomorrow.` });
    }

    let userProfileInfo = "";
    if (!isGuest) {
        const userDoc = await User.findById(req.user.uid).populate('coursesEnrolled', 'title');
        if (userDoc) {
            const enrolledCourses = userDoc.coursesEnrolled && userDoc.coursesEnrolled.length > 0
                ? userDoc.coursesEnrolled.map(c => c.title).join(', ') 
                : 'None';
            
            userProfileInfo = `
User Profile Information:
- Username: ${userDoc.username || 'Student'}
- Bio/Description: ${userDoc.headline || ''} ${userDoc.bio || ''}
- Courses Enrolled: ${enrolledCourses}
- Social Links: LinkedIn (${userDoc.socialLinks?.linkedin || 'None'}), GitHub (${userDoc.socialLinks?.github || 'None'}), Portfolio (${userDoc.socialLinks?.portfolio || 'None'})
`;
        }
    }

    if (!isCourseMode) {
        // General Mode
        const generalSystemPrompt = `You are SkillUp AI Tutor.
${userProfileInfo}
CRITICAL INSTRUCTION: Keep your responses extremely short and to the point. Answer in 1 or 2 sentences maximum. Do not provide large explanations or use lists. Be highly concise.`;
        const responseText = await generateChatResponse(message, generalSystemPrompt);
        return res.status(200).json({ success: true, response: responseText });
    }

    // Course Mode
    if (!courseId) {
        return res.status(400).json({ success: false, message: "courseId is required for course mode." });
    }
    if (isGuest) {
         return res.status(401).json({ success: false, message: "You must be logged in to use course mode." });
    }

    let course = await Course.findById(courseId);
    if (!course) {
        course = await DraftedCourse.findById(courseId);
    }
    if (!course) {
        return res.status(404).json({ success: false, message: "Course not found." });
    }

    // Context Building
    let progressStr = "Not started or progress unknown.";
    const progress = await UserProgress.findOne({ userId: req.user.uid, courseId: courseId });
    if (progress && progress.videosCompleted) {
        progressStr = `Completed ${progress.videosCompleted.length} videos.`;
    }

    const systemPrompt = `You are SkillUp AI Tutor.
${userProfileInfo}
The student is currently studying the following course: ${course.title}
Course Description: ${course.description}
Progress: ${progressStr}

Answer only questions related to this course.
If the question is unrelated to the course, politely refuse and ask the student to ask course related questions only. 
Do not expose private user information. 
CRITICAL INSTRUCTION: Limit your response to 1 or 2 short sentences. Be highly concise, direct, and to the point. Do not use conversational filler, lists, or elaborate unless absolutely necessary.`;

    // Fetch Chat History
    let chatDoc = await CourseChat.findOne({ userId: req.user.uid, courseId: courseId });
    let history = [];
    if (chatDoc && chatDoc.messages && chatDoc.messages.length > 0) {
        // Get last 10 messages
        history = chatDoc.messages.slice(-10);
    }

    const responseText = await generateChatResponse(message, systemPrompt, history);

    // Save to DB
    if (!chatDoc) {
        chatDoc = new CourseChat({
            userId: req.user.uid,
            courseId: courseId,
            messages: []
        });
    }

    chatDoc.messages.push({ role: 'user', content: message });
    chatDoc.messages.push({ role: 'model', content: responseText });
    await chatDoc.save();

    return res.status(200).json({ success: true, response: responseText });
});

exports.getCourseChat = catchAsyncError(async (req, res, next) => {
    const { courseId } = req.params;
    
    if (!req.user) {
        return res.status(401).json({ success: false, message: "Authentication required." });
    }

    const chatDoc = await CourseChat.findOne({ userId: req.user.uid, courseId: courseId });
    if (!chatDoc) {
        return res.status(200).json({ success: true, messages: [] });
    }

    return res.status(200).json({ success: true, messages: chatDoc.messages });
});
