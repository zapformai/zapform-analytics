import { redirect } from 'next/navigation'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth-options'
import Link from 'next/link'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { IconChartBar, IconPointer, IconShieldCheck, IconSparkles } from '@tabler/icons-react'

export default async function Home() {
  const session = await getServerSession(authOptions)

  // Redirect to dashboard if already logged in
  if (session) {
    redirect('/dashboard')
  }

  return (
    <div className="flex min-h-screen flex-col">
      {/* Header */}
      <header className="border-b">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Image
              src="/zapform_logo.svg"
              alt="ZapForm Analytics"
              width={32}
              height={32}
              className="h-8 w-8"
            />
            <span className="font-semibold text-lg">ZapForm Analytics</span>
          </div>
          <Button asChild variant="ghost">
            <Link href="/login">Sign In</Link>
          </Button>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1 flex flex-col items-center justify-center px-4 py-20">
        <div className="mx-auto max-w-4xl text-center space-y-8">
          {/* Logo */}
          <div className="flex justify-center">
            <Image
              src="/zapform_logo.svg"
              alt="ZapForm Analytics"
              width={80}
              height={80}
              className="h-20 w-20"
            />
          </div>

          {/* Headline */}
          <div className="space-y-4">
            <h1 className="text-4xl font-bold tracking-tight sm:text-6xl bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text">
              Privacy-First Analytics
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Track user behavior, display engagement actions, and gain insights without compromising privacy
            </p>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
            <Button asChild size="lg" className="text-base">
              <Link href="/register">
                <IconSparkles className="h-5 w-5 mr-2" />
                Get Started Free
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="text-base">
              <Link href="/login">Sign In</Link>
            </Button>
          </div>

          {/* Features Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-16">
            <div className="space-y-3 p-6 rounded-lg border bg-card hover:shadow-md transition-shadow">
              <div className="flex justify-center">
                <div className="p-3 rounded-full bg-primary/10">
                  <IconChartBar className="h-6 w-6 text-primary" />
                </div>
              </div>
              <h3 className="font-semibold text-lg">Real-Time Analytics</h3>
              <p className="text-sm text-muted-foreground">
                Track page views, clicks, scroll depth, and user sessions in real-time
              </p>
            </div>

            <div className="space-y-3 p-6 rounded-lg border bg-card hover:shadow-md transition-shadow">
              <div className="flex justify-center">
                <div className="p-3 rounded-full bg-primary/10">
                  <IconPointer className="h-6 w-6 text-primary" />
                </div>
              </div>
              <h3 className="font-semibold text-lg">Engagement Actions</h3>
              <p className="text-sm text-muted-foreground">
                Create and display popups, banners, and modals directly on your website
              </p>
            </div>

            <div className="space-y-3 p-6 rounded-lg border bg-card hover:shadow-md transition-shadow">
              <div className="flex justify-center">
                <div className="p-3 rounded-full bg-primary/10">
                  <IconShieldCheck className="h-6 w-6 text-primary" />
                </div>
              </div>
              <h3 className="font-semibold text-lg">Privacy Focused</h3>
              <p className="text-sm text-muted-foreground">
                GDPR-compliant with session tracking and no personal data collection
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t py-6">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          <p>© 2025 ZapForm. Simple, powerful analytics for modern websites.</p>
        </div>
      </footer>
    </div>
  )
}
