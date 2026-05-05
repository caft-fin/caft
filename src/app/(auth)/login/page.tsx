'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from "next/link";
import { GlassCard } from "@/components/ui/GlassCard";
import { api, ApiError } from '@/lib/apiClient';
import { Loader2 } from 'lucide-react';

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginPageContent />
    </Suspense>
  );
}

function LoginPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Handle Google OAuth error redirects
  useEffect(() => {
    const googleError = searchParams.get('error');
    if (googleError === 'google_auth_failed') {
      setError('Google sign-in failed. Please try again or use email login.');
    } else if (googleError === 'google_no_code') {
      setError('Google authorization was cancelled. Please try again.');
    }
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await api.auth.login(email);
      // Store email for the verify page
      sessionStorage.setItem('caft_login_email', email);
      router.push('/login/verify');
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError('Unable to connect. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <main className="flex-grow flex items-center justify-center px-gutter py-stack-lg relative z-10">
        <div className="w-full max-w-[440px]">
          {/* Branding Area */}
          <div className="text-center mb-stack-lg">
            <h1 className="text-2xl font-black text-orange-600 tracking-tighter font-headline-sm mb-2">CAFT Financial</h1>
            <p className="font-body-md text-body-md text-on-surface-variant">Step 1 of 2</p>
          </div>

          {/* Login Card */}
          <GlassCard className="border border-[#F2F2F7] rounded-xl shadow-[0_10px_20px_-5px_rgba(255,149,0,0.04)] p-stack-md md:p-stack-lg">
            <header className="mb-stack-md">
              <h2 className="font-headline-sm text-headline-sm text-on-surface">Login</h2>
              <p className="font-body-md text-body-md text-on-surface-variant mt-2">Enter your email to continue.</p>
            </header>

            {error && (
              <div className="mb-stack-md p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
                {error}
              </div>
            )}

            <form className="space-y-stack-md" onSubmit={handleSubmit}>
              {/* Email Input */}
              <div className="space-y-2">
                <label className="font-label-md text-label-md text-on-surface-variant block" htmlFor="email">Email</label>
                <input
                  className="w-full bg-[#F9F9F9] border-none rounded-lg px-4 py-3 focus:ring-2 focus:ring-primary-container focus:bg-white transition-all outline-none text-body-md font-body-md"
                  id="email"
                  placeholder="name@example.com"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={loading}
                />
              </div>

              {/* CTA Button */}
              <button
                className="w-full sun-gradient text-white font-button text-button py-4 rounded-xl shadow-lg hover:translate-y-[-2px] active:scale-[0.98] transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
                type="submit"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Sending OTP...
                  </>
                ) : (
                  'Continue'
                )}
              </button>
            </form>

            {/* Divider */}
            <div className="flex items-center gap-4 my-5">
              <div className="flex-1 h-px bg-gray-200" />
              <span className="text-xs font-medium text-gray-400 uppercase tracking-wider">or</span>
              <div className="flex-1 h-px bg-gray-200" />
            </div>

            {/* Google Sign-In Button */}
            <button
              type="button"
              onClick={() => {
                const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
                window.location.href = `${apiUrl}/auth/google`;
              }}
              className="w-full flex items-center justify-center gap-3 px-4 py-3.5 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 hover:border-gray-300 hover:shadow-sm transition-all duration-200 active:scale-[0.98]"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
              <span className="text-sm font-semibold text-gray-700">Sign in with Google</span>
            </button>
          </GlassCard>

          {/* Secondary Action */}
          <div className="text-center mt-stack-md">
            <p className="font-body-md text-body-md text-on-surface-variant">
              New here? Just enter your email — we&apos;ll create your account automatically.
            </p>
          </div>
        </div>
      </main>

      {/* Footer Component */}
      <footer className="bg-white border-t border-gray-100 py-8 mt-auto z-10">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="text-sm text-gray-500">
            © 2026 CAFT Financial Services. All rights reserved
          </div>
          <div className="flex flex-wrap justify-center gap-6">
            <Link href="#" className="text-sm text-gray-500 hover:text-primary transition-colors">Privacy Policy</Link>
            <Link href="#" className="text-sm text-gray-500 hover:text-primary transition-colors">Terms of Service</Link>
            <Link href="#" className="text-sm text-gray-500 hover:text-primary transition-colors">Cookie Settings</Link>
            <Link href="#" className="text-sm text-gray-500 hover:text-primary transition-colors">Contact Support</Link>
          </div>
        </div>
      </footer>
    </>
  );
}
