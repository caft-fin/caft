'use client';

import { Banknote, ArrowUpRight, Users, TrendingUp, UserMinus, ArrowDownRight, PieChart, LineChart } from 'lucide-react';

export default function AdminAnalyticsPage() {
  return (
    <>
      <header className="mb-10">
        <h2 className="text-[40px] font-extrabold text-on-surface font-headline-md tracking-tight">Platform Analytics</h2>
        <p className="text-lg text-gray-500 mt-2 font-medium">Deep dive into user behavior, revenue metrics, and platform performance.</p>
      </header>

      {/* KPI Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-gutter mb-stack-lg">
        <div className="glass-card p-6 rounded-2xl shadow-sm border border-gray-100 relative overflow-hidden">
          <div className="flex justify-between items-start mb-4 relative z-10">
            <div>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Monthly Revenue</p>
              <h3 className="text-2xl font-headline-sm font-bold mt-1 text-on-surface">₹4.2M</h3>
            </div>
            <div className="w-10 h-10 rounded-full bg-green-50 flex items-center justify-center text-green-600">
              <Banknote className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-center gap-2 text-sm relative z-10">
            <span className="text-green-500 font-bold flex items-center">
              <ArrowUpRight className="w-[14px] h-[14px]" /> 14.5%
            </span>
            <span className="text-gray-400">vs last month</span>
          </div>
          {/* Decorative Graph Line */}
          <svg className="absolute bottom-0 left-0 w-full h-12 text-green-100 opacity-50" preserveAspectRatio="none" viewBox="0 0 100 30">
            <path d="M0 30 L10 20 L30 25 L50 10 L70 15 L90 5 L100 0 L100 30 Z" fill="currentColor"/>
          </svg>
        </div>

        <div className="glass-card p-6 rounded-2xl shadow-sm border border-gray-100 relative overflow-hidden">
          <div className="flex justify-between items-start mb-4 relative z-10">
            <div>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Active Investors</p>
              <h3 className="text-2xl font-headline-sm font-bold mt-1 text-on-surface">8,421</h3>
            </div>
            <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-600">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-center gap-2 text-sm relative z-10">
            <span className="text-green-500 font-bold flex items-center">
              <ArrowUpRight className="w-[14px] h-[14px]" /> 5.2%
            </span>
            <span className="text-gray-400">vs last month</span>
          </div>
        </div>

        <div className="glass-card p-6 rounded-2xl shadow-sm border border-gray-100 relative overflow-hidden">
          <div className="flex justify-between items-start mb-4 relative z-10">
            <div>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">AUM Growth</p>
              <h3 className="text-2xl font-headline-sm font-bold mt-1 text-on-surface">18.4%</h3>
            </div>
            <div className="w-10 h-10 rounded-full bg-orange-50 flex items-center justify-center text-orange-600">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-center gap-2 text-sm relative z-10">
            <span className="text-green-500 font-bold flex items-center">
              <ArrowUpRight className="w-[14px] h-[14px]" /> 2.1%
            </span>
            <span className="text-gray-400">vs last year</span>
          </div>
        </div>

        <div className="sun-gradient p-6 rounded-2xl shadow-glow text-white relative overflow-hidden">
          <div className="flex justify-between items-start mb-4 relative z-10">
            <div>
              <p className="text-xs font-bold text-orange-100 uppercase tracking-widest">Churn Rate</p>
              <h3 className="text-2xl font-headline-sm font-bold mt-1">1.2%</h3>
            </div>
            <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
              <UserMinus className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-center gap-2 text-sm relative z-10">
            <span className="text-green-200 font-bold flex items-center">
              <ArrowDownRight className="w-[14px] h-[14px]" /> 0.4%
            </span>
            <span className="text-orange-100 opacity-80">vs last month</span>
          </div>
          <PieChart className="absolute -right-4 -bottom-4 w-[100px] h-[100px] text-white/10 pointer-events-none" />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-gutter mb-stack-lg">
        {/* Main Chart Area */}
        <div className="lg:col-span-2 glass-card p-8 rounded-[2rem] shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-8">
            <h3 className="font-headline-sm text-xl font-bold text-on-surface">Revenue Growth</h3>
            <div className="flex bg-gray-50 p-1 rounded-xl">
              <button className="px-4 py-1.5 rounded-lg text-xs font-bold text-gray-500 hover:text-orange-500 transition-colors">1W</button>
              <button className="px-4 py-1.5 rounded-lg text-xs font-bold bg-white shadow-sm text-orange-600 transition-colors">1M</button>
              <button className="px-4 py-1.5 rounded-lg text-xs font-bold text-gray-500 hover:text-orange-500 transition-colors">3M</button>
              <button className="px-4 py-1.5 rounded-lg text-xs font-bold text-gray-500 hover:text-orange-500 transition-colors">1Y</button>
            </div>
          </div>
          
          <div className="h-72 flex items-end justify-between gap-2 px-2 relative">
            {/* Background Grid */}
            <div className="absolute inset-0 flex flex-col justify-between pointer-events-none pb-6">
              <div className="w-full h-px border-t border-dashed border-gray-200"></div>
              <div className="w-full h-px border-t border-dashed border-gray-200"></div>
              <div className="w-full h-px border-t border-dashed border-gray-200"></div>
              <div className="w-full h-px border-t border-dashed border-gray-200"></div>
              <div className="w-full h-px border-t border-dashed border-gray-200"></div>
            </div>
            
            {/* Chart Bars */}
            {[45, 55, 40, 65, 75, 60, 85, 90, 80, 95, 100, 85].map((height, i) => (
              <div key={i} className="w-full relative group h-full flex items-end">
                <div 
                  className={`w-full rounded-t-lg transition-all duration-500 ${i === 10 ? 'bg-orange-500 shadow-lg shadow-orange-500/30' : 'bg-orange-100 hover:bg-orange-200'}`}
                  style={{ height: `${height}%` }}
                ></div>
                {/* Tooltip */}
                <div className="absolute -top-10 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 bg-gray-900 text-white text-[10px] px-2 py-1 rounded transition-opacity whitespace-nowrap z-10">
                  ₹{((height / 100) * 1.5).toFixed(1)}M
                </div>
              </div>
            ))}
          </div>
          
          <div className="flex justify-between mt-4 px-2 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
            <span>Jan</span>
            <span>Feb</span>
            <span>Mar</span>
            <span>Apr</span>
            <span>May</span>
            <span>Jun</span>
            <span>Jul</span>
            <span>Aug</span>
            <span>Sep</span>
            <span>Oct</span>
            <span>Nov</span>
            <span>Dec</span>
          </div>
        </div>

        {/* Subscription Breakdown */}
        <div className="glass-card p-8 rounded-[2rem] shadow-sm border border-gray-100 flex flex-col">
          <h3 className="font-headline-sm text-xl font-bold text-on-surface mb-8">Plan Distribution</h3>
          
          <div className="flex-1 flex flex-col justify-center">
            <div className="space-y-6">
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="font-bold text-gray-700">Solaris Basic</span>
                  <span className="font-bold">64%</span>
                </div>
                <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden">
                  <div className="h-full bg-blue-500 rounded-full" style={{ width: '64%' }}></div>
                </div>
              </div>
              
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="font-bold text-gray-700">Solaris Premium</span>
                  <span className="font-bold text-orange-600">28%</span>
                </div>
                <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden">
                  <div className="h-full bg-orange-500 rounded-full" style={{ width: '28%' }}></div>
                </div>
              </div>
              
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="font-bold text-gray-700">Solaris Elite</span>
                  <span className="font-bold text-purple-600">8%</span>
                </div>
                <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden">
                  <div className="h-full bg-purple-500 rounded-full" style={{ width: '8%' }}></div>
                </div>
              </div>
            </div>
            
            <div className="mt-10 p-5 bg-orange-50 rounded-xl border border-orange-100">
              <div className="flex gap-3">
                <LineChart className="text-orange-500 w-5 h-5" />
                <p className="text-sm text-orange-800 font-medium">Premium upgrades increased by 4.2% following the launch of Global Equities.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
