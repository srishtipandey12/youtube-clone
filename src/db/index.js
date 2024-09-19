import mongoose from 'mongoose';
import { DB_NAME } from '../constants.js';

const connectDB = async () => {
    try {
        const connectionInstance = await mongoose.connect(`mongodb+srv://srishti:srishti12@cluster0.pg301.mongodb.net/${DB_NAME}`);

        console.log(`\nDatabase connected! DB HOST: ${connectionInstance.connection.host}`);
    } catch (error) {
        console.log("MongoDB error:", error);
        process.exit(1);
    }
};

export default connectDB;
