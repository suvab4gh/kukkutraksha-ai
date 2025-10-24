'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/store';

export default function TestLoginPage() {
  const router = useRouter();
  const { setUser } = useAuthStore();

  useEffect(() => {
    // Auto-login as test farmer
    const testFarmer = {
      uid: 'test-farmer-1',
      email: 'farmer1@test.com',
      role: 'farmer' as const,
      farmId: 'test-farm-id', // This will be updated from API
      displayName: 'Test Farmer',
    };

    // Store in Zustand
    setUser(testFarmer);

    // Store in localStorage for persistence
    localStorage.setItem('user', JSON.stringify(testFarmer));

    // Redirect to farmer dashboard
    router.push('/farmer/dashboard');
  }, [setUser, router]);

  return (
    <div className="flex h-screen items-center justify-center bg-gradient-to-br from-green-50 to-blue-50">
      <div className="text-center">
        <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-solid border-green-600 border-r-transparent"></div>
        <p className="mt-4 text-lg font-semibold text-gray-700">
          Bypassing login... Redirecting to dashboard
        </p>
      </div>
    </div>
  );
}
