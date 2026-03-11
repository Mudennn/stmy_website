/**
 * Invite new admin user page.
 * Only accessible to Super Admins and Admins.
 */

import { requireAdmin } from '@/lib/auth/session'
import { InviteForm } from '@/components/users/invite-form'
import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'

export default async function InviteUserPage() {
  // Require admin access
  const session = await requireAdmin()

  return (
    <div className="flex flex-col gap-6 py-4 md:py-6 px-4 lg:px-6">
      <div className="flex items-center gap-4">
        <Link href="/dashboard/users">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="size-4 mr-2" />
            Back
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Invite User</h1>
          <p className="text-muted-foreground">Add a new admin or editor to the team</p>
        </div>
      </div>

      <div className="max-w-2xl">
        <InviteForm currentRole={session.adminUser.role} />
      </div>
    </div>
  )
}
