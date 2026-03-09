'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldError,
} from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { toast } from 'sonner'

/**
 * Login form for admin users.
 * Calls /api/auth/login Route Handler which properly handles cookies.
 */
export function LoginForm({
  error: initialError,
  className,
  ...props
}: React.ComponentProps<'div'> & { error?: string }) {
  const router = useRouter()
  const [error, setError] = useState(initialError || '')
  const [isPending, startTransition] = useTransition()

  async function handleSubmit(e: React.SyntheticEvent<HTMLFormElement>) {
    e.preventDefault()
    setError('')
    const formData = new FormData(e.currentTarget)

    startTransition(async () => {
      try {
        const response = await fetch('/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: formData.get('email'),
            password: formData.get('password'),
          }),
        })

        const result = await response.json()

        if (!result.success) {
          setError(result.error)
          toast.error(result.error)
        } else {
          // Redirect to dashboard
          router.push('/dashboard')
        }
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Login failed'
        setError(message)
        toast.error(message)
      }
    })
  }

  return (
    <div className={cn('flex flex-col gap-6', className)} {...props}>
      <Card>
        <CardHeader>
          <CardTitle>Admin Login</CardTitle>
          <CardDescription>
            Sign in to access the Superteam Malaysia CMS dashboard
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit}>
            <FieldGroup>
              {(error || initialError) && (
                <Field>
                  <FieldError>{error || initialError}</FieldError>
                </Field>
              )}

              <Field>
                <FieldLabel htmlFor="email">Email</FieldLabel>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="admin@example.com"
                  required
                  autoComplete="email"
                />
              </Field>

              <Field>
                <FieldLabel htmlFor="password">Password</FieldLabel>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  required
                  autoComplete="current-password"
                />
              </Field>

              <Field>
                <Button type="submit" disabled={isPending} className="w-full">
                  {isPending ? 'Signing in...' : 'Sign In'}
                </Button>
              </Field>
            </FieldGroup>
          </form>
        </CardContent>
      </Card>

      <FieldDescription className="text-center text-xs text-muted-foreground">
        Admin access only. Contact your administrator for account access.
      </FieldDescription>
    </div>
  )
}
