import { Button } from '@/components/ui/button'
import { ChevronLeftIcon } from 'lucide-react'
import Link from 'next/link'

interface FormShellProps {
  title: string
  description?: string
  backHref: string
  children: React.ReactNode
}

/**
 * Shared layout wrapper for create/edit forms.
 * Includes title, back button, and form submission button.
 */
export function FormShell({
  title,
  description,
  backHref,
  children,
}: FormShellProps) {
  return (
    <div className="flex flex-col gap-6 py-4 md:py-6 px-4 lg:px-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href={backHref}>
          <Button variant="ghost" size="icon">
            <ChevronLeftIcon className="h-4 w-4" />
            <span className="sr-only">Go back</span>
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
          {description && (
            <p className="text-sm text-muted-foreground">{description}</p>
          )}
        </div>
      </div>

      {/* Form Content */}
      <div className="flex flex-col gap-6 max-w-2xl">
        {children}
      </div>
    </div>
  )
}
