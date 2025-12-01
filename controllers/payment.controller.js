const Payment = require('../models/Payment');
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

            let payment = await Payment.findOne({ orderId: razorpay_order_id });
            payment.paymentStatus = 'paid';
            await payment.save();

            let user = await User.findOne({ _id: userId });
            user.coursesEnrolled.push(courseId);
            await user.save();

            let course = await DraftedCourse.findOne({ _id: courseId });
            course.totalStudentsPurchased += 1;
            await course.save();

            let existingProgress = await UserProgress.findOne({ userId, courseId });
            if (!existingProgress) {
                const courseModule = await CourseModule.findOne({ courseId });
                if (!courseModule) {
                    res.status(500).send({
                        success: false,
                        message: "Course Module not found for this course"
                    }); return;
                }

                const sectionArr = courseModule.sectionArr.map(section => ({
                    sectionId : section._id,
                    sectionName: section.sectionName,
                    videos: section.videos.map(video => ({
                        videoId : video._id,
                        public_id: video.public_id,
                        url: video.url,
                        name: video.name,
                        position: video.position, 
                        completed: false
                    }))
                }));

                const firstVideoUrl = sectionArr[0]?.videos[0]?.url || null;

                await UserProgress.create({
                    userId,
                    courseId,
                    lastWatchedVideo: firstVideoUrl,
                    sectionArr
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
        const sign = razorpay_order_id + "|" + razorpay_payment_id;
        const expectedSign = crypto.createHmac("sha256", process.env.RAZORPAY_KEY_SECRET).update(sign.toString()).digest("hex");
        if (expectedSign === razorpay_signature) {

            let payment = await Payment.findOne({ orderId: razorpay_order_id });
            payment.paymentStatus = 'paid';
            await payment.save();

            let user = await User.findOne({ _id: userId });
            user.coursesEnrolled.push(...courseIds);
            await user.save();

            let cart = await Cart.findOne({ userId: userId });
            cart.cartItems = [];
            await cart.save();

            res.status(200).send({ success: true, message: "Payment successful! Course enrolled and progress initialized." });

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

module.exports = {
    singleCheckoutOrder,
    singlePaymentVerification,
    multipleOrderCheckout,
    cartPaymentVerification
}