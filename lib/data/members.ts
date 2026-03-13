import { createClient } from '@/lib/supabase/server'
import type { Database } from '@/types/database'

type Member = Database['public']['Tables']['members']['Row']

export async function getAllMembers(): Promise<Member[]> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('members')
    .select('*')
    .eq('is_active', true)
    .order('full_name', { ascending: true })

  if (error) {
    console.error('[Members Data] Failed to fetch members:', error.message)
    return []
  }

  return data || []
}
