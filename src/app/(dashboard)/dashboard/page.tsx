'use client';

import { useEffect, useState } from 'react';
import { useStore } from '@/store/useStore';
import { getDashboardStats, getRecentTransactions, type Transaction } from '@/lib/api';
import {
  TrendingUp, TrendingDown, Wallet, ArrowRight,
  Landmark, Gem, Download, Globe, Lightbulb, Plus, Loader2,
  PieChart, Activity
} from 'lucide-react';

const getTransactionIcon = (icon: string) => {
  switch (icon) {
    case 'account_balance': return <Landmark className="w-5 h-5" />;
    case 'grid_goldenratio': return <Gem className="w-5 h-5" />;
    case 'download': return <Download className="w-5 h-5" />;
    default: return <Wallet className="w-5 h-5" />;
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

  const formatCurrency = (value: number) => 
    new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 2 }).format(value);

  const isProfit = dashboardStats.profitLoss >= 0;

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto w-full space-y-8">
      {/* Top Overview Section */}
      <div className="flex flex-col md:flex-row gap-6">
        {/* Main Portfolio Summary Card */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm flex-1 flex flex-col justify-between">
          <div className="flex justify-between items-start mb-6">
            <div>
              <p className="text-gray-500 font-medium text-sm mb-1">Total Portfolio Value</p>
              <h2 className="text-3xl font-bold text-gray-900">
                {formatCurrency(dashboardStats.totalValue)}
              </h2>
            </div>
            <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-semibold ${isProfit ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
              {isProfit ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
              {isProfit ? '+' : ''}{formatCurrency(dashboardStats.profitLoss)}
            </div>
          </div>
          <div className="flex gap-3 mt-auto">
            <button className="bg-orange-600 hover:bg-orange-700 text-white px-5 py-2.5 rounded-xl font-medium text-sm transition-colors shadow-sm">
              Add Funds
            </button>
            <button className="bg-gray-50 hover:bg-gray-100 text-gray-700 border border-gray-200 px-5 py-2.5 rounded-xl font-medium text-sm transition-colors">
              Withdraw
            </button>
          </div>
        </div>

        {/* Asset Segments Minimal Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 md:w-3/5">
          <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm flex flex-col">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 rounded-lg bg-orange-50 text-orange-600 flex items-center justify-center">
                <PieChart className="w-4 h-4" />
              </div>
              <p className="text-gray-500 font-medium text-sm">Domestic</p>
            </div>
            <p className="text-2xl font-bold text-gray-900 mb-2">{dashboardStats.allocation.domesticEquity}%</p>
            <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden mt-auto">
              <div className="h-full bg-orange-500 rounded-full" style={{ width: `${dashboardStats.allocation.domesticEquity}%` }}></div>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm flex flex-col">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 rounded-lg bg-yellow-50 text-yellow-600 flex items-center justify-center">
                <Globe className="w-4 h-4" />
              </div>
              <p className="text-gray-500 font-medium text-sm">Foreign</p>
            </div>
            <p className="text-2xl font-bold text-gray-900 mb-2">{dashboardStats.allocation.foreignAssets}%</p>
            <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden mt-auto">
              <div className="h-full bg-[#fdd404] rounded-full" style={{ width: `${dashboardStats.allocation.foreignAssets}%` }}></div>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm flex flex-col">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                <Gem className="w-4 h-4" />
              </div>
              <p className="text-gray-500 font-medium text-sm">Digital Gold</p>
            </div>
            <p className="text-2xl font-bold text-gray-900 mb-2">{dashboardStats.allocation.digitalGold}%</p>
            <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden mt-auto">
              <div className="h-full bg-blue-400 rounded-full" style={{ width: `${dashboardStats.allocation.digitalGold}%` }}></div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 gap-6">
        
        {/* Main Column (Transactions and Projections) */}
        <div className="space-y-6">
          {/* Wealth Projections */}
          <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm flex flex-col justify-between min-h-[320px]">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
              <div>
                <h3 className="text-lg font-bold text-gray-900">Wealth Projections</h3>
                <p className="text-sm text-gray-500">Based on standard SIP at 12% expected return</p>
              </div>
              <div className="flex bg-gray-50 p-1 rounded-xl">
                {['3M', '6M', '1Y', '3Y', '5Y'].map((period, i) => (
                  <button key={period} className={`px-3 py-1.5 rounded-lg text-xs font-semibold ${i === 4 ? 'bg-white shadow-sm text-orange-600' : 'text-gray-500 hover:text-gray-900'}`}>
                    {period}
                  </button>
                ))}
              </div>
            </div>
            
            {dashboardStats.totalValue === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center text-center p-6 border-2 border-dashed border-gray-100 rounded-xl bg-gray-50/50">
                <TrendingUp className="w-10 h-10 text-gray-300 mb-3" />
                <h4 className="text-gray-900 font-semibold mb-1">No Projections Available</h4>
                <p className="text-sm text-gray-500 max-w-sm">Invest to see your wealth projections over time.</p>
                <button className="mt-4 bg-orange-600 hover:bg-orange-700 text-white px-5 py-2 rounded-lg text-sm font-semibold transition-colors">Start Investing</button>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-2 gap-4 mb-8">
                  <div className="p-4 bg-gray-50/80 rounded-xl border border-gray-100">
                    <p className="text-xs text-gray-500 font-semibold uppercase tracking-wider mb-1">Total Invested</p>
                    <p className="text-xl font-bold text-gray-900">₹{formatCurrency(dashboardStats.totalValue * 0.8).replace('₹', '')}</p>
                  </div>
                  <div className="p-4 bg-orange-50/50 rounded-xl border border-orange-100">
                    <p className="text-xs text-orange-600 font-semibold uppercase tracking-wider mb-1">Expected Wealth</p>
                    <p className="text-xl font-bold text-orange-700">₹{formatCurrency(dashboardStats.totalValue * 1.93).replace('₹', '')}</p>
                    <p className="text-xs text-orange-600 mt-1 font-medium">Est. Returns: ₹{formatCurrency(dashboardStats.totalValue * 1.13).replace('₹', '')}</p>
                  </div>
                </div>

                <div className="relative h-40 w-full mt-auto flex flex-col">
                  <div className="flex-1 relative">
                    <svg className="absolute inset-0 w-full h-full overflow-visible" preserveAspectRatio="none" viewBox="0 0 100 100">
                      <defs>
                        <linearGradient id="gradient" x1="0" x2="0" y1="0" y2="1">
                          <stop offset="0%" stopColor="#f97316" stopOpacity="0.2"/>
                          <stop offset="100%" stopColor="#f97316" stopOpacity="0"/>
                        </linearGradient>
                      </defs>
                      <path d="M0,100 L0,80 Q30,60 60,35 T100,0 L100,100 Z" fill="url(#gradient)" />
                      <path d="M0,80 Q30,60 60,35 T100,0" fill="none" stroke="#f97316" strokeWidth="2.5" strokeLinecap="round" />
                      
                      <circle cx="0" cy="80" r="3" fill="#fff" stroke="#f97316" strokeWidth="2" />
                      <circle cx="60" cy="35" r="4" fill="#fff" stroke="#f97316" strokeWidth="2" className="shadow-lg" />
                      <circle cx="100" cy="0" r="4" fill="#f97316" stroke="#fff" strokeWidth="2" />
                      
                      <rect x="48" y="15" width="24" height="12" rx="4" fill="#fff" stroke="#f97316" strokeWidth="1" />
                      <text x="60" y="23" fontSize="6" fill="#f97316" fontWeight="bold" textAnchor="middle">+93%</text>
                    </svg>
                  </div>
                  <div className="flex justify-between text-xs font-semibold text-gray-400 uppercase tracking-wider mt-2">
                    <span>Today</span>
                    <span className="translate-x-4">Year 3</span>
                    <span>Year 5</span>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Recent Transactions */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="px-6 py-5 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
              <h3 className="text-lg font-bold text-gray-900">Recent Transactions</h3>
              <button className="text-sm font-medium text-orange-600 hover:text-orange-700 transition-colors">View All</button>
            </div>
            <div className="divide-y divide-gray-50">
              {transactions.slice(0, 4).map((tx) => (
                <div key={tx.id} className="p-5 flex items-center justify-between hover:bg-gray-50/80 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${iconBgClass[tx.icon ?? ''] ?? 'bg-gray-100 text-gray-600'}`}>
                      {getTransactionIcon(tx.icon ?? '')}
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900 text-sm">{tx.title}</p>
                      <p className="text-xs text-gray-500 font-medium mt-0.5">{tx.subtitle}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`font-semibold text-sm ${tx.type === 'credit' ? 'text-green-600' : 'text-gray-900'}`}>
                      {tx.type === 'credit' ? '+' : '-'}{formatCurrency(tx.amount)}
                    </p>
                    <p className="text-xs text-gray-400 font-medium mt-0.5 capitalize">{tx.status.toLowerCase()}</p>
                  </div>
                </div>
              ))}
              {transactions.length === 0 && (
                <div className="p-10 text-center text-gray-500 text-sm">
                  No transactions yet
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Mobile FAB */}
      <button className="lg:hidden fixed bottom-6 right-6 z-40 w-14 h-14 bg-orange-600 hover:bg-orange-700 text-white rounded-full shadow-lg shadow-orange-600/30 flex items-center justify-center active:scale-95 transition-all">
        <Plus className="w-6 h-6" />
      </button>
    </div>
  );
}
