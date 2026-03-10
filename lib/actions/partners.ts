'use server'

import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { getSession, requireAdmin } from '@/lib/auth/session'
import { partnerSchema, partnerFilterSchema } from '@/lib/schemas/partner'
import type { Database } from '@/types/database'
import { z } from 'zod'

type Partner = Database['public']['Tables']['partners']['Row']

const ALLOWED_LOGO_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
const LOGO_MIME_TO_EXT: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
  'image/gif': 'gif',
}

/**
 * Fetch all partners with filtering, searching, and pagination.
 * Authenticated users can see all partners.
 * Unauthenticated users can only see active partners.
 */
export async function getPartners(
  filters: Partial<z.infer<typeof partnerFilterSchema>> = {}
) {
  const supabase = await createClient()

  let session: Awaited<ReturnType<typeof getSession>> | null = null
  try {
    session = await getSession()
  } catch {
    // Unauthenticated user
  }

  const validFilters = partnerFilterSchema.parse(filters)
  const { search, isActive, page, pageSize, sortBy, sortOrder } = validFilters

  let query = supabase.from('partners').select('*', { count: 'exact' })

  if (!session) {
    query = query.eq('is_active', true)
  } else if (isActive !== undefined) {
    query = query.eq('is_active', isActive === 'true')
  }

  if (search) {
    query = query.ilike('name', `%${search}%`)
  }

  query = query.order(sortBy, { ascending: sortOrder === 'asc' })

  const offset = (page - 1) * pageSize
  query = query.range(offset, offset + pageSize - 1)

  const { data, error, count } = await query

  if (error) {
    throw new Error(`Failed to fetch partners: ${error.message}`)
  }

  return {
    partners: data || [],
    totalCount: count || 0,
  }
}

/**
 * Fetch a single partner by ID.
 * Unauthenticated users can only fetch active partners.
 */
export async function getPartner(id: string): Promise<Partner> {
  const supabase = await createClient()

  let session: Awaited<ReturnType<typeof getSession>> | null = null
  try {
    session = await getSession()
  } catch {
    // Unauthenticated user
  }

  const { data, error } = await supabase
    .from('partners')
    .select('*')
    .eq('id', id)
    .single()

  if (error) {
    throw new Error(`Failed to fetch partner: ${error.message}`)
  }

  if (!data) {
    throw new Error('Partner not found')
  }

  if (!session && !data.is_active) {
    throw new Error('Partner not found')
  }

  return data
}

/**
 * Create a new partner.
 * Requires admin or super_admin role.
 */
export async function createPartner(input: unknown): Promise<Partner> {
  const session = await requireAdmin()

  const data = partnerSchema.parse(input)

  const supabase = await createClient()
  const adminClient = createAdminClient()

  let logoUrl: string | null = null
  let filePath: string | null = null

  if (data.logo) {
    // Validate MIME type to prevent client-controlled content-type spoofing
    if (!ALLOWED_LOGO_TYPES.includes(data.logo.type)) {
      throw new Error('Unsupported file type. Allowed: JPEG, PNG, WebP, GIF')
    }

    const ext = LOGO_MIME_TO_EXT[data.logo.type] ?? 'jpg'
    filePath = `${session.user.id}-${Date.now()}.${ext}`

    const buffer = await data.logo.arrayBuffer()
    const { error: uploadError } = await adminClient.storage
      .from('partner-images')
      .upload(filePath, Buffer.from(buffer), { contentType: data.logo.type })

    if (uploadError) {
      throw new Error(`Failed to upload logo: ${uploadError.message}`)
    }

    const { data: publicUrlData } = adminClient.storage
      .from('partner-images')
      .getPublicUrl(filePath)

    logoUrl = publicUrlData.publicUrl
  }

  const { data: partner, error } = await supabase
    .from('partners')
    .insert({
      name: data.name,
      logo_url: logoUrl,
      is_active: data.isActive,
      created_by: session.user.id,
    })
    .select('*')
    .single()

  if (error) {
    if (filePath) {
      await adminClient.storage.from('partner-images').remove([filePath])
    }
    throw new Error(`Failed to create partner: ${error.message}`)
  }

  if (!partner) {
    throw new Error('Failed to create partner')
  }

  return partner
}

