import { Schema, model } from 'mongoose';

const CustomerTransactionsSchema = new Schema({
    customerId: {
        type: Number,
        required: false
    },
    transactionId: {
        type: Number,
        required: true
    },
    rulsetApplied: {
        type: String,
        required: true
    },
    cashbackReceived: {
        type: String,
        required: false
    },
    date: {
        type: String,
        required: true
    },
});

export default model('customer_transactions', CustomerTransactionsSchema);