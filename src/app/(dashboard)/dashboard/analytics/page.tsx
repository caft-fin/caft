'use client';

import { TrendingUp, TrendingDown, ArrowUpRight, ArrowDownRight, ArrowRight, CalendarDays, ChevronRight, MoreVertical } from 'lucide-react';

const commodities = [
  {
    icon: '★',
    iconBg: 'bg-yellow-100 text-yellow-700',
    name: 'Gold (MCX)',
    sub: 'Metal - Bullion',
    price: '₹62,450.00',
    change: '+1,200.00 (1.9%)',
    up: true,
    sparkPath: 'M0,15 L10,12 L20,18 L30,5 L40,10 L50,2 L60,8',
    sparkColor: '#22c55e',
  },
  {
    icon: '⛽',
    iconBg: 'bg-slate-100 text-slate-700',
    name: 'Crude Oil',
    sub: 'Energy - Domestic',
    price: '₹6,412.00',
    change: '-45.00 (0.7%)',
    up: false,
    sparkPath: 'M0,5 L10,8 L20,2 L30,15 L40,12 L50,18 L60,14',
    sparkColor: '#ef4444',
  },
  {
    icon: '🌿',
    iconBg: 'bg-orange-100 text-orange-700',
    name: 'Cotton',
    sub: 'Agri - Raw',
    price: '₹24,180.00',
    change: '0.00 (0.0%)',
    up: null,
    sparkPath: 'M0,10 L60,10',
    sparkColor: '#9ca3af',
  },
];

