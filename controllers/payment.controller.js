const razorpayInstance = require('../index');

const doPayment = async (req, res) => {
    const { courseId, userId } = req.query;
    const options = {
        amount: req.body.amount * 100, // Amount in paise
        currency: "INR",
        receipt: `receipt_${Date.now()}`,
    }

    try {
        const order = await razorpayInstance.orders.create(options);
        res.status(200).send({
            message: "Order created successfully!",
            order,
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