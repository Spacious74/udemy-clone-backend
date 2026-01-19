const Payment = require('../models/Payment');
const mongoose = require('mongoose');
const Razorpay = require('razorpay');
const crypto = require('crypto');
const User = require('../models/User');
const Cart = require('../models/Cart');
const DraftedCourse = require('../models/DraftedCourse');
const UserProgress = require('../models/UserProgress');
const CourseModule = require('../models/CourseModules');

const razorpayInstance = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET
});

const singleCheckoutOrder = async (req, res) => {
    const userId = req.user.uid;
    if (!userId) {
        return res.status(500).send({
            message: "Something went wrong while token authentication. Try again!",
            success: false,
        });
    }
    const { courseId, amount } = req.body;

    if (!amount || amount <= 0) {
        return res.status(400).send({
            message: "Invalid amount provided!",
            success: false
        })
    }
    if (!courseId) {
        return res.status(400).send({
            message: "Course ID is required!",
            success: false
        })
    }

    const options = {
        amount: amount * 100, // Amount in paise
        currency: "INR",
        receipt: `receipt_${Date.now()}`,
    }

    try {
        const order = await razorpayInstance.orders.create(options);
        await Payment.create({
            userId: userId,
            orderId: order.id,
            amount: options.amount / 100, // Convert back to rupees
            currency: order.currency,
            paymentStatus: order.status,
            paymentMethod: "razorpay",
            courses: [courseId],
            receipt: order.receipt
        })


        res.status(200).send({
            message: "Order created successfully!",
            orderId: order.id,
            amount: order.amount,
            currency: order.currency,
            success: true
        });

    } catch (error) {
        res.status(500).send({
            message: "Some internal error occurred while creating the order!",
            error: error.message,
            success: false
        });
    }
}

const multipleOrderCheckout = async (req, res) => {
    const userId = req.user.uid;
    if (!userId) {
        return res.status(500).send({
            message: "Something went wrong while token authentication. Try again!",
            success: false,
        });
    }
    const { courseIds, amount } = req.body;

    if (!amount || amount <= 0) {
        return res.status(400).send({
            message: "Invalid amount provided!",
            success: false
        })
    }
    if (courseIds.length == 0) {
        return res.status(400).send({
            message: "Course is required!",
            success: false
        })
    }

    const options = {
        amount: amount * 100, // Amount in paise
        currency: "INR",
        receipt: `receipt_${Date.now()}`,
    }

    try {
        const order = await razorpayInstance.orders.create(options);
        await Payment.create({
            userId: userId,
            orderId: order.id,
            amount: options.amount / 100, // Convert back to rupees
            currency: order.currency,
            paymentStatus: order.status,
            paymentMethod: "razorpay",
            courses: courseIds,
            receipt: order.receipt
        })


        res.status(200).send({
            message: "Order created successfully!",
            orderId: order.id,
            amount: order.amount,
            currency: order.currency,
            success: true
        });

    } catch (error) {
        res.status(500).send({
            message: "Some internal error occurred while creating the order!",
            error: error.message,
            success: false
        });
    }
}

const singlePaymentVerification = async (req, res) => {

    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, userId, courseId } = req.body;
    try {
        const sign = razorpay_order_id + "|" + razorpay_payment_id;
        const expectedSign = crypto.createHmac("sha256", process.env.RAZORPAY_KEY_SECRET).update(sign.toString()).digest("hex");
        if (expectedSign === razorpay_signature) {

            // For payment record
            let payment = await Payment.findOne({ orderId: razorpay_order_id });
            payment.paymentStatus = 'paid';
            await payment.save();

            // For saving courses enrolled by the user in their profile
            let user = await User.findOne({ _id: userId });
            user.coursesEnrolled.push(courseId);
            await user.save();

            // Increasing no. of students purchase of a course
            let course = await DraftedCourse.findOne({ _id: courseId });
            course.totalStudentsPurchased += 1;
            await course.save();

            // Now adding first videos data to the user progress's current Watching video because by default it's always first video
            let existingProgress = await UserProgress.findOne({ userId, courseId });
            if (!existingProgress) {
                const courseModule = await CourseModule.findOne({ courseId });
                if (!courseModule) {
                    res.status(500).send({
                        success: false,
                        message: "Course Module not found for this course"
                    }); return;
                }

                const sectionArr = courseModule.sectionArr;
                const vObj = sectionArr[0]?.videos[0];

                const currentWatchingVideo = {
                    videoId: vObj._id,
                    videoTitle: vObj.name,
                    videoUrl: vObj.url,
                    videoPublic_Id: vObj.public_id,
                }

                await UserProgress.create({
                    userId,
                    courseId,
                    currentWatchingVideo
                });

            }

            res.status(200).send({ success: true, message: "Payment done successfully! Please check your learning tab." });

        } else {
            res.status(400).send({ success: false, message: "Invalid signature" });
        }
    } catch (error) {
        res.status(500).send({
            message: "Some internal error occurred while verifying the payment!",
            error: error.message,
            success: false
        });
    }

}

const cartPaymentVerification = async (req, res) => {

    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, userId, courseIds } = req.body;

    try {
        // 1️⃣ Razorpay signature verify
        const sign = razorpay_order_id + "|" + razorpay_payment_id;
        const expectedSign = crypto
            .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
            .update(sign)
            .digest("hex");

        if (expectedSign !== razorpay_signature) {
            return res.status(400).json({ success: false, message: "Invalid signature" });
        }

        // 2️⃣ Payment idempotency check
        const payment = await Payment.findOne({ orderId: razorpay_order_id });
        if (!payment || payment.paymentStatus === 'paid') {
            return res.status(200).json({
                success: true,
                message: "Payment already processed"
            });
        }

        payment.paymentStatus = 'paid';
        await payment.save();

        // 3️⃣ Fetch user once
        const user = await User.findById(userId).select('coursesEnrolled');
        const alreadyEnrolled = user.coursesEnrolled.map(id => id.toString());

        // 4️⃣ Filter only NEW courses
        const newCourseIds = courseIds.filter(
            id => !alreadyEnrolled.includes(id.toString())
        );

        // 5️⃣ Add courses to user
        if (newCourseIds.length) {
            await User.updateOne(
                { _id: userId },
                { $addToSet: { coursesEnrolled: { $each: newCourseIds } } }
            );
        }

        // 6️⃣ Increment students count (only for new courses)
        await DraftedCourse.updateMany(
            { _id: { $in: newCourseIds } },
            { $inc: { totalStudentsPurchased: 1 } }
        );

        // 7️⃣ Create UserProgress safely (per course)
        for (const courseId of newCourseIds) {
            const exists = await UserProgress.findOne({ userId, courseId });
            if (exists) continue;

            const module = await CourseModule.findOne({ courseId });
            if (!module) continue;

            const firstVideo = module.sectionArr?.[0]?.videos?.[0];
            if (!firstVideo) continue;

            await UserProgress.create({
                userId,
                courseId,
                currentWatchingVideo: {
                    videoId: firstVideo._id,
                    videoTitle: firstVideo.name,
                    videoUrl: firstVideo.url,
                    videoPublic_Id: firstVideo.public_id
                }
            });
        }

        res.status(200).json({
            success: true,
            message: "Payment successful. Courses added safely."
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Error while verifying cart payment",
            error: error.message
        });
    }

}

module.exports = {
    singleCheckoutOrder,
    singlePaymentVerification,
    multipleOrderCheckout,
    cartPaymentVerification
}