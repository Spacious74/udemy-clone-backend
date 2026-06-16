const CourseAnalyticsDetail = require('../models/CourseAnalyticsDetail');
const DraftedCourse = require('../models/DraftedCourse');

const getEarningsAndReports = async (req, res) => {
    try {
        const teacherId = req.user.uid;
        const courseId = req.query.courseId;

        if (!teacherId) {
            return res.status(401).send({ success: false, message: "Unauthorized request" });
        }

        const query = { teacherId };
        if (courseId) {
            query.courseId = courseId;
        }

        const analytics = await CourseAnalyticsDetail.find(query)
            .populate('courseId', 'title price')
            .populate('studentsEnrolled.studentId', 'username');

        let totalEarnings = 0;
        let thisMonthEarnings = 0;
        let totalStudentsPurchases = 0;
        let todaysPurchasesCount = 0;
        let todaysEarnings = 0;

        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());

        let allTransactions = [];
        let monthlyDataMap = {};

        // Initialize last 6 months to 0 to ensure chart looks good
        for (let i = 5; i >= 0; i--) {
            const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
            const monthName = d.toLocaleString('default', { month: 'short' });
            monthlyDataMap[monthName] = 0;
        }

        for (const record of analytics) {
            const courseTitle = record.courseId?.title || 'Unknown Course';
            const coursePrice = record.courseId?.price || 0;
            const students = record.studentsEnrolled || [];

            totalStudentsPurchases += students.length;

            for (const student of students) {
                const amount = student.pricePaid || coursePrice;
                const date = new Date(student.enrolledAt);

                totalEarnings += amount;

                if (date >= startOfMonth) {
                    thisMonthEarnings += amount;
                }
                if (date >= startOfDay) {
                    todaysPurchasesCount++;
                    todaysEarnings += amount;
                }

                // For chart: Add to correct month
                const monthName = date.toLocaleString('default', { month: 'short' });
                if (monthlyDataMap[monthName] !== undefined) {
                    monthlyDataMap[monthName] += amount;
                }

                // Push to transactions list
                allTransactions.push({
                    studentName: student.studentId?.username || 'Unknown',
                    courseName: courseTitle,
                    amount: amount,
                    date: date
                });
            }
        }

        // Sort transactions to get recent ones first
        allTransactions.sort((a, b) => b.date - a.date);
        const recentTransactions = allTransactions.slice(0, 5);

        // Format chart data
        const monthlyEarningsChart = Object.keys(monthlyDataMap).map(month => ({
            month: month,
            earnings: monthlyDataMap[month]
        }));

        res.status(200).send({
            success: true,
            data: {
                totalEarnings,
                thisMonthEarnings,
                totalStudentsPurchases,
                todaysPurchasesCount,
                todaysEarnings,
                recentTransactions,
                monthlyEarningsChart
            }
        });

    } catch (error) {
        console.error("Error fetching earnings data:", error);
        res.status(500).send({ success: false, message: "Internal server error" });
    }
};

module.exports = {
    getEarningsAndReports
};
