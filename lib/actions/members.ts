'use server'

import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { getSession, requireAdmin } from '@/lib/auth/session'
import { memberSchema, memberFilterSchema } from '@/lib/schemas/member'
import type { Database } from '@/types/database'
import { z } from 'zod'

type Member = Database['public']['Tables']['members']['Row']

const ALLOWED_AVATAR_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
const AVATAR_MIME_TO_EXT: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
  'image/gif': 'gif',
}

/**
 * Fetch all members with filtering, searching, and pagination.
 * Authenticated users can see all members.
 * Unauthenticated users can only see active members.
 */
export async function getMembers(
  filters: Partial<z.infer<typeof memberFilterSchema>> = {}
) {
  const supabase = await createClient()

  let session: Awaited<ReturnType<typeof getSession>> | null = null
  try {
    session = await getSession()
  } catch {
    // Unauthenticated user
  }

  const validFilters = memberFilterSchema.parse(filters)
  const { search, isFeatured, isActive, page, pageSize, sortBy, sortOrder } = validFilters

  let query = supabase.from('members').select('*', { count: 'exact' })

  if (!session) {
    query = query.eq('is_active', true)
  } else if (isActive !== undefined) {
    query = query.eq('is_active', isActive === 'true')
  }

  if (isFeatured !== undefined) {
    query = query.eq('is_featured', isFeatured === 'true')
  }

  if (search) {
    query = query.ilike('full_name', `%${search}%`)
  }

  query = query.order(sortBy, { ascending: sortOrder === 'asc' })

  const offset = (page - 1) * pageSize
  query = query.range(offset, offset + pageSize - 1)

  const { data, error, count } = await query

  if (error) {
    throw new Error(`Failed to fetch members: ${error.message}`)
  }

  return {
    members: data || [],
    totalCount: count || 0,
  }
}

/**
 * Fetch a single member by ID.
 * Authenticated users can fetch any member.
 * Unauthenticated users can only fetch active members.
 */
export async function getMember(id: string): Promise<Member> {
  const supabase = await createClient()

  let session: Awaited<ReturnType<typeof getSession>> | null = null
  try {
    session = await getSession()
  } catch {
    // Unauthenticated user
  }

  const { data, error } = await supabase
    .from('members')
    .select('*')
    .eq('id', id)
    .single()

  if (error) {
    throw new Error(`Failed to fetch member: ${error.message}`)
  }

  if (!data) {
    throw new Error('Member not found')
  }

  if (!session && !data.is_active) {
    throw new Error('Member not found')
  }

  return data
}

/**
 * Create a new member.
 * Requires admin or super_admin role.
 */
export async function createMember(input: unknown): Promise<Member> {
  const session = await requireAdmin()

  const data = memberSchema.parse(input)

  const skillTagsArray = data.skillTags
    ? data.skillTags.split(',').map((t) => t.trim()).filter(Boolean)
    : []

  // Parse achievements JSON
  let achievementsObj: Record<string, unknown> | null = null
  if (data.achievements) {
    try {
      achievementsObj = JSON.parse(data.achievements)
    } catch {
      throw new Error('Invalid achievements JSON format')
    }
  }

  const supabase = await createClient()
  const adminClient = createAdminClient()

  let avatarUrl: string | null = null
  let filePath: string | null = null

  if (data.avatar) {
    // Validate MIME type to prevent client-controlled content-type spoofing
    if (!ALLOWED_AVATAR_TYPES.includes(data.avatar.type)) {
      throw new Error('Unsupported file type. Allowed: JPEG, PNG, WebP, GIF')
    }

    const ext = AVATAR_MIME_TO_EXT[data.avatar.type] ?? 'jpg'
    filePath = `${session.user.id}-${Date.now()}.${ext}`

    const buffer = await data.avatar.arrayBuffer()
    const { error: uploadError } = await adminClient.storage
      .from('member-images')
      .upload(filePath, Buffer.from(buffer), { contentType: data.avatar.type })

    if (uploadError) {
      throw new Error(`Failed to upload avatar: ${uploadError.message}`)
    }

    const { data: publicUrlData } = adminClient.storage
      .from('member-images')
      .getPublicUrl(filePath)

    avatarUrl = publicUrlData.publicUrl
  }

  const { data: member, error } = await supabase
    .from('members')
    .insert({
      full_name: data.fullName,
      role_title: data.roleTitle || null,
      company: data.company || null,
      bio: data.bio || null,
      avatar_url: avatarUrl,
      twitter_url: data.twitterUrl || null,
      skill_tags: skillTagsArray,
      achievements: achievementsObj as Database['public']['Tables']['members']['Insert']['achievements'],
      is_featured: data.isFeatured,
      is_active: data.isActive,
      created_by: session.user.id,
    })
    .select('*')
    .single()

  if (error) {
    if (filePath) {
      await adminClient.storage.from('member-images').remove([filePath])
    }
    throw new Error(`Failed to create member: ${error.message}`)
  }

  if (!member) {
    throw new Error('Failed to create member')
  }

  return member
}

