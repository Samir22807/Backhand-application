import mongoose from 'mongoose';
import { DB_NAME } from '../constants.js';

const connectDB = async () => {
    try {
        const connection = await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`);
        console.log(`\n MongoDB connected: ${connection.connection.host}`);
    } catch (error) {
        console.error('Connection failed:', error);
        process.exit(1); // Exit process with failure
    }
};

export default connectDB;