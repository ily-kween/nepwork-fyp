import "dotenv/config";
import { connectDB } from "./connect.js";
import { seedAdmin } from "./adminSeeder.js";
import mongoose from "mongoose";

const runSeeders = async () => {
    try {
        await connectDB();
        console.log("Database connected for seeding...");
        
        await seedAdmin();
        
        console.log("All seeders executed successfully.");
    } catch (error) {
        console.error("Seeding failed:", error);
    } finally {
        await mongoose.connection.close();
        process.exit(0);
    }
};

runSeeders();
