import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
    console.log("🌱 Starting database seeding...");

    // Create admin user
    console.log("👤 Creating admin user...");
    const hashedPassword = await bcrypt.hash("admin123", 12);

    const adminUser = await prisma.user.upsert({
        where: { email: "aungkhant.kk111@gmail.com" },
        update: {},
        create: {
            email: "aungkhant.kk111@gmail.com",
            name: "Admin User",
            password: hashedPassword,
            role: "ADMIN",
        },
    });
    console.log(`✅ Admin user created: ${adminUser.email}`);

    // Create categories
    console.log("📂 Creating expense categories...");
    const categories = [
        { name: "Food & Dining", color: "#DC143C", icon: "🍽️" },
        { name: "Transportation", color: "#F75270", icon: "🚗" },
        { name: "Shopping", color: "#F7CAC9", icon: "🛍️" },
        { name: "Entertainment", color: "#FDEBD0", icon: "🎬" },
        { name: "Bills & Utilities", color: "#FF6B6B", icon: "💡" },
        { name: "Healthcare", color: "#4ECDC4", icon: "🏥" },
        { name: "Education", color: "#45B7D1", icon: "📚" },
        { name: "Travel", color: "#96CEB4", icon: "✈️" },
        { name: "Other", color: "#FFEAA7", icon: "📦" },
    ];

    let createdCategories = 0;
    for (const category of categories) {
        const result = await prisma.category.upsert({
            where: { name: category.name },
            update: {},
            create: category,
        });
        if (result) createdCategories++;
    }
    console.log(`✅ Created ${createdCategories} expense categories`);

    console.log("🎉 Database seeded successfully!");
    console.log("\n📋 Summary:");
    console.log(`   • Admin user: ${adminUser.email} (password: admin123)`);
    console.log(`   • Categories: ${createdCategories} expense categories`);
    console.log("\n🚀 You can now start the application with: pnpm run dev");
}

main()
    .then(async () => {
        await prisma.$disconnect();
    })
    .catch(async (e) => {
        console.error(e);
        await prisma.$disconnect();
        process.exit(1);
    });
