import { Schema, model } from 'mongoose';

const TransactionSchema = new Schema({
    date: {
        type: String,
        required: true
    },
    customerId: {
        type: Number,
        required: false
    },
    id: {
        type: Number,
        required: true
    }
});

export default model('transactions', TransactionSchema);