export default function UserAnalyticsPage() {
  return (
    <div className="p-gutter max-w-7xl mx-auto space-y-stack-lg py-12 w-full">
      {/* Page Header */}
      <section className="flex flex-col md:flex-row justify-between items-end gap-stack-md">
        <div className="space-y-2">
          <h2 className="font-display-lg text-display-lg text-on-surface">Market Pulse</h2>
          <p className="font-body-lg text-body-lg text-on-surface-variant max-w-2xl">
            Real-time domestic and global commodity tracking with high-fidelity trend analysis.
          </p>
        </div>
        <div className="flex gap-stack-sm flex-wrap">
          <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-full border border-gray-100 shadow-sm">
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
            <span className="font-label-md text-label-md text-gray-600 uppercase tracking-wider">Market Open</span>
          </div>
          <button className="flex items-center gap-2 bg-white px-4 py-2 rounded-full border border-gray-100 shadow-sm hover:bg-gray-50 transition-colors">
            <CalendarDays className="w-4 h-4 text-gray-500" />
            <span className="font-label-md text-label-md">Last 30 Days</span>
          </button>
        </div>
      </section>

      {/* Bento Grid — Key Metrics */}
      <section className="grid grid-cols-1 md:grid-cols-4 gap-gutter">
        {/* Gold Card */}
        <div className="md:col-span-2 glass-card rounded-xl p-6 tonal-shadow relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <span className="text-7xl select-none">💰</span>
          </div>
          <div className="relative z-10 space-y-4">
            <div className="flex justify-between items-start">
              <div>
                <p className="font-label-md text-label-md text-primary uppercase">Commodity Focus</p>
                <h3 className="font-headline-sm text-headline-sm mt-1">Gold Spot (XAU/INR)</h3>
              </div>
              <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-bold">+2.4%</span>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-4xl font-bold font-headline-md">₹5,420.50</span>
              <span className="text-on-surface-variant font-body-md text-sm">/gram</span>
            </div>
            {/* Mini candle chart */}
            <div className="h-24 w-full flex items-end gap-1 pt-4">
              {[48, 64, 80, 56, 96, 88, 72].map((h, i) => (
                <div
                  key={i}
                  className="flex-1 rounded-t-sm"
                  style={{
                    height: `${h}%`,
                    backgroundColor: `hsl(25, ${60 + i * 5}%, ${70 - i * 5}%)`,
                  }}
                ></div>
              ))}
            </div>
          </div>
        </div>

        {/* NIFTY 50 */}
        <div className="glass-card rounded-xl p-6 tonal-shadow flex flex-col justify-between">
          <div>
            <TrendingUp className="w-6 h-6 text-primary mb-2" />
            <p className="font-label-md text-label-md text-on-surface-variant">Domestic Index</p>
            <h4 className="font-headline-sm text-headline-sm">NIFTY 50</h4>
          </div>
          <div className="mt-4">
            <p className="text-2xl font-bold">22,419.20</p>
            <p className="text-green-600 text-sm flex items-center gap-1">
              <ArrowUpRight className="w-4 h-4" />
              0.85% today
            </p>
          </div>
        </div>

        {/* USD/INR */}
        <div className="glass-card rounded-xl p-6 tonal-shadow flex flex-col justify-between">
          <div>
            <span className="text-blue-500 text-2xl mb-2 block">$</span>
            <p className="font-label-md text-label-md text-on-surface-variant">FX Rate</p>
            <h4 className="font-headline-sm text-headline-sm">USD/INR</h4>
          </div>
          <div className="mt-4">
            <p className="text-2xl font-bold">₹83.42</p>
            <p className="text-red-500 text-sm flex items-center gap-1">
              <ArrowDownRight className="w-4 h-4" />
              0.12% today
            </p>
          </div>
        </div>
      </section>

      {/* Interactive Visualization */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-gutter">
        {/* Main Chart */}
        <div className="lg:col-span-2 glass-card rounded-xl p-8 tonal-shadow">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h3 className="font-headline-sm text-headline-sm">Deep Market Insight</h3>
              <p className="text-on-surface-variant text-sm">Comparative analysis of Equity vs Commodities</p>
            </div>
            <div className="flex bg-surface-container-low p-1 rounded-lg">
              <button className="px-4 py-1.5 rounded-md text-sm font-medium bg-white shadow-sm text-primary">Line</button>
              <button className="px-4 py-1.5 rounded-md text-sm font-medium text-gray-500">Bar</button>
              <button className="px-4 py-1.5 rounded-md text-sm font-medium text-gray-500">Candle</button>
            </div>
          </div>
          <div className="relative h-[350px] w-full">
            <svg className="w-full h-full overflow-visible" viewBox="0 0 800 300">
              <line className="chart-grid-line" x1="0" x2="800" y1="50" y2="50" />
              <line className="chart-grid-line" x1="0" x2="800" y1="125" y2="125" />
              <line className="chart-grid-line" x1="0" x2="800" y1="200" y2="200" />
              <line className="chart-grid-line" x1="0" x2="800" y1="275" y2="275" />
              <defs>
                <linearGradient id="chartGradient" x1="0" x2="0" y1="0" y2="1">
                  <stop offset="0%" stopColor="#ff9500" stopOpacity="0.2" />
                  <stop offset="100%" stopColor="#ff9500" stopOpacity="0" />
                </linearGradient>
              </defs>
              <path
                d="M0,250 Q100,200 200,220 T400,150 T600,100 T800,130 L800,300 L0,300 Z"
                fill="url(#chartGradient)"
              />
              <path
                d="M0,250 Q100,200 200,220 T400,150 T600,100 T800,130"
                fill="none"
                stroke="#ff9500"
                strokeWidth="4"
                strokeLinecap="round"
              />
              <circle cx="600" cy="100" r="6" fill="#ff9500" />
              <circle cx="600" cy="100" r="12" fill="#ff9500" fillOpacity="0.2" />
            </svg>
            {/* Tooltip */}
            <div className="absolute bg-white p-3 rounded-lg shadow-xl border border-orange-100 z-10"
              style={{ top: '60px', left: '62%' }}>
              <p className="text-[10px] uppercase font-bold text-gray-400">Peak Insight</p>
              <p className="text-sm font-bold text-on-surface">₹12,450.00</p>
              <p className="text-[10px] text-green-600">+12% vs Baseline</p>
            </div>
          </div>
          <div className="flex justify-between mt-6 text-gray-400 text-xs font-medium">
            <span>Jan 01</span><span>Jan 08</span><span>Jan 15</span><span>Jan 22</span><span>Jan 31</span>
          </div>
        </div>

        {/* Right Sidebar */}
        <div className="space-y-gutter">
          {/* Sentiment */}
          <div className="glass-card rounded-xl p-6 tonal-shadow">
            <h4 className="font-label-md text-label-md text-on-surface-variant uppercase mb-4">Sentiment Index</h4>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">Bullish Sentiment</span>
              <span className="text-orange-600 font-bold">78%</span>
            </div>
            <div className="h-3 w-full bg-gray-100 rounded-full overflow-hidden">
              <div className="h-full sun-gradient rounded-full" style={{ width: '78%' }}></div>
            </div>
            <p className="mt-3 text-xs text-on-surface-variant leading-relaxed">
              Market sentiment is currently dominated by gold-backed assets and tech equity optimism.
            </p>
          </div>

          {/* Expert Advice */}
          <div className="glass-card rounded-xl p-6 tonal-shadow relative overflow-hidden group" style={{ background: 'linear-gradient(135deg, #8c5000 0%, #ff9500 100%)' }}>
            <div className="relative z-10">
              <h4 className="font-headline-sm text-headline-sm mb-2 text-white">Expert Advice</h4>
              <p className="text-sm opacity-90 mb-4 text-white">Your portfolio is currently 15% underweight in Foreign Commodities compared to peers.</p>
              <button className="bg-white text-primary px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider active:scale-95 transition-all">Review Allocation</button>
            </div>
            <div className="absolute -right-4 -bottom-4 opacity-10 group-hover:opacity-20 transition-opacity">
              <TrendingUp className="w-32 h-32 text-white" />
            </div>
          </div>

          {/* Upcoming Events */}
          <div className="glass-card rounded-xl p-6 tonal-shadow">
            <h4 className="font-label-md text-label-md text-on-surface-variant uppercase mb-4">Upcoming Data</h4>
            <div className="space-y-4">
              <div className="flex gap-4 items-center">
                <div className="bg-blue-50 text-blue-600 p-2 rounded-lg shrink-0">
                  <CalendarDays className="w-4 h-4" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-bold">RBI Policy Meet</p>
                  <p className="text-xs text-gray-500">Tomorrow, 10:00 AM</p>
                </div>
                <ChevronRight className="w-4 h-4 text-gray-300" />
              </div>
              <div className="flex gap-4 items-center">
                <div className="bg-orange-50 text-orange-600 p-2 rounded-lg shrink-0">
                  <CalendarDays className="w-4 h-4" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-bold">Gold CPI Release</p>
                  <p className="text-xs text-gray-500">Feb 05, 2024</p>
                </div>
                <ChevronRight className="w-4 h-4 text-gray-300" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Commodity Watchlist Table */}
      <section className="glass-card rounded-xl overflow-hidden tonal-shadow">
        <div className="px-8 py-6 border-b border-gray-100 flex justify-between items-center">
          <h3 className="font-headline-sm text-headline-sm">Commodity Watchlist</h3>
          <button className="text-primary text-sm font-bold flex items-center gap-1">
            View All Markets <ArrowRight className="w-4 h-4" />
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-gray-50/50">
                <th className="px-8 py-4 font-label-md text-label-md text-gray-500 uppercase">Asset</th>
                <th className="px-8 py-4 font-label-md text-label-md text-gray-500 uppercase text-right">Last Price</th>
                <th className="px-8 py-4 font-label-md text-label-md text-gray-500 uppercase text-right">Change</th>
                <th className="px-8 py-4 font-label-md text-label-md text-gray-500 uppercase text-center">Trend</th>
                <th className="px-8 py-4"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {commodities.map((c, i) => (
                <tr key={i} className="hover:bg-gray-50 transition-colors">
                  <td className="px-8 py-4">
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${c.iconBg}`}>
                        {c.icon}
                      </div>
                      <div>
                        <p className="font-bold text-sm">{c.name}</p>
                        <p className="text-xs text-gray-500">{c.sub}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-4 text-right font-bold">{c.price}</td>
                  <td className={`px-8 py-4 text-right font-medium ${c.up === true ? 'text-green-600' : c.up === false ? 'text-red-600' : 'text-gray-400'}`}>{c.change}</td>
                  <td className="px-8 py-4">
                    <div className="flex justify-center">
                      <svg width="60" height="20">
                        <path d={c.sparkPath} fill="none" stroke={c.sparkColor} strokeWidth="2" />
                      </svg>
                    </div>
                  </td>
                  <td className="px-8 py-4 text-right">
                    <button className="p-2 hover:bg-orange-50 rounded-full transition-colors">
                      <MoreVertical className="w-4 h-4 text-gray-400" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
