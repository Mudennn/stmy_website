'use client'

import type { Database } from '@/types/database'

type UserRole = Database['public']['Tables']['admin_users']['Row']['role']

interface RoleGateProps {
  children: React.ReactNode
  allowedRoles: UserRole[]
  currentRole: UserRole
  fallback?: React.ReactNode
}

/**
 * Conditionally renders children based on user role.
 * If the current role is not in allowedRoles, renders fallback (or null).
 */
export function RoleGate({
  children,
  allowedRoles,
  currentRole,
  fallback = null,
}: RoleGateProps) {
  const isAllowed = allowedRoles.includes(currentRole)

  if (!isAllowed) {
    return fallback
  }

  return children
}
