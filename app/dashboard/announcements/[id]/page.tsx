import { notFound } from 'next/navigation'
import { getSession } from '@/lib/auth/session'
import { getAnnouncement } from '@/lib/actions/announcements'
import { FormShell } from '@/components/cms'
import { AnnouncementForm } from '@/components/announcements/announcement-form'

interface AnnouncementPageProps {
  params: Promise<{ id: string }>
}

/**
 * Edit announcement page.
 * Requires editor or admin role to access.
 */
export default async function AnnouncementPage({ params }: AnnouncementPageProps) {
  const session = await getSession()
  const { role } = session.adminUser

  if (!['editor', 'admin', 'super_admin'].includes(role)) {
    notFound()
  }

  const { id } = await params

  let announcement
  try {
    announcement = await getAnnouncement(id)
  } catch {
    notFound()
  }

  return (
    <FormShell
      title="Edit Announcement"
      description="Update announcement details"
      backHref="/dashboard/announcements"
    >
      <AnnouncementForm announcement={announcement} isEditMode={true} />
    </FormShell>
  )
}
