import { requireAdmin } from '@/lib/auth/session'
import { FormShell } from '@/components/cms'
import { AnnouncementForm } from '@/components/announcements/announcement-form'

/**
 * Create new announcement page.
 * Only admins can create announcements.
 */
export default async function NewAnnouncementPage() {
  await requireAdmin()

  return (
    <FormShell
      title="Create Announcement"
      description="Add a new site-wide announcement banner"
      backHref="/dashboard/announcements"
    >
      <AnnouncementForm />
    </FormShell>
  )
}
