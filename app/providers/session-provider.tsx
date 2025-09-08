"use client"

import type React from "react"
import { SessionProvider as NextAuthSessionProvider } from "next-auth/react"
import { useState, useEffect } from "react"

export function SessionProvider({ children }: { children: React.ReactNode }) {
  const [hasError, setHasError] = useState(false)

  useEffect(() => {
    setHasError(false)
  }, [])

  if (hasError) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Authentication Service Unavailable</h2>
          <p className="text-gray-600 mb-4">Please check your environment configuration and try again.</p>
          <button
            onClick={() => {
              setHasError(false)
              window.location.reload()
            }}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
      </div>
    )
  }

  return (
    <NextAuthSessionProvider
      onError={(error) => {
        console.error("[v0] Session Provider Error:", error)
        if (error.message?.includes("JSON") || error.message?.includes("Internal")) {
          setHasError(true)
        }
      }}
    >
      {children}
    </NextAuthSessionProvider>
  )
}
