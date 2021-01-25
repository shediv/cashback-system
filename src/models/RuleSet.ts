import { Schema, model } from 'mongoose';

const RuleSetSchema = new Schema({
    startDate: {
        type: String,
        required: true,
        lowercase: false
    },
    endDate: {
        type: String,
        required: true,
        lowercase: true
    },
    cashback: {
        type: Number,
        required: true
    },
    redemptionLimit: {
        type: Number,
        required: false
    }
});

export default model('rulesets', RuleSetSchema);