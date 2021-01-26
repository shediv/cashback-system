import mongoose from 'mongoose';

export async function connect() {
    try {
        await mongoose.connect('mongodb+srv://cashback-system-admin:cashback-system-admin@cluster0.n9cq2.mongodb.net/test', {
            useNewUrlParser: true
        });
        console.log('>>> Database connected');
    }
    catch {
        console.log('Error');
    }
}
