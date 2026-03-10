import { requireAdmin } from '@/lib/auth/session'
import { FormShell } from '@/components/cms'
import { PartnerForm } from '@/components/partners/partner-form'

/**
 * Create new partner page.
 * Only admins can create partners.
 */
export default async function NewPartnerPage() {
  await requireAdmin()

  return (
    <FormShell
      title="Create Partner"
      description="Add a new partner to the ecosystem"
      backHref="/dashboard/partners"
    >
      <PartnerForm />
    </FormShell>
  )
}
