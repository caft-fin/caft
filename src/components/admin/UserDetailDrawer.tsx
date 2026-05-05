'use client';

import { useEffect, useState } from 'react';
import { api, type AdminUserDetails } from '@/lib/apiClient';
import {
  X, Loader2, Mail, Phone, MapPin, Globe, Eye, ShieldCheck,
  CreditCard, IndianRupee, Calendar, Clock, User, Landmark, Hash
} from 'lucide-react';

interface Props {
  userId: string | null;
  onClose: () => void;
}

export default function UserDetailDrawer({ userId, onClose }: Props) {
  const [user, setUser] = useState<AdminUserDetails | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) return;
    setLoading(true);
    api.admin.userDetails(userId)
      .then(res => setUser(res.data as AdminUserDetails))
      .catch(err => console.error('Failed to load user details:', err))
      .finally(() => setLoading(false));
  }, [userId]);

  if (!userId) return null;

  const fmt = (d?: string) => d ? new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '—';
  const fmtFull = (d?: string) => d ? new Date(d).toLocaleString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '—';

  const statusColor = (s: string) => {
    const map: Record<string, string> = {
      CAPTURED: 'bg-green-100 text-green-700', AUTHORIZED: 'bg-blue-100 text-blue-700',
      FAILED: 'bg-red-100 text-red-700', CREATED: 'bg-yellow-100 text-yellow-700',
      ACTIVE: 'bg-green-100 text-green-700', CANCELLED: 'bg-red-100 text-red-700',
      EXPIRED: 'bg-gray-100 text-gray-600', HALTED: 'bg-orange-100 text-orange-700',
    };
    return map[s] || 'bg-gray-100 text-gray-600';
  };

  return (
    <div className="fixed inset-0 z-50 flex">
      <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={onClose} />
      <div className="relative ml-auto w-full max-w-2xl bg-white shadow-2xl overflow-y-auto animate-slide-in-right">
        {/* Header */}
        <div className="sticky top-0 bg-white/90 backdrop-blur-md z-10 p-6 border-b border-gray-100 flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-900">User Details</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-xl transition-colors"><X className="w-5 h-5" /></button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-32"><Loader2 className="w-8 h-8 animate-spin text-orange-500" /></div>
        ) : user ? (
          <div className="p-6 space-y-6">
            {/* Profile Card */}
            <div className="bg-gradient-to-br from-orange-50 to-amber-50 rounded-2xl p-6">
              <div className="flex items-start gap-4">
                <div className="w-16 h-16 rounded-2xl bg-orange-200 flex items-center justify-center text-2xl font-black text-orange-700">
                  {user.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-gray-900">{user.name}</h3>
                  <div className="flex items-center gap-2 mt-1">
                    <span className={`px-2 py-0.5 rounded-md text-[10px] font-black uppercase ${user.role === 'ADMIN' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'}`}>{user.role}</span>
                    <span className={`px-2 py-0.5 rounded-md text-[10px] font-black uppercase ${user.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>{user.isActive ? 'Active' : 'Inactive'}</span>
                    <span className="px-2 py-0.5 rounded-md text-[10px] font-black uppercase bg-indigo-100 text-indigo-700 flex items-center gap-1"><ShieldCheck className="w-3 h-3" />{user.verifiedBy}</span>
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 mt-5">
                <InfoRow icon={<Mail className="w-3.5 h-3.5" />} label="Email" value={user.email} />
                <InfoRow icon={<Phone className="w-3.5 h-3.5" />} label="Phone" value={user.phone || '—'} />
                <InfoRow icon={<Calendar className="w-3.5 h-3.5" />} label="Joined" value={fmt(user.createdAt)} />
                <InfoRow icon={<Clock className="w-3.5 h-3.5" />} label="Last Login" value={fmtFull(user.lastLoginAt)} />
              </div>
            </div>

            {/* Revenue & Stats */}
            <div className="grid grid-cols-3 gap-3">
              <StatCard label="Total Revenue" value={user.totalRevenueFormatted} icon={<IndianRupee className="w-4 h-4" />} accent="orange" />
              <StatCard label="Total Visits" value={String(user.totalVisits)} icon={<Eye className="w-4 h-4" />} accent="blue" />
              <StatCard label="Referrals" value={String(user._count.referrals)} icon={<User className="w-4 h-4" />} accent="green" />
            </div>

            {/* Location Data */}
            <Section title="Location & Device" icon={<MapPin className="w-4 h-4" />}>
              <div className="grid grid-cols-2 gap-3">
                <InfoRow icon={<Globe className="w-3.5 h-3.5" />} label="IP Address" value={user.lastIpAddress || '—'} />
                <InfoRow icon={<MapPin className="w-3.5 h-3.5" />} label="City" value={user.lastCity || '—'} />
                <InfoRow icon={<MapPin className="w-3.5 h-3.5" />} label="State" value={user.lastState || '—'} />
                <InfoRow icon={<Hash className="w-3.5 h-3.5" />} label="Pincode" value={user.lastPincode || '—'} />
                <InfoRow icon={<Globe className="w-3.5 h-3.5" />} label="Country" value={user.lastCountry || '—'} />
                <InfoRow icon={<Hash className="w-3.5 h-3.5" />} label="Referral Code" value={user.referralCode || '—'} />
              </div>
            </Section>

            {/* Subscriptions */}
            <Section title={`Subscriptions (${user.subscriptions.length})`} icon={<CreditCard className="w-4 h-4" />}>
              {user.subscriptions.length > 0 ? (
                <div className="space-y-2">
                  {user.subscriptions.map(sub => (
                    <div key={sub.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                      <div>
                        <p className="font-semibold text-sm text-gray-900">{sub.plan.name}</p>
                        <p className="text-xs text-gray-500">{sub.billingCycle} • Started {fmt(sub.createdAt)}</p>
                      </div>
                      <span className={`px-2 py-0.5 rounded-md text-[10px] font-black uppercase ${statusColor(sub.status)}`}>{sub.status}</span>
                    </div>
                  ))}
                </div>
              ) : <p className="text-sm text-gray-400 text-center py-4">No subscriptions</p>}
            </Section>

            {/* Payments */}
            <Section title={`Payments (${user.payments.length})`} icon={<IndianRupee className="w-4 h-4" />}>
              {user.payments.length > 0 ? (
                <div className="space-y-2 max-h-72 overflow-y-auto">
                  {user.payments.map(p => (
                    <div key={p.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                      <div>
                        <p className="font-semibold text-sm text-gray-900">₹{(p.amount / 100).toLocaleString('en-IN')}</p>
                        <p className="text-xs text-gray-500">{p.method || 'N/A'} • {fmtFull(p.createdAt)}</p>
                        {p.failureReason && <p className="text-xs text-red-500 mt-0.5">{p.failureReason}</p>}
                      </div>
                      <span className={`px-2 py-0.5 rounded-md text-[10px] font-black uppercase ${statusColor(p.status)}`}>{p.status}</span>
                    </div>
                  ))}
                </div>
              ) : <p className="text-sm text-gray-400 text-center py-4">No payments recorded</p>}
            </Section>

            {/* Bank Accounts */}
            <Section title={`Bank Accounts (${user.linkedAccounts.length})`} icon={<Landmark className="w-4 h-4" />}>
              {user.linkedAccounts.length > 0 ? (
                <div className="space-y-2">
                  {user.linkedAccounts.map(a => (
                    <div key={a.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                      <div className={`w-10 h-7 rounded-md flex items-center justify-center text-[9px] text-white font-black ${a.colorClass || 'bg-gray-800'}`}>{a.bankAbbr}</div>
                      <div>
                        <p className="font-semibold text-sm text-gray-900">{a.bankName}</p>
                        <p className="text-xs text-gray-500 font-mono">•••• {a.last4}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : <p className="text-sm text-gray-400 text-center py-4">No bank accounts</p>}
            </Section>
          </div>
        ) : (
          <div className="text-center py-20 text-gray-500">User not found</div>
        )}
      </div>
    </div>
  );
}

function InfoRow({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-start gap-2">
      <span className="text-gray-400 mt-0.5">{icon}</span>
      <div>
        <p className="text-[10px] font-bold text-gray-400 uppercase">{label}</p>
        <p className="text-sm font-medium text-gray-800 break-all">{value}</p>
      </div>
    </div>
  );
}

function StatCard({ label, value, icon, accent }: { label: string; value: string; icon: React.ReactNode; accent: string }) {
  const colors: Record<string, string> = {
    orange: 'bg-orange-50 text-orange-600 border-orange-100',
    blue: 'bg-blue-50 text-blue-600 border-blue-100',
    green: 'bg-green-50 text-green-600 border-green-100',
  };
  return (
    <div className={`rounded-xl border p-4 ${colors[accent]}`}>
      <div className="flex items-center gap-1.5 mb-2 opacity-70">{icon}<span className="text-[10px] font-bold uppercase">{label}</span></div>
      <p className="text-2xl font-black">{value}</p>
    </div>
  );
}

function Section({ title, icon, children }: { title: string; icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <div>
      <h4 className="flex items-center gap-2 text-sm font-bold text-gray-700 mb-3">{icon}{title}</h4>
      {children}
    </div>
  );
}
