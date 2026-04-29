import { GlassCard } from "@/components/ui/GlassCard";
import Image from "next/image";
import { PlayCircle, TrendingUp, LineChart, ArrowRight, Wallet, Users, CheckCircle2 } from "lucide-react";

export default function LandingPage() {
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
              Your future is bright. Let's make it <span className="text-primary-container">brilliant.</span>
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
              <div className="relative w-full h-[500px]">
                <Image 
                  alt="Professional woman looking optimistic" 
                  className="rounded-2xl object-cover" 
                  fill
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuBPWflEdFmq-FdXTJaUewd_lkgKdgwgkibu3V5UkqiFXBnTXcOCSm4j7Mp_vP8bBivkfwLV445WuaCMLn68rgkNebUnGWbo0_c7OhAZMzCg3iygPIh20BFOvdlO2_BsjrYGFas3aAqmSO7bFOBDvARLKH118fOXtPUlwXODGjl5MVuxdhrHT05-q-VizWJ9ZdTyCjiI01bJwg7eibNXR88lFTsYegUWpZvk8l8w5hzjlOA44ZyAdYBr6jKTfh2Ya7BpFNtRazDzi4U"
                />
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

      {/* Social Proof */}
      <section className="py-stack-md bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <p className="text-center font-label-md text-on-surface-variant mb-8 uppercase tracking-widest text-xs">Trusted by forward-thinking institutions</p>
          <div className="flex flex-wrap justify-center items-center gap-12 opacity-40 grayscale hover:grayscale-0 transition-all duration-700">
            <span className="text-2xl font-bold font-display-lg">FINTECH+</span>
            <span className="text-2xl font-bold font-display-lg">SECURE.IO</span>
            <span className="text-2xl font-bold font-display-lg">GLOBALCAP</span>
            <span className="text-2xl font-bold font-display-lg">VISTA BANK</span>
            <span className="text-2xl font-bold font-display-lg">ORBITAL</span>
          </div>
        </div>
      </section>

      {/* Features Bento Grid */}
      <section className="py-stack-lg">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="font-headline-md text-headline-md text-on-surface mb-4">Intelligent tools for the modern investor</h2>
            <p className="text-on-surface-variant font-body-md max-w-2xl mx-auto">We've distilled complex financial data into beautiful, actionable insights that help you stay ahead of the curve.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-gutter">
            {/* Featured Tool */}
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
            
            {/* Portfolio Tracking */}
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

            {/* Referral System */}
            <div className="bg-primary-container rounded-3xl p-stack-md text-white flex flex-col justify-between">
              <div>
                <Users className="w-10 h-10 mb-4" />
                <h3 className="font-headline-sm text-headline-sm mb-4">Referral Rewards</h3>
                <p className="text-white/90 font-body-md">Grow with your circle. Invite friends and both receive managed portfolio fee credits for 6 months.</p>
              </div>
              <div className="mt-8 flex -space-x-4">
                <div className="w-12 h-12 rounded-full border-4 border-primary-container bg-gray-200 relative overflow-hidden">
                  <Image className="object-cover" fill sizes="48px" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBd6fNm1HY5YbOmdSxv5UkE_75oVG4rxvDaWfqNPOZ29B6YxSq7SE08VQuGdU_5UYExCmjL3UvqMOzJXPyiRRhQomwc4mMIjVcpjuGRdTQ4g2Wb1J3qaDolIAb2aO2PRbloPVNtzxYe5NBBtEXVYFfJfAbl31YpwZmBRG7k5LsGUO_tRdv2vbsHuqoeOQqSLeKQpsKVqP5qKyBeHfGAj2XSTxo8daIx3VrMimsw7jd2WuxyOmOactMwVWjSMFqegfBsLf3WVHFF1u4" alt="Portrait"/>
                </div>
                <div className="w-12 h-12 rounded-full border-4 border-primary-container bg-gray-200 relative overflow-hidden">
                  <Image className="object-cover" fill sizes="48px" src="https://lh3.googleusercontent.com/aida-public/AB6AXuA16aakLULlvN1Sz-mGL6Ru7hUfHrFb-Mo6xtQrbsZ1ONLX4UyBkgInZjqfOWEyPJpGJaSaZxmiUXhZ6fzYYEFSKLcFHYePMpGMjd2LTW60VC2sFmSVQfYbd7Q-c_JbDTD1p9B9TQv_Ee421Xhnh_ZxC2nvk8gYB0a7ZKXL7dVTmGOhkiyJyRsOXr8Ng-jKNVR7HtFAx6fJTKxs9GhlkFqhvdd0an4RxjNc5gF9YiSt8p7pEjhuS7yCC_edZWD45vxIu-xNHd5olkk" alt="Portrait"/>
                </div>
                <div className="w-12 h-12 rounded-full border-4 border-primary-container bg-gray-200 relative overflow-hidden">
                  <Image className="object-cover" fill sizes="48px" src="https://lh3.googleusercontent.com/aida-public/AB6AXuA6VD6jDBw165UxjGZHpY9oI8sznNF-PUv3hQn1PWEIGw_rqIH12xRntvgOWvQsqIYUsxY7favfX1KTuV2qqK2PUyfP3XYU8mNTx7tm_6XisDU8FuDwyskaC6Ee8ifkAUBAjP5dLiGfYFvFm15NvI-5YXfD13sbPJzr6u-1IPVu58eeqEbupCb70EuBUzVRtQell1H4iealH0ani-iKNwP7nGx4oFFDoWFs1KKsdGlKqv7T7_9uO9Gv3PEUlGLa_GHbea61MfMOg0s" alt="Portrait"/>
                </div>
                <div className="w-12 h-12 rounded-full border-4 border-primary-container bg-white flex items-center justify-center text-primary-container font-bold">+12</div>
              </div>
            </div>

            {/* Market Insights */}
            <div className="md:col-span-2 bg-white rounded-3xl p-stack-md border border-outline-variant/30 soft-glow">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center h-full">
                <div>
                  <h3 className="font-headline-sm text-headline-sm mb-4">Referral Dashboard</h3>
                  <p className="text-on-surface-variant font-body-md mb-6">Track your network's growth and claim your credits instantly. Transparent, fast, and rewarding.</p>
                  <ul className="space-y-3">
                    <li className="flex items-center gap-3 font-body-md text-on-surface">
                      <CheckCircle2 className="w-5 h-5 text-primary" />
                      Unlimited friends invited
                    </li>
                    <li className="flex items-center gap-3 font-body-md text-on-surface">
                      <CheckCircle2 className="w-5 h-5 text-primary" />
                      ₹0 Account management fees
                    </li>
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
              <p className="text-body-lg text-on-surface-variant mb-stack-md">Don't just save—strategize. Our projection engine simulates thousands of market scenarios to show you where you'll be in 3 months or 10 years.</p>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-stack-md">
                <div className="p-4 rounded-2xl bg-white border border-orange-50 text-center shadow-sm">
                  <p className="text-xs text-on-surface-variant uppercase mb-1">3 Months</p>
                  <p className="text-xl font-bold text-primary-container">+4.2%</p>
                </div>
                <div className="p-4 rounded-2xl bg-white border border-orange-50 text-center shadow-sm">
                  <p className="text-xs text-on-surface-variant uppercase mb-1">1 Year</p>
                  <p className="text-xl font-bold text-primary-container">+18.5%</p>
                </div>
                <div className="p-4 rounded-2xl bg-white border border-orange-50 text-center shadow-sm">
                  <p className="text-xs text-on-surface-variant uppercase mb-1">5 Years</p>
                  <p className="text-xl font-bold text-primary-container">+112%</p>
                </div>
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
                {/* Mockup Chart */}
                <div className="h-64 flex items-end gap-2 px-2">
                  <div className="w-1/12 h-[20%] bg-orange-100 rounded-t-lg transition-all hover:h-[30%]"></div>
                  <div className="w-1/12 h-[25%] bg-orange-100 rounded-t-lg"></div>
                  <div className="w-1/12 h-[30%] bg-orange-200 rounded-t-lg"></div>
                  <div className="w-1/12 h-[38%] bg-orange-200 rounded-t-lg"></div>
                  <div className="w-1/12 h-[45%] bg-orange-300 rounded-t-lg"></div>
                  <div className="w-1/12 h-[52%] bg-orange-300 rounded-t-lg"></div>
                  <div className="w-1/12 h-[65%] bg-orange-400 rounded-t-lg"></div>
                  <div className="w-1/12 h-[75%] bg-orange-400 rounded-t-lg"></div>
                  <div className="w-1/12 h-[82%] bg-orange-500 rounded-t-lg"></div>
                  <div className="w-1/12 h-[90%] bg-orange-500 rounded-t-lg"></div>
                  <div className="w-1/12 h-[95%] bg-primary-container rounded-t-lg"></div>
                  <div className="w-1/12 h-full bg-primary-container rounded-t-lg relative">
                    <div className="absolute -top-12 -left-8 bg-on-primary-container text-white text-xs p-2 rounded shadow-lg whitespace-nowrap">Target: ₹2.4M</div>
                  </div>
                </div>
                <div className="flex justify-between mt-4 text-xs text-on-surface-variant font-bold uppercase tracking-wider">
                  <span>Today</span>
                  <span>2026</span>
                  <span>2028</span>
                  <span>2030</span>
                </div>
              </GlassCard>
            </div>
          </div>
        </div>
      </section>

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
