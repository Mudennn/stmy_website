'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { announcementSchema, type AnnouncementFormData } from '@/lib/schemas/announcement'
import { createAnnouncement, updateAnnouncement } from '@/lib/actions/announcements'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Field } from '@/components/ui/field'
import { toast } from 'sonner'
import type { Database } from '@/types/database'
import { z } from 'zod'

type Announcement = Database['public']['Tables']['announcements']['Row']

interface AnnouncementFormProps {
  announcement?: Announcement
  isEditMode?: boolean
}

/**
 * Create/edit form for announcements using Zod validation.
 */
export function AnnouncementForm({ announcement, isEditMode = false }: AnnouncementFormProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const [formData, setFormData] = useState<AnnouncementFormData>(
    isEditMode && announcement
      ? {
          message: announcement.message,
          isActive: announcement.is_active ?? false,
          startsAt: announcement.starts_at?.slice(0, 16) ?? '',
          endsAt: announcement.ends_at?.slice(0, 16) ?? '',
        }
      : {
          message: '',
          isActive: false,
          startsAt: '',
          endsAt: '',
        }
  )

  const handleFieldChange = (field: keyof AnnouncementFormData, value: unknown) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: '' }))
    }
  }

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsLoading(true)
    setErrors({})

    try {
      announcementSchema.parse(formData)

      if (isEditMode && announcement) {
        await updateAnnouncement(announcement.id, formData)
        toast.success('Announcement updated successfully')
      } else {
        await createAnnouncement(formData)
        toast.success('Announcement created successfully')
      }
      router.push('/dashboard/announcements')
      router.refresh()
    } catch (error) {
      if (error instanceof z.ZodError) {
        const fieldErrors: Record<string, string> = {}
        error.issues.forEach((issue) => {
          const path = issue.path.join('.')
          fieldErrors[path] = issue.message
        })
        setErrors(fieldErrors)
      } else {
        const message = error instanceof Error ? error.message : 'An error occurred'
        toast.error(message)
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-6">
      {/* Message */}
      <Field>
        <Label htmlFor="message">Message *</Label>
        <textarea
          id="message"
          placeholder="Announcement message..."
          className="h-20 w-full px-3 py-2 rounded-md border border-input bg-background text-sm"
          value={formData.message}
          onChange={(e) => handleFieldChange('message', e.target.value)}
        />
        {errors['message'] && <p className="text-sm text-destructive">{errors['message']}</p>}
      </Field>

      {/* Date Range */}
      <div className="grid grid-cols-2 gap-4">
        <Field>
          <Label htmlFor="startsAt">Starts At</Label>
          <Input
            id="startsAt"
            type="datetime-local"
            value={formData.startsAt || ''}
            onChange={(e) => handleFieldChange('startsAt', e.target.value)}
          />
          {errors['startsAt'] && <p className="text-sm text-destructive">{errors['startsAt']}</p>}
        </Field>

        <Field>
          <Label htmlFor="endsAt">Ends At</Label>
          <Input
            id="endsAt"
            type="datetime-local"
            value={formData.endsAt || ''}
            onChange={(e) => handleFieldChange('endsAt', e.target.value)}
          />
          {errors['endsAt'] && <p className="text-sm text-destructive">{errors['endsAt']}</p>}
        </Field>
      </div>

      {/* Active */}
      <Field>
        <Label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={formData.isActive}
            onChange={(e) => handleFieldChange('isActive', e.target.checked)}
            className="h-4 w-4"
          />
          Active
        </Label>
        <p className="text-xs text-muted-foreground">
          Only one announcement can be active at a time. Enabling this will fail if another is already active.
        </p>
        {errors['isActive'] && <p className="text-sm text-destructive">{errors['isActive']}</p>}
      </Field>

      {/* Submit Buttons */}
      <div className="flex gap-3 justify-end pt-6 border-t">
        <Button type="button" variant="outline" onClick={() => router.back()} disabled={isLoading}>
          Cancel
        </Button>
        <Button type="submit" disabled={isLoading}>
          {isLoading
            ? 'Saving...'
            : isEditMode
            ? 'Update Announcement'
            : 'Create Announcement'}
        </Button>
      </div>
    </form>
  )
}
