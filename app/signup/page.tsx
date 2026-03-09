import { redirect } from 'next/navigation'

/**
 * Signup page redirects to login.
 * No public registration - user accounts are created via invite-only flow.
 */
export default function Page() {
  redirect('/login')
}
