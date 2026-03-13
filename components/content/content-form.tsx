'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { contentSchema, type ContentFormData } from '@/lib/schemas/content'
import { updateContent } from '@/lib/actions/content'
import { uploadImageAction } from '@/lib/actions/upload'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Field } from '@/components/ui/field'
import { toast } from 'sonner'
import type { Database } from '@/types/database'
import { z } from 'zod'
import Image from 'next/image'

type CmsContent = Database['public']['Tables']['cms_content']['Row']

interface ContentFormProps {
  content: CmsContent
}

interface Testimonial {
  content: string
  author: string
  avatar: string
  tweetUrl?: string
}

interface FAQItem {
  question: string
  answer: string
}

interface SocialLink {
  platform: string
  href: string
  icon?: string
}

/**
 * Edit form for CMS content sections using Zod validation.
 * Edit-only — no create or delete.
 * Section-specific rendering: Hero shows button input fields instead of raw JSON.
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
    sortOrder: content.sort_order ?? undefined,
    isPublished: content.is_published ?? false,
  })

  // Parse metadata for easy access — use formData if available, otherwise use initial content
  const metadata = formData.metadata
    ? JSON.parse(formData.metadata)
    : (content.metadata as Record<string, unknown> ?? {})

  // For Hero section: track button fields separately
  const [heroButtons, setHeroButtons] = useState({
    ctaPrimaryLabel: metadata?.ctaPrimary?.label ?? '',
    ctaPrimaryHref: metadata?.ctaPrimary?.href ?? '',
    ctaSecondaryLabel: metadata?.ctaSecondary?.label ?? '',
    ctaSecondaryHref: metadata?.ctaSecondary?.href ?? '',
  })

  // For Mission section: track highlight items
  const [missionItems, setMissionItems] = useState<Array<{id: string; title: string; description: string; image: string}>>(
    metadata?.items ?? []
  )

  // For Stats section: track counter values
  const [statsValues, setStatsValues] = useState<number[]>(
    metadata?.counterValues ?? [0, 0, 0, 0]
  )

  // Track uploading state for images
  const [uploadingImages, setUploadingImages] = useState<Record<string, boolean>>({})

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
      // For Hero section, build metadata from button fields
      const dataToSubmit = { ...formData }
      if (content.section === 'hero') {
        const heroMetadata = {
          ctaPrimary: {
            label: heroButtons.ctaPrimaryLabel,
            href: heroButtons.ctaPrimaryHref,
          },
          ctaSecondary: {
            label: heroButtons.ctaSecondaryLabel,
            href: heroButtons.ctaSecondaryHref,
          },
        }
        dataToSubmit.metadata = JSON.stringify(heroMetadata)
      } else if (content.section === 'mission') {
        const missionMetadata = {
          items: missionItems,
        }
        dataToSubmit.metadata = JSON.stringify(missionMetadata)
      } else if (content.section === 'stats') {
        const statsMetadata = {
          counterValues: statsValues,
        }
        dataToSubmit.metadata = JSON.stringify(statsMetadata)
      }

      contentSchema.parse(dataToSubmit)
      await updateContent(content.id, dataToSubmit)
      toast.success('Content updated successfully')
      router.push('/dashboard/content')
      router.refresh()
    } catch (error) {
      if (error instanceof z.ZodError) {
        const fieldErrors: Record<string, string> = {}
        error.issues.forEach((issue) => {
          const path = issue.path.join('.')
          fieldErrors[path] = issue.message        })
        setErrors(fieldErrors)
        toast.error('Validation failed. Check the form for errors.')
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

      {/* Section-specific fields */}
      {content.section === 'hero' && (
        <>
          <div className="border-t pt-6">
            <h3 className="font-semibold mb-4">Primary Button</h3>
            <div className="grid grid-cols-2 gap-4">
              <Field>
                <Label htmlFor="ctaPrimaryLabel">Label</Label>
                <Input
                  id="ctaPrimaryLabel"
                  placeholder="e.g., Join the Community"
                  value={heroButtons.ctaPrimaryLabel}
                  onChange={(e) => setHeroButtons({ ...heroButtons, ctaPrimaryLabel: e.target.value })}
                />
              </Field>
              <Field>
                <Label htmlFor="ctaPrimaryHref">URL</Label>
                <Input
                  id="ctaPrimaryHref"
                  placeholder="e.g., https://discord.gg/..."
                  value={heroButtons.ctaPrimaryHref}
                  onChange={(e) => setHeroButtons({ ...heroButtons, ctaPrimaryHref: e.target.value })}
                />
              </Field>
            </div>
          </div>

          <div className="border-t pt-6">
            <h3 className="font-semibold mb-4">Secondary Button</h3>
            <div className="grid grid-cols-2 gap-4">
              <Field>
                <Label htmlFor="ctaSecondaryLabel">Label</Label>
                <Input
                  id="ctaSecondaryLabel"
                  placeholder="e.g., Explore Opportunities"
                  value={heroButtons.ctaSecondaryLabel}
                  onChange={(e) => setHeroButtons({ ...heroButtons, ctaSecondaryLabel: e.target.value })}
                />
              </Field>
              <Field>
                <Label htmlFor="ctaSecondaryHref">URL</Label>
                <Input
                  id="ctaSecondaryHref"
                  placeholder="e.g., https://..."
                  value={heroButtons.ctaSecondaryHref}
                  onChange={(e) => setHeroButtons({ ...heroButtons, ctaSecondaryHref: e.target.value })}
                />
              </Field>
            </div>
          </div>
        </>
      )}

      {/* Section-specific fields for Mission/Highlights */}
      {content.section === 'mission' && (
        <div className="border-t pt-6 space-y-6">
          <h3 className="font-semibold">Highlight Items</h3>
          {missionItems.map((item, idx) => (
            <div key={idx} className="border rounded-lg p-4 space-y-4 bg-muted/30">
              <div className="flex items-center justify-between mb-4">
                <h4 className="font-medium">Item {idx + 1}</h4>
                <button
                  type="button"
                  onClick={() => setMissionItems(missionItems.filter((_, i) => i !== idx))}
                  className="text-sm text-destructive hover:underline"
                >
                  Remove
                </button>
              </div>

              <Field>
                <Label htmlFor={`mission-title-${idx}`}>Title</Label>
                <Input
                  id={`mission-title-${idx}`}
                  placeholder="e.g., Builder Support & Mentorship"
                  value={item.title}
                  onChange={(e) => {
                    const updated = [...missionItems]
                    updated[idx].title = e.target.value
                    setMissionItems(updated)
                  }}
                />
              </Field>

              <Field>
                <Label htmlFor={`mission-description-${idx}`}>Description</Label>
                <Input
                  id={`mission-description-${idx}`}
                  placeholder="Item description"
                  value={item.description}
                  onChange={(e) => {
                    const updated = [...missionItems]
                    updated[idx].description = e.target.value
                    setMissionItems(updated)
                  }}
                />
              </Field>

              <Field>
                <Label htmlFor={`mission-image-${idx}`}>Image</Label>
                <div className="space-y-3">
                  {item.image && (
                    <div className="relative w-full h-40 rounded-lg overflow-hidden border border-input bg-muted">
                      <Image
                        src={item.image}
                        alt="Preview"
                        fill
                        className="object-cover"
                      />
                    </div>
                  )}
                  <div className="flex gap-2">
                    <input
                      id={`mission-image-${idx}`}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={async (e) => {
                        const file = e.currentTarget.files?.[0]
                        if (!file) return

                        setUploadingImages(prev => ({ ...prev, [`mission-${idx}`]: true }))
                        try {
                          const formData = new FormData()
                          formData.append('file', file)
                          formData.append('folder', 'mission-highlights')

                          const { url, error } = await uploadImageAction(formData)

                          if (error) {
                            toast.error(error)
                            return
                          }

                          if (url) {
                            const updated = [...missionItems]
                            updated[idx].image = url
                            setMissionItems(updated)
                            toast.success('Image uploaded successfully')
                          }
                        } finally {
                          setUploadingImages(prev => ({ ...prev, [`mission-${idx}`]: false }))
                        }
                      }}
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => document.getElementById(`mission-image-${idx}`)?.click()}
                      disabled={uploadingImages[`mission-${idx}`]}
                    >
                      {uploadingImages[`mission-${idx}`] ? 'Uploading...' : 'Upload Image'}
                    </Button>
                    {item.image && (
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => {
                          const updated = [...missionItems]
                          updated[idx].image = ''
                          setMissionItems(updated)
                        }}
                      >
                        Remove
                      </Button>
                    )}
                  </div>
                </div>
              </Field>
            </div>
          ))}

          <button
            type="button"
            onClick={() => {
              const newId = String(Math.max(...missionItems.map(i => parseInt(i.id) || 0), 0) + 1)
              setMissionItems([
                ...missionItems,
                { id: newId, title: '', description: '', image: '' }
              ])
            }}
            className="w-full py-2 px-3 rounded-md border border-input bg-muted hover:bg-muted/80 text-sm font-medium transition-colors"
          >
            + Add Item
          </button>
        </div>
      )}

      {/* Stats section - counter values */}
      {content.section === 'stats' && (
        <div className="border-t pt-6 space-y-4">
          <Field>
            <Label>Counter Values (in order)</Label>
            <div className="space-y-2">
              {[0, 1, 2, 3].map((idx) => (
                <Field key={idx}>
                  <Label htmlFor={`counter-${idx}`} className="text-sm">Counter {idx + 1}</Label>
                  <Input
                    id={`counter-${idx}`}
                    type="number"
                    placeholder="0"
                    value={statsValues[idx] ?? ''}
                    onChange={(e) => {
                      const updated = [...statsValues]
                      updated[idx] = parseInt(e.target.value) || 0
                      setStatsValues(updated)
                    }}
                  />
                </Field>
              ))}
            </div>
          </Field>
        </div>
      )}

      {/* Community Wall - testimonials */}
      {content.section === 'community_wall' && (
        <div className="border-t pt-6 space-y-6">
          <h3 className="font-semibold">Testimonials</h3>
          {(metadata?.testimonials ?? []).map((item: Testimonial, idx: number) => (
            <div key={idx} className="border rounded-lg p-4 space-y-4 bg-muted/30">
              <div className="flex items-center justify-between mb-4">
                <h4 className="font-medium">Testimonial {idx + 1}</h4>
                <button
                  type="button"
                  onClick={() => {
                    const updated = metadata?.testimonials?.filter((_: Testimonial, i: number) => i !== idx) ?? []
                    const testimonialMetadata = { testimonials: updated }
                    setFormData(prev => ({
                      ...prev,
                      metadata: JSON.stringify(testimonialMetadata)
                    }))
                  }}
                  className="text-sm text-destructive hover:underline"
                >
                  Remove
                </button>
              </div>

              <Field>
                <Label htmlFor={`testimonial-content-${idx}`}>Content (Text)</Label>
                <textarea
                  id={`testimonial-content-${idx}`}
                  placeholder="Testimonial text"
                  className="h-20 w-full px-3 py-2 rounded-md border border-input bg-background text-sm"
                  value={item.content}
                  onChange={(e) => {
                    const updated = [...(metadata?.testimonials ?? [])]
                    updated[idx].content = e.target.value
                    const testimonialMetadata = { testimonials: updated }
                    setFormData(prev => ({
                      ...prev,
                      metadata: JSON.stringify(testimonialMetadata)
                    }))
                  }}
                />
              </Field>

              <Field>
                <Label htmlFor={`testimonial-tweetUrl-${idx}`}>Tweet URL (Optional)</Label>
                <Input
                  id={`testimonial-tweetUrl-${idx}`}
                  type="url"
                  placeholder="https://twitter.com/username/status/..."
                  value={item.tweetUrl ?? ''}
                  onChange={(e) => {
                    const updated = [...(metadata?.testimonials ?? [])]
                    updated[idx].tweetUrl = e.target.value
                    const testimonialMetadata = { testimonials: updated }
                    setFormData(prev => ({
                      ...prev,
                      metadata: JSON.stringify(testimonialMetadata)
                    }))
                  }}
                />
              </Field>

              <Field>
                <Label htmlFor={`testimonial-author-${idx}`}>Author</Label>
                <Input
                  id={`testimonial-author-${idx}`}
                  placeholder="e.g., @username"
                  value={item.author}
                  onChange={(e) => {
                    const updated = [...(metadata?.testimonials ?? [])]
                    updated[idx].author = e.target.value
                    const testimonialMetadata = { testimonials: updated }
                    setFormData(prev => ({
                      ...prev,
                      metadata: JSON.stringify(testimonialMetadata)
                    }))
                  }}
                />
              </Field>

              <Field>
                <Label htmlFor={`testimonial-avatar-${idx}`}>Avatar</Label>
                <div className="space-y-3">
                  {item.avatar && (
                    <div className="relative w-20 h-20 overflow-hidden border border-input bg-muted">
                      <Image
                        src={item.avatar}
                        alt="Avatar"
                        fill
                        className="object-cover"
                      />
                    </div>
                  )}
                  <div className="flex gap-2">
                    <input
                      id={`testimonial-avatar-${idx}`}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={async (e) => {
                        const file = e.currentTarget.files?.[0]
                        if (!file) return

                        setUploadingImages(prev => ({ ...prev, [`testimonial-${idx}`]: true }))
                        try {
                          const formData = new FormData()
                          formData.append('file', file)
                          formData.append('folder', 'testimonial-avatars')

                          const { url, error } = await uploadImageAction(formData)

                          if (error) {
                            toast.error(error)
                            return
                          }

                          if (url) {
                            const updated = [...(metadata?.testimonials ?? [])]
                            updated[idx].avatar = url
                            const testimonialMetadata = { testimonials: updated }
                            setFormData(prev => ({
                              ...prev,
                              metadata: JSON.stringify(testimonialMetadata)
                            }))
                            toast.success('Avatar uploaded successfully')
                          }
                        } finally {
                          setUploadingImages(prev => ({ ...prev, [`testimonial-${idx}`]: false }))
                        }
                      }}
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => document.getElementById(`testimonial-avatar-${idx}`)?.click()}
                      disabled={uploadingImages[`testimonial-${idx}`]}
                    >
                      {uploadingImages[`testimonial-${idx}`] ? 'Uploading...' : 'Upload Avatar'}
                    </Button>
                    {item.avatar && (
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => {
                          const updated = [...(metadata?.testimonials ?? [])]
                          updated[idx].avatar = ''
                          const testimonialMetadata = { testimonials: updated }
                          setFormData(prev => ({
                            ...prev,
                            metadata: JSON.stringify(testimonialMetadata)
                          }))
                        }}
                      >
                        Remove
                      </Button>
                    )}
                  </div>
                </div>
              </Field>
            </div>
          ))}

          <Button
            type="button"
            variant="outline"
            onClick={() => {
              const updated = [...(metadata?.testimonials ?? [])]
              updated.push({ id: updated.length + 1, content: '', author: '', avatar: '', tweetUrl: '' })
              const testimonialMetadata = { testimonials: updated }
              setFormData(prev => ({
                ...prev,
                metadata: JSON.stringify(testimonialMetadata)
              }))
            }}
            className="w-full"
          >
            + Add Testimonial
          </Button>
        </div>
      )}

      {/* FAQ section */}
      {content.section === 'faq' && (
        <div className="border-t pt-6 space-y-6">
          <h3 className="font-semibold">FAQ Items</h3>
          {(metadata?.items ?? []).map((item: FAQItem, idx: number) => (
            <div key={idx} className="border rounded-lg p-4 space-y-4 bg-muted/30">
              <div className="flex items-center justify-between mb-4">
                <h4 className="font-medium">Question {idx + 1}</h4>
                <button
                  type="button"
                  onClick={() => {
                    const updated = metadata?.items?.filter((_: FAQItem, i: number) => i !== idx) ?? []
                    const faqMetadata = { items: updated }
                    setFormData(prev => ({
                      ...prev,
                      metadata: JSON.stringify(faqMetadata)
                    }))
                  }}
                  className="text-sm text-destructive hover:underline"
                >
                  Remove
                </button>
              </div>

              <Field>
                <Label htmlFor={`faq-question-${idx}`}>Question</Label>
                <Input
                  id={`faq-question-${idx}`}
                  placeholder="e.g., What is Superteam Malaysia?"
                  value={item.question}
                  onChange={(e) => {
                    const updated = [...(metadata?.items ?? [])]
                    updated[idx].question = e.target.value
                    const faqMetadata = { items: updated }
                    setFormData(prev => ({
                      ...prev,
                      metadata: JSON.stringify(faqMetadata)
                    }))
                  }}
                />
              </Field>

              <Field>
                <Label htmlFor={`faq-answer-${idx}`}>Answer</Label>
                <textarea
                  id={`faq-answer-${idx}`}
                  placeholder="Answer text"
                  className="h-24 w-full px-3 py-2 rounded-md border border-input bg-background text-sm"
                  value={item.answer}
                  onChange={(e) => {
                    const updated = [...(metadata?.items ?? [])]
                    updated[idx].answer = e.target.value
                    const faqMetadata = { items: updated }
                    setFormData(prev => ({
                      ...prev,
                      metadata: JSON.stringify(faqMetadata)
                    }))
                  }}
                />
              </Field>
            </div>
          ))}

          <button
            type="button"
            onClick={() => {
              const updated = [...(metadata?.items ?? [])]
              updated.push({ question: '', answer: '' })
              const faqMetadata = { items: updated }
              setFormData(prev => ({
                ...prev,
                metadata: JSON.stringify(faqMetadata)
              }))
            }}
            className="w-full py-2 px-3 rounded-md border border-input bg-muted hover:bg-muted/80 text-sm font-medium transition-colors"
          >
            + Add Question
          </button>
        </div>
      )}

      {/* Join CTA - social links */}
      {content.section === 'join_cta' && (
        <div className="border-t pt-6 space-y-6">
          <h3 className="font-semibold">Social Links</h3>
          {(metadata?.socials ?? []).map((item: SocialLink, idx: number) => (
            <div key={idx} className="border rounded-lg p-4 space-y-4 bg-muted/30">
              <div className="flex items-center justify-between mb-4">
                <h4 className="font-medium">Social {idx + 1}</h4>
                <button
                  type="button"
                  onClick={() => {
                    const updated = metadata?.socials?.filter((_: SocialLink, i: number) => i !== idx) ?? []
                    const socialMetadata = { socials: updated }
                    setFormData(prev => ({
                      ...prev,
                      metadata: JSON.stringify(socialMetadata)
                    }))
                  }}
                  className="text-sm text-destructive hover:underline"
                >
                  Remove
                </button>
              </div>

              <Field>
                <Label htmlFor={`social-platform-${idx}`}>Platform</Label>
                <Input
                  id={`social-platform-${idx}`}
                  placeholder="e.g., twitter, discord, telegram"
                  value={item.platform ?? ''}
                  onChange={(e) => {
                    const updated = [...(metadata?.socials ?? [])]
                    updated[idx].platform = e.target.value
                    const socialMetadata = { socials: updated }
                    setFormData(prev => ({
                      ...prev,
                      metadata: JSON.stringify(socialMetadata)
                    }))
                  }}
                />
              </Field>

              <Field>
                <Label htmlFor={`social-href-${idx}`}>URL</Label>
                <Input
                  id={`social-href-${idx}`}
                  type="url"
                  placeholder="https://..."
                  value={item.href}
                  onChange={(e) => {
                    const updated = [...(metadata?.socials ?? [])]
                    updated[idx].href = e.target.value
                    const socialMetadata = { socials: updated }
                    setFormData(prev => ({
                      ...prev,
                      metadata: JSON.stringify(socialMetadata)
                    }))
                  }}
                />
              </Field>
            </div>
          ))}

          <button
            type="button"
            onClick={() => {
              const updated = [...(metadata?.socials ?? [])]
              updated.push({ platform: '', href: '', icon: '' })
              const socialMetadata = { socials: updated }
              setFormData(prev => ({
                ...prev,
                metadata: JSON.stringify(socialMetadata)
              }))
            }}
            className="w-full py-2 px-3 rounded-md border border-input bg-muted hover:bg-muted/80 text-sm font-medium transition-colors"
          >
            + Add Social Link
          </button>
        </div>
      )}

      {/* Metadata - fallback for sections without custom UI */}
      {content.section !== 'hero' && content.section !== 'mission' && content.section !== 'stats' && content.section !== 'community_wall' && content.section !== 'faq' && content.section !== 'join_cta' && (
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
      )}

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