/**
 * Update an existing member.
 * Editors can only update; admins can update and delete.
 */
export async function updateMember(id: string, input: unknown): Promise<Member> {
  const session = await getSession()
  if (!['editor', 'admin', 'super_admin'].includes(session.adminUser.role)) {
    throw new Error('Unauthorized')
  }

  const data = memberSchema.partial().parse(input)

  const skillTagsArray =
    data.skillTags !== undefined
      ? data.skillTags
        ? data.skillTags.split(',').map((t) => t.trim()).filter(Boolean)
        : []
      : undefined

  // Parse achievements JSON
  let achievementsObj: Record<string, unknown> | null | undefined = undefined
  if (data.achievements !== undefined) {
    if (data.achievements) {
      try {
        achievementsObj = JSON.parse(data.achievements)
      } catch {
        throw new Error('Invalid achievements JSON format')
      }
    } else {
      achievementsObj = null
    }
  }

  const supabase = await createClient()
  const adminClient = createAdminClient()

  let newAvatarUrl: string | undefined = undefined
  let filePath: string | null = null

  if (data.avatar) {
    // Validate MIME type to prevent client-controlled content-type spoofing
    if (!ALLOWED_AVATAR_TYPES.includes(data.avatar.type)) {
      throw new Error('Unsupported file type. Allowed: JPEG, PNG, WebP, GIF')
    }

    const ext = AVATAR_MIME_TO_EXT[data.avatar.type] ?? 'jpg'
    filePath = `${session.user.id}-${Date.now()}.${ext}`

    const buffer = await data.avatar.arrayBuffer()
    const { error: uploadError } = await adminClient.storage
      .from('member-images')
      .upload(filePath, Buffer.from(buffer), { contentType: data.avatar.type })

    if (uploadError) {
      throw new Error(`Failed to upload avatar: ${uploadError.message}`)
    }

    const { data: publicUrlData } = adminClient.storage
      .from('member-images')
      .getPublicUrl(filePath)

    newAvatarUrl = publicUrlData.publicUrl
  }

  // Fetch old avatar URL for cleanup
  let oldAvatarUrl: string | null = null
  if (newAvatarUrl) {
    const { data: existing } = await supabase
      .from('members')
      .select('avatar_url')
      .eq('id', id)
      .single()
    oldAvatarUrl = existing?.avatar_url ?? null
  }

  const updateData: Partial<Database['public']['Tables']['members']['Update']> = {
    updated_at: new Date().toISOString(),
  }

  if (data.fullName) updateData.full_name = data.fullName
  if (data.roleTitle !== undefined) updateData.role_title = data.roleTitle || null
  if (data.company !== undefined) updateData.company = data.company || null
  if (data.bio !== undefined) updateData.bio = data.bio || null
  if (newAvatarUrl !== undefined) updateData.avatar_url = newAvatarUrl
  if (data.twitterUrl !== undefined) updateData.twitter_url = data.twitterUrl || null
  if (skillTagsArray !== undefined) updateData.skill_tags = skillTagsArray
  if (achievementsObj !== undefined) updateData.achievements = achievementsObj as Database['public']['Tables']['members']['Update']['achievements']
  if (data.isFeatured !== undefined) updateData.is_featured = data.isFeatured
  if (data.isActive !== undefined) updateData.is_active = data.isActive

  const { data: member, error } = await supabase
    .from('members')
    .update(updateData)
    .eq('id', id)
    .select('*')
    .single()

  if (error) {
    if (filePath) {
      await adminClient.storage.from('member-images').remove([filePath])
    }
    throw new Error(`Failed to update member: ${error.message}`)
  }

  if (!member) {
    throw new Error('Member not found')
  }

  // Clean up old avatar after successful DB update — non-fatal
  if (oldAvatarUrl) {
    try {
      const oldPath = new URL(oldAvatarUrl).pathname.split('/member-images/')[1]
      if (oldPath) {
        await adminClient.storage.from('member-images').remove([oldPath])
      }
    } catch {
      console.error('Failed to clean up old storage object for updated member', id)
    }
  }

  return member
}

/**
 * Delete a member.
 * Requires admin or super_admin role.
 */
export async function deleteMember(id: string): Promise<void> {
  await requireAdmin()

  const supabase = await createClient()
  const adminClient = createAdminClient()

  const { data: member } = await supabase
    .from('members')
    .select('avatar_url')
    .eq('id', id)
    .single()

  const { error } = await supabase.from('members').delete().eq('id', id)

  if (error) {
    throw new Error(`Failed to delete member: ${error.message}`)
  }

  // Clean up orphaned storage object — non-fatal
  if (member?.avatar_url) {
    try {
      const filePath = new URL(member.avatar_url).pathname.split('/member-images/')[1]
      if (filePath) {
        await adminClient.storage.from('member-images').remove([filePath])
      }
    } catch {
      console.error('Failed to clean up storage object for deleted member', id)
    }
  }
}
