import mongoose from "mongoose";
import config from "../config";
import User from "../models/user";

const seedAdmin = async () => {
  try {
    console.log("Connecting to MongoDB...");
    await mongoose.connect(config.mongoUri);
    console.log("Connected to MongoDB");

    // Check if admin already exists
    const existingAdmin = await User.findOne({ email: "admin@pulse.com" });
    if (existingAdmin) {
      console.log("Admin user already exists!");
      console.log("Email: admin@pulse.com");
      console.log("Role:", existingAdmin.role);
      process.exit(0);
    }

    // Create admin user
    const admin = await User.create({
      name: "Nandhan",
      email: "admin@pulse.com",
      password: "admin123",
      role: config.roles.ADMIN,
      organisation: "Pulse",
      isActive: true,
    });

    console.log("\n✅ Admin user created successfully!");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log("Email:    admin@pulse.com");
    console.log("Password: admin123");
    console.log("Role:     admin");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");

    process.exit(0);
  } catch (error) {
    console.error("Error seeding admin user:", error);
    process.exit(1);
  }
};

seedAdmin();
