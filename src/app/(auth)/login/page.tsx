'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from "next/link";
import { GlassCard } from "@/components/ui/GlassCard";
import { api, ApiError } from '@/lib/apiClient';
import { Loader2 } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

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
            <h1 className="font-display text-2xl font-extrabold text-primary tracking-tighter mb-2">CAFT Financial</h1>
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
