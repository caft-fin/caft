'use client';

import { useEffect, useState } from 'react';
import { useStore } from '@/store/useStore';
import { api } from '@/lib/apiClient';
import type { DashboardStats, TransactionItem } from '@/lib/apiClient';
import { 
  TrendingUp, TrendingDown, PieChart, ArrowRight, Activity, 
  BarChart3, Loader2, ArrowUpRight, ArrowDownRight, Globe, Gem 
} from 'lucide-react';

export default function UserAnalyticsPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [transactions, setTransactions] = useState<TransactionItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const [statsRes, txnsRes] = await Promise.all([
          api.stats.dashboard().catch(() => ({ data: null })),
          api.user.transactions(50).catch(() => ({ data: [] }))
        ]);
        setStats(statsRes.data as DashboardStats | null);
        setTransactions((txnsRes.data || []) as TransactionItem[]);
      } catch (err) {
        console.error('Failed to fetch analytics data:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const formatCurrency = (amount: number) => 
    new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amount);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 text-orange-600 animate-spin" />
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="w-full flex-1 flex flex-col items-center justify-center min-h-[80vh] relative p-6 overflow-hidden">
        
        {/* Abstract Background Chart Skeleton */}
        <div className="absolute inset-0 pointer-events-none flex flex-col items-center justify-center z-0 opacity-40 select-none">
          <div className="w-full max-w-6xl h-full flex items-center justify-center relative">
            <svg viewBox="0 0 1000 400" className="w-full h-auto text-gray-200 stroke-current blur-[2px]">
              {/* Primary Line */}
              <path d="M0,350 C150,350 200,200 350,250 C500,300 600,100 750,150 C900,200 950,50 1000,50" fill="none" strokeWidth="6" strokeLinecap="round" />
              {/* Secondary Line */}
              <path d="M0,380 C200,380 250,280 400,320 C550,360 650,200 800,250 C950,300 980,150 1000,100" fill="none" strokeWidth="3" strokeDasharray="8 8" strokeLinecap="round" />
              {/* Grid Lines */}
              <line x1="0" y1="100" x2="1000" y2="100" strokeWidth="1" strokeDasharray="4 4" className="text-gray-100" />
              <line x1="0" y1="200" x2="1000" y2="200" strokeWidth="1" strokeDasharray="4 4" className="text-gray-100" />
              <line x1="0" y1="300" x2="1000" y2="300" strokeWidth="1" strokeDasharray="4 4" className="text-gray-100" />
            </svg>
            <div className="absolute inset-0 bg-gradient-to-t from-[#f8f9fa] via-transparent to-transparent"></div>
          </div>
        </div>

        {/* Foreground Content */}
        <div className="relative z-10 flex flex-col items-center max-w-2xl text-center">
          <div className="w-20 h-20 mb-8 rounded-full bg-orange-50 border border-orange-100 shadow-sm flex items-center justify-center relative">
            <div className="absolute inset-0 rounded-full animate-ping opacity-20 bg-orange-400" style={{ animationDuration: '3s' }}></div>
            <BarChart3 className="w-8 h-8 text-orange-600 relative z-10" strokeWidth={1.5} />
          </div>
          
          <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 tracking-tight mb-6">
            Intelligent Analytics
          </h1>
          
          <p className="text-lg text-gray-500 max-w-xl leading-relaxed mb-10">
            Gain institutional-grade clarity on your portfolio. Performance tracking, predictive trends, and proprietary algorithmic insights will be dynamically generated here.
          </p>

          <div className="flex flex-col sm:flex-row items-center gap-4">
            <button className="px-8 py-3.5 bg-gray-900 hover:bg-black text-white rounded-xl font-semibold transition-all shadow-lg hover:shadow-xl active:scale-95 flex items-center gap-2">
              Explore Available Tools <ArrowRight className="w-4 h-4" />
            </button>
            <button className="px-8 py-3.5 bg-white border border-gray-200 hover:border-gray-300 text-gray-700 rounded-xl font-semibold transition-all shadow-sm active:scale-95">
              Learn about algorithms
            </button>
          </div>
        </div>
      </div>
    );
  }

  const isProfit = stats.profitLoss >= 0;
  
  // Calculate simple metrics from transactions
  const totalCredits = transactions.filter(t => t.type === 'credit').reduce((sum, t) => sum + t.amount, 0);
  const totalDebits = transactions.filter(t => t.type === 'debit').reduce((sum, t) => sum + t.amount, 0);

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-8 w-full">
      {/* Page Header */}
      <section className="flex flex-col md:flex-row justify-between items-end gap-4">
        <div>
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Portfolio Analytics</h2>
          <p className="text-sm text-gray-500 max-w-2xl">
            Detailed breakdown of your asset allocation, historical performance, and cash flow analysis.
          </p>
        </div>
      </section>

      {/* Primary Metrics Grid */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Total Value */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm flex flex-col justify-between">
          <div>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Total Asset Value</p>
            <h3 className="text-3xl font-bold text-gray-900 mb-4">{formatCurrency(stats.totalValue)}</h3>
          </div>
          <div className="flex items-center gap-2">
            <div className={`px-2.5 py-1 rounded-full text-xs font-bold flex items-center gap-1 ${isProfit ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
              {isProfit ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
              {isProfit ? '+' : ''}{formatCurrency(stats.profitLoss)}
            </div>
            <span className="text-xs text-gray-500 font-medium">All time</span>
          </div>
        </div>

        {/* Cash Flow */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm flex flex-col justify-between">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">Cash Flow (Recent)</p>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-green-50 flex items-center justify-center text-green-600">
                  <ArrowDownRight className="w-4 h-4" />
                </div>
                <span className="text-sm font-semibold text-gray-700">Inflow</span>
              </div>
              <span className="font-bold text-gray-900">{formatCurrency(totalCredits)}</span>
            </div>
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-red-50 flex items-center justify-center text-red-600">
                  <ArrowUpRight className="w-4 h-4" />
                </div>
                <span className="text-sm font-semibold text-gray-700">Outflow</span>
              </div>
              <span className="font-bold text-gray-900">{formatCurrency(totalDebits)}</span>
            </div>
          </div>
        </div>

        {/* Action Card */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-orange-600 to-orange-500 p-6 text-white shadow-lg shadow-orange-500/20 flex flex-col justify-between">
          <div className="relative z-10">
            <h3 className="text-xl font-bold mb-2">Optimize Portfolio</h3>
            <p className="text-orange-100 text-sm mb-6 max-w-[200px]">
              Based on your analytics, you can improve diversification by balancing your assets.
            </p>
          </div>
          <button className="bg-white text-orange-600 font-semibold px-4 py-2.5 rounded-xl text-sm transition-transform active:scale-95 w-fit relative z-10">
            View Recommendations
          </button>
          <Activity className="absolute -right-6 -bottom-6 w-32 h-32 text-orange-400/30" />
        </div>
      </section>

      {/* Asset Allocation & Performance */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Allocation Breakdown */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-6">
            <PieChart className="w-5 h-5 text-gray-400" />
            <h3 className="text-lg font-bold text-gray-900">Asset Allocation</h3>
          </div>
          
          <div className="space-y-6">
            {/* Domestic Equity */}
            <div>
              <div className="flex justify-between items-end mb-2">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center">
                    <BarChart3 className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900 text-sm">Domestic Equity</p>
                    <p className="text-xs text-gray-500">Indian Stock Market</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold text-gray-900">{stats.allocation.domesticEquity}%</p>
                  <p className="text-xs text-gray-500">{formatCurrency(stats.totalValue * (stats.allocation.domesticEquity / 100))}</p>
                </div>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-1.5 overflow-hidden">
                <div className="bg-orange-500 h-full rounded-full" style={{ width: `${stats.allocation.domesticEquity}%` }}></div>
              </div>
            </div>

            {/* Foreign Assets */}
            <div>
              <div className="flex justify-between items-end mb-2">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-yellow-50 text-yellow-600 flex items-center justify-center">
                    <Globe className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900 text-sm">Foreign Assets</p>
                    <p className="text-xs text-gray-500">Global Equities</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold text-gray-900">{stats.allocation.foreignAssets}%</p>
                  <p className="text-xs text-gray-500">{formatCurrency(stats.totalValue * (stats.allocation.foreignAssets / 100))}</p>
                </div>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-1.5 overflow-hidden">
                <div className="bg-[#fdd404] h-full rounded-full" style={{ width: `${stats.allocation.foreignAssets}%` }}></div>
              </div>
            </div>

            {/* Digital Gold */}
            <div>
              <div className="flex justify-between items-end mb-2">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                    <Gem className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900 text-sm">Digital Gold</p>
                    <p className="text-xs text-gray-500">Precious Metals</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold text-gray-900">{stats.allocation.digitalGold}%</p>
                  <p className="text-xs text-gray-500">{formatCurrency(stats.totalValue * (stats.allocation.digitalGold / 100))}</p>
                </div>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-1.5 overflow-hidden">
                <div className="bg-blue-400 h-full rounded-full" style={{ width: `${stats.allocation.digitalGold}%` }}></div>
              </div>
            </div>
          </div>
        </div>

        {/* Transaction Flow Analysis */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm flex flex-col">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-gray-900">Recent Activity Flow</h3>
            <button className="text-sm font-semibold text-orange-600 hover:text-orange-700 flex items-center gap-1 transition-colors">
              Full Report <ArrowRight className="w-4 h-4" />
            </button>
          </div>
          
          <div className="flex-1 overflow-y-auto pr-2 space-y-4 max-h-[300px]">
            {transactions.slice(0, 10).map((tx) => (
              <div key={tx.id} className="flex items-center justify-between p-3 rounded-xl hover:bg-gray-50 transition-colors border border-transparent hover:border-gray-100">
                <div>
                  <p className="font-semibold text-sm text-gray-900">{tx.title}</p>
                  <p className="text-xs text-gray-500">{new Intl.DateTimeFormat('en-US', { month: 'short', day: '2-digit', year: 'numeric' }).format(new Date(tx.createdAt))}</p>
                </div>
                <div className="text-right">
                  <p className={`font-bold text-sm ${tx.type === 'credit' ? 'text-green-600' : 'text-gray-900'}`}>
                    {tx.type === 'credit' ? '+' : '-'}{formatCurrency(tx.amount)}
                  </p>
                  <p className="text-[10px] text-gray-400 uppercase font-semibold tracking-wider">{tx.status}</p>
                </div>
              </div>
            ))}
            {transactions.length === 0 && (
              <div className="text-center py-12 text-gray-500 text-sm">
                No recent transactions to analyze.
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
