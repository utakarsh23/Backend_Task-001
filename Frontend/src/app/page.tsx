'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { isAuthenticated, getUserRole } from '@/utils/auth';

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    // Redirect based on authentication status and role
    if (isAuthenticated()) {
      const role = getUserRole();
      if (role === 'admin' || role === 'dev') {
        router.push('/admin');
      } else {
        router.push('/dashboard');
      }
    } else {
      router.push('/auth');
    }
  }, [router]);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
    </div>
  );
}
