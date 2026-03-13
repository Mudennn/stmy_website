'use client'

import { useState } from 'react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { eventSchema, type EventFormData } from '@/lib/schemas/event'
import { createEvent, updateEvent } from '@/lib/actions/events'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Field } from '@/components/ui/field'
import { toast } from 'sonner'
import type { Database } from '@/types/database'
import { z } from 'zod'

type Event = Database['public']['Tables']['events']['Row']

interface EventFormProps {
  event?: Event
  isEditMode?: boolean
}

/**
 * Create/edit form for events using Zod validation.
 * Uses React state for form management.
 */
export function EventForm({ event, isEditMode = false }: EventFormProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const [formData, setFormData] = useState<EventFormData>(
    isEditMode && event
      ? {
          title: event.title,
          eventDate: event.event_date?.slice(0, 16) ?? '',
          location: event.location || '',
          lumaUrl: event.luma_url || '',
          image: undefined,
          status: event.status,
        }
      : {
          title: '',
          eventDate: '',
          location: '',
          lumaUrl: '',
          image: undefined,
          status: 'draft',
        }
  )
  const [currentImageUrl] = useState<string | null>(
    isEditMode && event?.image_url ? event.image_url : null
  )
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)

  const handleFieldChange = (field: keyof EventFormData, value: string | number | File | undefined) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    // Clear error for this field
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: '' }))
    }
  }

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsLoading(true)
    setErrors({})

    try {
      // Create submission data object with File if present
      const submitData = {
        title: formData.title,
        eventDate: formData.eventDate,
        location: formData.location,
        lumaUrl: formData.lumaUrl,
        image: formData.image,
        status: formData.status,
      }

      // Validate form data with Zod
      eventSchema.parse(submitData)

      if (isEditMode && event) {
        await updateEvent(event.id, submitData)
        toast.success('Event updated successfully')
      } else {
        await createEvent(submitData)
        toast.success('Event created successfully')
      }
      router.push('/dashboard/events')
    } catch (error) {
      if (error instanceof z.ZodError) {
        // Convert Zod errors to field errors
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
      {/* Title */}
      <Field>
        <Label htmlFor="title">Title *</Label>
        <Input
          id="title"
          placeholder="Enter event title"
          value={formData.title}
          onChange={(e) => handleFieldChange('title', e.target.value)}
        />
        {errors['title'] && (
          <p className="text-sm text-destructive">{errors['title']}</p>
        )}
      </Field>


      {/* Event Date */}
      <Field>
        <Label htmlFor="eventDate">Event Date *</Label>
        <Input
          id="eventDate"
          type="datetime-local"
          value={formData.eventDate}
          onChange={(e) => handleFieldChange('eventDate', e.target.value)}
        />
        {errors['eventDate'] && (
          <p className="text-sm text-destructive">{errors['eventDate']}</p>
        )}
      </Field>

      {/* Location */}
      <Field>
        <Label htmlFor="location">Location</Label>
        <Input
          id="location"
          placeholder="e.g., KL Convention Center"
          value={formData.location || ''}
          onChange={(e) => handleFieldChange('location', e.target.value)}
        />
        {errors['location'] && (
          <p className="text-sm text-destructive">{errors['location']}</p>
        )}
      </Field>

      {/* Luma URL */}
      <Field>
        <Label htmlFor="lumaUrl">Luma Event URL</Label>
        <Input
          id="lumaUrl"
          type="url"
          placeholder="https://lu.ma/..."
          value={formData.lumaUrl || ''}
          onChange={(e) => handleFieldChange('lumaUrl', e.target.value)}
        />
        {errors['lumaUrl'] && (
          <p className="text-sm text-destructive">{errors['lumaUrl']}</p>
        )}
      </Field>

      {/* Image Upload */}
      <Field>
        <Label htmlFor="image">Event Image</Label>
        <div className="space-y-3">
          {(currentImageUrl || previewUrl) && (
            <div className="relative w-full h-48 bg-muted rounded-md overflow-hidden">
              <Image
                src={previewUrl || currentImageUrl || ''}
                alt="Event preview"
                fill
                className="object-cover"
              />
              {previewUrl && (
                <button
                  type="button"
                  onClick={() => {
                    setPreviewUrl(null)
                    handleFieldChange('image', undefined)
                  }}
                  className="absolute top-2 right-2 bg-destructive text-white rounded-md px-2 py-1 text-xs hover:bg-destructive/90"
                >
                  Clear
                </button>
              )}
            </div>
          )}
          <Input
            id="image"
            type="file"
            accept="image/*"
            onChange={(e) => {
              const file = e.target.files?.[0]
              if (file) {
                handleFieldChange('image', file)
                const reader = new FileReader()
                reader.onloadend = () => {
                  setPreviewUrl(reader.result as string)
                }
                reader.readAsDataURL(file)
              }
            }}
          />
          <p className="text-xs text-muted-foreground">
            {isEditMode && currentImageUrl && !previewUrl
              ? 'Upload a new image to replace the current one'
              : 'Supported formats: JPG, PNG, WebP (max 5MB)'}
          </p>
        </div>
        {errors['image'] && (
          <p className="text-sm text-destructive">{errors['image']}</p>
        )}
      </Field>

      {/* Status */}
      <Field>
        <Label htmlFor="status">Status</Label>
        <Select value={formData.status} onValueChange={(value) => handleFieldChange('status', value)}>
          <SelectTrigger id="status">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="draft">Draft</SelectItem>
            <SelectItem value="published">Published</SelectItem>
            <SelectItem value="cancelled">Cancelled</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
          </SelectContent>
        </Select>
        {errors['status'] && (
          <p className="text-sm text-destructive">{errors['status']}</p>
        )}
      </Field>

      {/* Submit Buttons */}
      <div className="flex gap-3 justify-end pt-6 border-t">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.back()}
          disabled={isLoading}
        >
          Cancel
        </Button>
        <Button type="submit" disabled={isLoading}>
          {isLoading ? 'Saving...' : isEditMode ? 'Update Event' : 'Create Event'}
        </Button>
      </div>
    </form>
  )
}
