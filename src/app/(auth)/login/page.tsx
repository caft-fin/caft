import Link from "next/link";
import { GlassCard } from "@/components/ui/GlassCard";
import Image from 'next/image';

export default function LoginPage() {
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
              <p className="font-body-md text-body-md text-on-surface-variant mt-2">Enter your work email to continue.</p>
            </header>
            
            <form className="space-y-stack-md" action="/login/verify">
              {/* Email Input */}
              <div className="space-y-2">
                <label className="font-label-md text-label-md text-on-surface-variant block" htmlFor="email">Work Email</label>
                <input 
                  className="w-full bg-[#F9F9F9] border-none rounded-lg px-4 py-3 focus:ring-2 focus:ring-primary-container focus:bg-white transition-all outline-none text-body-md font-body-md" 
                  id="email" 
                  placeholder="name@company.com" 
                  type="email"
                  required
                />
              </div>
              
              {/* CTA Button */}
              <button 
                className="w-full sun-gradient text-white font-button text-button py-4 rounded-xl shadow-lg hover:translate-y-[-2px] active:scale-[0.98] transition-all duration-200" 
                type="submit"
              >
                Continue
              </button>
            </form>
            
            {/* Divider */}
            <div className="relative my-stack-md">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-surface-variant"></div>
              </div>
              <div className="relative flex justify-center text-label-md uppercase">
                <span className="bg-white/50 backdrop-blur-sm px-4 text-on-surface-variant font-label-md">or</span>
              </div>
            </div>
            
            {/* Social Login */}
            <button className="w-full flex items-center justify-center gap-3 border-2 border-primary-container/20 hover:bg-orange-50 text-on-surface font-button text-button py-4 rounded-xl transition-all active:scale-[0.98]">
              <Image 
                alt="Google" 
                className="w-5 h-5" 
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuAUj12dFNgB8PGyARGHpCrxOrp1pGjmr1smC0ef1z7YSYBrOu9UINhDicdRbtkqR6W4OkvIdwVMCBpj0UqVR-ejkAyJAIqenjcW8FblL4rMMpky8yF4nzKh4NQsRVA1WPQ4L0mypFzLCBv4h4rzhQd-tvpu2LEaHZJc_tFfSO4G75dMnK_AigCuCmGGGBvwu0vUc8fxQIyyDqPkDC-eY4MNpS4HObfjXq3AwJdG9h_jCddskR70TTm51Aemn0_6vuAxmP8U9SMKxCE" 
                width={20}
                height={20}
              />
              Continue with Google
            </button>
          </GlassCard>
          
          {/* Secondary Action */}
          <div className="text-center mt-stack-md">
            <p className="font-body-md text-body-md text-on-surface-variant">
              Don't have an account? <Link href="/pricing" className="text-primary font-semibold hover:underline">Contact Sales</Link>
            </p>
          </div>
        </div>
      </main>
      
      {/* Footer Component */}
      <footer className="bg-white border-t border-gray-100 py-8 mt-auto z-10">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="text-sm text-gray-500">
            © 2024 CAFT Financial Services. All rights reserved
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
