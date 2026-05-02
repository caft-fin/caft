'use client';

import { useStore } from '@/store/useStore';
import {
  UserCircle2, Lock, Vibrate, Fingerprint,
  Bell, Landmark, CirclePlus, Star, Trash2, KeyRound
} from 'lucide-react';

export default function UserSettingsPage() {
  const user = useStore((state) => state.user);

  return (
    <div className="p-stack-lg max-w-container-max mx-auto px-6 md:px-8">
      {/* Page Header */}
      <header className="mb-stack-md pt-4">
        <h1 className="font-display-lg text-on-surface mb-2">Settings</h1>
        <p className="font-body-lg text-gray-500">Manage your financial identity and security preferences.</p>
      </header>

      <div className="grid grid-cols-12 gap-gutter">
        {/* Account Information (8 cols) */}
        <section className="col-span-12 lg:col-span-8">
          <div className="glass-card rounded-xl p-stack-md shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-headline-sm flex items-center gap-2">
                <UserCircle2 className="w-6 h-6 text-primary-container" />
                Account Information
              </h2>
              <button className="text-primary font-button px-4 py-2 rounded-lg border border-outline-variant hover:bg-orange-50/50 transition-all">
                Edit Profile
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-stack-md">
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Full Name</label>
                <p className="font-body-md text-on-surface">{user?.name ?? 'User'}</p>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Email Address</label>
                <p className="font-body-md text-on-surface">{user?.email ?? 'aditya.v@caftfinancial.com'}</p>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Phone Number</label>
                <p className="font-body-md text-on-surface">+91 98765 43210</p>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Account Type</label>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                  {user?.membershipLevel ?? 'Premium Solaris'}
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* Plan Upgrade Card (4 cols) */}
        <section className="col-span-12 lg:col-span-4">
          <div className="bg-gradient-to-br from-primary-container to-orange-600 rounded-xl p-stack-md text-white shadow-xl flex flex-col justify-between h-full relative overflow-hidden">
            <div className="relative z-10">
              <h3 className="font-headline-sm mb-2">Upgrade to Solaris Elite</h3>
              <p className="text-white/80 text-sm mb-6">Unlock higher transaction limits and dedicated wealth managers.</p>
              <div className="flex items-baseline gap-1 mb-8">
                <span className="text-3xl font-bold">₹4,999</span>
                <span className="text-white/60">/year</span>
              </div>
            </div>
            <button className="bg-white text-orange-600 font-button py-3 rounded-lg shadow-lg relative z-10 active:scale-95 transition-transform">
              View Benefits
            </button>
            <Star className="absolute -right-4 -bottom-4 w-28 h-28 text-white/10 fill-white/10" />
          </div>
        </section>

        {/* Security & Privacy (7 cols) */}
        <section className="col-span-12 md:col-span-6 lg:col-span-7">
          <div className="glass-card rounded-xl p-stack-md shadow-sm h-full">
            <h2 className="font-headline-sm flex items-center gap-2 mb-6">
              <Lock className="w-6 h-6 text-primary-container" />
              Security &amp; Privacy
            </h2>
            <div className="space-y-6">
              {/* Change Password */}
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-100">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-primary-container shadow-sm">
                    <KeyRound className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="font-label-md">Login Password</p>
                    <p className="text-xs text-gray-500">Last changed 4 months ago</p>
                  </div>
                </div>
                <button className="text-primary font-button text-sm hover:underline">Update</button>
              </div>
              {/* 2FA */}
              <div className="flex items-center justify-between p-4">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-orange-50 flex items-center justify-center text-primary-container">
                    <Vibrate className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="font-label-md">Two-Factor Authentication</p>
                    <p className="text-xs text-gray-500">Secure your account with OTP</p>
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input defaultChecked className="sr-only peer" type="checkbox" />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-container"></div>
                </label>
              </div>
              {/* Biometric */}
              <div className="flex items-center justify-between p-4">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-orange-50 flex items-center justify-center text-primary-container">
                    <Fingerprint className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="font-label-md">Biometric Login</p>
                    <p className="text-xs text-gray-500">FaceID or TouchID</p>
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input className="sr-only peer" type="checkbox" />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-container"></div>
                </label>
              </div>
            </div>
          </div>
        </section>

        {/* Linked Accounts (5 cols) */}
        <section className="col-span-12 md:col-span-6 lg:col-span-5">
          <div className="glass-card rounded-xl p-stack-md shadow-sm h-full">
            <h2 className="font-headline-sm flex items-center gap-2 mb-6">
              <Landmark className="w-6 h-6 text-primary-container" />
              Linked Accounts
            </h2>
            <div className="space-y-4">
              {[
                { abbr: 'HDFC', bg: 'bg-blue-600', name: 'HDFC Savings', last4: '4421' },
                { abbr: 'ICICI', bg: 'bg-red-600', name: 'ICICI Corporate', last4: '8902' },
              ].map((bank) => (
                <div key={bank.abbr} className="p-4 rounded-xl border border-gray-100 flex items-center justify-between hover:border-primary-container/30 transition-all cursor-pointer bg-white">
                  <div className="flex items-center gap-3">
                    <div className={`w-12 h-8 rounded flex items-center justify-center text-[10px] text-white font-bold italic tracking-tighter ${bank.bg}`}>
                      {bank.abbr}
                    </div>
                    <div>
                      <p className="font-label-md">{bank.name}</p>
                      <p className="text-xs text-gray-500">•••• {bank.last4}</p>
                    </div>
                  </div>
                  <span className="text-gray-400 text-lg">›</span>
                </div>
              ))}
              <button className="w-full py-4 border-2 border-dashed border-gray-200 rounded-xl text-gray-400 font-button flex items-center justify-center gap-2 hover:border-primary-container/50 hover:text-primary transition-all">
                <CirclePlus className="w-5 h-5" />
                Add New Account
              </button>
            </div>
          </div>
        </section>

        {/* Notifications (full width) */}
        <section className="col-span-12">
          <div className="glass-card rounded-xl p-stack-md shadow-sm">
            <h2 className="font-headline-sm flex items-center gap-2 mb-8">
              <Bell className="w-6 h-6 text-primary-container" />
              Notification Preferences
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-gutter">
              <div className="space-y-6">
                <h3 className="font-label-md text-gray-400 uppercase tracking-widest text-xs">Email Alerts</h3>
                {[
                  { label: 'Monthly Statements', checked: true },
                  { label: 'Transaction Alerts (> ₹10,000)', checked: true },
                  { label: 'Promotional Offers', checked: false },
                ].map((item) => (
                  <div key={item.label} className="flex items-center justify-between">
                    <span className="text-on-surface">{item.label}</span>
                    <input defaultChecked={item.checked} className="rounded border-gray-300 text-primary-container focus:ring-primary-container" type="checkbox" />
                  </div>
                ))}
              </div>
              <div className="space-y-6">
                <h3 className="font-label-md text-gray-400 uppercase tracking-widest text-xs">Push Notifications</h3>
                {[
                  { label: 'Immediate Payment Alerts', checked: true },
                  { label: 'Security Logins', checked: true },
                  { label: 'Bill Reminders', checked: true },
                ].map((item) => (
                  <div key={item.label} className="flex items-center justify-between">
                    <span className="text-on-surface">{item.label}</span>
                    <input defaultChecked={item.checked} className="rounded border-gray-300 text-primary-container focus:ring-primary-container" type="checkbox" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Danger Zone (full width) */}
        <section className="col-span-12 mb-8">
          <div className="p-stack-md rounded-xl border border-red-100 bg-red-50/30 flex items-center justify-between gap-4">
            <div>
              <h3 className="font-headline-sm text-red-700 flex items-center gap-2">
                <Trash2 className="w-5 h-5" />
                Deactivate Account
              </h3>
              <p className="text-sm text-red-600/70">Permanently remove your account and all associated data.</p>
            </div>
            <button className="shrink-0 bg-red-100 text-red-700 px-6 py-2 rounded-lg font-button hover:bg-red-200 transition-colors">
              Deactivate
            </button>
          </div>
        </section>
      </div>
    </div>
  );
}