/**
 * Update an existing partner.
 * Editors can only update; admins can update and delete.
 */
export async function updatePartner(id: string, input: unknown): Promise<Partner> {
  const session = await getSession()
  if (!['editor', 'admin', 'super_admin'].includes(session.adminUser.role)) {
    throw new Error('Unauthorized')
  }

  const data = partnerSchema.partial().parse(input)

  const supabase = await createClient()
  const adminClient = createAdminClient()

  let newLogoUrl: string | undefined = undefined
  let filePath: string | null = null

  if (data.logo) {
    // Validate MIME type to prevent client-controlled content-type spoofing
    if (!ALLOWED_LOGO_TYPES.includes(data.logo.type)) {
      throw new Error('Unsupported file type. Allowed: JPEG, PNG, WebP, GIF')
    }

    const ext = LOGO_MIME_TO_EXT[data.logo.type] ?? 'jpg'
    filePath = `${session.user.id}-${Date.now()}.${ext}`

    const buffer = await data.logo.arrayBuffer()
    const { error: uploadError } = await adminClient.storage
      .from('partner-images')
      .upload(filePath, Buffer.from(buffer), { contentType: data.logo.type })

    if (uploadError) {
      throw new Error(`Failed to upload logo: ${uploadError.message}`)
    }

    const { data: publicUrlData } = adminClient.storage
      .from('partner-images')
      .getPublicUrl(filePath)

    newLogoUrl = publicUrlData.publicUrl
  }

  // Fetch old logo URL for cleanup
  let oldLogoUrl: string | null = null
  if (newLogoUrl) {
    const { data: existing } = await supabase
      .from('partners')
      .select('logo_url')
      .eq('id', id)
      .single()
    oldLogoUrl = existing?.logo_url ?? null
  }

  const updateData: Partial<Database['public']['Tables']['partners']['Update']> = {
    updated_at: new Date().toISOString(),
  }

  if (data.name) updateData.name = data.name
  if (newLogoUrl !== undefined) updateData.logo_url = newLogoUrl
  if (data.isActive !== undefined) updateData.is_active = data.isActive

  const { data: partner, error } = await supabase
    .from('partners')
    .update(updateData)
    .eq('id', id)
    .select('*')
    .single()

  if (error) {
    if (filePath) {
      await adminClient.storage.from('partner-images').remove([filePath])
    }
    throw new Error(`Failed to update partner: ${error.message}`)
  }

  if (!partner) {
    throw new Error('Partner not found')
  }

  // Clean up old logo after successful DB update — non-fatal
  if (oldLogoUrl) {
    try {
      const oldPath = new URL(oldLogoUrl).pathname.split('/partner-images/')[1]
      if (oldPath) {
        await adminClient.storage.from('partner-images').remove([oldPath])
      }
    } catch {
      console.error('Failed to clean up old storage object for updated partner', id)
    }
  }

  return partner
}

/**
 * Delete a partner.
 * Requires admin or super_admin role.
 */
export async function deletePartner(id: string): Promise<void> {
  await requireAdmin()

  const supabase = await createClient()
  const adminClient = createAdminClient()

  const { data: partner } = await supabase
    .from('partners')
    .select('logo_url')
    .eq('id', id)
    .single()

  const { error } = await supabase.from('partners').delete().eq('id', id)

  if (error) {
    throw new Error(`Failed to delete partner: ${error.message}`)
  }

  // Clean up orphaned storage object — non-fatal
  if (partner?.logo_url) {
    try {
      const filePath = new URL(partner.logo_url).pathname.split('/partner-images/')[1]
      if (filePath) {
        await adminClient.storage.from('partner-images').remove([filePath])
      }
    } catch {
      console.error('Failed to clean up storage object for deleted partner', id)
    }
  }
}
