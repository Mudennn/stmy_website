/**
 * Invite new admin user page.
 * Only accessible to Super Admins and Admins.
 */

import { requireAdmin } from '@/lib/auth/session'
import { FormShell } from '@/components/cms'
import { InviteForm } from '@/components/users/invite-form'

export default async function InviteUserPage() {
  // Require admin access
  const session = await requireAdmin()

  return (
    <FormShell
      title="Invite User"
      description="Add a new admin or editor to the team"
      backHref="/dashboard/users"
    >
      <InviteForm currentRole={session.adminUser.role} />
    </FormShell>
  )
}
