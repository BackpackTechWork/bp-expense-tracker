import NextAuth from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import Google from "next-auth/providers/google";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { prisma, testDatabaseConnection } from "./lib/prisma";

const logUserActivity = async (userId: string, provider: string) => {
    try {
        await Promise.all([
            prisma.user.update({
                where: { id: userId },
                data: { lastLoginAt: new Date() },
            }),
            prisma.activityLog.create({
                data: {
                    userId,
                    action: "LOGIN",
                    details: `User logged in with ${provider}`,
                },
            }),
        ]);
    } catch (error) {
        console.error("Database error during login logging:", error);
    }
};

export const { handlers, auth, signIn, signOut } = NextAuth({
    // Temporarily disable adapter to test OAuth flow
    // adapter: process.env.DATABASE_URL
    //     ? (PrismaAdapter(prisma) as any)
    //     : undefined,
    providers: [
        ...(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET
            ? [
                  Google({
                      clientId: process.env.GOOGLE_CLIENT_ID,
                      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
                  }),
              ]
            : (() => {
                  console.warn(
                      "Google OAuth not configured - missing GOOGLE_CLIENT_ID or GOOGLE_CLIENT_SECRET"
                  );
                  return [];
              })()),
        Credentials({
            name: "credentials",
            credentials: {
                email: { label: "Email", type: "email" },
                password: { label: "Password", type: "password" },
            },
            async authorize(credentials) {
                if (
                    !credentials?.email ||
                    !credentials?.password ||
                    !process.env.DATABASE_URL
                ) {
                    return null;
                }

                const dbTest = await testDatabaseConnection();
                if (!dbTest.success) {
                    console.error(
                        "Database connection failed during auth:",
                        dbTest.message
                    );
                    return null;
                }

                const user = await prisma.user.findUnique({
                    where: { email: credentials.email as string },
                });

                if (!user?.password) return null;

                const isPasswordValid = await bcrypt.compare(
                    credentials.password as string,
                    user.password
                );

                if (!isPasswordValid) return null;

                if (user.isBanned) {
                    throw new Error("Account has been banned");
                }

                await logUserActivity(user.id, "credentials");

                return {
                    id: user.id,
                    email: user.email,
                    name: user.name,
                    role: user.role,
                    image: user.image,
                };
            },
        }),
    ],
    session: {
        strategy: "jwt",
        maxAge: 30 * 24 * 60 * 60,
    },
    callbacks: {
        async jwt({ token, user, account }) {
            if (user) {
                console.log("JWT callback - user data:", {
                    email: user.email,
                    name: user.name,
                });

                // Handle user creation/update for OAuth users
                if (
                    account?.provider === "google" &&
                    user.email &&
                    process.env.DATABASE_URL
                ) {
                    try {
                        const existingUser = await prisma.user.findUnique({
                            where: { email: user.email },
                        });

                        if (existingUser) {
                            console.log(
                                "Existing user found in JWT callback:",
                                existingUser.id
                            );
                            token.role = existingUser.role;
                            // Update image if needed
                            if (!existingUser.image && user.image) {
                                await prisma.user.update({
                                    where: { id: existingUser.id },
                                    data: { image: user.image },
                                });
                            }
                        } else {
                            console.log(
                                "Creating new user in JWT callback:",
                                user.email
                            );
                            const newUser = await prisma.user.create({
                                data: {
                                    email: user.email,
                                    name: user.name || user.email.split("@")[0],
                                    image: user.image,
                                    role: "USER",
                                    emailVerified: new Date(),
                                },
                            });
                            console.log(
                                "New user created in JWT callback:",
                                newUser.id
                            );
                            token.role = newUser.role;
                        }
                    } catch (error) {
                        console.error("Error in JWT callback:", error);
                        token.role = "USER"; // Default role
                    }
                } else {
                    token.role = user.role || "USER";
                }

                token.email = user.email;
                token.name = user.name;
                token.image = user.image;
            }
            return token;
        },
        async session({ session, token }) {
            if (token) {
                session.user.id = token.sub!;
                session.user.role = token.role as string;
                session.user.email = token.email as string;
                session.user.name = token.name as string;
                session.user.image = token.image as string;
            }
            return session;
        },
        async signIn({ user, account, profile }) {
            console.log("SignIn callback called:", {
                user: { email: user.email, name: user.name },
                account: { provider: account?.provider },
                hasDatabase: !!process.env.DATABASE_URL,
            });

            // For now, allow all sign-ins to test OAuth flow
            // We'll handle user creation in the JWT callback instead
            return true;
        },
        async redirect({ url, baseUrl }) {
            if (url.startsWith("/")) return `${baseUrl}${url}`;
            else if (new URL(url).origin === baseUrl) return url;

            return baseUrl;
        },
    },
    pages: {
        signIn: "/auth/signin",
        error: "/auth/error",
    },
    secret:
        process.env.NEXTAUTH_SECRET || "fallback-secret-for-development-only",
    debug: process.env.NODE_ENV === "development",
});
