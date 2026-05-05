'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useStore } from '@/store/useStore';
import { setTokens } from '@/lib/apiClient';
import { Loader2 } from 'lucide-react';

export default function GoogleCallbackPage() {
  return (
    <Suspense fallback={
      <main className="flex-grow flex items-center justify-center px-6 py-20">
        <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
      </main>
    }>
      <GoogleCallbackContent />
    </Suspense>
  );
}

function GoogleCallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const login = useStore(state => state.login);
  const [error, setError] = useState('');

  useEffect(() => {
    const accessToken = searchParams.get('accessToken');
    const refreshToken = searchParams.get('refreshToken');
    const userStr = searchParams.get('user');

    if (!accessToken || !refreshToken || !userStr) {
      setError('Missing authentication data from Google. Please try again.');
      setTimeout(() => router.replace('/login'), 3000);
      return;
    }

    try {
      const user = JSON.parse(userStr);

      // Store tokens (sets localStorage + auth cookie)
      setTokens(accessToken, refreshToken);

      // Update Zustand store
      login(user);

      // Redirect to dashboard
      router.replace('/dashboard');
    } catch {
      setError('Failed to process Google login. Please try again.');
      setTimeout(() => router.replace('/login'), 3000);
    }
  }, [searchParams, router, login]);

  return (
    <main className="flex-grow flex items-center justify-center px-6 py-20">
      <div className="text-center">
        {error ? (
          <>
            <p className="text-red-600 font-medium mb-2">{error}</p>
            <p className="text-sm text-gray-500">Redirecting to login...</p>
          </>
        ) : (
          <>
            <Loader2 className="w-8 h-8 animate-spin text-orange-500 mx-auto mb-4" />
            <p className="text-gray-700 font-medium">Signing you in with Google...</p>
          </>
        )}
      </div>
    </main>
  );
}
