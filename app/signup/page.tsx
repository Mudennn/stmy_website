'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

export default function SignupPage() {
  const router = useRouter();
  const supabase = createClient();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const checkAuth = async () => {
      try {
        // Get the current user
        const { data: { user } } = await supabase.auth.getUser();

        if (!isMounted) return;

        if (user) {
          // User came from invite link with valid session
          router.push('/auth/accept-invite');
        } else {
          // No valid session, redirect to login
          router.push('/login');
        }
      } catch (error) {
        if (!isMounted) return;
        console.error('Auth check failed:', error);
        router.push('/login');
      } finally {
        if (isMounted) {
          setIsChecking(false);
        }
      }
    };

    checkAuth();

    return () => {
      isMounted = false;
    };
  }, [supabase.auth, router]);

  // Show loading state while processing auth
  return (
    <div className="min-h-screen flex items-center justify-center bg-hero">
      <div className="text-white text-center">
        {isChecking ? (
          <>
            <p className="text-lg">Processing your invitation...</p>
            <p className="text-sm text-white/60 mt-2">Please wait while we set up your account</p>
          </>
        ) : null}
      </div>
    </div>
  );
}
