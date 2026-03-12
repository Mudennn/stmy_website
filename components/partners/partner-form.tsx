'use client'

import { useState } from 'react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { partnerSchema, type PartnerFormData } from '@/lib/schemas/partner'
import { createPartner, updatePartner } from '@/lib/actions/partners'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Field } from '@/components/ui/field'
import { toast } from 'sonner'
import type { Database } from '@/types/database'
import { z } from 'zod'

type Partner = Database['public']['Tables']['partners']['Row']

interface PartnerFormProps {
  partner?: Partner
  isEditMode?: boolean
}

/**
 * Create/edit form for partners using Zod validation.
 */
export function PartnerForm({ partner, isEditMode = false }: PartnerFormProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const [formData, setFormData] = useState<Omit<PartnerFormData, 'logo'>>(
    isEditMode && partner
      ? {
          name: partner.name,
          isActive: partner.is_active ?? true,
        }
      : {
          name: '',
          isActive: true,
        }
  )

  const [logoFile, setLogoFile] = useState<File | undefined>(undefined)
  const [currentLogoUrl] = useState<string | null>(
    isEditMode && partner?.logo_url ? partner.logo_url : null
  )
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)

  const handleFieldChange = (field: keyof Omit<PartnerFormData, 'logo'>, value: unknown) => {
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
      const submitData = { ...formData, logo: logoFile }
      partnerSchema.parse(submitData)

      if (isEditMode && partner) {
        await updatePartner(partner.id, submitData)
        toast.success('Partner updated successfully')
      } else {
        await createPartner(submitData)
        toast.success('Partner created successfully')
      }
      router.push('/dashboard/partners')
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
        <Label htmlFor="name">Name *</Label>
        <Input
          id="name"
          placeholder="Partner name"
          value={formData.name}
          onChange={(e) => handleFieldChange('name', e.target.value)}
        />
        {errors['name'] && <p className="text-sm text-destructive">{errors['name']}</p>}
      </Field>

      {/* Logo Upload */}
      <Field>
        <Label htmlFor="logo">Logo</Label>
        <div className="space-y-3">
          {(currentLogoUrl || previewUrl) && (
            <div className="relative w-32 h-20 bg-muted rounded-md overflow-hidden">
              <Image
                src={previewUrl || currentLogoUrl || ''}
                alt="Logo preview"
                fill
                className="object-contain p-2"
              />
              {previewUrl && (
                <button
                  type="button"
                  onClick={() => {
                    setPreviewUrl(null)
                    setLogoFile(undefined)
                  }}
                  className="absolute top-1 right-1 bg-destructive text-white rounded-md px-1 py-0.5 text-xs hover:bg-destructive/90"
                >
                  ✕
                </button>
              )}
            </div>
          )}
          <Input
            id="logo"
            type="file"
            accept="image/*"
            onChange={(e) => {
              const file = e.target.files?.[0]
              if (file) {
                setLogoFile(file)
                const reader = new FileReader()
                reader.onloadend = () => setPreviewUrl(reader.result as string)
                reader.readAsDataURL(file)
              }
            }}
          />
          <p className="text-xs text-muted-foreground">
            {isEditMode && currentLogoUrl && !previewUrl
              ? 'Upload a new image to replace the current one'
              : 'Supported formats: JPG, PNG, WebP, GIF (max 5MB)'}
          </p>
        </div>
        {errors['logo'] && <p className="text-sm text-destructive">{errors['logo']}</p>}
      </Field>

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
        {errors['isActive'] && <p className="text-sm text-destructive">{errors['isActive']}</p>}
      </Field>

      {/* Submit Buttons */}
      <div className="flex gap-3 justify-end pt-6 border-t">
        <Button type="button" variant="outline" onClick={() => router.back()} disabled={isLoading}>
          Cancel
        </Button>
        <Button type="submit" disabled={isLoading}>
          {isLoading ? 'Saving...' : isEditMode ? 'Update Partner' : 'Create Partner'}
        </Button>
      </div>
    </form>
  )
}
