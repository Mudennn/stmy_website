import { notFound } from 'next/navigation'
import { getSession } from '@/lib/auth/session'
import { getContent } from '@/lib/actions/content'
import { FormShell } from '@/components/cms'
import { ContentForm } from '@/components/content/content-form'

interface ContentPageProps {
  params: Promise<{ id: string }>
}

/**
 * Edit CMS content page.
 * Requires editor or admin role to access.
 */
export default async function ContentEditPage({ params }: ContentPageProps) {
  const session = await getSession()
  const { role } = session.adminUser

  if (!['editor', 'admin', 'super_admin'].includes(role)) {
    notFound()
  }

  const { id } = await params

  let content
  try {
    content = await getContent(id)
  } catch {
    notFound()
  }

  return (
    <FormShell
      title="Edit Content"
      description="Update section content"
      backHref="/dashboard/content"
    >
      <ContentForm content={content} />
    </FormShell>
  )
}
