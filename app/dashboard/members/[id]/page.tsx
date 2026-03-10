import { notFound } from 'next/navigation'
import { getSession } from '@/lib/auth/session'
import { getMember } from '@/lib/actions/members'
import { FormShell } from '@/components/cms'
import { MemberForm } from '@/components/members/member-form'

interface MemberPageProps {
  params: Promise<{ id: string }>
}

/**
 * Edit member page.
 * Requires editor or admin role to access.
 */
export default async function MemberPage({ params }: MemberPageProps) {
  const session = await getSession()
  const { role } = session.adminUser

  if (!['editor', 'admin', 'super_admin'].includes(role)) {
    notFound()
  }

  const { id } = await params

  let member
  try {
    member = await getMember(id)
  } catch {
    notFound()
  }

  return (
    <FormShell
      title="Edit Member"
      description="Update member details"
      backHref="/dashboard/members"
    >
      <MemberForm member={member} isEditMode={true} />
    </FormShell>
  )
}
