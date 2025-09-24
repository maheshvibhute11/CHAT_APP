import mongoose from "mongoose";

export const connectDB = async () => {
    try {
        // Event listener for successful connection
        mongoose.connection.on("connected", () => {
            console.log("Database connected successfully");
        });

        // Connect to MongoDB (no deprecated options needed)
        await mongoose.connect(`${process.env.MONGODB_URI}/chat-app`);

        console.log("MongoDB connection established");
    } catch (error) {
        console.error("Error connecting to MongoDB:", error);
    }
};
