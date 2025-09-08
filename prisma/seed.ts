import { PrismaClient } from "@prisma/client"
import bcrypt from "bcryptjs"

const prisma = new PrismaClient()

async function main() {
  // Create admin user
  const hashedPassword = await bcrypt.hash("admin123", 12)

  const admin = await prisma.user.upsert({
    where: { email: "admin@expensetracker.com" },
    update: {},
    create: {
      email: "admin@expensetracker.com",
      name: "Admin User",
      password: hashedPassword,
      role: "ADMIN",
    },
  })

  // Create default categories
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
  ]

  for (const category of categories) {
    await prisma.category.upsert({
      where: { name: category.name },
      update: {},
      create: category,
    })
  }

  console.log("Database seeded successfully!")
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })
