'use client';

import Link from "next/link";
import { GlassCard } from "@/components/ui/GlassCard";
import { useRef } from "react";
import { ShieldCheck } from 'lucide-react';

export default function LoginVerifyPage() {
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const handleInput = (e: React.FormEvent<HTMLInputElement>, index: number) => {
    const value = e.currentTarget.value;
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, index: number) => {
    if (e.key === 'Backspace' && !e.currentTarget.value && index > 0) {
      inputRefs.current[index - 1]?.focus();
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
            <p className="font-body-md text-body-md text-on-surface-variant">We've sent a 6-digit secure code to your registered email. Please enter it below to continue.</p>
          </div>
          
          {/* OTP Card */}
          <GlassCard className="shadow-[0_10px_20px_-5px_rgba(0,0,0,0.04)] rounded-xl p-8">
            <form className="space-y-stack-md" action="/dashboard">
              <div className="flex justify-between gap-2 md:gap-3">
                {[0, 1, 2, 3, 4, 5].map((i) => (
                  <input 
                    key={i}
                    ref={(el) => { inputRefs.current[i] = el; }}
                    onChange={(e) => handleInput(e, i)}
                    onKeyDown={(e) => handleKeyDown(e, i)}
                    className="otp-input w-12 h-14 md:w-14 md:h-16 text-center text-headline-sm font-headline-sm bg-[#F9F9F9] border-none rounded-lg outline-none focus:bg-white focus:ring-2 focus:ring-primary-container transition-all duration-200" 
                    maxLength={1} 
                    required 
                    type="text"
                  />
                ))}
              </div>
              <div className="pt-4">
                <button 
                  className="w-full bg-gradient-to-r from-primary-container to-orange-600 text-white py-4 rounded-xl font-button text-button shadow-lg shadow-orange-500/20 hover:translate-y-[-2px] active:scale-95 transition-all duration-200" 
                  type="submit"
                >
                  Sign In Securely
                </button>
              </div>
              <div className="text-center pt-2">
                <p className="font-body-md text-label-md text-on-surface-variant">
                  Didn't receive the code?{' '}
                  <button type="button" className="text-orange-600 font-semibold hover:underline decoration-2 underline-offset-4 transition-all">Resend Code</button>
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
            <span className="text-gray-400">© 2024 CAFT Financial. All rights reserved.</span>
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
