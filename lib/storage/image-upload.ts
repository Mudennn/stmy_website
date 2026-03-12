import { createClient } from '@/lib/supabase/server'

const BUCKET_NAME = 'homepage-images'

/**
 * Upload image to storage bucket
 * Bucket must be created via scripts/create-storage-bucket.ts first
 * Returns public URL if successful
 */
export async function uploadImage(file: File, folder: string = 'uploads'): Promise<string | null> {
  try {
    const supabase = await createClient()

    // Sanitize folder parameter to prevent path traversal (defense-in-depth)
    const safeFolder = folder
      .replace(/\.\./g, '')          // remove traversal sequences
      .replace(/[^a-zA-Z0-9/_-]/g, '') // allow only safe path chars
      .replace(/^\/+|\/+$/g, '')     // strip leading/trailing slashes
      || 'uploads'

    // Generate unique filename with path injection protection
    const timestamp = Date.now()
    const random = Math.random().toString(36).substring(7)
    const safeBaseName = file.name
      .split(/[\\/]/).pop()!         // strip any directory separators
      .replace(/[^a-zA-Z0-9._-]/g, '_') // allow only safe chars
    const filename = `${safeFolder}/${timestamp}-${random}-${safeBaseName}`

    const { error: uploadError } = await supabase.storage
      .from(BUCKET_NAME)
      .upload(filename, file, {
        cacheControl: '3600',
        upsert: false,
      })

    if (uploadError) {
      console.error('[Storage] Upload error:', uploadError)
      return null
    }

    // Get public URL
    const { data } = supabase.storage.from(BUCKET_NAME).getPublicUrl(filename)
    return data.publicUrl
  } catch (error) {
    console.error('[Storage] Upload exception:', error)
    return null
  }
}

/**
 * Delete image from storage bucket
 */
export async function deleteImage(imageUrl: string): Promise<boolean> {
  try {
    const supabase = await createClient()

    // Extract path from URL
    const url = new URL(imageUrl)
    const pathParts = url.pathname.split('/storage/v1/object/public/')

    if (pathParts.length < 2) {
      console.error('[Storage] Invalid image URL format')
      return false
    }

    const filePath = pathParts[1].split('/').slice(1).join('/') // Remove bucket name

    const { error } = await supabase.storage
      .from(BUCKET_NAME)
      .remove([filePath])

    if (error) {
      console.error('[Storage] Delete error:', error)
      return false
    }

    return true
  } catch (error) {
    console.error('[Storage] Delete exception:', error)
    return false
  }
}
