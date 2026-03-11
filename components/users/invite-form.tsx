/**
 * Form for inviting new admin users.
 * Super Admins can invite both admins and editors.
 * Admins can only invite editors.
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
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { toast } from 'sonner'
import { z } from 'zod'

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

  // Determine available roles based on current user's role
  const availableRoles =
    currentRole === 'super_admin'
      ? [
          { value: 'admin', label: 'Admin' },
          { value: 'editor', label: 'Editor' },
        ]
      : [{ value: 'editor', label: 'Editor' }]

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

      if (result.success) {
        toast.success(`Invited ${formData.email} as ${formData.role}`)
        setFormData({ email: '', full_name: '', role: 'editor' })
        router.push('/dashboard/users')
        router.refresh()
      } else {
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
  )
}
