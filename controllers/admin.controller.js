const User = require('../models/User');
const Course = require('../models/Course');
const DraftedCourse = require('../models/DraftedCourse');
const Payment = require('../models/Payment');
const CourseCategory = require('../models/CourseCategory');
const Certificate = require('../models/Certificate');
const CourseAnalyticsDetail = require('../models/CourseAnalyticsDetail');
const Review = require('../models/Review');
const CourseModule = require('../models/CourseModules');
const Question = require('../models/Question');
// Dashboard Stats
const getDashboardStats = async (req, res) => {
    try {
        const totalUsers = await User.countDocuments();
        const totalCourses = await DraftedCourse.countDocuments();
        const successfulPayments = await Payment.find({ paymentStatus: 'paid' });
        
        let totalRevenue = 0;
        let totalEnrollments = 0;
        const monthlyRevenue = new Array(12).fill(0);
        
        successfulPayments.forEach(p => {
            totalRevenue += (p.amount || 0);
            totalEnrollments += (p.courses ? p.courses.length : 0);
            
            if (p.createdAt) {
                const month = new Date(p.createdAt).getMonth();
                monthlyRevenue[month] += (p.amount || 0);
            }
        });

        const recentUsers = await User.find().sort({ createdAt: -1 }).limit(5).select('-password');
        const recentPayments = await Payment.find({ paymentStatus: 'paid' }).sort({ createdAt: -1 }).limit(5).populate('userId', 'username email').populate('courses', 'title');

        res.status(200).json({
            success: true,
            data: {
                totalUsers,
                totalCourses,
                totalRevenue,
                totalEnrollments,
                recentUsers,
                recentPayments,
                monthlyRevenue
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: "Error fetching dashboard stats", error: error.message });
    }
};

// Users
const getUsers = async (req, res) => {
    try {
        const { page = 1, limit = 10, search = '', role = '' } = req.query;
        
        let query = {};
        if (search) {
            query.$or = [
                { username: { $regex: search, $options: 'i' } },
                { email: { $regex: search, $options: 'i' } }
            ];
        }
        if (role) {
            query.role = role;
        }

        const users = await User.find(query)
            .select('-password')
            .sort({ createdAt: -1 })
            .limit(limit * 1)
            .skip((page - 1) * limit);
            
        const count = await User.countDocuments(query);

        res.status(200).json({
            success: true,
            data: users,
            total: count,
            page: Number(page),
            totalPages: Math.ceil(count / limit)
        });
    } catch (error) {
        res.status(500).json({ success: false, message: "Error fetching users", error: error.message });
    }
};

const updateUserRole = async (req, res) => {
    try {
        const { id } = req.params;
        const { role } = req.body;
        
        if (!['admin', 'teacher', 'student'].includes(role)) {
            return res.status(400).json({ success: false, message: "Invalid role" });
        }

        const updatedUser = await User.findByIdAndUpdate(id, { role }, { new: true }).select('-password');
        
        if (!updatedUser) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        res.status(200).json({ success: true, message: "User role updated successfully", data: updatedUser });
    } catch (error) {
        res.status(500).json({ success: false, message: "Error updating user role", error: error.message });
    }
};

const getUserDetails = async (req, res) => {
    try {
        const { id } = req.params;
        const user = await User.findById(id)
            .select('-password')
            .populate('coursesEnrolled', 'title coursePoster price language level')
            .populate('certifications.courseId', 'title');
        
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        const purchasedCourses = user.coursesEnrolled || [];
        const certificates = user.certifications || [];

        let teacherData = null;
        if (user.role === 'teacher') {
            // Fetch created courses
            const createdCourses = await DraftedCourse.find({ 'educator.edId': id }).populate('subCategoryId', 'name');
            
            // Fetch analytics
            const analytics = await CourseAnalyticsDetail.find({ teacherId: id }).populate('courseId', 'title');
            
            // Fetch reviews
            const courseIds = createdCourses.map(c => c._id);
            const reviews = await Review.find({ courseId: { $in: courseIds } }).populate('courseId', 'title');

            teacherData = {
                createdCourses,
                analytics,
                reviews
            };
        }

        res.status(200).json({
            success: true,
            data: {
                profile: user,
                purchasedCourses,
                certificates,
                teacherData
            }
        });

    } catch (error) {
        res.status(500).json({ success: false, message: "Error fetching user details", error: error.message });
    }
};


// Courses
const getCourses = async (req, res) => {
    try {
         const { page = 1, limit = 10, search = '' } = req.query;
         
         let query = {};
         if(search) {
             query.title = { $regex: search, $options: 'i' };
         }

         const courses = await DraftedCourse.find(query)
            .populate('educator.edId', 'username email')
            .populate('subCategoryId', 'name')
            .sort({ createdAt: -1 })
            .limit(limit * 1)
            .skip((page - 1) * limit);

         const count = await DraftedCourse.countDocuments(query);
         
         const formattedCourses = courses.map(course => {
             const courseObj = course.toObject();
             return {
                 ...courseObj,
                 instructor: courseObj.educator?.edId || { username: courseObj.educator?.edname },
                 category: courseObj.subCategoryId
             };
         });

         res.status(200).json({
            success: true,
            data: formattedCourses,
            total: count,
            page: Number(page),
            totalPages: Math.ceil(count / limit)
         });
    } catch (error) {
        res.status(500).json({ success: false, message: "Error fetching courses", error: error.message });
    }
};

const getCourseDetails = async (req, res) => {
    try {
        const { id } = req.params;
        const course = await DraftedCourse.findById(id).populate('educator.edId', 'username email').populate('subCategoryId', 'name');
        
        if (!course) {
            return res.status(404).json({ success: false, message: 'Course not found' });
        }

        // Fetch enrolled users
        const enrolledUsers = await User.find({ coursesEnrolled: id }).select('username email createdAt isActive');

        // Fetch lectures/modules
        const courseModules = await CourseModule.findOne({ courseId: id });

        // Fetch reviews
        const reviewData = await Review.findOne({ courseId: id }).populate('reviewArr.userId', 'username');

        // Fetch QnA
        const qna = await Question.find({ courseId: id }).populate('userId', 'username email').sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            data: {
                course,
                enrolledUsers,
                modules: courseModules ? courseModules.sectionArr : [],
                reviews: reviewData ? reviewData.reviewArr : [],
                qna
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: "Error fetching course details", error: error.message });
    }
};

