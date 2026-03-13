/**
 * Form for updating the current user's profile name.
 */

'use client'

import * as React from 'react'
import { useRouter } from 'next/navigation'
import { updateProfile } from '@/lib/actions/settings'
import { profileSchema } from '@/lib/schemas/settings'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { toast } from 'sonner'
import { z } from 'zod'

interface ProfileFormProps {
  defaultName: string
}

export function ProfileForm({ defaultName }: ProfileFormProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = React.useState(false)
  const [fullName, setFullName] = React.useState(defaultName)
  const [error, setError] = React.useState('')

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    try {
      profileSchema.parse({ full_name: fullName })

      const form = new FormData()
      form.append('full_name', fullName)

      const result = await updateProfile(form)

      if (result.success) {
        toast.success('Profile updated')
        router.refresh()
      } else {
        toast.error(result.error)
      }
    } catch (err) {
      if (err instanceof z.ZodError) {
        setError(err.issues[0]?.message || 'Invalid input')
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
        <label htmlFor="full_name" className="text-sm font-medium">
          Full Name
        </label>
        <Input
          id="full_name"
          type="text"
          placeholder="Your name"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          disabled={isLoading}
        />
        {error && <p className="text-sm text-red-600">{error}</p>}
      </div>

      <Button type="submit" disabled={isLoading}>
        {isLoading ? 'Saving...' : 'Save'}
      </Button>
    </form>
  )
}
