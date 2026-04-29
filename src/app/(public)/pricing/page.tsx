import { CheckCircle2, XCircle, Minus, Check } from 'lucide-react';
import Image from 'next/image';

export default function PricingPage() {
  return (
    <>
      {/* Hero Section */}
      <section className="relative pt-24 pb-16 px-6 text-center overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full -z-10 opacity-10">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary-container rounded-full blur-[100px]"></div>
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-secondary-container rounded-full blur-[100px]"></div>
        </div>
        <h1 className="font-display-lg text-display-lg text-on-surface mb-stack-sm">Plans for every financial journey.</h1>
        <p className="font-body-lg text-body-lg text-on-surface-variant max-w-2xl mx-auto mb-stack-lg">
          Choose the level of precision and insight that fits your wealth goals. From personal savings to institutional wealth management.
        </p>
        
        {/* Toggle (Monthly/Yearly) */}
        <div className="flex items-center justify-center gap-4 mb-16">
          <span className="font-label-md text-label-md text-on-surface-variant">Monthly</span>
          <button className="w-12 h-6 bg-primary-container rounded-full relative p-1 transition-colors">
            <div className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full"></div>
          </button>
          <span className="font-label-md text-label-md text-on-surface">Yearly <span className="text-primary font-bold">(Save 20%)</span></span>
        </div>
      </section>

      {/* Pricing Cards Bento Grid */}
      <section className="max-w-7xl mx-auto px-6 pb-stack-lg">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-gutter">
          {/* Basic Plan */}
          <div className="bg-white rounded-xl p-8 border border-gray-100 tonal-shadow flex flex-col hover:translate-y-[-4px] transition-transform duration-300">
            <div className="mb-6">
              <span className="font-label-md text-label-md text-primary uppercase tracking-widest bg-primary-fixed/30 px-3 py-1 rounded-full">Essentials</span>
              <h3 className="font-headline-sm text-headline-sm mt-4">Basic</h3>
              <div className="mt-4 flex items-baseline gap-1">
                <span className="text-4xl font-bold font-headline-md">₹0</span>
                <span className="text-on-surface-variant font-body-md">/mo</span>
              </div>
              <p className="text-on-surface-variant font-body-md mt-4">Perfect for individuals starting their financial tracking journey.</p>
            </div>
            <ul className="flex-grow space-y-4 mb-8">
              <li className="flex items-center gap-3">
                <CheckCircle2 className="text-primary w-5 h-5" />
                <span className="font-body-md">Personal Expense Tracking</span>
              </li>
              <li className="flex items-center gap-3">
                <CheckCircle2 className="text-primary w-5 h-5" />
                <span className="font-body-md">Basic Savings Goals</span>
              </li>
              <li className="flex items-center gap-3">
                <CheckCircle2 className="text-primary w-5 h-5" />
                <span className="font-body-md">Monthly Statements</span>
              </li>
              <li className="flex items-center gap-3 text-gray-400">
                <XCircle className="w-5 h-5" />
                <span className="font-body-md">Market Insights</span>
              </li>
            </ul>
            <button className="w-full py-4 rounded-xl text-button font-button text-white sun-gradient shadow-xl hover:translate-y-[-2px] transition-all active:scale-95 duration-200">
              Get Started
            </button>
          </div>

          {/* Pro Plan (Featured) */}
          <div className="sun-gradient rounded-xl p-8 tonal-shadow flex flex-col relative scale-105 z-10 shadow-[0_20px_40px_-10px_rgba(255,149,0,0.3)]">
            <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-on-surface text-white px-4 py-1 rounded-full text-xs font-bold tracking-widest uppercase">Most Popular</div>
            <div className="mb-6">
              <span className="font-label-md text-label-md text-white/90 uppercase tracking-widest bg-white/20 px-3 py-1 rounded-full">Growth</span>
              <h3 className="font-headline-sm text-headline-sm text-white mt-4">Pro</h3>
              <div className="mt-4 flex items-baseline gap-1">
                <span className="text-4xl font-bold font-headline-md text-white">₹999</span>
                <span className="text-white/80 font-body-md">/mo</span>
              </div>
              <p className="text-white/90 font-body-md mt-4">Advanced tools for serious investors and family wealth growth.</p>
            </div>
            <ul className="flex-grow space-y-4 mb-8">
              <li className="flex items-center gap-3">
                <CheckCircle2 className="text-white w-5 h-5" />
                <span className="font-body-md text-white">Everything in Basic</span>
              </li>
              <li className="flex items-center gap-3">
                <CheckCircle2 className="text-white w-5 h-5" />
                <span className="font-body-md text-white">Stock Portfolio Sync</span>
              </li>
              <li className="flex items-center gap-3">
                <CheckCircle2 className="text-white w-5 h-5" />
                <span className="font-body-md text-white">AI-Powered Market Insights</span>
              </li>
              <li className="flex items-center gap-3">
                <CheckCircle2 className="text-white w-5 h-5" />
                <span className="font-body-md text-white">Tax Optimization Reports</span>
              </li>
            </ul>
            <button className="w-full py-4 rounded-lg bg-white text-orange-600 font-button text-button shadow-lg hover:shadow-xl transition-all active:scale-95 duration-200">
              Subscribe Now
            </button>
          </div>

          {/* Institutional Plan */}
          <div className="bg-white rounded-xl p-8 border border-gray-100 tonal-shadow flex flex-col hover:translate-y-[-4px] transition-transform duration-300">
            <div className="mb-6">
              <span className="font-label-md text-label-md text-primary uppercase tracking-widest bg-primary-fixed/30 px-3 py-1 rounded-full">Enterprise</span>
              <h3 className="font-headline-sm text-headline-sm mt-4">Institutional</h3>
              <div className="mt-4 flex items-baseline gap-1">
                <span className="text-4xl font-bold font-headline-md">₹4,999</span>
                <span className="text-on-surface-variant font-body-md">/mo</span>
              </div>
              <p className="text-on-surface-variant font-body-md mt-4">Comprehensive suite for wealth managers and large organizations.</p>
            </div>
            <ul className="flex-grow space-y-4 mb-8">
              <li className="flex items-center gap-3">
                <CheckCircle2 className="text-primary w-5 h-5" />
                <span className="font-body-md">Unlimited Portfolios</span>
              </li>
              <li className="flex items-center gap-3">
                <CheckCircle2 className="text-primary w-5 h-5" />
                <span className="font-body-md">Custom API Access</span>
              </li>
              <li className="flex items-center gap-3">
                <CheckCircle2 className="text-primary w-5 h-5" />
                <span className="font-body-md">Dedicated Advisor Support</span>
              </li>
              <li className="flex items-center gap-3">
                <CheckCircle2 className="text-primary w-5 h-5" />
                <span className="font-body-md">Audit-Ready Compliance</span>
              </li>
            </ul>
            <button className="w-full py-4 rounded-lg border-2 border-primary text-primary font-button text-button hover:bg-orange-50 transition-colors active:scale-95 duration-200">
              Contact Sales
            </button>
          </div>
        </div>
      </section>

      {/* Feature Comparison Table */}
      <section className="max-w-4xl mx-auto px-6 py-stack-lg">
        <h2 className="font-headline-md text-headline-md text-center mb-12">Detailed Comparison</h2>
        <div className="glass-panel rounded-2xl overflow-hidden border border-outline-variant/30 tonal-shadow">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-surface-container-low">
                <th className="p-6 font-headline-sm text-sm uppercase tracking-wider">Feature</th>
                <th className="p-6 font-headline-sm text-sm uppercase tracking-wider text-center">Basic</th>
                <th className="p-6 font-headline-sm text-sm uppercase tracking-wider text-center text-primary">Pro</th>
                <th className="p-6 font-headline-sm text-sm uppercase tracking-wider text-center">Inst.</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              <tr>
                <td className="p-6 font-body-md">Active Accounts</td>
                <td className="p-6 text-center font-body-md">2</td>
                <td className="p-6 text-center font-body-md text-primary font-bold">10</td>
                <td className="p-6 text-center font-body-md">Unlimited</td>
              </tr>
              <tr>
                <td className="p-6 font-body-md">Real-time Data</td>
                <td className="p-6 text-center"><Minus className="text-gray-300 w-6 h-6 mx-auto" /></td>
                <td className="p-6 text-center"><Check className="text-primary w-6 h-6 mx-auto" /></td>
                <td className="p-6 text-center"><Check className="text-primary w-6 h-6 mx-auto" /></td>
              </tr>
              <tr>
                <td className="p-6 font-body-md">Wealth Coaching</td>
                <td className="p-6 text-center"><Minus className="text-gray-300 w-6 h-6 mx-auto" /></td>
                <td className="p-6 text-center font-body-md">Monthly</td>
                <td className="p-6 text-center font-body-md">Priority 24/7</td>
              </tr>
              <tr>
                <td className="p-6 font-body-md">Custom Dashboards</td>
                <td className="p-6 text-center"><Minus className="text-gray-300 w-6 h-6 mx-auto" /></td>
                <td className="p-6 text-center font-body-md">Limited</td>
                <td className="p-6 text-center font-body-md">Full Access</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* Trust Section */}
      <section className="bg-surface-container-lowest py-20">
        <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-2 items-center gap-16">
          <div>
            <h2 className="font-headline-md text-headline-md mb-6">Why trust CAFT Financial?</h2>
            <p className="font-body-lg text-body-lg text-on-surface-variant mb-8">
              We prioritize your security and growth with bank-level encryption and unbiased financial algorithms.
            </p>
            <div className="grid grid-cols-2 gap-8">
              <div className="flex flex-col gap-2">
                <span className="text-3xl font-bold text-primary">₹500Cr+</span>
                <span className="text-label-md text-on-surface-variant uppercase">Assets Tracked</span>
              </div>
              <div className="flex flex-col gap-2">
                <span className="text-3xl font-bold text-primary">50k+</span>
                <span className="text-label-md text-on-surface-variant uppercase">Active Users</span>
              </div>
            </div>
          </div>
          <div className="rounded-2xl overflow-hidden tonal-shadow h-64 md:h-96">
            <Image 
              alt="Financial growth visualization" 
              className="w-full h-full object-cover" 
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuBkLUmFnLHYVvRRE9bfd6uXDbpb4G_H8G46DybWiMZ7vY9xbnPgU9RyAbF2Hkt9lcdHckr5_dQvw_jxxTrbj62OpbIJ2ZxeAAa7OiHVlzvcwmHeaDESkzAGypeD6ldMeCRT2sFPA92qX5OL13I9w-zyOhvtkMNbXWv0ZykzzF7Spr0j-LaLsD0NDfN5eLawIKxmwxa-_2csK_7jOGThAUElZMsY3nmaKluGQRwqmvGLKYjmE6mTCP0gUJLlLWatmp0nvxlR12abUz4" 
              width={600}
              height={400}
            />
          </div>
        </div>
      </section>
    </>
  );
}
