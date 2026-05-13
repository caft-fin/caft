'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { GlassCard } from "@/components/ui/GlassCard";
import Image from "next/image";
import { PlayCircle, TrendingUp, LineChart, ArrowRight, Wallet, Users, CheckCircle2, Package } from "lucide-react";
import { api } from '@/lib/apiClient';
import type { PlanItem } from '@/lib/apiClient';

interface BannerCompany { name: string; color?: string; }

const RANDOM_COLORS = ['#E67E22', '#2ECC71', '#3498DB', '#9B59B6', '#E74C3C', '#1ABC9C', '#F39C12', '#2980B9'];

function getYouTubeId(url: string): string {
  if (!url) return '';
  const match = url.match(/(?:embed\/|watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]+)/);
  return match ? match[1] : '';
}

export default function LandingPage() {
  const [settings, setSettings] = useState<Record<string, string>>({});
  const [videoPlaying, setVideoPlaying] = useState(false);
  const [products, setProducts] = useState<PlanItem[]>([]);

  useEffect(() => {
    api.public.settings().then(res => setSettings(res.data)).catch(() => { });
    api.plans.list().then(res => {
      const publicProducts = res.data.filter((p: PlanItem) => p.itemCategory === 'DIGITAL_PRODUCT' || p.itemCategory === 'PHYSICAL_PRODUCT');
      setProducts(publicProducts);
    }).catch(() => {});
  }, []);

  const heroMediaType = settings.heroMediaType || 'image';
  // Empty string when no heroImageUrl is configured — admin must set one via Settings.
  // Never fall back to an external CDN domain (lh3.googleusercontent.com, etc.)
  const heroImageUrl = settings.heroImageUrl || '';
  const heroVideoUrl = settings.heroVideoUrl || '';

  // Banner
  const bannerCompanies: BannerCompany[] = (() => {
    try { return JSON.parse(settings.bannerCompanies || '[]'); } catch { return []; }
  })();
  const defaultCompanies: BannerCompany[] = [
    { name: 'FINTECH+' }, { name: 'SECURE.IO' }, { name: 'GLOBALCAP' }, { name: 'VISTA BANK' }, { name: 'ORBITAL' },
  ];
  const companies = bannerCompanies.length > 0 ? bannerCompanies : defaultCompanies;
  const colorMode = settings.bannerColorMode || 'same';
  const defaultColor = settings.bannerDefaultColor || '';
  const textSize = settings.bannerTextSize || '2xl';
  const fontFamily = settings.bannerFontFamily || 'inherit';

  return (
    <>
      {/* Hero Section */}
      <section className="relative py-stack-lg overflow-hidden">
        <div className="absolute top-0 right-0 w-1/2 h-full opacity-10 pointer-events-none">
          <div className="absolute inset-0 sun-gradient blur-[120px] rounded-full transform translate-x-1/2 -translate-y-1/4"></div>
        </div>
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center py-16">
          <div className="z-10">
            <span className="inline-block py-1 px-4 rounded-full bg-primary-fixed text-on-primary-fixed font-label-md mb-stack-sm uppercase tracking-widest text-xs">
              Modern Wealth Management
            </span>
            <h1 className="font-display-lg text-display-lg text-on-surface mb-stack-md">
              Your future is bright. Let&apos;s make it <span className="text-primary-container">brilliant.</span>
            </h1>
            <p className="font-body-lg text-body-lg text-on-surface-variant mb-stack-lg max-w-lg">
              Accessible financial strategies and market insights designed for young professionals who want their money to work as hard as they do.
            </p>
            <div className="flex flex-wrap gap-4">
              <button className="px-8 py-4 rounded-xl text-button font-button text-white sun-gradient shadow-xl hover:translate-y-[-2px] transition-all">
                Start Your Growth
              </button>
              <button className="px-8 py-4 rounded-xl text-button font-button border-2 border-primary-container text-primary-container hover:bg-orange-50 transition-all flex items-center gap-2">
                <PlayCircle className="w-6 h-6" />
                How it Works
              </button>
            </div>
          </div>
          <div className="relative">
            <GlassCard className="p-4 rounded-3xl soft-glow transform rotate-2">
              <div className="relative w-full h-[500px] rounded-2xl overflow-hidden">
                {heroMediaType === 'video' && heroVideoUrl ? (
                  videoPlaying ? (
                    <iframe
                      src={`https://www.youtube.com/embed/${getYouTubeId(heroVideoUrl)}?autoplay=1`}
                      className="absolute inset-0 w-full h-full"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                      title="Hero video"
                    />
                  ) : (
                    <button
                      onClick={() => setVideoPlaying(true)}
                      className="absolute inset-0 w-full h-full group cursor-pointer"
                      aria-label="Play video"
                    >
                      {/* YouTube thumbnail */}
                      <Image
                        src={`https://img.youtube.com/vi/${getYouTubeId(heroVideoUrl)}/maxresdefault.jpg`}
                        alt="Video thumbnail"
                        fill
                        className="object-cover"
                        unoptimized
                      />
                      {/* Dark overlay */}
                      <div className="absolute inset-0 bg-black/20 group-hover:bg-black/30 transition-colors" />
                      {/* Play button */}
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-20 h-20 rounded-full bg-white/90 shadow-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                          <PlayCircle className="w-12 h-12 text-orange-600" />
                        </div>
                      </div>
                    </button>
                  )
                ) : heroImageUrl ? (
                  <Image
                    alt="Professional woman looking optimistic"
                    className="rounded-2xl object-cover"
                    fill
                    sizes="(max-width: 1024px) 100vw, 50vw"
                    src={heroImageUrl}
                  />
                ) : (
                  <div className="absolute inset-0 bg-gradient-to-br from-orange-50 to-indigo-100 rounded-2xl flex items-center justify-center">
                    <TrendingUp className="w-24 h-24 text-orange-300 opacity-40" />
                  </div>
                )}
              </div>
              <div className="absolute -bottom-6 -left-6 glass-card p-6 rounded-2xl shadow-xl max-w-xs animate-bounce z-20">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 rounded-full bg-secondary-container flex items-center justify-center">
                    <TrendingUp className="text-on-secondary-container w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-gray-500 uppercase tracking-tighter">Portfolio Growth</p>
                    <p className="text-xl font-bold text-on-surface">+12.4% <span className="text-sm font-normal text-green-500">this year</span></p>
                  </div>
                </div>
              </div>
            </GlassCard>
          </div>
        </div>
      </section>

      {/* Social Proof — Dynamic */}
      <section className="py-stack-md bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <p className="text-center font-label-md text-on-surface-variant mb-8 uppercase tracking-widest text-xs">Trusted by forward-thinking institutions</p>
          <div className="flex flex-wrap justify-center items-center gap-12 transition-all duration-700">
            {companies.map((c, i) => {
              const color = colorMode === 'random'
                ? (c.color || RANDOM_COLORS[i % RANDOM_COLORS.length])
                : (defaultColor || undefined);
              return (
                <span
                  key={i}
                  className={`text-${textSize} font-bold font-display-lg`}
                  style={{ color, fontFamily: fontFamily !== 'inherit' ? fontFamily : undefined }}
                >
                  {c.name}
                </span>
              );
            })}
          </div>
        </div>
      </section>

      {/* Features Bento Grid */}
      <section className="py-stack-lg">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="font-headline-md text-headline-md text-on-surface mb-4">Intelligent tools for the modern investor</h2>
            <p className="text-on-surface-variant font-body-md max-w-2xl mx-auto">We&apos;ve distilled complex financial data into beautiful, actionable insights that help you stay ahead of the curve.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-gutter">
            <div className="md:col-span-2 bg-white rounded-3xl p-stack-md border border-outline-variant/30 soft-glow overflow-hidden relative group">
              <div className="relative z-10 flex flex-col h-full justify-between">
                <div>
                  <LineChart className="w-10 h-10 text-primary-container mb-4" />
                  <h3 className="font-headline-sm text-headline-sm mb-4">Advanced Market Analysis</h3>
                  <p className="text-on-surface-variant font-body-md max-w-md">Our AI-driven engine parses thousands of data points to bring you clear, actionable market signals before they become news.</p>
                </div>
                <div className="mt-8">
                  <button className="flex items-center gap-2 text-primary font-button hover:gap-4 transition-all">Explore the terminal <ArrowRight className="w-5 h-5" /></button>
                </div>
              </div>
              <div className="absolute top-0 right-0 w-1/2 h-full bg-orange-50/50 rounded-l-full transform translate-x-1/4 group-hover:translate-x-0 transition-transform duration-700"></div>
            </div>
            <div className="bg-secondary-container rounded-3xl p-stack-md flex flex-col justify-between">
              <div>
                <Wallet className="w-10 h-10 text-on-secondary-container mb-4" />
                <h3 className="font-headline-sm text-headline-sm text-on-secondary-container mb-4">Real-time Tracking</h3>
                <p className="text-on-secondary-container/80 font-body-md">Connect all your accounts in one sun-drenched dashboard for a unified view of your net worth.</p>
              </div>
              <div className="h-24 bg-white/30 rounded-xl mt-6 flex items-end p-4 gap-2">
                <div className="w-1/4 bg-on-secondary-container/20 h-1/2 rounded-t-md"></div>
                <div className="w-1/4 bg-on-secondary-container/40 h-3/4 rounded-t-md"></div>
                <div className="w-1/4 bg-on-secondary-container/60 h-2/3 rounded-t-md"></div>
                <div className="w-1/4 bg-on-secondary-container h-full rounded-t-md"></div>
              </div>
            </div>
            <div className="bg-primary-container rounded-3xl p-stack-md text-white flex flex-col justify-between">
              <div>
                <Users className="w-10 h-10 mb-4" />
                <h3 className="font-headline-sm text-headline-sm mb-4">Referral Rewards</h3>
                <p className="text-white/90 font-body-md">Grow with your circle. Invite friends and both receive managed portfolio fee credits for 6 months.</p>
              </div>
              <div className="mt-8 flex -space-x-4">
                <div className="w-12 h-12 rounded-full border-4 border-primary-container bg-gray-200 relative overflow-hidden">
                  <Image className="object-cover" fill sizes="48px" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBd6fNm1HY5YbOmdSxv5UkE_75oVG4rxvDaWfqNPOZ29B6YxSq7SE08VQuGdU_5UYExCmjL3UvqMOzJXPyiRRhQomwc4mMIjVcpjuGRdTQ4g2Wb1J3qaDolIAb2aO2PRbloPVNtzxYe5NBBtEXVYFfJfAbl31YpwZmBRG7k5LsGUO_tRdv2vbsHuqoeOQqSLeKQpsKVqP5qKyBeHfGAj2XSTxo8daIx3VrMimsw7jd2WuxyOmOactMwVWjSMFqegfBsLf3WVHFF1u4" alt="Portrait" />
                </div>
                <div className="w-12 h-12 rounded-full border-4 border-primary-container bg-gray-200 relative overflow-hidden">
                  <Image className="object-cover" fill sizes="48px" src="https://lh3.googleusercontent.com/aida-public/AB6AXuA16aakLULlvN1Sz-mGL6Ru7hUfHrFb-Mo6xtQrbsZ1ONLX4UyBkgInZjqfOWEyPJpGJaSaZxmiUXhZ6fzYYEFSKLcFHYePMpGMjd2LTW60VC2sFmSVQfYbd7Q-c_JbDTD1p9B9TQv_Ee421Xhnh_ZxC2nvk8gYB0a7ZKXL7dVTmGOhkiyJyRsOXr8Ng-jKNVR7HtFAx6fJTKxs9GhlkFqhvdd0an4RxjNc5gF9YiSt8p7pEjhuS7yCC_edZWD45vxIu-xNHd5olkk" alt="Portrait" />
                </div>
                <div className="w-12 h-12 rounded-full border-4 border-primary-container bg-gray-200 relative overflow-hidden">
                  <Image className="object-cover" fill sizes="48px" src="https://lh3.googleusercontent.com/aida-public/AB6AXuA6VD6jDBw165UxjGZHpY9oI8sznNF-PUv3hQn1PWEIGw_rqIH12xRntvgOWvQsqIYUsxY7favfX1KTuV2qqK2PUyfP3XYU8mNTx7tm_6XisDU8FuDwyskaC6Ee8ifkAUBAjP5dLiGfYFvFm15NvI-5YXfD13sbPJzr6u-1IPVu58eeqEbupCb70EuBUzVRtQell1H4iealH0ani-iKNwP7nGx4oFFDoWFs1KKsdGlKqv7T7_9uO9Gv3PEUlGLa_GHbea61MfMOg0s" alt="Portrait" />
                </div>
                <div className="w-12 h-12 rounded-full border-4 border-primary-container bg-white flex items-center justify-center text-primary-container font-bold">+12</div>
              </div>
            </div>
            <div className="md:col-span-2 bg-white rounded-3xl p-stack-md border border-outline-variant/30 soft-glow">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center h-full">
                <div>
                  <h3 className="font-headline-sm text-headline-sm mb-4">Referral Dashboard</h3>
                  <p className="text-on-surface-variant font-body-md mb-6">Track your network&apos;s growth and claim your credits instantly. Transparent, fast, and rewarding.</p>
                  <ul className="space-y-3">
                    <li className="flex items-center gap-3 font-body-md text-on-surface"><CheckCircle2 className="w-5 h-5 text-primary" />Unlimited friends invited</li>
                    <li className="flex items-center gap-3 font-body-md text-on-surface"><CheckCircle2 className="w-5 h-5 text-primary" />₹0 Account management fees</li>
                  </ul>
                </div>
                <div className="bg-surface-container-low rounded-2xl p-6 border border-orange-100">
                  <div className="flex justify-between items-center mb-6">
                    <span className="font-bold text-on-surface">Your Earnings</span>
                    <span className="text-primary font-black">₹1,450.00</span>
                  </div>
                  <div className="space-y-4">
                    <div className="h-2 w-full bg-gray-200 rounded-full overflow-hidden">
                      <div className="h-full sun-gradient w-3/4 rounded-full"></div>
                    </div>
                    <p className="text-xs text-on-surface-variant">75% to your next bonus milestone</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Wealth Management / Projections */}
      <section className="py-stack-lg bg-surface-bright relative">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col lg:flex-row gap-16 items-center">
            <div className="lg:w-1/2">
              <span className="text-primary font-bold uppercase tracking-widest text-xs mb-4 block">Visualized Wealth</span>
              <h2 className="font-headline-md text-headline-md text-on-surface mb-6">Predict your potential with high-fidelity projections</h2>
              <p className="text-body-lg text-on-surface-variant mb-stack-md">Don&apos;t just save—strategize. Our projection engine simulates thousands of market scenarios to show you where you&apos;ll be in 3 months or 10 years.</p>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-stack-md">
                <div className="p-4 rounded-2xl bg-white border border-orange-50 text-center shadow-sm"><p className="text-xs text-on-surface-variant uppercase mb-1">3 Months</p><p className="text-xl font-bold text-primary-container">+4.2%</p></div>
                <div className="p-4 rounded-2xl bg-white border border-orange-50 text-center shadow-sm"><p className="text-xs text-on-surface-variant uppercase mb-1">1 Year</p><p className="text-xl font-bold text-primary-container">+18.5%</p></div>
                <div className="p-4 rounded-2xl bg-white border border-orange-50 text-center shadow-sm"><p className="text-xs text-on-surface-variant uppercase mb-1">5 Years</p><p className="text-xl font-bold text-primary-container">+112%</p></div>
              </div>
              <button className="px-8 py-4 rounded-xl text-button font-button text-white sun-gradient shadow-xl hover:opacity-90 transition-all">Create Wealth Plan</button>
            </div>
            <div className="lg:w-1/2 w-full">
              <GlassCard className="p-8 rounded-[40px] soft-glow relative">
                <div className="flex justify-between items-center mb-8">
                  <h4 className="font-bold text-on-surface">Growth Projection</h4>
                  <div className="flex gap-2">
                    <span className="px-3 py-1 rounded-full bg-primary-fixed text-on-primary-fixed text-xs font-bold">Aggressive</span>
                    <span className="px-3 py-1 rounded-full bg-surface-container-high text-on-surface-variant text-xs font-bold">Stable</span>
                  </div>
                </div>
                <div className="h-64 flex items-end gap-2 px-2">
                  {[20, 25, 30, 38, 45, 52, 65, 75, 82, 90, 95, 100].map((h, i) => (
                    <div key={i} className={`w-1/12 rounded-t-lg transition-all`} style={{ height: `${h}%`, background: `hsl(${25 + i * 3}, ${60 + i * 3}%, ${70 - i * 3}%)` }}>
                    </div>
                  ))}
                </div>
                <div className="flex justify-between mt-4 text-xs text-on-surface-variant font-bold uppercase tracking-wider">
                  <span>Today</span><span>2026</span><span>2028</span><span>2030</span>
                </div>
              </GlassCard>
            </div>
          </div>
        </div>
      </section>

      {/* Products Section */}
      {products.length > 0 && (
        <section className="py-stack-lg max-w-7xl mx-auto px-6">
          <div className="text-center mb-12">
            <span className="text-primary font-bold uppercase tracking-widest text-xs mb-4 block">Premium Catalog</span>
            <h2 className="font-headline-md text-headline-md text-on-surface mb-4">Discover Our Products</h2>
            <p className="text-on-surface-variant font-body-md max-w-2xl mx-auto">Explore exclusive digital and physical products to elevate your financial journey.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {products.map((product) => (
              <div key={product.id} className="bg-white rounded-3xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-xl transition-all group flex flex-col">
                <div className="h-48 w-full bg-gray-100 relative overflow-hidden">
                  {product.images && product.images.length > 0 ? (
                    <Image src={product.images[0]} alt={product.name} fill className="object-cover group-hover:scale-105 transition-transform duration-500" unoptimized />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-300">
                      <Package className="w-12 h-12" />
                    </div>
                  )}
                  {product.bannerBadge && (
                    <span className="absolute top-4 right-4 bg-orange-500 text-white text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider shadow-md">
                      {product.bannerBadge}
                    </span>
                  )}
                </div>
                <div className="p-6 flex-1 flex flex-col">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-bold text-gray-900 text-lg">{product.name}</h3>
                  </div>
                  <p className="text-sm text-gray-500 line-clamp-2 mb-4 flex-1">{product.description}</p>
                  
                  <div className="pt-4 border-t border-gray-50 flex items-center justify-between">
                    <div className="font-bold text-gray-900 text-lg">
                      {product.isOneTime && product.oneTimePrice ? (
                        `₹${(product.oneTimePrice / 100).toLocaleString()}`
                      ) : product.pricing && product.pricing.length > 0 ? (
                        `₹${(product.pricing[0].price / 100).toLocaleString()}`
                      ) : (
                        'Free'
                      )}
                    </div>
                    <Link href={`/pricing#plan-${product.id}`} className="text-sm font-bold text-orange-600 hover:text-orange-700 bg-orange-50 hover:bg-orange-100 px-4 py-2 rounded-xl transition-colors">
                      View Details
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* CTA Section */}
      <section className="py-stack-lg max-w-7xl mx-auto px-6">
        <div className="rounded-[40px] sun-gradient p-12 lg:p-24 text-white text-center relative overflow-hidden shadow-2xl">
          <div className="absolute inset-0 opacity-10 pointer-events-none">
            <div className="absolute top-0 left-0 w-64 h-64 border-[40px] border-white rounded-full -translate-x-1/2 -translate-y-1/2"></div>
            <div className="absolute bottom-0 right-0 w-96 h-96 border-[60px] border-white rounded-full translate-x-1/2 translate-y-1/2"></div>
          </div>
          <div className="relative z-10">
            <h2 className="font-display-lg text-display-lg mb-6">Ready to see the sun?</h2>
            <p className="text-white/90 text-body-lg max-w-xl mx-auto mb-stack-lg">Join 50,000+ investors who have chosen a warmer, smarter way to build their legacy. Open an account in 5 minutes.</p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="bg-white text-primary px-10 py-4 rounded-xl font-button shadow-xl hover:scale-105 transition-all">Get Started Free</button>
              <button className="bg-on-primary-container/20 backdrop-blur-md text-white border border-white/30 px-10 py-4 rounded-xl font-button hover:bg-on-primary-container/30 transition-all">Contact Advisor</button>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
