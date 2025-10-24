'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/store';

export default function TestAdminLoginPage() {
  const router = useRouter();
  const { setUser } = useAuthStore();

  useEffect(() => {
    // Auto-login as test admin
    const testAdmin = {
      uid: 'test-admin-1',
      email: 'admin@test.com',
      role: 'admin' as const,
      displayName: 'Test Admin',
    };

    // Store in Zustand
    setUser(testAdmin);

    // Store in localStorage for persistence
    localStorage.setItem('user', JSON.stringify(testAdmin));

    // Redirect to admin dashboard
    router.push('/admin/dashboard');
  }, [setUser, router]);

  return (
    <div className="flex h-screen items-center justify-center bg-gradient-to-br from-blue-50 to-purple-50">
      <div className="text-center">
        <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent"></div>
        <p className="mt-4 text-lg font-semibold text-gray-700">
          Bypassing admin login... Redirecting to dashboard
        </p>
      </div>
    </div>
  );
}