const deleteCourse = async (req, res) => {
    try {
        const { id } = req.params;
        await DraftedCourse.findByIdAndDelete(id);
        res.status(200).json({ success: true, message: "Course deleted successfully" });
    } catch (error) {
        res.status(500).json({ success: false, message: "Error deleting course", error: error.message });
    }
};

// Categories
const getCategories = async (req, res) => {
    try {
        const categories = await CourseCategory.find().populate('parentId', 'name');
        res.status(200).json({ success: true, data: categories });
    } catch (error) {
        res.status(500).json({ success: false, message: "Error fetching categories", error: error.message });
    }
};

const addCategory = async (req, res) => {
    try {
        const { name, description, parentId } = req.body;
        const category = new CourseCategory({ name, description, parentId });
        await category.save();
        res.status(201).json({ success: true, data: category, message: "Category added" });
    } catch (error) {
        res.status(500).json({ success: false, message: "Error adding category", error: error.message });
    }
};

const editCategory = async (req, res) => {
    try {
        const { id } = req.params;
        const updated = await CourseCategory.findByIdAndUpdate(id, req.body, { new: true });
        res.status(200).json({ success: true, data: updated, message: "Category updated" });
    } catch (error) {
        res.status(500).json({ success: false, message: "Error updating category", error: error.message });
    }
};

const deleteCategory = async (req, res) => {
    try {
        const { id } = req.params;
        await CourseCategory.findByIdAndDelete(id);
        res.status(200).json({ success: true, message: "Category deleted" });
    } catch (error) {
        res.status(500).json({ success: false, message: "Error deleting category", error: error.message });
    }
};

// Transactions
const getTransactions = async (req, res) => {
    try {
        const { page = 1, limit = 10 } = req.query;
        const query = { paymentStatus: 'paid' };

        const transactions = await Payment.find(query)
            .populate('userId', 'username email')
            .populate('courses', 'title')
            .sort({ createdAt: -1 })
            .limit(limit * 1)
            .skip((page - 1) * limit);

        const count = await Payment.countDocuments(query);

        res.status(200).json({
            success: true,
            data: transactions,
            total: count,
            page: Number(page),
            totalPages: Math.ceil(count / limit)
        });
    } catch(error) {
         res.status(500).json({ success: false, message: "Error fetching transactions", error: error.message });
    }
};

module.exports = {
    getDashboardStats,
    getUsers,
    updateUserRole,
    getUserDetails,
    getCourses,
    getCourseDetails,
    deleteCourse,
    getCategories,
    addCategory,
    editCategory,
    deleteCategory,
    getTransactions
};
