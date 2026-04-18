import mongoose from "mongoose";

export const connectDB = async () => {
    const mongoUrl = process.env.MONGO_DB_URL;

    if (!mongoUrl) {
        throw new Error("MONGO_DB_URL is not set in environment variables");
    }

    try {
        const connection = await mongoose.connect(mongoUrl, {
            serverSelectionTimeoutMS: 5000,
        });
        console.log(
            `MONGODB CONNECTION SUCCESSFULL! on ${connection.connection.host}`,
        );
        return connection;
    } catch (error) {
        console.error(`xxxxx MONGODB CONNECTION FAILED!! ${error.message}`);
        throw error;
    }
};
