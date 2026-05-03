'use client';

import { useEffect, useState } from 'react';
import { api, type AdminStatsOverview } from '@/lib/apiClient';
import { Banknote, ArrowUpRight, Users, TrendingUp, UserMinus, PieChart, LineChart, Loader2, AlertTriangle } from 'lucide-react';

export default function AdminAnalyticsPage() {
  const [stats, setStats] = useState<AdminStatsOverview | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const loadStats = async () => {
    try {
      setLoading(true);
      const res = await api.admin.statsOverview();
      setStats(res.data);
    } catch (err) {
      console.error('Failed to load analytics:', err);
      setError('Failed to load analytics data. Please check the backend.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStats();
  }, []);

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amount);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 text-orange-500 animate-spin" />
      </div>
    );
  }

  const totalUsers = stats?.totalUsers ?? 0;
  const activeUsers = stats?.activeUsers ?? 0;
  const totalRevenue = stats?.totalRevenue ?? 0;
  const activeSubscriptions = stats?.activeSubscriptions ?? 0;
  const securityScore = stats?.securityScore ?? 0;
  const inactiveUsers = totalUsers - activeUsers;
  const churnRate = totalUsers > 0 ? ((inactiveUsers / totalUsers) * 100).toFixed(1) : '0.0';
  const activePercent = totalUsers > 0 ? ((activeUsers / totalUsers) * 100).toFixed(0) : '0';

  return (
    <>
      <header className="mb-10">
        <h2 className="text-[40px] font-extrabold text-on-surface font-headline-md tracking-tight">Platform Analytics</h2>
        <p className="text-lg text-gray-500 mt-2 font-medium">Real-time metrics derived from your platform data.</p>
      </header>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700 flex items-center gap-3">
          <AlertTriangle className="w-5 h-5 shrink-0" />
          {error}
        </div>
      )}

      {/* KPI Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-gutter mb-stack-lg">
        <div className="glass-card p-6 rounded-2xl shadow-sm border border-gray-100 relative overflow-hidden">
          <div className="flex justify-between items-start mb-4 relative z-10">
            <div>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Total Revenue</p>
              <h3 className="text-2xl font-headline-sm font-bold mt-1 text-on-surface">{formatCurrency(totalRevenue)}</h3>
            </div>
            <div className="w-10 h-10 rounded-full bg-green-50 flex items-center justify-center text-green-600">
              <Banknote className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-center gap-2 text-sm relative z-10">
            <span className="text-green-500 font-bold flex items-center">
              <ArrowUpRight className="w-[14px] h-[14px]" /> {activeSubscriptions}
            </span>
            <span className="text-gray-400">active subscriptions</span>
          </div>
          <svg className="absolute bottom-0 left-0 w-full h-12 text-green-100 opacity-50" preserveAspectRatio="none" viewBox="0 0 100 30">
            <path d="M0 30 L10 20 L30 25 L50 10 L70 15 L90 5 L100 0 L100 30 Z" fill="currentColor"/>
          </svg>
        </div>

        <div className="glass-card p-6 rounded-2xl shadow-sm border border-gray-100 relative overflow-hidden">
          <div className="flex justify-between items-start mb-4 relative z-10">
            <div>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Active Users</p>
              <h3 className="text-2xl font-headline-sm font-bold mt-1 text-on-surface">{activeUsers.toLocaleString()}</h3>
            </div>
            <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-600">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-center gap-2 text-sm relative z-10">
            <span className="text-green-500 font-bold flex items-center">
              <ArrowUpRight className="w-[14px] h-[14px]" /> {activePercent}%
            </span>
            <span className="text-gray-400">of total users</span>
          </div>
        </div>

        <div className="glass-card p-6 rounded-2xl shadow-sm border border-gray-100 relative overflow-hidden">
          <div className="flex justify-between items-start mb-4 relative z-10">
            <div>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Total Users</p>
              <h3 className="text-2xl font-headline-sm font-bold mt-1 text-on-surface">{totalUsers.toLocaleString()}</h3>
            </div>
            <div className="w-10 h-10 rounded-full bg-orange-50 flex items-center justify-center text-orange-600">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-center gap-2 text-sm relative z-10">
            <span className="text-blue-500 font-bold flex items-center">
              <ArrowUpRight className="w-[14px] h-[14px]" /> {securityScore}%
            </span>
            <span className="text-gray-400">security score</span>
          </div>
        </div>

        <div className="sun-gradient p-6 rounded-2xl shadow-glow text-white relative overflow-hidden">
          <div className="flex justify-between items-start mb-4 relative z-10">
            <div>
              <p className="text-xs font-bold text-orange-100 uppercase tracking-widest">Churn Rate</p>
              <h3 className="text-2xl font-headline-sm font-bold mt-1">{churnRate}%</h3>
            </div>
            <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
              <UserMinus className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-center gap-2 text-sm relative z-10">
            <span className="text-orange-100 opacity-80">{inactiveUsers} inactive user{inactiveUsers !== 1 ? 's' : ''}</span>
          </div>
          <PieChart className="absolute -right-4 -bottom-4 w-[100px] h-[100px] text-white/10 pointer-events-none" />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-gutter mb-stack-lg">
        {/* Main Chart Area */}
        <div className="lg:col-span-2 glass-card p-8 rounded-[2rem] shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-8">
            <h3 className="font-headline-sm text-xl font-bold text-on-surface">Platform Overview</h3>
            <div className="flex bg-gray-50 p-1 rounded-xl">
              <button className="px-4 py-1.5 rounded-lg text-xs font-bold bg-white shadow-sm text-orange-600 transition-colors">Overview</button>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-6">
            <div className="p-6 bg-gradient-to-br from-orange-50 to-amber-50 rounded-2xl border border-orange-100">
              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Active Subscriptions</p>
              <p className="text-3xl font-bold text-orange-600">{activeSubscriptions}</p>
              <p className="text-sm text-gray-500 mt-2">Paying customers</p>
            </div>
            <div className="p-6 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl border border-blue-100">
              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Security Score</p>
              <p className="text-3xl font-bold text-blue-600">{securityScore}%</p>
              <div className="w-full h-2 bg-blue-100 rounded-full mt-3">
                <div className="h-full bg-blue-500 rounded-full transition-all" style={{ width: `${securityScore}%` }}></div>
              </div>
            </div>
            <div className="p-6 bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl border border-green-100">
              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Revenue</p>
              <p className="text-3xl font-bold text-green-600">{formatCurrency(totalRevenue)}</p>
              <p className="text-sm text-gray-500 mt-2">Total captured</p>
            </div>
            <div className="p-6 bg-gradient-to-br from-purple-50 to-violet-50 rounded-2xl border border-purple-100">
              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">User Retention</p>
              <p className="text-3xl font-bold text-purple-600">{activePercent}%</p>
              <p className="text-sm text-gray-500 mt-2">Active / Total</p>
            </div>
          </div>
        </div>

        {/* Subscription Breakdown */}
        <div className="glass-card p-8 rounded-[2rem] shadow-sm border border-gray-100 flex flex-col">
          <h3 className="font-headline-sm text-xl font-bold text-on-surface mb-8">User Breakdown</h3>
          
          <div className="flex-1 flex flex-col justify-center">
            <div className="space-y-6">
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="font-bold text-gray-700">Active Users</span>
                  <span className="font-bold">{activePercent}%</span>
                </div>
                <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden">
                  <div className="h-full bg-green-500 rounded-full transition-all" style={{ width: `${activePercent}%` }}></div>
                </div>
              </div>
              
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="font-bold text-gray-700">Subscribed Users</span>
                  <span className="font-bold text-orange-600">{totalUsers > 0 ? ((activeSubscriptions / totalUsers) * 100).toFixed(0) : 0}%</span>
                </div>
                <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden">
                  <div className="h-full bg-orange-500 rounded-full transition-all" style={{ width: `${totalUsers > 0 ? ((activeSubscriptions / totalUsers) * 100) : 0}%` }}></div>
                </div>
              </div>
              
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="font-bold text-gray-700">Inactive Users</span>
                  <span className="font-bold text-red-600">{churnRate}%</span>
                </div>
                <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden">
                  <div className="h-full bg-red-400 rounded-full transition-all" style={{ width: `${churnRate}%` }}></div>
                </div>
              </div>
            </div>
            
            <div className="mt-10 p-5 bg-orange-50 rounded-xl border border-orange-100">
              <div className="flex gap-3">
                <LineChart className="text-orange-500 w-5 h-5 shrink-0" />
                <p className="text-sm text-orange-800 font-medium">
                  All data is sourced from your live database. No mock data is used.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
