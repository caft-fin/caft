'use client';

import { useEffect, useState } from 'react';
import { useStore } from '@/store/useStore';
import { api } from '@/lib/apiClient';
import type { LinkedAccount, NotificationPrefs } from '@/lib/apiClient';
import {
  UserCircle2, Lock, Fingerprint, Bell, Landmark, 
  Trash2, KeyRound, ShieldCheck, Mail, Smartphone, RefreshCw, Plus
} from 'lucide-react';

export default function UserSettingsPage() {
  const user = useStore((state) => state.user);
  
  const [linkedAccounts, setLinkedAccounts] = useState<LinkedAccount[]>([]);
  const [notifications, setNotifications] = useState<NotificationPrefs | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchSettings() {
      try {
        const [accountsRes, notifRes] = await Promise.all([
          api.user.linkedAccounts().catch(() => ({ data: [] })),
          api.user.notifications().catch(() => ({ data: null }))
        ]);
        setLinkedAccounts(accountsRes.data as LinkedAccount[]);
        setNotifications(notifRes.data as NotificationPrefs | null);
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
        
        {/* Account Information (12 cols) */}
        <section className="col-span-12">
          <div className="bg-white rounded-2xl border border-gray-100 p-8 shadow-sm h-full flex flex-col">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-xl font-bold flex items-center gap-3 text-gray-900">
                <UserCircle2 className="w-6 h-6 text-orange-600" />
                Personal Information
              </h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8 flex-1">
              <div>
                <label className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-1">Full Name</label>
                <p className="text-base font-medium text-gray-900">{user?.name || 'Not provided'}</p>
              </div>
              <div>
                <label className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-1">Email Address</label>
                <p className="text-base font-medium text-gray-900">{user?.email || 'Not provided'}</p>
              </div>
              <div>
                <label className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-1">Phone Number</label>
                <p className="text-base font-medium text-gray-900">{user?.phone || 'Not provided'}</p>
              </div>
              <div>
                <label className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-1">Membership Status</label>
                <div className="mt-1">
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-gray-900 text-white shadow-sm">
                    {user?.membershipLevel || 'Standard'}
                  </span>
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
              Linked Bank Accounts
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
                    <button className="p-2 text-gray-400 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100" title="Remove Account">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 border-2 border-dashed border-gray-100 rounded-xl">
                  <p className="text-gray-500 text-sm">No accounts linked yet.</p>
                </div>
              )}
            </div>

            <button className="mt-4 w-full py-3.5 border-2 border-dashed border-gray-200 rounded-xl text-gray-600 font-semibold text-sm flex items-center justify-center gap-2 hover:border-orange-500 hover:text-orange-600 hover:bg-orange-50 transition-all">
              <Plus className="w-4 h-4" /> Link New Account
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
    </div>
  );
}
