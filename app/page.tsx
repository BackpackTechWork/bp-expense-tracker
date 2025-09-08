import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { BarChart3, Shield, Smartphone, Zap } from "lucide-react"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#FDEBD0] to-[#F7CAC9]">
      {/* Header */}
      <header className="bg-white/90 backdrop-blur-sm border-b border-white/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="text-2xl font-bold text-[#DC143C]">ExpenseTracker</div>
            <div className="space-x-4">
              <Button asChild variant="outline">
                <Link href="/auth/signin">Sign In</Link>
              </Button>
              <Button asChild className="bg-[#DC143C] hover:bg-[#F75270]">
                <Link href="/auth/signup">Get Started</Link>
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
            Track Your Expenses
            <span className="block text-[#DC143C]">Anywhere, Anytime</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            A powerful PWA expense tracker that works offline. Manage your finances with beautiful charts, smart
            budgeting, and seamless synchronization across all your devices.
          </p>
          <div className="space-x-4">
            <Button asChild size="lg" className="bg-[#DC143C] hover:bg-[#F75270]">
              <Link href="/auth/signup">Start Tracking Free</Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link href="/auth/signin">Sign In</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Everything You Need</h2>
            <p className="text-xl text-gray-600">Powerful features designed for modern expense tracking</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <Card className="bg-white/80 backdrop-blur-sm border-white/20">
              <CardHeader>
                <div className="p-2 rounded-lg bg-[#FDEBD0] w-fit">
                  <Smartphone className="h-6 w-6 text-[#DC143C]" />
                </div>
                <CardTitle>Works Offline</CardTitle>
                <CardDescription>
                  Add expenses even without internet. Everything syncs when you're back online.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="bg-white/80 backdrop-blur-sm border-white/20">
              <CardHeader>
                <div className="p-2 rounded-lg bg-[#F7CAC9] w-fit">
                  <BarChart3 className="h-6 w-6 text-[#DC143C]" />
                </div>
                <CardTitle>Smart Analytics</CardTitle>
                <CardDescription>Beautiful charts and insights to understand your spending patterns.</CardDescription>
              </CardHeader>
            </Card>

            <Card className="bg-white/80 backdrop-blur-sm border-white/20">
              <CardHeader>
                <div className="p-2 rounded-lg bg-[#FDEBD0] w-fit">
                  <Shield className="h-6 w-6 text-[#DC143C]" />
                </div>
                <CardTitle>Secure & Private</CardTitle>
                <CardDescription>
                  Your financial data is encrypted and stored securely with enterprise-grade security.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="bg-white/80 backdrop-blur-sm border-white/20">
              <CardHeader>
                <div className="p-2 rounded-lg bg-[#F7CAC9] w-fit">
                  <Zap className="h-6 w-6 text-[#DC143C]" />
                </div>
                <CardTitle>Lightning Fast</CardTitle>
                <CardDescription>Optimized for speed with instant loading and smooth animations.</CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <Card className="bg-white/80 backdrop-blur-sm border-white/20">
            <CardContent className="py-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Ready to Take Control?</h2>
              <p className="text-xl text-gray-600 mb-8">
                Join thousands of users who are already tracking their expenses smarter.
              </p>
              <Button asChild size="lg" className="bg-[#DC143C] hover:bg-[#F75270]">
                <Link href="/auth/signup">Get Started Now</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white/90 backdrop-blur-sm border-t border-white/20 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-gray-600">© 2024 ExpenseTracker. Built with Next.js and love.</p>
        </div>
      </footer>
    </div>
  )
}
