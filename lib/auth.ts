import type { NextAuthOptions } from "next-auth"
import { PrismaAdapter } from "@auth/prisma-adapter"
import GoogleProvider from "next-auth/providers/google"
import CredentialsProvider from "next-auth/providers/credentials"
import bcrypt from "bcryptjs"
import { prisma, testDatabaseConnection } from "./prisma"

export const authOptions: NextAuthOptions = {
  adapter: process.env.DATABASE_URL ? PrismaAdapter(prisma) : undefined,
  providers: [
    ...(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET
      ? [
          GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
          }),
        ]
      : []),
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        try {
          if (!credentials?.email || !credentials?.password) {
            return null
          }

          if (!process.env.DATABASE_URL) {
            console.error("[v0] DATABASE_URL not configured")
            return null
          }

          const dbTest = await testDatabaseConnection()
          if (!dbTest.success) {
            console.error("[v0] Database connection failed during auth:", dbTest.message)
            return null
          }

          const user = await prisma.user.findUnique({
            where: {
              email: credentials.email,
            },
          })

          if (!user || !user.password) {
            return null
          }

          const isPasswordValid = await bcrypt.compare(credentials.password, user.password)

          if (!isPasswordValid) {
            return null
          }

          if (user.isBanned) {
            throw new Error("Account has been banned")
          }

          try {
            await Promise.all([
              prisma.user.update({
                where: { id: user.id },
                data: { lastLoginAt: new Date() },
              }),
              prisma.activityLog.create({
                data: {
                  userId: user.id,
                  action: "LOGIN",
                  details: "User logged in with credentials",
                },
              }),
            ])
          } catch (dbError) {
            console.error("[v0] Database error during login:", dbError)
            // Continue with login even if logging fails
          }

          return {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role,
            image: user.image,
          }
        } catch (error) {
          console.error("[v0] Auth error:", error)
          return null
        }
      },
    }),
  ],
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role
      }
      return token
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.sub!
        session.user.role = token.role as string
      }
      return session
    },
    async signIn({ user, account }) {
      try {
        if (process.env.DATABASE_URL && account?.provider === "google") {
          try {
            await Promise.all([
              prisma.user.update({
                where: { email: user.email! },
                data: { lastLoginAt: new Date() },
              }),
              prisma.activityLog.create({
                data: {
                  userId: user.id!,
                  action: "LOGIN",
                  details: "User logged in with Google",
                },
              }),
            ])
          } catch (dbError) {
            console.error("[v0] Database error during Google sign-in:", dbError)
            // Continue with sign-in even if logging fails
          }
        }
        return true
      } catch (error) {
        console.error("[v0] Sign-in callback error:", error)
        return true // Still allow sign-in even if logging fails
      }
    },
  },
  pages: {
    signIn: "/auth/signin",
    signUp: "/auth/signup",
    error: "/auth/error",
  },
  secret: process.env.NEXTAUTH_SECRET || "fallback-secret-for-development-only",
  debug: process.env.NODE_ENV === "development",
  logger: {
    error(code, metadata) {
      console.error("[v0] NextAuth Error:", code, metadata)
    },
    warn(code) {
      console.warn("[v0] NextAuth Warning:", code)
    },
    debug(code, metadata) {
      if (process.env.NODE_ENV === "development") {
        console.log("[v0] NextAuth Debug:", code, metadata)
      }
    },
  },
}
