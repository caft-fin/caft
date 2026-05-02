'use client';

import { useEffect, useState, useCallback } from 'react';
import { useStore } from '@/store/useStore';
import { api, type AdminUserItem, ApiError } from '@/lib/apiClient';
import {
  UserPlus, TrendingUp, Timer, ShieldCheck, ChevronDown, MoreVertical,
  ChevronLeft, ChevronRight, Loader2, X, Shield
} from 'lucide-react';

export default function AdminManagementPage() {
  const isSuperAdmin = useStore(state => state.isSuperAdmin);
  const [users, setUsers] = useState<AdminUserItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [meta, setMeta] = useState({ total: 0, page: 1, totalPages: 1 });
  const [roleFilter, setRoleFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [search, setSearch] = useState('');

  // Modals
  const [showCreateUser, setShowCreateUser] = useState(false);
  const [showCreateAdmin, setShowCreateAdmin] = useState(false);
  const [formData, setFormData] = useState({ email: '', name: '', phone: '', password: '' });
  const [formError, setFormError] = useState('');
  const [formLoading, setFormLoading] = useState(false);

  const loadUsers = useCallback(async (page = 1) => {
    try {
      setLoading(true);
      const params = new URLSearchParams({ page: String(page), limit: '10' });
      if (search) params.set('search', search);
      if (statusFilter) params.set('status', statusFilter);
      const res = await api.admin.users(params.toString());
      setUsers(res.data);
      setMeta({ total: res.meta.total, page: res.meta.page, totalPages: res.meta.totalPages });
    } catch (err) {
      console.error('Failed to load users:', err);
    } finally {
      setLoading(false);
    }
  }, [search, statusFilter]);

  useEffect(() => { loadUsers(); }, [loadUsers]);

  const handleCreateUser = async () => {
    setFormError('');
    setFormLoading(true);
    try {
      await api.admin.createUser({ email: formData.email, name: formData.name, phone: formData.phone || undefined });
      setShowCreateUser(false);
      setFormData({ email: '', name: '', phone: '', password: '' });
      loadUsers(meta.page);
    } catch (err) {
      setFormError(err instanceof ApiError ? err.message : 'Failed to create user');
    } finally {
      setFormLoading(false);
    }
  };

  const handleCreateAdmin = async () => {
    setFormError('');
    setFormLoading(true);
    try {
      await api.admin.createAdmin({ email: formData.email, name: formData.name, password: formData.password });
      setShowCreateAdmin(false);
      setFormData({ email: '', name: '', phone: '', password: '' });
      loadUsers(meta.page);
    } catch (err) {
      setFormError(err instanceof ApiError ? err.message : 'Failed to create admin');
    } finally {
      setFormLoading(false);
    }
  };

  const handleDeactivate = async (id: string) => {
    if (!confirm('Deactivate this user?')) return;
    try {
      await api.admin.deleteUser(id);
      loadUsers(meta.page);
    } catch (err) {
      alert(err instanceof ApiError ? err.message : 'Failed to deactivate');
    }
  };

  return (
    <>
      {/* Hero Header Section */}
      <section className="mt-8 mb-10 flex flex-col md:flex-row md:items-end justify-between gap-gutter">
        <div>
          <h2 className="font-headline-md text-[40px] text-on-surface tracking-tight">User Management</h2>
          <p className="text-body-lg text-gray-500 mt-2">Control access levels and monitor team activity across the organization.</p>
        </div>
        <div className="flex gap-3">
          {isSuperAdmin && (
            <button
              onClick={() => { setShowCreateAdmin(true); setFormError(''); }}
              className="bg-purple-600 text-white px-6 py-4 rounded-2xl font-button flex items-center gap-2 shadow-lg hover:-translate-y-1 transition-all active:scale-95"
            >
              <Shield className="w-5 h-5" />
              Create Admin
            </button>
          )}
          <button
            onClick={() => { setShowCreateUser(true); setFormError(''); }}
            className="sun-gradient text-white px-8 py-4 rounded-2xl font-button flex items-center gap-2 shadow-[0_20px_40px_rgba(140,80,0,0.2)] hover:-translate-y-1 transition-all active:scale-95"
          >
            <UserPlus className="w-6 h-6" />
            Create New User
          </button>
        </div>
      </section>

      {/* Stats Overview */}
      <section className="grid grid-cols-1 md:grid-cols-4 gap-gutter mb-stack-lg">
        <div className="glass-card p-8 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
          <p className="text-label-md text-gray-400 uppercase tracking-widest text-[11px]">Total Users</p>
          <h3 className="text-4xl font-headline-md text-on-surface mt-2">{meta.total.toLocaleString()}</h3>
          <div className="mt-4 flex items-center gap-1.5 text-green-600 text-sm font-bold">
            <TrendingUp className="w-4 h-4" />
            From database
          </div>
        </div>

        <div className="glass-card p-8 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
          <p className="text-label-md text-gray-400 uppercase tracking-widest text-[11px]">Active Now</p>
          <h3 className="text-4xl font-headline-md text-on-surface mt-2">
            {users.filter(u => u.isActive).length}
          </h3>
        </div>

        <div className="glass-card p-8 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
          <p className="text-label-md text-gray-400 uppercase tracking-widest text-[11px]">Pending Review</p>
          <h3 className="text-4xl font-headline-md text-on-surface mt-2">
            {users.filter(u => !u.kycVerified).length}
          </h3>
          <div className="mt-4 flex items-center gap-1.5 text-orange-500 text-sm font-bold">
            <Timer className="w-4 h-4" />
            KYC pending
          </div>
        </div>

        <div className="sun-gradient p-8 rounded-3xl shadow-[0_20px_50px_rgba(140,80,0,0.15)] text-white relative overflow-hidden">
          <p className="text-label-md text-orange-100 uppercase tracking-widest text-[11px] relative z-10">Security Health</p>
          <h3 className="text-4xl font-headline-md mt-2 relative z-10">Excellent</h3>
          <div className="mt-5 h-2 bg-white/20 rounded-full overflow-hidden relative z-10">
            <div className="h-full bg-white rounded-full w-[94%]"></div>
          </div>
          <ShieldCheck className="absolute -right-4 -bottom-4 text-white/10 w-40 h-40 pointer-events-none" />
        </div>
      </section>

      {/* Search & Filters */}
      <section className="bg-white rounded-[32px] shadow-[0_10px_40px_rgba(0,0,0,0.02)] border border-gray-50 overflow-hidden">
        <div className="p-8 border-b border-gray-50 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <input
              className="bg-gray-50 border-none rounded-xl px-5 py-3 text-sm font-medium text-gray-700 focus:ring-2 focus:ring-orange-500/20 focus:bg-white transition-all outline-none w-64"
              placeholder="Search users..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && loadUsers(1)}
            />
            <div className="relative">
              <select
                className="appearance-none bg-gray-50 border-none rounded-xl pl-5 pr-12 py-3 text-sm font-bold text-gray-700 focus:ring-2 focus:ring-orange-500/20 focus:bg-white transition-all cursor-pointer outline-none"
                value={statusFilter}
                onChange={e => setStatusFilter(e.target.value)}
              >
                <option value="">All Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
              <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none w-5 h-5" />
            </div>
          </div>
          <div className="text-sm text-gray-400 font-medium">
            Showing <span className="text-on-surface font-bold">{users.length}</span> of <span className="text-on-surface font-bold">{meta.total.toLocaleString()}</span> users
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 text-orange-500 animate-spin" />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50/30 text-[11px] text-gray-400 uppercase tracking-[0.15em] font-black">
                  <th className="px-10 py-5">User Details</th>
                  <th className="px-8 py-5">Role</th>
                  <th className="px-8 py-5">Status</th>
                  <th className="px-8 py-5">Plan</th>
                  <th className="px-10 py-5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {users.map(user => {
                  const initials = user.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
                  const planName = user.subscriptions?.[0]?.plan?.name ?? 'Free';
                  return (
                    <tr key={user.id} className="hover:bg-orange-50/20 transition-colors group">
                      <td className="px-10 py-6">
                        <div className="flex items-center gap-4">
                          <div className="w-11 h-11 rounded-full flex items-center justify-center font-black ring-2 ring-white shadow-sm bg-orange-100 text-orange-700">
                            {initials}
                          </div>
                          <div>
                            <p className="font-bold text-on-surface text-base">
                              {user.name}
                              {user.isSuperAdmin && <span className="ml-2 text-xs text-purple-600 font-bold">SUPERADMIN</span>}
                            </p>
                            <p className="text-sm text-gray-400">{user.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <span className={`px-3 py-1 rounded-lg text-[11px] font-black uppercase tracking-wider ${user.role === 'ADMIN' ? 'bg-purple-50 text-purple-600' : 'bg-blue-50 text-blue-600'}`}>
                          {user.role}
                        </span>
                      </td>
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-2.5">
                          <div className={`w-2.5 h-2.5 rounded-full ${user.isActive ? 'bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.4)]' : 'bg-gray-300'}`}></div>
                          <span className="text-sm font-bold text-gray-700">{user.isActive ? 'Active' : 'Inactive'}</span>
                        </div>
                      </td>
                      <td className="px-8 py-6 text-sm text-gray-500">{planName}</td>
                      <td className="px-10 py-6 text-right">
                        <button
                          onClick={() => handleDeactivate(user.id)}
                          disabled={user.isSuperAdmin}
                          className="p-2.5 text-gray-300 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                          title={user.isSuperAdmin ? 'Cannot deactivate Superadmin' : 'Deactivate user'}
                        >
                          <MoreVertical className="w-6 h-6" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        <div className="p-8 bg-gray-50/30 flex items-center justify-between">
          <button
            onClick={() => loadUsers(meta.page - 1)}
            disabled={meta.page <= 1}
            className="flex items-center gap-2 text-sm font-bold text-gray-400 hover:text-orange-600 disabled:opacity-30 transition-colors"
          >
            <ChevronLeft className="w-5 h-5" /> Previous
          </button>
          <span className="text-sm text-gray-500">Page {meta.page} of {meta.totalPages}</span>
          <button
            onClick={() => loadUsers(meta.page + 1)}
            disabled={meta.page >= meta.totalPages}
            className="flex items-center gap-2 text-sm font-bold text-gray-400 hover:text-orange-600 disabled:opacity-30 transition-colors"
          >
            Next <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </section>

      {/* Create User Modal */}
      {showCreateUser && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-8 w-full max-w-md shadow-2xl">
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-headline-sm text-headline-sm">Create New User</h3>
              <button onClick={() => setShowCreateUser(false)} className="text-gray-400 hover:text-gray-600"><X className="w-5 h-5" /></button>
            </div>
            {formError && <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">{formError}</div>}
            <div className="space-y-4">
              <div>
                <label className="text-sm font-bold text-gray-600 block mb-1">Full Name *</label>
                <input className="w-full bg-gray-50 border-none rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-orange-500/30" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} />
              </div>
              <div>
                <label className="text-sm font-bold text-gray-600 block mb-1">Email *</label>
                <input type="email" className="w-full bg-gray-50 border-none rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-orange-500/30" value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} />
              </div>
              <div>
                <label className="text-sm font-bold text-gray-600 block mb-1">Phone</label>
                <input className="w-full bg-gray-50 border-none rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-orange-500/30" value={formData.phone} onChange={e => setFormData({ ...formData, phone: e.target.value })} />
              </div>
              <button onClick={handleCreateUser} disabled={formLoading} className="w-full sun-gradient text-white py-3 rounded-xl font-button disabled:opacity-60 flex items-center justify-center gap-2">
                {formLoading ? <><Loader2 className="w-5 h-5 animate-spin" /> Creating...</> : 'Create User'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create Admin Modal (Superadmin Only) */}
      {showCreateAdmin && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-8 w-full max-w-md shadow-2xl border-2 border-purple-100">
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-headline-sm text-headline-sm flex items-center gap-2">
                <Shield className="w-5 h-5 text-purple-600" />
                Create Admin Account
              </h3>
              <button onClick={() => setShowCreateAdmin(false)} className="text-gray-400 hover:text-gray-600"><X className="w-5 h-5" /></button>
            </div>
            <div className="mb-4 p-3 bg-purple-50 rounded-lg text-xs text-purple-700 font-medium">
              Only you (Superadmin) can create admin accounts. This admin will NOT be able to create other admins.
            </div>
            {formError && <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">{formError}</div>}
            <div className="space-y-4">
              <div>
                <label className="text-sm font-bold text-gray-600 block mb-1">Full Name *</label>
                <input className="w-full bg-gray-50 border-none rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-purple-500/30" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} />
              </div>
              <div>
                <label className="text-sm font-bold text-gray-600 block mb-1">Email *</label>
                <input type="email" className="w-full bg-gray-50 border-none rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-purple-500/30" value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} />
              </div>
              <div>
                <label className="text-sm font-bold text-gray-600 block mb-1">Password * (min. 8 characters)</label>
                <input type="password" className="w-full bg-gray-50 border-none rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-purple-500/30" value={formData.password} onChange={e => setFormData({ ...formData, password: e.target.value })} />
              </div>
              <button onClick={handleCreateAdmin} disabled={formLoading} className="w-full bg-purple-600 text-white py-3 rounded-xl font-button disabled:opacity-60 flex items-center justify-center gap-2 hover:bg-purple-700 transition-colors">
                {formLoading ? <><Loader2 className="w-5 h-5 animate-spin" /> Creating...</> : 'Create Admin'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
