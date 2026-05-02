'use client';

import { useEffect, useState } from 'react';
import { useStore } from '@/store/useStore';
import { getDashboardStats, getRecentTransactions, type Transaction } from '@/lib/api';
import {
  TrendingUp, TrendingDown, Wallet, ArrowRight,
  Landmark, Gem, Download, Globe, Lightbulb, Plus, Loader2
} from 'lucide-react';

const getTransactionIcon = (icon: string) => {
  switch (icon) {
    case 'account_balance': return <Landmark className="w-6 h-6" />;
    case 'grid_goldenratio': return <Gem className="w-6 h-6" />;
    case 'download': return <Download className="w-6 h-6" />;
    default: return <Wallet className="w-6 h-6" />;
  }
};

const iconBgClass: Record<string, string> = {
  account_balance: 'bg-blue-50 text-blue-600',
  grid_goldenratio: 'bg-orange-50 text-orange-600',
  download: 'bg-green-50 text-green-600',
};

export default function DashboardPage() {
  const dashboardStats = useStore((state) => state.dashboardStats);
  const transactions = useStore((state) => state.transactions);
  const updateDashboardStats = useStore((state) => state.updateDashboardStats);
  const setTransactions = useStore((state) => state.setTransactions);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const [stats, txns] = await Promise.all([
          getDashboardStats(),
          getRecentTransactions(),
        ]);
        updateDashboardStats(stats);
        setTransactions(txns.map((tx: Transaction) => ({
          ...tx,
          date: tx.subtitle?.split('•')[1]?.trim() ?? '',
        })));
      } catch (err) {
        console.error('Failed to fetch dashboard data:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (loading && dashboardStats.totalValue === 0) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 text-orange-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto w-full space-y-gutter">
      {/* Hero Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-gutter">
        {/* Portfolio Card */}
        <div className="md:col-span-2 bg-gradient-to-br from-orange-600 to-orange-400 rounded-[2rem] p-8 text-white relative overflow-hidden shadow-xl shadow-orange-500/20">
          <div className="relative z-10">
            <div className="flex justify-between items-start mb-12">
              <div>
                <p className="text-orange-100 font-label-md uppercase tracking-widest text-xs mb-2">Total Portfolio Value</p>
                <h2 className="text-display-lg font-headline-md leading-none">
                  {new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 2 }).format(dashboardStats.totalValue)}
                </h2>
              </div>
              <div className="bg-white/20 backdrop-blur-md rounded-2xl p-4 text-right">
                <p className="text-orange-100 text-[10px] uppercase font-bold tracking-tighter">Real-time P/L</p>
                <p className={`text-xl font-bold flex items-center justify-end gap-1 ${dashboardStats.profitLoss >= 0 ? 'text-white' : 'text-red-200'}`}>
                  {dashboardStats.profitLoss >= 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                  {dashboardStats.profitLoss >= 0 ? '+' : ''}
                  {new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 2 }).format(dashboardStats.profitLoss)}
                </p>
              </div>
            </div>
            <div className="flex gap-4">
              <button className="bg-white text-orange-600 px-6 py-3 rounded-xl font-button text-sm shadow-sm active:scale-95 transition-all">Add Funds</button>
              <button className="bg-orange-500/30 border border-white/20 backdrop-blur-sm text-white px-6 py-3 rounded-xl font-button text-sm active:scale-95 transition-all">Withdraw</button>
            </div>
          </div>
          <div className="absolute -right-12 -bottom-12 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
          <div className="absolute right-10 top-10 opacity-20">
            <Wallet className="w-28 h-28" />
          </div>
        </div>

        {/* Asset Breakdown Bento */}
        <div className="bg-white rounded-[2rem] border border-gray-100 p-8 shadow-sm">
          <h3 className="font-headline-sm text-lg mb-6">Asset Segments</h3>
          <div className="space-y-6">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500 font-medium">Domestic Equity</span>
                <span className="font-bold">{dashboardStats.allocation.domesticEquity}%</span>
              </div>
              <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                <div className="h-full bg-orange-500 rounded-full transition-all" style={{ width: `${dashboardStats.allocation.domesticEquity}%` }}></div>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500 font-medium">Foreign Assets</span>
                <span className="font-bold">{dashboardStats.allocation.foreignAssets}%</span>
              </div>
              <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                <div className="h-full rounded-full transition-all" style={{ width: `${dashboardStats.allocation.foreignAssets}%`, backgroundColor: '#fdd404' }}></div>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500 font-medium">Digital Gold</span>
                <span className="font-bold">{dashboardStats.allocation.digitalGold}%</span>
              </div>
              <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                <div className="h-full rounded-full transition-all" style={{ width: `${dashboardStats.allocation.digitalGold}%`, backgroundColor: '#86aeff' }}></div>
              </div>
            </div>
          </div>
          <div className="mt-8 pt-6 border-t border-gray-50">
            <button className="text-orange-600 font-button text-sm flex items-center gap-2 hover:gap-3 transition-all">
              Detailed Allocation
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-gutter pb-24">
        {/* Left Column */}
        <div className="lg:col-span-2 space-y-gutter">
          {/* Wealth Projections Chart */}
          <div className="bg-white rounded-[2rem] p-8 border border-gray-100 shadow-sm">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
              <div>
                <h3 className="font-headline-sm text-xl">Wealth Growth Projections</h3>
                <p className="text-gray-500 text-sm">Estimated trajectory based on current SIPs</p>
              </div>
              <div className="flex bg-gray-50 p-1 rounded-xl">
                <button className="px-4 py-1.5 rounded-lg text-xs font-bold bg-white shadow-sm text-orange-600">3M</button>
                <button className="px-4 py-1.5 rounded-lg text-xs font-bold text-gray-500 hover:text-orange-500">6M</button>
                <button className="px-4 py-1.5 rounded-lg text-xs font-bold text-gray-500 hover:text-orange-500">1Y</button>
                <button className="px-4 py-1.5 rounded-lg text-xs font-bold text-gray-500 hover:text-orange-500">3Y</button>
                <button className="px-4 py-1.5 rounded-lg text-xs font-bold text-gray-500 hover:text-orange-500">5Y</button>
              </div>
            </div>
            <div className="h-64 flex items-end justify-between gap-2 px-2">
              {[40, 55, 68, 82, 100].map((h, i) => (
                <div key={i} className={`w-full rounded-t-xl relative group ${i === 4 ? 'bg-orange-500 shadow-lg shadow-orange-500/20' : 'bg-orange-50'}`} style={{ height: `${h}%` }}>
                  {i < 4 && <div className="absolute inset-x-0 bottom-0 bg-orange-500/20 rounded-t-xl h-[65%] transition-all group-hover:h-[85%]"></div>}
                </div>
              ))}
            </div>
            <div className="flex justify-between mt-4 px-2 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
              <span>2024</span><span>2025</span><span>2026</span><span>2028</span><span>2029</span>
            </div>
          </div>

          {/* Recent Transactions */}
          <div className="bg-white rounded-[2rem] border border-gray-100 overflow-hidden shadow-sm">
            <div className="p-8 flex justify-between items-center border-b border-gray-50">
              <h3 className="font-headline-sm text-lg">Recent Transactions</h3>
              <button className="text-sm font-button text-gray-400 hover:text-orange-500 transition-colors">View All History</button>
            </div>
            <div className="divide-y divide-gray-50">
              {transactions.map((tx) => (
                <div key={tx.id} className="p-6 flex items-center justify-between hover:bg-gray-50 transition-colors cursor-pointer group">
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center ${iconBgClass[tx.icon ?? ''] ?? 'bg-gray-50 text-gray-600'}`}>
                      {getTransactionIcon(tx.icon ?? '')}
                    </div>
                    <div>
                      <p className="font-bold text-sm">{tx.title}</p>
                      <p className="text-[10px] text-gray-400 uppercase font-medium">{tx.subtitle}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`font-bold text-sm ${tx.type === 'credit' ? 'text-green-600' : ''}`}>
                      {tx.type === 'credit' ? '+' : '- '}
                      {new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 2 }).format(tx.amount)}
                    </p>
                    <p className="text-[10px] text-green-500 font-bold uppercase">{tx.status}</p>
                  </div>
                </div>
              ))}
              {transactions.length === 0 && (
                <div className="p-12 text-center text-gray-400">
                  <p>No transactions yet</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Sidebar */}
        <div className="space-y-gutter">
          {/* Market Pulse */}
          <div className="bg-white rounded-[2rem] p-8 border border-gray-100 shadow-sm">
            <h3 className="font-headline-sm text-lg mb-6">Market Pulse</h3>
            <div className="space-y-6">
              {[
                { code: 'N50', label: 'Nifty 50', value: '22,123.45', change: '+1.24%', up: true },
                { code: 'GLD', label: 'Gold (24K)', value: '6,540.00', change: '-0.12%', up: false },
                { code: 'USD', label: 'USD/INR', value: '82.94', change: '0.00%', up: null },
              ].map((item) => (
                <div key={item.code} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center text-gray-600 text-xs font-bold">{item.code}</div>
                    <span className="text-sm font-bold">{item.label}</span>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold">{item.value}</p>
                    <p className={`text-[10px] font-bold ${item.up === true ? 'text-green-500' : item.up === false ? 'text-red-500' : 'text-gray-400'}`}>{item.change}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Promo Card */}
          <div className="bg-gradient-to-tr rounded-[2rem] p-8 relative overflow-hidden group" style={{ background: 'linear-gradient(to top right, #fdd404, #ff9500)' }}>
            <div className="relative z-10">
              <h4 className="font-headline-sm text-xl mb-2" style={{ color: '#6f5c00' }}>Foreign Assets Await</h4>
              <p className="text-sm mb-6 leading-relaxed" style={{ color: '#554600' }}>Diversify your portfolio with US Tech stocks. Zero brokerage on first 3 trades.</p>
              <button className="bg-white font-button text-sm px-6 py-3 rounded-xl shadow-lg active:scale-95 transition-all" style={{ color: '#221b00' }}>Explore Global</button>
            </div>
            <div className="absolute -right-4 -bottom-4 opacity-10 group-hover:scale-110 transition-transform duration-500">
              <Globe className="w-32 h-32" />
            </div>
          </div>

          {/* Growth Tip */}
          <div className="bg-white rounded-[2rem] p-6 border border-gray-100 shadow-sm border-l-4 border-l-orange-500">
            <div className="flex items-center gap-2 text-orange-500 mb-2">
              <Lightbulb className="w-4 h-4" />
              <span className="text-[10px] uppercase font-bold tracking-widest">Growth Tip</span>
            </div>
            <p className="text-sm font-body-md text-gray-600">&quot;Your Domestic Equity allocation is 5% higher than your target. Consider rebalancing into Digital Gold to maintain risk levels.&quot;</p>
          </div>
        </div>
      </div>

      {/* Mobile FAB */}
      <button className="lg:hidden fixed bottom-20 right-6 z-40 w-14 h-14 bg-orange-500 text-white rounded-full shadow-xl shadow-orange-500/30 flex items-center justify-center active:scale-95 transition-all">
        <Plus className="w-6 h-6" />
      </button>
    </div>
  );
}
