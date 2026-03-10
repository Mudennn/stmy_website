'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { contentSchema, type ContentFormData } from '@/lib/schemas/content'
import { updateContent } from '@/lib/actions/content'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Field } from '@/components/ui/field'
import { toast } from 'sonner'
import type { Database } from '@/types/database'
import { z } from 'zod'

type CmsContent = Database['public']['Tables']['cms_content']['Row']

interface ContentFormProps {
  content: CmsContent
}

/**
 * Edit form for CMS content sections using Zod validation.
 * Edit-only — no create or delete.
 */
export function ContentForm({ content }: ContentFormProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const [formData, setFormData] = useState<ContentFormData>({
    title: content.title ?? '',
    subtitle: content.subtitle ?? '',
    body: content.body ?? '',
    metadata: content.metadata ? JSON.stringify(content.metadata, null, 2) : '',
    imageUrl: content.image_url ?? '',
    sortOrder: content.sort_order ?? undefined,
    isPublished: content.is_published ?? false,
  })

  const handleFieldChange = (field: keyof ContentFormData, value: unknown) => {
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
      contentSchema.parse(formData)
      await updateContent(content.id, formData)
      toast.success('Content updated successfully')
      router.push('/dashboard/content')
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
      {/* Section (read-only) */}
      <Field>
        <Label>Section</Label>
        <p className="text-sm font-medium capitalize px-3 py-2 rounded-md bg-muted">
          {content.section.replace(/_/g, ' ')}
        </p>
      </Field>

      {/* Title */}
      <Field>
        <Label htmlFor="title">Title</Label>
        <Input
          id="title"
          placeholder="Section title"
          value={formData.title ?? ''}
          onChange={(e) => handleFieldChange('title', e.target.value)}
        />
        {errors['title'] && <p className="text-sm text-destructive">{errors['title']}</p>}
      </Field>

      {/* Subtitle */}
      <Field>
        <Label htmlFor="subtitle">Subtitle</Label>
        <Input
          id="subtitle"
          placeholder="Section subtitle"
          value={formData.subtitle ?? ''}
          onChange={(e) => handleFieldChange('subtitle', e.target.value)}
        />
        {errors['subtitle'] && <p className="text-sm text-destructive">{errors['subtitle']}</p>}
      </Field>

      {/* Body */}
      <Field>
        <Label htmlFor="body">Body</Label>
        <textarea
          id="body"
          placeholder="Section body content..."
          className="h-32 w-full px-3 py-2 rounded-md border border-input bg-background text-sm"
          value={formData.body ?? ''}
          onChange={(e) => handleFieldChange('body', e.target.value)}
        />
        {errors['body'] && <p className="text-sm text-destructive">{errors['body']}</p>}
      </Field>

      {/* Metadata */}
      <Field>
        <Label htmlFor="metadata">Metadata (JSON)</Label>
        <textarea
          id="metadata"
          placeholder='{}'
          className="h-32 w-full px-3 py-2 rounded-md border border-input bg-background text-sm font-mono"
          value={formData.metadata ?? ''}
          onChange={(e) => handleFieldChange('metadata', e.target.value)}
        />
        {errors['metadata'] && <p className="text-sm text-destructive">{errors['metadata']}</p>}
      </Field>

      {/* Image URL and Sort Order */}
      <div className="grid grid-cols-2 gap-4">
        <Field>
          <Label htmlFor="imageUrl">Image URL</Label>
          <Input
            id="imageUrl"
            type="url"
            placeholder="https://..."
            value={formData.imageUrl ?? ''}
            onChange={(e) => handleFieldChange('imageUrl', e.target.value)}
          />
          {errors['imageUrl'] && <p className="text-sm text-destructive">{errors['imageUrl']}</p>}
        </Field>

        <Field>
          <Label htmlFor="sortOrder">Sort Order</Label>
          <Input
            id="sortOrder"
            type="number"
            min={0}
            placeholder="0"
            value={formData.sortOrder ?? ''}
            onChange={(e) =>
              handleFieldChange(
                'sortOrder',
                e.target.value === '' ? undefined : Number(e.target.value)
              )
            }
          />
          {errors['sortOrder'] && <p className="text-sm text-destructive">{errors['sortOrder']}</p>}
        </Field>
      </div>

      {/* Published */}
      <Field>
        <Label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={formData.isPublished}
            onChange={(e) => handleFieldChange('isPublished', e.target.checked)}
            className="h-4 w-4"
          />
          Published
        </Label>
        {errors['isPublished'] && <p className="text-sm text-destructive">{errors['isPublished']}</p>}
      </Field>

      {/* Submit Buttons */}
      <div className="flex gap-3 justify-end pt-6 border-t">
        <Button type="button" variant="outline" onClick={() => router.back()} disabled={isLoading}>
          Cancel
        </Button>
        <Button type="submit" disabled={isLoading}>
          {isLoading ? 'Saving...' : 'Update Content'}
        </Button>
      </div>
    </form>
  )
}
