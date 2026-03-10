import { notFound } from 'next/navigation'
import { getSession } from '@/lib/auth/session'
import { getPartner } from '@/lib/actions/partners'
import { FormShell } from '@/components/cms'
import { PartnerForm } from '@/components/partners/partner-form'

interface PartnerPageProps {
  params: Promise<{ id: string }>
}

/**
 * Edit partner page.
 * Requires editor or admin role to access.
 */
export default async function PartnerPage({ params }: PartnerPageProps) {
  const session = await getSession()
  const { role } = session.adminUser

  if (!['editor', 'admin', 'super_admin'].includes(role)) {
    notFound()
  }

  const { id } = await params

  let partner
  try {
    partner = await getPartner(id)
  } catch {
    notFound()
  }

  return (
    <FormShell
      title="Edit Partner"
      description="Update partner details"
      backHref="/dashboard/partners"
    >
      <PartnerForm partner={partner} isEditMode={true} />
    </FormShell>
  )
}
