/**
 * Next.js middleware for route protection and session management.
 * Runs on every request to:
 * 1. Refresh Supabase auth session via cookies (applies to pages AND API routes)
 * 2. Protect /dashboard/* routes (redirect to /login if not authenticated)
 * 3. Redirect authenticated users away from /login (to /dashboard)
 * 4. Redirect /signup to /login (no public registration, invite-only)
 *
 * Note: API routes are included in the matcher so that session tokens are
 * refreshed before protected endpoints are called. This prevents issues where
 * an expired token would return null even with a valid refresh token.
 */

import { NextResponse, type NextRequest } from 'next/server'
import { createServerClient } from '@supabase/ssr'

export async function middleware(request: NextRequest) {
  // Start with the next response
  const supabaseResponse = NextResponse.next({
    request,
  })

  // Initialize Supabase client with cookies from the request
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          // In middleware, only set cookies on the response (request cookies are read-only)
          cookiesToSet.forEach(({ name, value, options }) => {
            supabaseResponse.cookies.set(name, value, options)
          })
        },
      },
    }
  )

  // Refresh the session to ensure it's still valid
  // Wrap in try-catch to handle timeouts gracefully
  let user = null
  try {
    const { data: { user: authUser } } = await supabase.auth.getUser()
    user = authUser
  } catch (error) {
    // If session check fails (e.g. Supabase unreachable), user stays null.
    // Dashboard routes will be redirected to /login (fail-closed).
    console.error('[Middleware] Auth check failed:', error instanceof Error ? error.message : 'Unknown error')
  }

  // Route protection: redirect to /login if not authenticated
  if (!user && request.nextUrl.pathname.startsWith('/dashboard')) {
    const loginUrl = request.nextUrl.clone()
    loginUrl.pathname = '/login'
    return NextResponse.redirect(loginUrl)
  }

  // Don't redirect authenticated users away from /login in middleware
  // Let the dashboard layout handle the auth check instead
  // This prevents redirect loops when session is still being established

  // Redirect /signup to /login (no public registration)
  if (request.nextUrl.pathname === '/signup') {
    const loginUrl = request.nextUrl.clone()
    loginUrl.pathname = '/login'
    return NextResponse.redirect(loginUrl)
  }

  return supabaseResponse
}

// Configure which routes trigger the middleware
export const config = {
  matcher: ['/dashboard/:path*', '/login', '/signup', '/api/:path*'],
}
