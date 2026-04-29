import { GlassCard } from "@/components/ui/GlassCard";
import { Calendar, PiggyBank, TrendingUp, ArrowUp, Banknote, ArrowDown, CalendarDays, ChevronRight, ArrowRight, Star, MoreVertical, Cylinder } from 'lucide-react';

export default function AnalyticsPage() {
  return (
    <div className="p-gutter max-w-7xl mx-auto space-y-stack-lg py-12">
      {/* Hero / Page Header */}
      <section className="flex flex-col md:flex-row justify-between items-end gap-stack-md">
        <div className="space-y-2">
          <h2 className="font-display-lg text-display-lg text-on-surface">Market Pulse</h2>
          <p className="font-body-lg text-body-lg text-on-surface-variant max-w-2xl">
            Real-time domestic and global commodity tracking with high-fidelity trend analysis.
          </p>
        </div>
        <div className="flex gap-stack-sm">
          <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-full border border-gray-100 shadow-sm">
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
            <span className="font-label-md text-label-md text-gray-600 uppercase tracking-wider">Market Open</span>
          </div>
          <button className="flex items-center gap-2 bg-white px-4 py-2 rounded-full border border-gray-100 shadow-sm hover:bg-gray-50 transition-colors">
            <Calendar className="w-4 h-4" />
            <span className="font-label-md text-label-md">Last 30 Days</span>
          </button>
        </div>
      </section>

      {/* Bento Grid - Key Metrics */}
      <section className="grid grid-cols-1 md:grid-cols-4 gap-gutter">
        {/* Gold Asset Card */}
        <GlassCard className="md:col-span-2 rounded-xl p-6 tonal-shadow relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <PiggyBank className="w-24 h-24" />
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
            {/* Mini Candle Chart */}
            <div className="h-24 w-full flex items-end gap-1 pt-4">
              <div className="flex-1 bg-gray-100 rounded-t-sm h-12"></div>
              <div className="flex-1 bg-orange-200 rounded-t-sm h-16"></div>
              <div className="flex-1 bg-orange-300 rounded-t-sm h-20"></div>
              <div className="flex-1 bg-orange-400 rounded-t-sm h-14"></div>
              <div className="flex-1 bg-orange-500 rounded-t-sm h-24"></div>
              <div className="flex-1 bg-orange-600 rounded-t-sm h-22"></div>
              <div className="flex-1 bg-orange-400 rounded-t-sm h-18"></div>
            </div>
          </div>
        </GlassCard>

        {/* Domestic Market Card */}
        <GlassCard className="rounded-xl p-6 tonal-shadow flex flex-col justify-between">
          <div>
            <TrendingUp className="text-primary mb-2 w-6 h-6" />
            <p className="font-label-md text-label-md text-on-surface-variant">Domestic Index</p>
            <h4 className="font-headline-sm text-headline-sm">NIFTY 50</h4>
          </div>
          <div className="mt-4">
            <p className="text-2xl font-bold">22,419.20</p>
            <p className="text-green-600 text-sm flex items-center gap-1">
              <ArrowUp className="w-4 h-4" />
              0.85% today
            </p>
          </div>
        </GlassCard>

        {/* Foreign Exchange Card */}
        <GlassCard className="rounded-xl p-6 tonal-shadow flex flex-col justify-between">
          <div>
            <Banknote className="text-blue-500 mb-2 w-6 h-6" />
            <p className="font-label-md text-label-md text-on-surface-variant">FX Rate</p>
            <h4 className="font-headline-sm text-headline-sm">USD/INR</h4>
          </div>
          <div className="mt-4">
            <p className="text-2xl font-bold">₹83.42</p>
            <p className="text-red-500 text-sm flex items-center gap-1">
              <ArrowDown className="w-4 h-4" />
              0.12% today
            </p>
          </div>
        </GlassCard>
      </section>

      {/* Interactive Visualization Section */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-gutter">
        {/* Main Trend Chart */}
        <GlassCard className="lg:col-span-2 rounded-xl p-8 tonal-shadow">
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
          {/* SVG Chart Simulation */}
          <div className="relative h-[350px] w-full">
            <svg className="w-full h-full overflow-visible" viewBox="0 0 800 300">
              <line className="chart-grid-line" x1="0" x2="800" y1="50" y2="50"></line>
              <line className="chart-grid-line" x1="0" x2="800" y1="125" y2="125"></line>
              <line className="chart-grid-line" x1="0" x2="800" y1="200" y2="200"></line>
              <line className="chart-grid-line" x1="0" x2="800" y1="275" y2="275"></line>
              <defs>
                <linearGradient id="chartGradient" x1="0" x2="0" y1="0" y2="1">
                  <stop offset="0%" stopColor="#ff9500" stopOpacity="0.2"></stop>
                  <stop offset="100%" stopColor="#ff9500" stopOpacity="0"></stop>
                </linearGradient>
              </defs>
              <path d="M0,250 Q100,200 200,220 T400,150 T600,100 T800,130 L800,300 L0,300 Z" fill="url(#chartGradient)"></path>
              <path d="M0,250 Q100,200 200,220 T400,150 T600,100 T800,130" fill="none" stroke="#ff9500" strokeLinecap="round" strokeWidth="4"></path>
              <circle cx="600" cy="100" fill="#ff9500" r="6"></circle>
              <circle cx="600" cy="100" fill="#ff9500" fillOpacity="0.2" r="12"></circle>
            </svg>
            <div className="absolute top-[80px] left-[610px] bg-white p-3 rounded-lg shadow-xl border border-orange-100 z-10">
              <p className="text-[10px] uppercase font-bold text-gray-400">Peak Insight</p>
              <p className="text-sm font-bold text-on-surface">₹12,450.00</p>
              <p className="text-[10px] text-green-600">+12% vs Baseline</p>
            </div>
          </div>
          <div className="flex justify-between mt-6 text-gray-400 text-xs font-medium">
            <span>Jan 01</span>
            <span>Jan 08</span>
            <span>Jan 15</span>
            <span>Jan 22</span>
            <span>Jan 31</span>
          </div>
        </GlassCard>

        {/* Trend Indicators / Sidebar Info */}
        <div className="space-y-gutter">
          <GlassCard className="rounded-xl p-6 tonal-shadow">
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
          </GlassCard>
          
          <GlassCard className="rounded-xl p-6 tonal-shadow overflow-hidden bg-cover bg-center text-white relative group" style={{ backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuAKHSqRQDqwrPrkuXz8H3wZM3Umf27Se1KOrYSx3Fp_4INHKMnY6xgqtHlHIxiAa6Bl7n8HSA4fAtwBDy3PaEDvd3Pe0Bro_x1KHAft0d-r9GpDc_M1L-k6CScA_WoSPHyqkJU7WS4EeQwHbzpKJfX3Q062VVvKhWaOs3Fmt_uXGcDZhWvJSwkmkJpgujKGAOTTc7ljVLm1ltXjWG8_TGSEML0yfAgjTCWek44jwK0YLza4g9MuHq5JBij6wQpISSOUyCEZODzmq_o')" }}>
            <div className="absolute inset-0 bg-primary/80 backdrop-blur-[2px] transition-all group-hover:backdrop-blur-0"></div>
            <div className="relative z-10">
              <h4 className="font-headline-sm text-headline-sm mb-2">Expert Advice</h4>
              <p className="text-sm opacity-90 mb-4">Your portfolio is currently 15% underweight in Foreign Commodities compared to peers.</p>
              <button className="bg-white text-primary px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider">Review Allocation</button>
            </div>
          </GlassCard>

          <GlassCard className="rounded-xl p-6 tonal-shadow">
            <h4 className="font-label-md text-label-md text-on-surface-variant uppercase mb-4">Upcoming Data</h4>
            <div className="space-y-4">
              <div className="flex gap-4 items-center">
                <div className="bg-blue-50 text-blue-600 p-2 rounded-lg">
                  <CalendarDays className="w-4 h-4" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-bold">RBI Policy Meet</p>
                  <p className="text-xs text-gray-500">Tomorrow, 10:00 AM</p>
                </div>
                <ChevronRight className="text-gray-300 w-5 h-5" />
              </div>
              <div className="flex gap-4 items-center">
                <div className="bg-orange-50 text-orange-600 p-2 rounded-lg">
                  <CalendarDays className="w-4 h-4" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-bold">Gold CPI Release</p>
                  <p className="text-xs text-gray-500">Feb 05, 2024</p>
                </div>
                <ChevronRight className="text-gray-300 w-5 h-5" />
              </div>
            </div>
          </GlassCard>
        </div>
      </section>

      {/* Table of Commodities */}
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
              <tr className="hover:bg-gray-50 transition-colors">
                <td className="px-8 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-yellow-100 text-yellow-700 flex items-center justify-center">
                      <Star className="w-4 h-4 fill-yellow-700" />
                    </div>
                    <div>
                      <p className="font-bold text-sm">Gold (MCX)</p>
                      <p className="text-xs text-gray-500">Metal - Bullion</p>
                    </div>
                  </div>
                </td>
                <td className="px-8 py-4 text-right font-bold">₹62,450.00</td>
                <td className="px-8 py-4 text-right text-green-600 font-medium">+1,200.00 (1.9%)</td>
                <td className="px-8 py-4">
                  <div className="flex justify-center">
                    <svg height="20" width="60">
                      <path d="M0,15 L10,12 L20,18 L30,5 L40,10 L50,2 L60,8" fill="none" stroke="#22c55e" strokeWidth="2"></path>
                    </svg>
                  </div>
                </td>
                <td className="px-8 py-4 text-right">
                  <button className="p-2 hover:bg-orange-50 rounded-full transition-colors">
                    <MoreVertical className="text-gray-400 w-5 h-5" />
                  </button>
                </td>
              </tr>
              {/* Additional rows omitted for brevity, adding a couple representing the UI */}
              <tr className="hover:bg-gray-50 transition-colors">
                <td className="px-8 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-slate-100 text-slate-700 flex items-center justify-center">
                      <Cylinder className="w-4 h-4 fill-slate-700" />
                    </div>
                    <div>
                      <p className="font-bold text-sm">Crude Oil</p>
                      <p className="text-xs text-gray-500">Energy - Domestic</p>
                    </div>
                  </div>
                </td>
                <td className="px-8 py-4 text-right font-bold">₹6,412.00</td>
                <td className="px-8 py-4 text-right text-red-600 font-medium">-45.00 (0.7%)</td>
                <td className="px-8 py-4">
                  <div className="flex justify-center">
                    <svg height="20" width="60">
                      <path d="M0,5 L10,8 L20,2 L30,15 L40,12 L50,18 L60,14" fill="none" stroke="#ef4444" strokeWidth="2"></path>
                    </svg>
                  </div>
                </td>
                <td className="px-8 py-4 text-right">
                  <button className="p-2 hover:bg-orange-50 rounded-full transition-colors">
                    <MoreVertical className="text-gray-400 w-5 h-5" />
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
