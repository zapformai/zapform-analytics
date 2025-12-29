import { redirect } from 'next/navigation'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth-options'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default async function Home() {
  const session = await getServerSession(authOptions)

  // Redirect to dashboard if already logged in
  if (session) {
    redirect('/dashboard')
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4">
      <div className="mx-auto max-w-3xl text-center space-y-8">
        <div className="space-y-4">
          <h1 className="text-4xl font-bold tracking-tight sm:text-6xl">
            Zapform Analytics
          </h1>
          <p className="text-xl text-muted-foreground">
            Track and analyze your website visitors with powerful, privacy-focused analytics
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button asChild size="lg">
            <Link href="/register">Get Started</Link>
          </Button>
          <Button asChild size="lg" variant="outline">
            <Link href="/login">Sign In</Link>
          </Button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 mt-16 text-left">
          <div className="space-y-2">
            <h3 className="font-semibold">Track Everything</h3>
            <p className="text-sm text-muted-foreground">
              Page views, clicks, scroll depth, device info, and more - all automatically tracked
            </p>
          </div>
          <div className="space-y-2">
            <h3 className="font-semibold">Multiple Projects</h3>
            <p className="text-sm text-muted-foreground">
              Track multiple websites from a single dashboard with unique tracking codes
            </p>
          </div>
          <div className="space-y-2">
            <h3 className="font-semibold">Privacy Focused</h3>
            <p className="text-sm text-muted-foreground">
              GDPR-compliant analytics with session tracking and no personal data collection
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
