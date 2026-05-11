'use client';

import { useEffect, useState } from 'react';
import { useStore } from '@/store/useStore';
import { api, type AdminStatsOverview, type AdminUserItem, type RevenueAnalytics, type PlanItem, ApiError } from '@/lib/apiClient';
import { 
  TrendingUp, Users, Shield, Filter, Download, Edit2, Trash2, 
  CreditCard, Activity, Landmark, CircleDollarSign, AlertTriangle, 
  Loader2, Skull, ArrowRight, Package, Zap, ShoppingBag
} from 'lucide-react';
import Link from 'next/link';

export default function AdminDashboardPage() {
  const isSuperAdmin = useStore(state => state.isSuperAdmin);
  const [stats, setStats] = useState<AdminStatsOverview | null>(null);
  const [recentUsers, setRecentUsers] = useState<AdminUserItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [revenueBreakdown, setRevenueBreakdown] = useState<{
    subscriptions: number;
    digitalProducts: number;
    physicalProducts: number;
    services: number;
  } | null>(null);

  const loadData = async (isInitial = false) => {
    try {
      if (!isInitial) setLoading(true);
      setError('');
      const [statsRes, usersRes] = await Promise.all([
        api.admin.statsOverview(),
        api.admin.users('page=1&limit=5&sortBy=createdAt&sortOrder=desc'),
      ]);
      setStats(statsRes.data);
      setRecentUsers(usersRes.data);

      // Fetch revenue breakdown by category
      try {
        const [revenueRes, plansRes] = await Promise.all([
          api.admin.analytics.revenue(),
          api.admin.plans.all(),
        ]);
        const revenueData = revenueRes.data as RevenueAnalytics;
        const allPlans = plansRes.data as PlanItem[];
        
        // Build a planId -> itemCategory map
        const planCategoryMap = new Map<string, string>();
        allPlans.forEach(p => planCategoryMap.set(p.id, p.itemCategory));

        // Calculate revenue by category from revenueByPlan
        const categoryRevenue = { subscriptions: 0, digitalProducts: 0, physicalProducts: 0, services: 0 };
        if (revenueData.revenueByPlan) {
          revenueData.revenueByPlan.forEach(rp => {
            const category = planCategoryMap.get(rp.planId) || 'SUBSCRIPTION';
            switch (category) {
              case 'SUBSCRIPTION': categoryRevenue.subscriptions += rp.revenue; break;
              case 'DIGITAL_PRODUCT': categoryRevenue.digitalProducts += rp.revenue; break;
              case 'PHYSICAL_PRODUCT': categoryRevenue.physicalProducts += rp.revenue; break;
              case 'SERVICE': categoryRevenue.services += rp.revenue; break;
            }
          });
        }
        setRevenueBreakdown(categoryRevenue);
      } catch {
        // Non-critical — the main stats already loaded
      }
    } catch (err) {
      console.error('Failed to load admin stats:', err);
      setError('Failed to load data from the server. Please check that the backend is running.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData(true);
  }, []);

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amount);

  const handleEditUser = (userId: string) => {
    // Navigate to management page with user selected
    window.location.assign(`/admin/management`);
  };

  const handleDeleteUser = async (userId: string, userName: string, isSuperAdminUser: boolean) => {
    if (isSuperAdminUser) {
      alert('Cannot deactivate the Superadmin account.');
      return;
    }
    if (!confirm(`Deactivate user "${userName}"?`)) return;
    try {
      await api.admin.deleteUser(userId);
      loadData();
    } catch (err) {
      alert(err instanceof ApiError ? err.message : 'Failed to deactivate user');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 text-orange-500 animate-spin" />
      </div>
    );
  }

  // Revenue is stored in paise in the DB — convert to rupees for display
  const totalRevenueRupees = (stats?.totalRevenue ?? 0) / 100;

  return (
    <div className="space-y-stack-lg">
      {/* Welcome Section */}
      <section className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="font-display-lg text-[40px] text-on-background tracking-tight">System Overview</h1>
          <p className="font-body-lg text-body-lg text-on-surface-variant mt-1">Real-time control panel for CAFT Financial operations.</p>
        </div>
        <div className="flex gap-3">
          <div className="glass-card px-4 py-2 rounded-xl flex items-center gap-3 shadow-sm border border-gray-100">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
            <span className="text-label-md font-semibold text-gray-600">DATABASE ACTIVE</span>
          </div>
        </div>
      </section>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700 flex items-center gap-3">
          <AlertTriangle className="w-5 h-5 shrink-0" />
          {error}
        </div>
      )}

      {/* Bento Grid for Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-gutter">
        {/* Total Revenue Card with Category Breakdown */}
        <div className="md:col-span-2 glass-card rounded-2xl p-6 shadow-sm overflow-hidden relative group">
          <div className="absolute -right-10 -top-10 w-40 h-40 bg-orange-100/50 rounded-full group-hover:scale-110 transition-transform duration-700"></div>
          <h3 className="font-headline-sm text-headline-sm text-on-background mb-4">Total Revenue</h3>
          <div className="flex items-baseline gap-2">
            <span className="text-display-lg font-bold text-orange-600">{formatCurrency(totalRevenueRupees)}</span>
          </div>
          <p className="text-on-surface-variant text-body-md mt-2">
            From {stats?.activeSubscriptions ?? 0} active subscriptions
          </p>
          {/* Revenue Breakdown by Category */}
          {revenueBreakdown && (
            <div className="mt-4 pt-4 border-t border-gray-100 grid grid-cols-2 gap-3 relative z-10">
              <div className="flex items-center gap-2">
                <CreditCard className="w-3.5 h-3.5 text-blue-500" />
                <div>
                  <p className="text-[10px] text-gray-400 uppercase font-semibold tracking-wide">Subscriptions</p>
                  <p className="text-sm font-bold text-gray-800">{formatCurrency(revenueBreakdown.subscriptions / 100)}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Package className="w-3.5 h-3.5 text-purple-500" />
                <div>
                  <p className="text-[10px] text-gray-400 uppercase font-semibold tracking-wide">Digital Products</p>
                  <p className="text-sm font-bold text-gray-800">{formatCurrency(revenueBreakdown.digitalProducts / 100)}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <ShoppingBag className="w-3.5 h-3.5 text-green-500" />
                <div>
                  <p className="text-[10px] text-gray-400 uppercase font-semibold tracking-wide">Physical Products</p>
                  <p className="text-sm font-bold text-gray-800">{formatCurrency(revenueBreakdown.physicalProducts / 100)}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Zap className="w-3.5 h-3.5 text-orange-500" />
                <div>
                  <p className="text-[10px] text-gray-400 uppercase font-semibold tracking-wide">Services</p>
                  <p className="text-sm font-bold text-gray-800">{formatCurrency(revenueBreakdown.services / 100)}</p>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="glass-card rounded-2xl p-6 shadow-sm">
          <Users className="text-orange-500 mb-2 w-6 h-6" />
          <h4 className="text-label-md text-on-surface-variant">Active Users</h4>
          <p className="text-headline-md font-bold mt-1">{stats?.activeUsers?.toLocaleString() ?? '—'}</p>
          <div className="w-full bg-gray-100 h-1.5 rounded-full mt-4">
            <div
              className="bg-orange-500 h-1.5 rounded-full transition-all"
              style={{ width: stats ? `${Math.min(100, (stats.activeUsers / Math.max(stats.totalUsers, 1)) * 100)}%` : '0%' }}
            ></div>
          </div>
        </div>

        <div className="glass-card rounded-2xl p-6 shadow-sm">
          <Shield className="text-orange-500 mb-2 w-6 h-6" />
          <h4 className="text-label-md text-on-surface-variant">Security Score</h4>
          <p className="text-headline-md font-bold mt-1">{stats?.securityScore ?? 0}%</p>
          <p className="text-xs text-green-500 mt-2">Optimal Health</p>
        </div>
      </div>

      {/* User Management Table */}
      <section className="glass-card rounded-2xl shadow-sm overflow-hidden">
        <div className="px-6 py-5 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
          <h3 className="font-headline-sm text-headline-sm text-on-background">Recent Users</h3>
          <div className="flex gap-2">
            <button className="bg-white border border-gray-200 px-4 py-2 rounded-lg text-sm font-semibold hover:bg-gray-50 flex items-center gap-2">
              <Filter className="w-4 h-4" /> Filter
            </button>
            <button className="bg-white border border-gray-200 px-4 py-2 rounded-lg text-sm font-semibold hover:bg-gray-50 flex items-center gap-2">
              <Download className="w-4 h-4" /> Export
            </button>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-gray-50/30 text-label-md text-on-surface-variant uppercase tracking-wider">
                <th className="px-6 py-4 font-semibold">User</th>
                <th className="px-6 py-4 font-semibold">Status</th>
                <th className="px-6 py-4 font-semibold">Plan</th>
                <th className="px-6 py-4 font-semibold">Role</th>
                <th className="px-6 py-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {recentUsers.map(user => {
                const initials = user.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
                const planName = user.subscriptions?.[0]?.plan?.name ?? 'Free';
                return (
                  <tr key={user.id} className="hover:bg-orange-50/30 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full flex items-center justify-center font-bold bg-orange-100 text-orange-700">
                          {initials}
                        </div>
                        <div>
                          <p className="font-semibold text-on-background">{user.name}</p>
                          <p className="text-xs text-on-surface-variant">{user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${user.isActive ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                        {user.isActive ? 'ACTIVE' : 'INACTIVE'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-on-surface-variant">{planName}</td>
                    <td className="px-6 py-4">
                      <span className={`text-xs font-bold ${user.role === 'ADMIN' ? 'text-purple-600' : 'text-gray-500'}`}>
                        {user.role}{user.isSuperAdmin ? ' ★' : ''}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right flex justify-end gap-2">
                      <button
                        onClick={() => handleEditUser(user.id)}
                        className="p-2 hover:text-orange-500 hover:bg-orange-50 rounded-lg transition-colors"
                        title="View/Edit user"
                      >
                        <Edit2 className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => handleDeleteUser(user.id, user.name, user.isSuperAdmin)}
                        disabled={user.isSuperAdmin}
                        className="p-2 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                        title={user.isSuperAdmin ? 'Cannot deactivate Superadmin' : 'Deactivate user'}
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <div className="px-6 py-4 border-t border-gray-100 flex justify-between items-center text-sm text-on-surface-variant">
          <span>Showing {recentUsers.length} of {stats?.totalUsers?.toLocaleString() ?? '—'} users</span>
          <a href="/admin/management" className="text-orange-600 font-bold hover:underline">View All →</a>
        </div>
      </section>

      {/* Subscription Editor & Investment Tracking */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-gutter">
        {/* Subscription Plan Editor */}
        <section className="glass-card rounded-2xl p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-6">
            <CreditCard className="text-orange-500 w-6 h-6" />
            <h3 className="font-headline-sm text-headline-sm text-on-background">Subscription Overview</h3>
          </div>
          <div className="space-y-6">
            <div className="p-4 bg-orange-50 rounded-xl border border-orange-100">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-semibold text-orange-800">Active Subscriptions</span>
                <span className="text-2xl font-bold text-orange-600">{stats?.activeSubscriptions ?? 0}</span>
              </div>
              <p className="text-xs text-orange-700 leading-relaxed">
                Manage plans, pricing, and features from the Plans administration page.
              </p>
            </div>

            <Link href="/admin/subscriptions" className="w-full bg-orange-600 text-white font-button py-3 rounded-xl hover:bg-orange-700 transition-colors shadow-lg shadow-orange-500/10 block text-center">
              Manage Subscription Plans
            </Link>
          </div>
        </section>

        {/* Investment Tracking */}
        <section className="glass-card rounded-2xl p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-6">
            <Activity className="text-orange-500 w-6 h-6" />
            <h3 className="font-headline-sm text-headline-sm text-on-background">Platform Metrics</h3>
          </div>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 sun-gradient rounded-lg flex items-center justify-center text-white">
                  <TrendingUp className="w-6 h-6" />
                </div>
                <div>
                  <p className="font-semibold">Total Users</p>
                  <p className="text-xs text-on-surface-variant">Registered accounts</p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-bold text-orange-600">{stats?.totalUsers?.toLocaleString() ?? '—'}</p>
              </div>
            </div>

            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center text-white">
                  <Landmark className="w-6 h-6" />
                </div>
                <div>
                  <p className="font-semibold">Active Users</p>
                  <p className="text-xs text-on-surface-variant">Currently active</p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-bold text-on-background">{stats?.activeUsers?.toLocaleString() ?? '—'}</p>
              </div>
            </div>

            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-purple-500 rounded-lg flex items-center justify-center text-white">
                  <CircleDollarSign className="w-6 h-6" />
                </div>
                <div>
                  <p className="font-semibold">Revenue</p>
                  <p className="text-xs text-on-surface-variant">Total captured</p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-bold text-on-background">{formatCurrency(totalRevenueRupees)}</p>
              </div>
            </div>
          </div>
        </section>
      </div>

      {/* Danger Zone — Superadmin Only */}
      {isSuperAdmin && (
        <section className="border-2 border-red-200 bg-gradient-to-br from-red-50/50 to-red-100/30 rounded-2xl p-8 shadow-sm">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-red-100 text-red-600 rounded-2xl flex items-center justify-center shadow-inner">
                <Skull className="w-7 h-7" />
              </div>
              <div>
                <h3 className="text-headline-sm font-bold text-red-900">Danger Zone</h3>
                <p className="text-body-md text-red-700">Direct database access. View all tables, inspect records, and permanently delete data.</p>
              </div>
            </div>
            <Link
              href="/admin/danger-zone"
              className="shrink-0 bg-red-600 text-white px-8 py-4 rounded-2xl font-button flex items-center gap-2 shadow-lg shadow-red-500/25 hover:-translate-y-0.5 transition-all active:scale-95"
            >
              <Skull className="w-5 h-5" />
              Enter Danger Zone
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </section>
      )}
    </div>
  );
}
