'use server'

import { uploadImage } from '@/lib/storage/image-upload'

/**
 * Server action to upload image from FormData
 * Used by client components to upload files to Supabase storage
 */
export async function uploadImageAction(formData: FormData): Promise<{ url: string | null; error: string | null }> {
  try {
    const file = formData.get('file') as File

    if (!file) {
      return { url: null, error: 'No file provided' }
    }

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
    if (!allowedTypes.includes(file.type)) {
      return { url: null, error: 'Invalid file type. Allowed: JPEG, PNG, WebP, GIF' }
    }

    // Validate file size (5MB)
    if (file.size > 5242880) {
      return { url: null, error: 'File too large. Maximum 5MB allowed' }
    }

    const folder = (formData.get('folder') as string) || 'uploads'
    const url = await uploadImage(file, folder)

    if (!url) {
      return { url: null, error: 'Failed to upload image' }
    }

    return { url, error: null }
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Upload failed'
    return { url: null, error: message }
  }
}
