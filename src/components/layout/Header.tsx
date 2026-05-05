'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import Image from 'next/image';
import { useEffect, useState } from 'react';
import { api } from '@/lib/apiClient';

export function Header() {
  const pathname = usePathname();
  const [logoType, setLogoType] = useState<'text' | 'svg'>('text');
  const [logoSvgUrl, setLogoSvgUrl] = useState('');

  useEffect(() => {
    api.public.settings().then(res => {
      if (res.data.logoType === 'svg') setLogoType('svg');
      if (res.data.logoSvgUrl) setLogoSvgUrl(res.data.logoSvgUrl);
    }).catch(() => { });
  }, []);

  const getLinkClass = (path: string) => {
    return pathname === path
      ? "px-5 py-2.5 rounded-full bg-orange-50 text-orange-600 font-bold text-sm tracking-wide"
      : "px-5 py-2.5 text-gray-600 hover:text-orange-500 transition-colors font-button text-sm tracking-wide";
  };

  return (
    <header className="fixed top-0 w-full z-50 border-b border-orange-100/50 bg-white/80 backdrop-blur-xl shadow-[0_10px_20px_-10px_rgba(255,149,0,0.04)]">
      <div className="flex justify-between items-center max-w-7xl mx-auto px-6 h-20">
        <Link href="/" className="flex items-center gap-2">
          {logoType === 'svg' && logoSvgUrl ? (
            <Image src={logoSvgUrl} alt="CAFT Financial" width={160} height={40} className="h-10 w-auto object-contain" unoptimized />
          ) : (
            <span className="text-2xl font-black text-orange-600 tracking-tighter font-headline-sm">CAFT Financial</span>
          )}
        </Link>
        <nav className="hidden md:flex items-center gap-2">
          <Link href="/pricing" className={getLinkClass('/pricing')}>
            Pricing
          </Link>
          <Link href="/analytics" className={getLinkClass('/analytics')}>
            Analytics
          </Link>
          <Link href="/algo-indicators" className={getLinkClass('/algo-indicators')}>
            Courses & Tools
          </Link>
          <Link href="/about" className={getLinkClass('/about')}>
            About & Contact
          </Link>
        </nav>
        <div className="flex items-center gap-4">
          <Link href="/login" className="px-6 py-2.5 rounded-lg text-sm font-semibold text-white sun-gradient shadow-lg hover:opacity-90 transition-all active:scale-[0.97]">
            Get Started
          </Link>
        </div>
      </div>
    </header>
  );
}
