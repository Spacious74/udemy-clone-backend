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
    const limit = isGuest ? 10 : 1000;

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
            --- LOGGED-IN USER PROFILE (use this to answer any personal questions) ---
            Name: ${userDoc.username || 'Student'}
            Headline: ${userDoc.headline || 'Not set'}
            Bio: ${userDoc.bio || 'Not set'}
            Courses Enrolled: ${enrolledCourses}
            Social Links: LinkedIn (${userDoc.socialLinks?.linkedin || 'None'}), GitHub (${userDoc.socialLinks?.github || 'None'}), Portfolio (${userDoc.socialLinks?.portfolio || 'None'})
            --- END USER PROFILE ---
            `;
        }
    }

    const maxTokens = 1400;

    if (!isCourseMode) {
        // General Mode
        const generalSystemPrompt = `You are SkillUp AI Tutor, a concise educational assistant. ${userProfileInfo}
        RULES:
        1. If the user asks about their name, profile, headline, bio, enrolled courses, or any personal information, answer using the USER PROFILE above. For example, if they ask "what's my name?", reply with their Name from the profile.
        2. Keep ALL responses under 300 words. Use 1-2 short paragraphs maximum. Never use bullet lists or numbered lists unless absolutely necessary.
        3. Be direct, helpful, and conversational. No filler phrases like "Great question!" or "That's a wonderful query!".`;
        const responseText = await generateChatResponse(message, generalSystemPrompt, [], maxTokens);
        return res.status(200).json({ success: true, response: responseText });
    }

    // Course Mode
    if (!courseId) {
        return res.status(400).json({ success: false, message: "courseId is required for course mode." });
    }
    if (isGuest) {
        return res.status(401).json({ success: false, message: "You must be logged in to use course mode." });
    }

    let course = await DraftedCourse.findById(courseId);
    if (!course) {
        return res.status(404).json({ success: false, message: "Course not found." });
    }

    // Context Building
    let progressStr = "Not started or progress unknown.";
    const progress = await UserProgress.findOne({ userId: req.user.uid, courseId: courseId });
    if (progress && progress.videosCompleted) {
        progressStr = `Completed ${progress.videosCompleted.length} videos.`;
    }

    const systemPrompt = `You are SkillUp AI Tutor, a concise educational assistant for a specific course.
        ${userProfileInfo}
        Current Course: ${course.title}
        Course Description: ${course.description}
        Student Progress: ${progressStr}

        RULES:
        1. If the user asks about their name, profile, headline, bio, enrolled courses, or any personal information, answer using the USER PROFILE above.
        2. Answer only questions related to this course. If unrelated, politely redirect.
        3. Keep ALL responses under 300 words. Use 1-2 short paragraphs maximum. No bullet lists or numbered lists unless absolutely necessary.
        4. Be direct and helpful. No filler phrases.`;

    // Fetch Chat History
    let chatDoc = await CourseChat.findOne({ userId: req.user.uid, courseId: courseId });
    let history = [];
    if (chatDoc && chatDoc.messages && chatDoc.messages.length > 0) {
        // Get last 10 messages
        history = chatDoc.messages.slice(-10);
    }

    const responseText = await generateChatResponse(message, systemPrompt, history, maxTokens);

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

exports.getDailyLimit = catchAsyncError(async (req, res, next) => {
    const isGuest = !req.user;
    const identifier = isGuest ? req.ip : req.user.uid;
    const limit = isGuest ? 10 : 1000;
    const date = getTodayDateString();

    const record = await DailyAILimit.findOne({ identifier, date });
    const totalQuestions = record ? record.totalQuestions : 0;
    const remaining = Math.max(0, limit - totalQuestions);

    return res.status(200).json({ success: true, limit, totalQuestions, remaining });
});
