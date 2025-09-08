"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { RefreshCw, CheckCircle, XCircle, AlertCircle } from "lucide-react"

interface HealthStatus {
  status: string
  timestamp: string
  environment: {
    nodeEnv: string
    missing: string[]
    missingOptional: string[]
    isValid: boolean
  }
  database: {
    status: string
    error: string | null
  }
}

export default function DebugPage() {
  const [health, setHealth] = useState<HealthStatus | null>(null)
  const [loading, setLoading] = useState(true)

  const fetchHealth = async () => {
    setLoading(true)
    try {
      const response = await fetch("/api/health")
      const data = await response.json()
      setHealth(data)
    } catch (error) {
      console.error("Failed to fetch health status:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchHealth()
  }, [])

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "connected":
      case "ok":
        return <CheckCircle className="w-5 h-5 text-green-500" />
      case "disconnected":
      case "error":
        return <XCircle className="w-5 h-5 text-red-500" />
      default:
        return <AlertCircle className="w-5 h-5 text-yellow-500" />
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center min-h-[400px]">
          <RefreshCw className="w-8 h-8 animate-spin" />
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">System Diagnostics</h1>
        <Button onClick={fetchHealth} disabled={loading}>
          <RefreshCw className="w-4 h-4 mr-2" />
          Refresh
        </Button>
      </div>

      {health && (
        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {getStatusIcon(health.status)}
                System Status
              </CardTitle>
              <CardDescription>Overall application health</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Status:</span>
                  <Badge variant={health.status === "ok" ? "default" : "destructive"}>{health.status}</Badge>
                </div>
                <div className="flex justify-between">
                  <span>Environment:</span>
                  <Badge variant="outline">{health.environment.nodeEnv}</Badge>
                </div>
                <div className="flex justify-between">
                  <span>Timestamp:</span>
                  <span className="text-sm text-muted-foreground">{new Date(health.timestamp).toLocaleString()}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {getStatusIcon(health.database.status)}
                Database Status
              </CardTitle>
              <CardDescription>Database connection health</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Connection:</span>
                  <Badge variant={health.database.status === "connected" ? "default" : "destructive"}>
                    {health.database.status}
                  </Badge>
                </div>
                {health.database.error && (
                  <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded text-sm text-red-700">
                    <strong>Error:</strong> {health.database.error}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {health.environment.isValid ? (
                  <CheckCircle className="w-5 h-5 text-green-500" />
                ) : (
                  <XCircle className="w-5 h-5 text-red-500" />
                )}
                Environment Variables
              </CardTitle>
              <CardDescription>Required and optional environment variables</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {health.environment.missing.length > 0 && (
                  <div>
                    <h4 className="font-semibold text-red-600 mb-2">Missing Required Variables:</h4>
                    <div className="flex flex-wrap gap-2">
                      {health.environment.missing.map((variable) => (
                        <Badge key={variable} variant="destructive">
                          {variable}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {health.environment.missingOptional.length > 0 && (
                  <div>
                    <h4 className="font-semibold text-yellow-600 mb-2">Missing Optional Variables:</h4>
                    <div className="flex flex-wrap gap-2">
                      {health.environment.missingOptional.map((variable) => (
                        <Badge key={variable} variant="outline">
                          {variable}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {health.environment.isValid && health.environment.missingOptional.length === 0 && (
                  <div className="text-green-600">✅ All environment variables are properly configured</div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Setup Instructions</CardTitle>
          <CardDescription>Follow these steps to configure your environment</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <h4 className="font-semibold">Required Environment Variables:</h4>
            <ul className="list-disc list-inside space-y-1 text-sm">
              <li>
                <code>DATABASE_URL</code> - Your PostgreSQL database connection string
              </li>
              <li>
                <code>NEXTAUTH_SECRET</code> - A random secret for NextAuth.js (generate with:{" "}
                <code>openssl rand -base64 32</code>)
              </li>
              <li>
                <code>NEXTAUTH_URL</code> - Your application URL (e.g., http://localhost:3000)
              </li>
            </ul>
          </div>
          <div className="space-y-2">
            <h4 className="font-semibold">Optional Environment Variables:</h4>
            <ul className="list-disc list-inside space-y-1 text-sm">
              <li>
                <code>GOOGLE_CLIENT_ID</code> - Google OAuth client ID
              </li>
              <li>
                <code>GOOGLE_CLIENT_SECRET</code> - Google OAuth client secret
              </li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
