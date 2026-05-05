'use client';

import { useEffect, useState, useMemo } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useStore } from '@/store/useStore';
import { api } from '@/lib/apiClient';
import type { LinkedAccount, NotificationPrefs, SubscriptionInfo } from '@/lib/apiClient';
import {
  UserCircle2, Bell, Landmark, Sparkles, Award, Flame, Gem, Crown, Star, Rocket,
  Trash2, Mail, RefreshCw, Plus, Phone, Check, X, ShieldCheck, Zap, Heart
} from 'lucide-react';

// Badge pool — each user gets a deterministic subset based on their ID hash
const BADGE_POOL = [
  { label: 'Early Adopter', icon: Rocket, color: 'bg-violet-100 text-violet-700 border-violet-200' },
  { label: 'Verified Investor', icon: ShieldCheck, color: 'bg-emerald-100 text-emerald-700 border-emerald-200' },
  { label: 'Rising Star', icon: Star, color: 'bg-amber-100 text-amber-700 border-amber-200' },
  { label: 'Power User', icon: Zap, color: 'bg-blue-100 text-blue-700 border-blue-200' },
  { label: 'Trailblazer', icon: Flame, color: 'bg-orange-100 text-orange-700 border-orange-200' },
  { label: 'Premium Member', icon: Gem, color: 'bg-pink-100 text-pink-700 border-pink-200' },
  { label: 'Top Contributor', icon: Award, color: 'bg-cyan-100 text-cyan-700 border-cyan-200' },
  { label: 'Elite Trader', icon: Crown, color: 'bg-yellow-100 text-yellow-700 border-yellow-200' },
  { label: 'Community Star', icon: Heart, color: 'bg-rose-100 text-rose-700 border-rose-200' },
  { label: 'Innovation Pioneer', icon: Sparkles, color: 'bg-indigo-100 text-indigo-700 border-indigo-200' },
];

function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) - hash) + str.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

