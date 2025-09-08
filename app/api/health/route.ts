import { NextResponse } from "next/server"
import { testDatabaseConnection } from "@/lib/prisma"
import { checkEnvironmentVariables } from "@/lib/env-check"

export async function GET() {
  try {
    const envCheck = checkEnvironmentVariables()

    const dbTest = await testDatabaseConnection()

    let nextAuthStatus = "unknown"
    let nextAuthError = null

    try {
      const response = await fetch(`${process.env.NEXTAUTH_URL || "http://localhost:3000"}/api/auth/session`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      })

      if (response.ok) {
        const contentType = response.headers.get("content-type")
        if (contentType?.includes("application/json")) {
          nextAuthStatus = "healthy"
        } else {
          nextAuthStatus = "returning_html"
          nextAuthError = "NextAuth API returning HTML instead of JSON"
        }
      } else {
        nextAuthStatus = "error"
        nextAuthError = `HTTP ${response.status}: ${response.statusText}`
      }
    } catch (error) {
      nextAuthStatus = "unreachable"
      nextAuthError = error instanceof Error ? error.message : "Unknown NextAuth error"
    }

    return NextResponse.json({
      status: envCheck.isValid && dbTest.success && nextAuthStatus === "healthy" ? "ok" : "degraded",
      timestamp: new Date().toISOString(),
      environment: {
        nodeEnv: process.env.NODE_ENV,
        ...envCheck,
      },
      database: {
        status: dbTest.success ? "connected" : "disconnected",
        error: dbTest.success ? null : dbTest.message,
      },
      nextAuth: {
        status: nextAuthStatus,
        error: nextAuthError,
      },
    })
  } catch (error) {
    return NextResponse.json(
      {
        status: "error",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
