import { Schema, model } from 'mongoose';

const CashbackSchema = new Schema({
    transactionId: {
        type: Number,
        required: true
    },
    amount: {
        type: Number,
        required: true
    }
});

export default model('cashbacks', CashbackSchema);