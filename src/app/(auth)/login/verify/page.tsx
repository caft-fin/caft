'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from "next/link";
import { GlassCard } from "@/components/ui/GlassCard";
import { ShieldCheck, Loader2 } from 'lucide-react';
import { api, ApiError, setTokens } from '@/lib/apiClient'; // setTokens sets the presence cookie only
import { useStore } from '@/store/useStore';

export default function LoginVerifyPage() {
  const router = useRouter();
  const login = useStore((state) => state.login);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const [otp, setOtp] = useState<string[]>(Array(6).fill(''));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [email, setEmail] = useState(() => {
    if (typeof sessionStorage !== 'undefined') {
      return sessionStorage.getItem('caft_login_email') || '';
    }
    return '';
  });
  const [resendCooldown, setResendCooldown] = useState(0);

  useEffect(() => {
    if (!email) {
      router.replace('/login');
    }
  }, [email, router]);

  // Resend cooldown timer
  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(() => setResendCooldown(resendCooldown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendCooldown]);

  const handleInput = (value: string, index: number) => {
    const newOtp = [...otp];
    newOtp[index] = value.slice(-1); // Only keep last char
    setOtp(newOtp);
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, index: number) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    const newOtp = [...otp];
    pasted.split('').forEach((char, i) => { newOtp[i] = char; });
    setOtp(newOtp);
    inputRefs.current[Math.min(pasted.length, 5)]?.focus();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const otpCode = otp.join('');
    if (otpCode.length !== 6) {
      setError('Please enter all 6 digits');
      return;
    }
    setLoading(true);

    try {
      const res = await api.auth.verifyOtp(email, otpCode);
      const { user } = res.data;
      // Tokens are in httpOnly cookies set by the backend — just set the presence cookie
      setTokens();
      login({
        id: user.id,
        name: user.name,
        email: user.email,
        avatarUrl: user.avatarUrl,
        membershipLevel: user.membershipLevel,
        role: user.role,
        isSuperAdmin: user.isSuperAdmin,
      });
      sessionStorage.removeItem('caft_login_email');
      const redirectPath = sessionStorage.getItem('caft_post_login_redirect') || '/dashboard';
      sessionStorage.removeItem('caft_post_login_redirect');
      router.push(redirectPath);
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError('Verification failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (resendCooldown > 0) return;
    try {
      await api.auth.login(email);
      setResendCooldown(60);
      setOtp(Array(6).fill(''));
      setError('');
    } catch {
      setError('Failed to resend code. Try again.');
    }
  };

  return (
    <>
      <main className="flex-grow flex items-center justify-center pt-24 pb-stack-lg px-margin-mobile z-10">
        <div className="w-full max-w-md">
          {/* Progress Indicator */}
          <div className="flex justify-center mb-stack-md gap-2">
            <div className="h-1.5 w-12 rounded-full bg-primary-container/20"></div>
            <div className="h-1.5 w-12 rounded-full bg-primary-container"></div>
          </div>
          
          {/* Header Section */}
          <div className="text-center mb-stack-lg">
            <h1 className="font-headline-md text-headline-md text-on-surface mb-2">Verify Identity - Step 2</h1>
            <p className="font-body-md text-body-md text-on-surface-variant">
              We&apos;ve sent a 6-digit secure code to <strong className="text-on-surface">{email}</strong>. Please enter it below to continue.
            </p>
          </div>
          
          {error && (
            <div className="mb-stack-md p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700 text-center">
              {error}
            </div>
          )}

          {/* OTP Card */}
          <GlassCard className="shadow-[0_10px_20px_-5px_rgba(0,0,0,0.04)] rounded-xl p-8">
            <form className="space-y-stack-md" onSubmit={handleSubmit}>
              <div className="flex justify-between gap-2 md:gap-3" onPaste={handlePaste}>
                {[0, 1, 2, 3, 4, 5].map((i) => (
                  <input 
                    key={i}
                    ref={(el) => { inputRefs.current[i] = el; }}
                    value={otp[i]}
                    onChange={(e) => handleInput(e.target.value, i)}
                    onKeyDown={(e) => handleKeyDown(e, i)}
                    className="otp-input w-12 h-14 md:w-14 md:h-16 text-center text-headline-sm font-headline-sm bg-[#F9F9F9] border-none rounded-lg outline-none focus:bg-white focus:ring-2 focus:ring-primary-container transition-all duration-200" 
                    maxLength={1} 
                    required 
                    type="text"
                    inputMode="numeric"
                    disabled={loading}
                  />
                ))}
              </div>
              <div className="pt-4">
                <button 
                  className="w-full bg-gradient-to-r from-primary-container to-orange-600 text-white py-4 rounded-xl font-button text-button shadow-lg shadow-orange-500/20 hover:translate-y-[-2px] active:scale-95 transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-60" 
                  type="submit"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Verifying...
                    </>
                  ) : (
                    'Sign In Securely'
                  )}
                </button>
              </div>
              <div className="text-center pt-2">
                <p className="font-body-md text-label-md text-on-surface-variant">
                  Didn&apos;t receive the code?{' '}
                  <button
                    type="button"
                    onClick={handleResend}
                    disabled={resendCooldown > 0}
                    className="text-orange-600 font-semibold hover:underline decoration-2 underline-offset-4 transition-all disabled:text-gray-400 disabled:no-underline"
                  >
                    {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : 'Resend Code'}
                  </button>
                </p>
              </div>
            </form>
          </GlassCard>
          
          {/* Security Assurance */}
          <div className="mt-stack-lg flex items-center justify-center gap-3 text-gray-400">
            <ShieldCheck className="w-5 h-5" />
            <p className="text-sm font-medium">Bank-level 256-bit encryption secure session</p>
          </div>
        </div>
      </main>
      
      {/* Footer */}
      <footer className="bg-white w-full py-12 px-6 border-t border-[#F2F2F7] text-sm z-10">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4 max-w-7xl mx-auto">
          <div className="flex items-center gap-2">
            <span className="font-bold text-gray-900">CAFT Financial</span>
            <span className="text-gray-400">© 2026 CAFT Financial. All rights reserved.</span>
          </div>
          <nav className="flex gap-6">
            <Link className="text-gray-400 hover:text-orange-500 transition-colors opacity-80 hover:opacity-100" href="#">Privacy Policy</Link>
            <Link className="text-gray-400 hover:text-orange-500 transition-colors opacity-80 hover:opacity-100" href="#">Terms of Service</Link>
            <Link className="text-gray-400 hover:text-orange-500 transition-colors opacity-80 hover:opacity-100" href="#">Help Center</Link>
          </nav>
        </div>
      </footer>
    </>
  );
}
