const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    orderId: String,
    paymentId: String,
    signature: String,
    amount: Number,
    currency: String,
    paymentStatus: String, // 'created' | 'paid' | 'failed'
    paymentMethod: String,
    courses: [
        { type: mongoose.Schema.Types.ObjectId, ref: 'Course' }
    ],
    receipt: String,
    createdAt: {
        type: Date,
        immutable: true,
        default: () => Date.now(),
    },
    updatedAt: {
        type: Date,
        default: () => Date.now(),
    },
})

const Payment = mongoose.model('Payment', paymentSchema);
module.exports = Payment;