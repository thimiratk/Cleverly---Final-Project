const bcrypt = require("bcryptjs");
const { PrismaClient } = require("./generated/prisma");

const prisma = new PrismaClient();

async function createAdmin() {
  try {
    console.log("Creating admin user...");
    
    const adminEmail = "admin@cleverly.com";
    const adminPassword = "admin12345"; // Change this in production
    
    // Check if admin already exists
    const existingAdmin = await prisma.users.findFirst({
      where: {
        OR: [
          { email: adminEmail },
          { role: "ADMIN" }
        ]
      }
    });

    if (existingAdmin) {
      console.log("Admin user already exists!");
      console.log("Email:", existingAdmin.email);
      console.log("Role:", existingAdmin.role);
      return;
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(adminPassword, 12);

    // Create admin user
    const admin = await prisma.users.create({
      data: {
        name: "System Administrator",
        email: adminEmail,
        password: hashedPassword,
        role: "ADMIN",
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true
      }
    });

    console.log("✅ Admin user created successfully!");
    console.log("Admin Details:");
    console.log("- ID:", admin.id);
    console.log("- Name:", admin.name);
    console.log("- Email:", admin.email);
    console.log("- Role:", admin.role);
    console.log("- Created:", admin.createdAt);
    console.log("\n📝 Login Credentials:");
    console.log("- Email:", adminEmail);
    console.log("- Password:", adminPassword);
    console.log("\n⚠️  IMPORTANT: Change the admin password after first login!");

  } catch (error) {
    console.error("❌ Error creating admin user:", error);
  } finally {
    await prisma.$disconnect();
  }
}

createAdmin();