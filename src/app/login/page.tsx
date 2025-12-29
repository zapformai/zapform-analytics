import { redirect } from 'next/navigation'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth-options'
import { LoginForm } from '@/components/auth/login-form'

export default async function LoginPage() {
  const session = await getServerSession(authOptions)

  // Redirect to dashboard if already logged in
  if (session) {
    redirect('/dashboard')
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold">Zapform Analytics</h1>
          <p className="text-muted-foreground">Track and analyze your website visitors</p>
        </div>
        <LoginForm />
      </div>
    </div>
  )
}
