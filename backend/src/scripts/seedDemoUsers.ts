import mongoose from "mongoose";
import config from "../config";
import User from "../models/user";

const demoUsers = [
  {
    name: "Admin Demo",
    email: "admin@pulse.com",
    password: "admin123",
    role: config.roles.ADMIN,
    organisation: "Pulse",
    isActive: true,
  },
  {
    name: "Editor Demo",
    email: "editor@pulse.com",
    password: "editor123",
    role: config.roles.EDITOR,
    organisation: "Pulse",
    isActive: true,
  },
  {
    name: "Viewer Demo",
    email: "viewer@pulse.com",
    password: "viewer123",
    role: config.roles.VIEWER,
    organisation: "Pulse",
    isActive: true,
  },
];

const seedDemoUsers = async () => {
  try {
    console.log("Connecting to MongoDB...");
    await mongoose.connect(config.mongoUri);
    console.log("Connected to MongoDB\n");

    for (const userData of demoUsers) {
      const existing = await User.findOne({ email: userData.email });

      if (existing) {
        console.log(`✓ ${userData.role} user already exists: ${userData.email}`);
        continue;
      }

      await User.create(userData);
      console.log(`✅ Created ${userData.role} user: ${userData.email}`);
    }

    console.log("\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log("       DEMO CREDENTIALS");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log("Admin:  admin@pulse.com  / admin123");
    console.log("Editor: editor@pulse.com / editor123");
    console.log("Viewer: viewer@pulse.com / viewer123");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");

    process.exit(0);
  } catch (error) {
    console.error("Error seeding demo users:", error);
    process.exit(1);
  }
};

seedDemoUsers();
