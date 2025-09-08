import NextAuth from "next-auth"
import { authOptions } from "@/lib/auth"
import { type NextRequest, NextResponse } from "next/server"

async function handleAuth(req: NextRequest) {
  try {
    const handler = NextAuth(authOptions)
    return await handler(req)
  } catch (error) {
    console.error("[v0] NextAuth API Error:", error)

    return NextResponse.json(
      {
        error: "Authentication service temporarily unavailable",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}

export { handleAuth as GET, handleAuth as POST }
