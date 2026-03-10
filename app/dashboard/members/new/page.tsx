import { requireAdmin } from '@/lib/auth/session'
import { FormShell } from '@/components/cms'
import { MemberForm } from '@/components/members/member-form'

/**
 * Create new member page.
 * Only admins can create members.
 */
export default async function NewMemberPage() {
  await requireAdmin()

  return (
    <FormShell
      title="Create Member"
      description="Add a new member to the community"
      backHref="/dashboard/members"
    >
      <MemberForm />
    </FormShell>
  )
}
