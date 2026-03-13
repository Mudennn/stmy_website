/**
 * Form for changing the current user's password.
 * No current password required — user is already authenticated.
 */

'use client'

import * as React from 'react'
import { updatePassword } from '@/lib/actions/settings'
import { passwordSchema } from '@/lib/schemas/settings'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { toast } from 'sonner'
import { z } from 'zod'

export function PasswordForm() {
  const [isLoading, setIsLoading] = React.useState(false)
  const [formData, setFormData] = React.useState({
    password: '',
    confirmPassword: '',
  })
  const [errors, setErrors] = React.useState<Record<string, string>>({})

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setErrors({})
    setIsLoading(true)

    try {
      passwordSchema.parse(formData)

      const form = new FormData()
      form.append('password', formData.password)
      form.append('confirmPassword', formData.confirmPassword)

      const result = await updatePassword(form)

      if (result.success) {
        toast.success('Password updated')
        setFormData({ password: '', confirmPassword: '' })
      } else {
        toast.error(result.error)
      }
    } catch (err) {
      if (err instanceof z.ZodError) {
        const fieldErrors: Record<string, string> = {}
        err.issues.forEach((issue) => {
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
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <label htmlFor="password" className="text-sm font-medium">
          New Password
        </label>
        <Input
          id="password"
          type="password"
          placeholder="Enter new password"
          value={formData.password}
          onChange={(e) => setFormData({ ...formData, password: e.target.value })}
          disabled={isLoading}
        />
        {errors.password && <p className="text-sm text-red-600">{errors.password}</p>}
      </div>

      <div className="space-y-2">
        <label htmlFor="confirmPassword" className="text-sm font-medium">
          Confirm Password
        </label>
        <Input
          id="confirmPassword"
          type="password"
          placeholder="Confirm new password"
          value={formData.confirmPassword}
          onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
          disabled={isLoading}
        />
        {errors.confirmPassword && <p className="text-sm text-red-600">{errors.confirmPassword}</p>}
      </div>

      <Button type="submit" disabled={isLoading}>
        {isLoading ? 'Updating...' : 'Update Password'}
      </Button>
    </form>
  )
}
