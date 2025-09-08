export function checkEnvironmentVariables() {
  const requiredVars = {
    DATABASE_URL: process.env.DATABASE_URL,
    NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET,
  }

  const recommendedVars = {
    NEXTAUTH_URL: process.env.NEXTAUTH_URL,
  }

  const optionalVars = {
    GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID,
    GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET,
  }

  const missing = Object.entries(requiredVars)
    .filter(([_, value]) => !value)
    .map(([key]) => key)

  const missingRecommended = Object.entries(recommendedVars)
    .filter(([_, value]) => !value)
    .map(([key]) => key)

  const missingOptional = Object.entries(optionalVars)
    .filter(([_, value]) => !value)
    .map(([key]) => key)

  return {
    missing,
    missingRecommended,
    missingOptional,
    isValid: missing.length === 0,
    details: {
      hasDatabase: !!process.env.DATABASE_URL,
      hasNextAuthSecret: !!process.env.NEXTAUTH_SECRET,
      hasNextAuthUrl: !!process.env.NEXTAUTH_URL,
      hasGoogleOAuth: !!(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET),
    },
  }
}
