import Link from 'next/link';
import { ShieldAlert, ShieldCheck, AtSign, Key, Info, ArrowRight } from 'lucide-react';
import Image from 'next/image';

export default function AdminLoginPage() {
  return (
    <div className="bg-background text-on-background font-body-md min-h-screen flex flex-col">
      <main className="flex-grow flex items-center justify-center relative overflow-hidden px-margin-mobile">
        {/* Background Decorations (Glassmorphic Accents) */}
        <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-primary-fixed/30 rounded-full blur-[100px] pointer-events-none"></div>
        <div className="absolute bottom-[-10%] left-[-10%] w-[400px] h-[400px] bg-tertiary-fixed/20 rounded-full blur-[80px] pointer-events-none"></div>
        
        <div className="w-full max-w-[480px] z-10">
          {/* Branding Header */}
          <div className="text-center mb-stack-lg">
            <div className="inline-flex items-center justify-center p-4 bg-white rounded-2xl shadow-xl shadow-orange-500/10 mb-stack-md">
              <ShieldAlert className="text-primary w-9 h-9" />
            </div>
            <h1 className="font-headline-md text-headline-md text-on-background">CAFT Financial</h1>
            <p className="font-body-md text-body-md text-on-surface-variant mt-2">Administrative Control Portal</p>
          </div>
          
          {/* Login Card */}
          <div className="glass-card border border-white/40 rounded-xl p-stack-lg shadow-[0_20px_40px_rgba(140,80,0,0.08)]">
            <div className="mb-stack-lg border-b border-surface-variant pb-stack-md">
              <div className="flex items-center gap-2 mb-2">
                <ShieldCheck className="text-primary w-4 h-4" />
                <span className="font-label-md text-label-md text-primary uppercase tracking-widest">Secure Entry</span>
              </div>
              <h2 className="font-headline-sm text-headline-sm">Authorized Access Only</h2>
            </div>
            
            <form className="space-y-stack-md">
              {/* Email Field */}
              <div className="space-y-2">
                <label className="block font-label-md text-label-md text-on-surface-variant px-1" htmlFor="admin-email">Admin Identifier</label>
                <div className="relative">
                  <AtSign className="absolute left-4 top-1/2 -translate-y-1/2 text-outline-variant w-5 h-5" />
                  <input 
                    className="w-full pl-12 pr-4 py-4 bg-surface-container-lowest border border-outline-variant rounded-lg focus:ring-2 focus:ring-primary-container focus:border-primary outline-none transition-all font-body-md text-body-md" 
                    id="admin-email" 
                    name="admin-email" 
                    placeholder="admin@caft.financial" 
                    type="email"
                  />
                </div>
              </div>
              
              {/* OTP / Password Field */}
              <div className="space-y-2">
                <div className="flex justify-between items-center px-1">
                  <label className="font-label-md text-label-md text-on-surface-variant" htmlFor="admin-pass">Access Token</label>
                  <Link className="text-xs font-label-md text-primary hover:underline" href="#">Request New OTP</Link>
                </div>
                <div className="relative">
                  <Key className="absolute left-4 top-1/2 -translate-y-1/2 text-outline-variant w-5 h-5" />
                  <input 
                    className="w-full pl-12 pr-4 py-4 bg-surface-container-lowest border border-outline-variant rounded-lg focus:ring-2 focus:ring-primary-container focus:border-primary outline-none transition-all font-body-md text-body-md" 
                    id="admin-pass" 
                    name="admin-pass" 
                    placeholder="••••••••" 
                    type="password"
                  />
                </div>
                <p className="text-[12px] text-on-surface-variant px-1 mt-1 flex items-center gap-1">
                  <Info className="w-[14px] h-[14px]" />
                  Multi-factor authentication is required for this session.
                </p>
              </div>
              
              {/* Action Button */}
              <div className="pt-stack-sm">
                <Link href="/admin/dashboard" className="w-full sun-gradient text-on-primary font-button text-button py-4 rounded-lg shadow-lg shadow-orange-500/25 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2">
                  Initialize Secure Session
                  <ArrowRight className="w-[18px] h-[18px]" />
                </Link>
              </div>
            </form>
            
            {/* Alternative Links */}
            <div className="mt-stack-lg pt-stack-md border-t border-surface-variant flex flex-col gap-4">
              <button className="w-full border border-outline-variant py-3 rounded-lg font-button text-button text-on-surface-variant hover:bg-surface-container transition-colors flex items-center justify-center gap-2">
                <Image 
                  alt="Google Logo" 
                  className="w-5 h-5" 
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuBM-Dr2yu-fqxxsSI1P3P8skUZZ28L6af2TP-0lVyOGmO2ejDwqzeBsTCb44Fs94WttL2RUhh9XgmiNoB1g-RJQUdMHsJVaV9hgKQXL9q1YXyt9WGljk5fvxiXx-eloEbKJWLVNzPNRuvMQFTFl7yGuCJqWhtkoY7B4HyE_QubiSzSF-9txAHIsF1TpYcInF4ZgQUia_v1Xj_qVabCedSiuDsWGZKwkbojR0pMYFpL2Ep65Mvannk_x3zS6NngBhPgUOaUNTMV-x-o"
                  width={20}
                  height={20}
                />
                Enterprise SSO Login
              </button>
              <div className="text-center">
                <Link className="font-label-md text-label-md text-on-surface-variant hover:text-primary transition-colors" href="/login">
                  Return to Standard Member Login
                </Link>
              </div>
            </div>
          </div>
          
          {/* System Status Footer */}
          <div className="mt-stack-md flex justify-between items-center px-4">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
              <span className="text-[12px] font-label-md text-on-surface-variant">System Online: v2.4.0</span>
            </div>
            <div className="flex items-center gap-4 text-[12px] font-label-md text-on-surface-variant">
              <Link className="hover:text-primary" href="#">Legal</Link>
              <Link className="hover:text-primary" href="#">Privacy</Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
