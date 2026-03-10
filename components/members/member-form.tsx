'use client'

import { useState } from 'react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { memberSchema, type MemberFormData } from '@/lib/schemas/member'
import { createMember, updateMember } from '@/lib/actions/members'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Field } from '@/components/ui/field'
import { toast } from 'sonner'
import type { Database } from '@/types/database'
import { z } from 'zod'

type Member = Database['public']['Tables']['members']['Row']

interface MemberFormProps {
  member?: Member
  isEditMode?: boolean
}

/**
 * Create/edit form for members using Zod validation.
 */
export function MemberForm({ member, isEditMode = false }: MemberFormProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const [formData, setFormData] = useState<Omit<MemberFormData, 'avatar'>>(
    isEditMode && member
      ? {
          fullName: member.full_name,
          roleTitle: member.role_title || '',
          company: member.company || '',
          bio: member.bio || '',
          twitterUrl: member.twitter_url || '',
          skillTags: member.skill_tags?.join(', ') || '',
          isFeatured: member.is_featured ?? false,
          isActive: member.is_active ?? true,
        }
      : {
          fullName: '',
          roleTitle: '',
          company: '',
          bio: '',
          twitterUrl: '',
          skillTags: '',
          isFeatured: false,
          isActive: true,
        }
  )

  const [avatarFile, setAvatarFile] = useState<File | undefined>(undefined)
  const [currentAvatarUrl] = useState<string | null>(
    isEditMode && member?.avatar_url ? member.avatar_url : null
  )
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)

  const handleFieldChange = (field: keyof Omit<MemberFormData, 'avatar'>, value: unknown) => {
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
      const submitData = { ...formData, avatar: avatarFile }
      memberSchema.parse(submitData)

      if (isEditMode && member) {
        await updateMember(member.id, submitData)
        toast.success('Member updated successfully')
      } else {
        await createMember(submitData)
        toast.success('Member created successfully')
      }
      router.push('/dashboard/members')
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
      {/* Name */}
      <Field>
        <Label htmlFor="fullName">Full Name *</Label>
        <Input
          id="fullName"
          placeholder="Enter full name"
          value={formData.fullName}
          onChange={(e) => handleFieldChange('fullName', e.target.value)}
        />
        {errors['fullName'] && <p className="text-sm text-destructive">{errors['fullName']}</p>}
      </Field>

      {/* Role Title and Company */}
      <div className="grid grid-cols-2 gap-4">
        <Field>
          <Label htmlFor="roleTitle">Role / Title</Label>
          <Input
            id="roleTitle"
            placeholder="e.g., Frontend Developer"
            value={formData.roleTitle || ''}
            onChange={(e) => handleFieldChange('roleTitle', e.target.value)}
          />
          {errors['roleTitle'] && <p className="text-sm text-destructive">{errors['roleTitle']}</p>}
        </Field>

        <Field>
          <Label htmlFor="company">Company</Label>
          <Input
            id="company"
            placeholder="e.g., Acme Corp"
            value={formData.company || ''}
            onChange={(e) => handleFieldChange('company', e.target.value)}
          />
          {errors['company'] && <p className="text-sm text-destructive">{errors['company']}</p>}
        </Field>
      </div>

      {/* Bio */}
      <Field>
        <Label htmlFor="bio">Bio</Label>
        <textarea
          id="bio"
          placeholder="Short bio..."
          className="h-28 w-full px-3 py-2 rounded-md border border-input bg-background text-sm"
          value={formData.bio || ''}
          onChange={(e) => handleFieldChange('bio', e.target.value)}
        />
        {errors['bio'] && <p className="text-sm text-destructive">{errors['bio']}</p>}
      </Field>

      {/* Avatar Upload */}
      <Field>
        <Label htmlFor="avatar">Avatar</Label>
        <div className="space-y-3">
          {(currentAvatarUrl || previewUrl) && (
            <div className="relative w-24 h-24 bg-muted rounded-full overflow-hidden">
              <Image
                src={previewUrl || currentAvatarUrl || ''}
                alt="Avatar preview"
                fill
                className="object-cover"
              />
              {previewUrl && (
                <button
                  type="button"
                  onClick={() => {
                    setPreviewUrl(null)
                    setAvatarFile(undefined)
                  }}
                  className="absolute top-1 right-1 bg-destructive text-white rounded-md px-1 py-0.5 text-xs hover:bg-destructive/90"
                >
                  ✕
                </button>
              )}
            </div>
          )}
          <Input
            id="avatar"
            type="file"
            accept="image/*"
            onChange={(e) => {
              const file = e.target.files?.[0]
              if (file) {
                setAvatarFile(file)
                const reader = new FileReader()
                reader.onloadend = () => setPreviewUrl(reader.result as string)
                reader.readAsDataURL(file)
              }
            }}
          />
          <p className="text-xs text-muted-foreground">
            {isEditMode && currentAvatarUrl && !previewUrl
              ? 'Upload a new image to replace the current one'
              : 'Supported formats: JPG, PNG, WebP (max 5MB)'}
          </p>
        </div>
        {errors['avatar'] && <p className="text-sm text-destructive">{errors['avatar']}</p>}
      </Field>

      {/* Twitter URL */}
      <Field>
        <Label htmlFor="twitterUrl">Twitter URL</Label>
        <Input
          id="twitterUrl"
          type="url"
          placeholder="https://twitter.com/..."
          value={formData.twitterUrl || ''}
          onChange={(e) => handleFieldChange('twitterUrl', e.target.value)}
        />
        {errors['twitterUrl'] && <p className="text-sm text-destructive">{errors['twitterUrl']}</p>}
      </Field>

      {/* Skill Tags */}
      <Field>
        <Label htmlFor="skillTags">Skill Tags</Label>
        <Input
          id="skillTags"
          placeholder="e.g., React, TypeScript, Solana"
          value={formData.skillTags || ''}
          onChange={(e) => handleFieldChange('skillTags', e.target.value)}
        />
        <p className="text-xs text-muted-foreground">Comma-separated list of skills</p>
        {errors['skillTags'] && <p className="text-sm text-destructive">{errors['skillTags']}</p>}
      </Field>

      {/* Featured and Active */}
      <div className="grid grid-cols-2 gap-4">
        <Field>
          <Label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={formData.isFeatured}
              onChange={(e) => handleFieldChange('isFeatured', e.target.checked)}
              className="h-4 w-4"
            />
            Featured
          </Label>
          {errors['isFeatured'] && <p className="text-sm text-destructive">{errors['isFeatured']}</p>}
        </Field>

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
          {errors['isActive'] && <p className="text-sm text-destructive">{errors['isActive']}</p>}
        </Field>
      </div>

      {/* Submit Buttons */}
      <div className="flex gap-3 justify-end pt-6 border-t">
        <Button type="button" variant="outline" onClick={() => router.back()} disabled={isLoading}>
          Cancel
        </Button>
        <Button type="submit" disabled={isLoading}>
          {isLoading ? 'Saving...' : isEditMode ? 'Update Member' : 'Create Member'}
        </Button>
      </div>
    </form>
  )
}
