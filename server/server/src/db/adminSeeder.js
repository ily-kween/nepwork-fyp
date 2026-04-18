import { User } from "../models/user.model.js";

export const seedAdmin = async () => {
    try {
        const adminEmail = process.env.ADMIN_EMAIL;
        const adminPassword = process.env.ADMIN_PASSWORD;

        if (!adminEmail || !adminPassword) {
            console.warn("Skipping Admin Seeding: ADMIN_EMAIL or ADMIN_PASSWORD not set in .env");
            return;
        }

        const existingAdmin = await User.findOne({ email: adminEmail });

        if (existingAdmin) {
            console.log(`Admin already exists: ${adminEmail}`);
            // Ensure it has the admin role if it already exists
            if (existingAdmin.role !== "admin") {
                existingAdmin.role = "admin";
                existingAdmin.emailVerified = true;
                existingAdmin.kycVerified = true;
                await existingAdmin.save();
                console.log(`Updated existing user ${adminEmail} to admin role.`);
            }
            return;
        }

        const admin = await User.create({
            name: {
                firstName: "System",
                lastName: "Admin",
            },
            email: adminEmail,
            password: adminPassword, // Note: passwords are currently plain text in this project
            role: "admin",
            emailVerified: true,
            kycVerified: true,
        });

        console.log(`Admin user created successfully: ${admin.email}`);
    } catch (error) {
        console.error(`Error seeding admin user: ${error.message}`);
    }
};
