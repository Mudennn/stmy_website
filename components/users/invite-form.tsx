/**
 * Form for inviting new admin users.
 * Super Admins can invite both admins and editors.
 * Admins can only invite editors.
 *
 * On success, shows a credentials dialog with the generated password
 * for the admin to copy and share with the invited user.
 */

'use client'

import * as React from 'react'
import { useRouter } from 'next/navigation'
import { inviteUser } from '@/lib/actions/users'
import { inviteSchema } from '@/lib/schemas/auth'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { toast } from 'sonner'
import { z } from 'zod'
import { CopyIcon, CheckIcon } from 'lucide-react'

interface InviteFormProps {
  currentRole: 'super_admin' | 'admin' | 'editor'
}

export function InviteForm({ currentRole }: InviteFormProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = React.useState(false)
  const [formData, setFormData] = React.useState<{
    email: string
    full_name: string
    role: 'admin' | 'editor'
  }>({
    email: '',
    full_name: '',
    role: 'editor',
  })
  const [errors, setErrors] = React.useState<Record<string, string>>({})

  // Credentials dialog state
  const [credentials, setCredentials] = React.useState<{
    email: string
    password: string
  } | null>(null)
  const [copied, setCopied] = React.useState(false)

  // Determine available roles based on current user's role
  const availableRoles =
    currentRole === 'super_admin'
      ? [
          { value: 'admin', label: 'Admin' },
          { value: 'editor', label: 'Editor' },
        ]
      : [{ value: 'editor', label: 'Editor' }]

  const loginUrl = typeof window !== 'undefined'
    ? `${window.location.origin}/login`
    : '/login'

  const handleCopyCredentials = async () => {
    if (!credentials) return
    const text = `Login URL: ${loginUrl}\nEmail: ${credentials.email}\nPassword: ${credentials.password}`
    await navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleDialogClose = () => {
    setCredentials(null)
    router.push('/dashboard/users')
    router.refresh()
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setErrors({})
    setIsLoading(true)

    try {
      // Validate with schema
      inviteSchema.parse(formData)

      // Create FormData for server action
      const form = new FormData()
      form.append('email', formData.email)
      form.append('full_name', formData.full_name)
      form.append('role', formData.role)

      // Call server action
      const result = await inviteUser(form)

      if (result.success && result.data) {
        toast.success(`Invited ${formData.email} as ${formData.role}`)
        setFormData({ email: '', full_name: '', role: 'editor' })
        // Show credentials dialog
        setCredentials({
          email: result.data.email,
          password: result.data.password,
        })
      } else if (!result.success) {
        toast.error(result.error)
      }
    } catch (error) {
      if (error instanceof z.ZodError) {
        const fieldErrors: Record<string, string> = {}
        error.issues.forEach((issue) => {
          const field = String(issue.path[0])
          fieldErrors[field] = issue.message
        })
        setErrors(fieldErrors)
      } else {
        toast.error('An unexpected error occurred')
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <>
      <form onSubmit={handleSubmit} className="space-y-6 max-w-md">
        {/* Email */}
        <div className="space-y-2">
          <label htmlFor="email" className="text-sm font-medium">
            Email Address
          </label>
          <Input
            id="email"
            type="email"
            placeholder="user@example.com"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            disabled={isLoading}
          />
          {errors.email && <p className="text-sm text-red-600">{errors.email}</p>}
        </div>

        {/* Full Name */}
        <div className="space-y-2">
          <label htmlFor="full_name" className="text-sm font-medium">
            Full Name
          </label>
          <Input
            id="full_name"
            type="text"
            placeholder="John Doe"
            value={formData.full_name}
            onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
            disabled={isLoading}
          />
          {errors.full_name && <p className="text-sm text-red-600">{errors.full_name}</p>}
        </div>

        {/* Role */}
        <div className="space-y-2">
          <label htmlFor="role" className="text-sm font-medium">
            Role
          </label>
          <Select value={formData.role} onValueChange={(value: 'admin' | 'editor') => setFormData({ ...formData, role: value })}>
            <SelectTrigger id="role" disabled={isLoading}>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {availableRoles.map((role) => (
                <SelectItem key={role.value} value={role.value}>
                  {role.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.role && <p className="text-sm text-red-600">{errors.role}</p>}

          {currentRole === 'admin' && (
            <p className="text-xs text-muted-foreground">
              As an admin, you can only invite editors. Contact a super admin to create admins.
            </p>
          )}
        </div>

        {/* Submit Button */}
        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading ? 'Sending Invite...' : 'Send Invite'}
        </Button>
      </form>

      {/* Credentials Dialog */}
      <Dialog open={!!credentials} onOpenChange={(open) => { if (!open) handleDialogClose() }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>User Invited Successfully</DialogTitle>
            <DialogDescription>
              An invitation email has been sent. Share the login credentials below with the user.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 rounded-md border bg-muted/50 p-4 font-mono text-sm">
            <div>
              <span className="text-muted-foreground">Login URL: </span>
              <span>{loginUrl}</span>
            </div>
            <div>
              <span className="text-muted-foreground">Email: </span>
              <span>{credentials?.email}</span>
            </div>
            <div>
              <span className="text-muted-foreground">Password: </span>
              <span>{credentials?.password}</span>
            </div>
          </div>

          <p className="text-xs text-muted-foreground">
            The user can change their password after logging in via Settings.
          </p>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={handleCopyCredentials}>
              {copied ? (
                <>
                  <CheckIcon className="mr-2 size-4" />
                  Copied
                </>
              ) : (
                <>
                  <CopyIcon className="mr-2 size-4" />
                  Copy Credentials
                </>
              )}
            </Button>
            <Button onClick={handleDialogClose}>Done</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