export default function UserSettingsPage() {
  const user = useStore((state) => state.user);
  const login = useStore((state) => state.login);

  const [linkedAccounts, setLinkedAccounts] = useState<LinkedAccount[]>([]);
  const [notifications, setNotifications] = useState<NotificationPrefs | null>(null);
  const [activeSub, setActiveSub] = useState<SubscriptionInfo | null>(null);
  const [loading, setLoading] = useState(true);

  // Phone editing
  const [editingPhone, setEditingPhone] = useState(false);
  const [phoneInput, setPhoneInput] = useState(user?.phone || '');
  const [phoneSaving, setPhoneSaving] = useState(false);

  // Add bank modal
  const [showBankModal, setShowBankModal] = useState(false);
  const [bankForm, setBankForm] = useState({
    bankName: '', bankAbbr: '', accountName: '', last4: '', accountType: 'savings', colorClass: 'bg-gray-800'
  });
  const [bankSaving, setBankSaving] = useState(false);

  useEffect(() => {
    async function fetchSettings() {
      try {
        const [accountsRes, notifRes, subRes] = await Promise.all([
          api.user.linkedAccounts().catch(() => ({ data: [] })),
          api.user.notifications().catch(() => ({ data: null })),
          api.subscriptions.active().catch(() => ({ data: null }))
        ]);
        setLinkedAccounts(accountsRes.data as LinkedAccount[]);
        setNotifications(notifRes.data as NotificationPrefs | null);
        setActiveSub(subRes.data as SubscriptionInfo | null);
      } catch (err) {
        console.error('Failed to load settings', err);
      } finally {
        setLoading(false);
      }
    }
    fetchSettings();
  }, []);

  const handleToggleNotification = async (key: keyof NotificationPrefs) => {
    if (!notifications) return;
    const updated = { ...notifications, [key]: !notifications[key] };
    setNotifications(updated);
    try {
      await api.user.updateNotifications({ [key]: updated[key] });
    } catch {
      // Revert on error
      setNotifications(notifications);
    }
  };

  const handleSavePhone = async () => {
    setPhoneSaving(true);
    try {
      const res = await api.user.update({ phone: phoneInput } as any);
      // Update Zustand store with new phone
      if (user) {
        login({ ...user, phone: (res.data as any)?.phone || phoneInput });
      }
      setEditingPhone(false);
    } catch (err) {
      console.error('Failed to save phone', err);
    } finally {
      setPhoneSaving(false);
    }
  };

  const handleAddBank = async (e: React.FormEvent) => {
    e.preventDefault();
    setBankSaving(true);
    try {
      await api.user.addLinkedAccount(bankForm);
      // Refresh accounts list
      const res = await api.user.linkedAccounts().catch(() => ({ data: [] }));
      setLinkedAccounts(res.data as LinkedAccount[]);
      setShowBankModal(false);
      setBankForm({ bankName: '', bankAbbr: '', accountName: '', last4: '', accountType: 'savings', colorClass: 'bg-gray-800' });
    } catch (err) {
      console.error('Failed to add bank', err);
    } finally {
      setBankSaving(false);
    }
  };

  const handleRemoveBank = async (id: string) => {
    try {
      await api.user.removeLinkedAccount(id);
      setLinkedAccounts(prev => prev.filter(a => a.id !== id));
    } catch (err) {
      console.error('Failed to remove bank', err);
    }
  };

  // Determine verification method
  const verifiedBy = user?.verifiedBy || 'OTP';

  // Assign exactly one badge randomly to the user, consistently based on ID hash
  const userBadge = useMemo(() => {
    const seed = hashString(user?.id || 'default');
    return BADGE_POOL[seed % BADGE_POOL.length];
  }, [user?.id]);

  const initials = user?.name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || '?';

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-8 w-full">
      {/* Page Header */}
      <header className="flex flex-col md:flex-row justify-between items-end gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Account Settings</h1>
          <p className="text-sm text-gray-500 max-w-2xl">
            Manage your personal identity, linked financial accounts, and security preferences.
          </p>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

        {/* Unified Profile & Details Card */}
        <section className="col-span-12">
          <div className="bg-white rounded-3xl border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-hidden">
            {/* Beautiful Gradient Banner */}
            <div className="h-40 bg-gradient-to-r from-rose-400 via-orange-400 to-amber-500 relative overflow-hidden">
              <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImEiIHBhdHRlcm5Vbml0cz0idXNlclNwYWNlT25Vc2UiIHdpZHRoPSIyMCIgaGVpZ2h0PSIyMCI+PGNpcmNsZSBjeD0iMTAiIGN5PSIxMCIgcj0iMS41IiBmaWxsPSJyZ2JhKDI1NSwyNTUsMjU1LDAuMSkiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjYSkiLz48L3N2Zz4=')] opacity-30" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
            </div>

            <div className="px-6 md:px-10 pb-10 relative">
              <div className="flex flex-col lg:flex-row gap-8 items-start lg:items-end -mt-16 mb-10">
                {/* Avatar */}
                <div className="relative flex-shrink-0 group">
                  {user?.avatarUrl ? (
                    <Image
                      src={user.avatarUrl}
                      alt={user.name || 'Profile'}
                      width={128}
                      height={128}
                      className="rounded-3xl ring-4 ring-white shadow-xl object-cover w-32 h-32 transition-transform duration-300 group-hover:scale-105"
                    />
                  ) : (
                    <div className="w-32 h-32 rounded-3xl ring-4 ring-white shadow-xl bg-gradient-to-br from-rose-400 to-orange-500 flex items-center justify-center transition-transform duration-300 group-hover:scale-105">
                      <span className="text-5xl font-black text-white drop-shadow-md">{initials}</span>
                    </div>
                  )}
                  <div className="absolute -bottom-2 -right-2 w-10 h-10 rounded-full bg-green-500 border-4 border-white flex items-center justify-center shadow-lg">
                    <Check className="w-5 h-5 text-white" />
                  </div>
                </div>

                {/* Identity & Badges */}
                <div className="flex-1 pb-2">
                  <div className="flex flex-wrap items-center gap-4 mb-2">
                    <h2 className="text-3xl font-black text-gray-900 tracking-tight">{user?.name || 'User'}</h2>
                    
                    {/* Random Assigned Badge */}
                    <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-bold shadow-sm ${userBadge.color}`}>
                      <userBadge.icon className="w-4 h-4" />
                      {userBadge.label}
                    </div>
                    
                    {/* Verification Status */}
                    <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-green-50/80 border border-green-100 text-green-700">
                      <ShieldCheck className="w-4 h-4" />
                      <span className="text-[11px] font-bold uppercase tracking-wide">Verified by {verifiedBy}</span>
                    </div>
                  </div>
                  <p className="text-base text-gray-500 font-medium">{user?.email}</p>
                </div>

                {/* Subscription Plan Area */}
                <div className="bg-gray-50/80 backdrop-blur-sm p-5 rounded-3xl border border-gray-100 w-full lg:w-auto min-w-[280px]">
                  {loading ? (
                    <div className="flex justify-center py-4"><RefreshCw className="w-6 h-6 animate-spin text-gray-400" /></div>
                  ) : activeSub ? (
                    <div className="flex flex-col">
                      <span className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 flex items-center gap-2">
                        <Crown className="w-4 h-4 text-orange-500" />
                        Active Plan
                      </span>
                      <div className="flex items-baseline gap-2 mb-1">
                        <h3 className="text-xl font-black text-gray-900">{activeSub.plan.name}</h3>
                        <span className="text-xs font-bold px-2 py-1 bg-green-100 text-green-700 rounded-lg uppercase">Active</span>
                      </div>
                      <p className="text-sm text-gray-500 font-medium">Billing Cycle: <span className="text-gray-900 capitalize">{activeSub.billingCycle.toLowerCase()}</span></p>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center lg:items-end text-center lg:text-right">
                       <span className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 w-full text-left">Current Plan</span>
                       <div className="text-gray-900 font-bold mb-4 flex items-center gap-2">
                         <span className="w-2 h-2 rounded-full bg-gray-300"></span>
                         No active subscription
                       </div>
                       <Link href="/pricing" className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-gray-900 text-white text-sm font-bold shadow-lg shadow-gray-900/20 hover:bg-gray-800 hover:shadow-xl hover:-translate-y-0.5 transition-all">
                         <Sparkles className="w-4 h-4 text-orange-400" />
                         Subscribe Now
                       </Link>
                    </div>
                  )}
                </div>
              </div>

              {/* Personal Details Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 bg-gray-50/50 p-6 md:p-8 rounded-3xl border border-gray-100/80">
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider flex items-center gap-2">
                    <UserCircle2 className="w-3.5 h-3.5" /> Full Name
                  </label>
                  <p className="text-base font-semibold text-gray-900">{user?.name || 'Not provided'}</p>
                </div>
                
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider flex items-center gap-2">
                    <Mail className="w-3.5 h-3.5" /> Email Address
                  </label>
                  <p className="text-base font-semibold text-gray-900">{user?.email || 'Not provided'}</p>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider flex items-center gap-2">
                    <Phone className="w-3.5 h-3.5" /> Phone Number
                  </label>
                  {editingPhone ? (
                    <div className="flex items-center gap-2 max-w-xs">
                      <input
                        type="tel"
                        value={phoneInput}
                        onChange={e => setPhoneInput(e.target.value)}
                        placeholder="+91 98765 43210"
                        className="flex-1 px-3 py-2 rounded-xl border border-gray-200 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-orange-200 focus:border-orange-400 bg-white shadow-sm transition-shadow"
                      />
                      <button onClick={handleSavePhone} disabled={phoneSaving}
                        className="p-2 rounded-xl bg-green-500 text-white hover:bg-green-600 transition-colors disabled:opacity-50 shadow-sm">
                        <Check className="w-4 h-4" />
                      </button>
                      <button onClick={() => { setEditingPhone(false); setPhoneInput(user?.phone || ''); }}
                        className="p-2 rounded-xl bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors shadow-sm">
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-3 group">
                      <p className="text-base font-semibold text-gray-900">{user?.phone || 'Not provided'}</p>
                      <button onClick={() => { setEditingPhone(true); setPhoneInput(user?.phone || ''); }}
                        className="p-1.5 rounded-lg bg-gray-100 text-gray-500 hover:bg-orange-50 hover:text-orange-600 transition-all opacity-0 lg:group-hover:opacity-100" title="Edit phone">
                        <Phone className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </section>



        {/* Linked Accounts (12 cols) */}
        <section className="col-span-12">
          <div className="bg-white rounded-2xl border border-gray-100 p-8 shadow-sm h-full flex flex-col">
            <h2 className="text-xl font-bold flex items-center gap-3 text-gray-900 mb-6">
              <Landmark className="w-6 h-6 text-orange-600" />
              Bank Accounts
            </h2>

            <div className="flex-1 space-y-4">
              {loading ? (
                <div className="flex justify-center py-8"><RefreshCw className="w-6 h-6 animate-spin text-gray-400" /></div>
              ) : linkedAccounts.length > 0 ? (
                linkedAccounts.map((bank) => (
                  <div key={bank.id} className="p-4 rounded-xl border border-gray-100 flex items-center justify-between hover:border-orange-200 hover:bg-orange-50/30 transition-all bg-white group">
                    <div className="flex items-center gap-4">
                      <div className={`w-14 h-10 rounded-lg flex items-center justify-center text-xs text-white font-black italic tracking-wider shadow-inner ${bank.colorClass || 'bg-gray-800'}`}>
                        {bank.bankAbbr}
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900 text-sm">{bank.bankName}</p>
                        <p className="text-xs text-gray-500 font-mono mt-0.5">•••• {bank.last4}</p>
                      </div>
                    </div>
                    <button onClick={() => handleRemoveBank(bank.id)} className="p-2 text-gray-400 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100" title="Remove Account">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 border-2 border-dashed border-gray-100 rounded-xl">
                  <p className="text-gray-500 text-sm">No accounts added yet.</p>
                </div>
              )}
            </div>

            <button onClick={() => setShowBankModal(true)}
              className="mt-4 w-full py-3.5 border-2 border-dashed border-gray-200 rounded-xl text-gray-600 font-semibold text-sm flex items-center justify-center gap-2 hover:border-orange-500 hover:text-orange-600 hover:bg-orange-50 transition-all">
              <Plus className="w-4 h-4" /> Add Bank Account
            </button>
          </div>
        </section>

        {/* Notifications (full width) */}
        <section className="col-span-12">
          <div className="bg-white rounded-2xl border border-gray-100 p-8 shadow-sm">
            <h2 className="text-xl font-bold flex items-center gap-3 text-gray-900 mb-8">
              <Bell className="w-6 h-6 text-orange-600" />
              Notification Preferences
            </h2>

            {loading ? (
              <div className="flex justify-center py-8"><RefreshCw className="w-6 h-6 animate-spin text-gray-400" /></div>
            ) : notifications ? (
              <div className="grid grid-cols-1 gap-12">
                <div className="space-y-6">
                  <div className="flex items-center gap-2 mb-2 text-gray-500 border-b border-gray-100 pb-3">
                    <Mail className="w-4 h-4" />
                    <h3 className="font-bold uppercase tracking-wider text-xs">Email Alerts</h3>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-sm font-semibold text-gray-900 block">Monthly Statements</span>
                      <span className="text-xs text-gray-500">Receive detailed monthly portfolio reports</span>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" checked={notifications.monthlyStatements} onChange={() => handleToggleNotification('monthlyStatements')} className="sr-only peer" />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-orange-500"></div>
                    </label>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-sm font-semibold text-gray-900 block">Promotional Offers</span>
                      <span className="text-xs text-gray-500">Updates on new plans and features</span>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" checked={notifications.promotionalOffers} onChange={() => handleToggleNotification('promotionalOffers')} className="sr-only peer" />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-orange-500"></div>
                    </label>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center text-gray-500 py-4 text-sm">Failed to load notification settings.</div>
            )}
          </div>
        </section>

      </div>

      {/* ── Add Bank Account Modal ── */}
      {showBankModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center">
          <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={() => setShowBankModal(false)} />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg p-8 animate-scale-up">
            <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-3">
              <Landmark className="w-5 h-5 text-orange-500" />
              Add Bank Account
            </h3>

            <form onSubmit={handleAddBank} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Bank Name *</label>
                  <input type="text" required value={bankForm.bankName} onChange={e => setBankForm(p => ({ ...p, bankName: e.target.value }))}
                    placeholder="e.g. HDFC Bank"
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-orange-200 focus:border-orange-400 text-sm" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Bank Abbreviation *</label>
                  <input type="text" required maxLength={6} value={bankForm.bankAbbr} onChange={e => setBankForm(p => ({ ...p, bankAbbr: e.target.value.toUpperCase() }))}
                    placeholder="e.g. HDFC"
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-orange-200 focus:border-orange-400 text-sm font-mono" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Account Holder Name *</label>
                <input type="text" required value={bankForm.accountName} onChange={e => setBankForm(p => ({ ...p, accountName: e.target.value }))}
                  placeholder="Full name as on bank account"
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-orange-200 focus:border-orange-400 text-sm" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Last 4 Digits *</label>
                  <input type="text" required maxLength={4} pattern="[0-9]{4}" value={bankForm.last4} onChange={e => setBankForm(p => ({ ...p, last4: e.target.value }))}
                    placeholder="1234"
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-orange-200 focus:border-orange-400 text-sm font-mono" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Account Type</label>
                  <select value={bankForm.accountType} onChange={e => setBankForm(p => ({ ...p, accountType: e.target.value }))}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-orange-200 focus:border-orange-400 bg-white cursor-pointer">
                    <option value="savings">Savings</option>
                    <option value="current">Current</option>
                    <option value="corporate">Corporate</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Brand Color</label>
                <div className="flex gap-2 flex-wrap">
                  {['bg-gray-800', 'bg-blue-700', 'bg-red-600', 'bg-green-700', 'bg-indigo-600', 'bg-orange-600', 'bg-purple-700', 'bg-teal-600'].map(c => (
                    <button type="button" key={c} onClick={() => setBankForm(p => ({ ...p, colorClass: c }))}
                      className={`w-8 h-8 rounded-lg ${c} transition-all ${bankForm.colorClass === c ? 'ring-2 ring-offset-2 ring-orange-400 scale-110' : 'opacity-60 hover:opacity-100'}`} />
                  ))}
                </div>
              </div>

              <div className="flex gap-3 pt-4 border-t border-gray-100">
                <button type="button" onClick={() => setShowBankModal(false)}
                  className="flex-1 py-3 rounded-xl border border-gray-200 text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-colors">
                  Cancel
                </button>
                <button type="submit" disabled={bankSaving}
                  className="flex-1 py-3 rounded-xl sun-gradient text-white text-sm font-bold shadow-lg hover:opacity-90 transition-all disabled:opacity-50">
                  {bankSaving ? 'Saving...' : 'Add Account'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
