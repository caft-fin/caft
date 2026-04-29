'use client';

import { useStore } from '@/store/useStore';
import Image from 'next/image';
import {
  Star, Edit, Share2, Lock, Smartphone, Fingerprint,
  ChevronRight, ShieldCheck
} from 'lucide-react';

export default function UserProfilePage() {
  const user = useStore((state) => state.user);

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto w-full">
      {/* Page Header */}
      <div className="mb-stack-lg text-center lg:text-left pt-4">
        <h1 className="font-display-lg text-display-lg text-on-surface mb-2">User Profile</h1>
        <p className="font-body-md text-on-surface-variant max-w-2xl">
          Manage your personal identity, tracking rewards, and secure your financial future.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-gutter">
        {/* Left Column */}
        <div className="lg:col-span-8 grid grid-cols-1 md:grid-cols-2 gap-gutter">
          {/* Personal Details */}
          <div className="glass-card rounded-xl p-stack-md md:col-span-2">
            <div className="flex items-center justify-between mb-stack-md">
              <h3 className="font-headline-sm text-headline-sm">Personal Details</h3>
              <button className="text-orange-600 font-button text-sm flex items-center hover:opacity-80 transition-opacity">
                <Edit className="w-4 h-4 mr-1" /> Edit
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-stack-md">
              <div className="space-y-1">
                <label className="font-label-md text-label-md text-on-surface-variant">Full Name</label>
                <p className="font-body-md text-body-md font-semibold">{user?.name ?? 'Aditya Sharma'}</p>
              </div>
              <div className="space-y-1">
                <label className="font-label-md text-label-md text-on-surface-variant">Email Address</label>
                <p className="font-body-md text-body-md font-semibold">{user?.email ?? 'aditya.v@caftfinancial.com'}</p>
              </div>
              <div className="space-y-1">
                <label className="font-label-md text-label-md text-on-surface-variant">Phone Number</label>
                <p className="font-body-md text-body-md font-semibold">+91 98765 43210</p>
              </div>
              <div className="space-y-1">
                <label className="font-label-md text-label-md text-on-surface-variant">Account Type</label>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                  {user?.membershipLevel ?? 'Premium Solaris'}
                </span>
              </div>
            </div>
          </div>

          {/* Referral Rewards — gradient card */}
          <div className="sun-gradient rounded-xl p-stack-md text-white shadow-xl shadow-orange-500/10">
            <div className="flex items-center mb-stack-sm">
              <Star className="w-5 h-5 fill-white mr-2" />
              <h3 className="font-headline-sm text-headline-sm">Referral Rewards</h3>
            </div>
            <div className="mt-4">
              <div className="text-4xl font-extrabold mb-1">₹4,250</div>
              <p className="text-white/80 text-sm">Total Earnings this year</p>
            </div>
            <div className="mt-stack-md pt-stack-md border-t border-white/20">
              <div className="flex justify-between text-sm">
                <span>Total Referrals</span>
                <span className="font-bold">12 Users</span>
              </div>
              <div className="w-full bg-white/20 h-2 rounded-full mt-2">
                <div className="bg-white h-full rounded-full" style={{ width: '75%' }}></div>
              </div>
              <p className="text-[10px] mt-2 text-white/70">3 more to unlock Gold tier bonus</p>
            </div>
          </div>

          {/* Invite Friends / Referral Code */}
          <div className="glass-card rounded-xl p-stack-md flex flex-col justify-between">
            <div>
              <h3 className="font-headline-sm text-headline-sm mb-1">Invite Friends</h3>
              <p className="text-sm text-on-surface-variant">Share your code and earn ₹250 per sign-up.</p>
            </div>
            <div className="mt-stack-md">
              <div className="bg-surface-container-low rounded-lg p-3 flex items-center justify-between border border-dashed border-orange-200">
                <span className="font-bold tracking-widest text-orange-600">CAFT_ADITYA77</span>
                <button className="sun-gradient text-white px-4 py-2 rounded-lg text-xs font-button flex items-center active:scale-95 transition-all">
                  <Share2 className="w-4 h-4 mr-2" /> Share
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div className="lg:col-span-4 space-y-gutter">
          {/* Security Settings */}
          <div className="glass-card rounded-xl overflow-hidden">
            <div className="p-stack-md border-b border-gray-100">
              <h3 className="font-headline-sm text-headline-sm">Security</h3>
            </div>
            <div className="divide-y divide-gray-100">
              {/* Change Password */}
              <div className="p-4 hover:bg-gray-50 transition-colors cursor-pointer flex items-center justify-between">
                <div className="flex items-center">
                  <div className="w-8 h-8 rounded bg-blue-50 flex items-center justify-center mr-3 text-blue-600">
                    <Lock className="w-4 h-4" />
                  </div>
                  <span className="text-sm font-medium">Change Password</span>
                </div>
                <ChevronRight className="w-4 h-4 text-gray-400" />
              </div>
              {/* 2FA */}
              <div className="p-4 hover:bg-gray-50 transition-colors cursor-pointer flex items-center justify-between">
                <div className="flex items-center">
                  <div className="w-8 h-8 rounded bg-green-50 flex items-center justify-center mr-3 text-green-600">
                    <Smartphone className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-sm font-medium block">Two-Factor Auth</span>
                    <p className="text-[10px] text-green-600">Enabled</p>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-gray-400" />
              </div>
              {/* Biometric */}
              <div className="p-4 hover:bg-gray-50 transition-colors flex items-center justify-between">
                <div className="flex items-center">
                  <div className="w-8 h-8 rounded bg-purple-50 flex items-center justify-center mr-3 text-purple-600">
                    <Fingerprint className="w-4 h-4" />
                  </div>
                  <span className="text-sm font-medium">Biometric Login</span>
                </div>
                {/* Toggle on */}
                <div className="w-10 h-5 bg-orange-500 rounded-full relative cursor-pointer">
                  <div className="absolute right-0.5 top-0.5 w-4 h-4 bg-white rounded-full shadow-sm"></div>
                </div>
              </div>
            </div>
          </div>

          {/* KYC Badge */}
          <div className="bg-surface-container rounded-xl p-stack-md border border-outline-variant relative overflow-hidden">
            <div className="relative z-10">
              <div className="flex items-center text-primary mb-2">
                <ShieldCheck className="w-4 h-4 mr-1 fill-primary/20" />
                <span className="text-xs font-bold uppercase tracking-wider">KYC Verified</span>
              </div>
              <h4 className="font-button text-on-surface">Digital Identity Secured</h4>
              <p className="text-xs text-on-surface-variant mt-1">Your profile is fully compliant with financial regulations.</p>
            </div>
            <div className="absolute -right-4 -bottom-4 opacity-5">
              <ShieldCheck className="w-24 h-24" />
            </div>
          </div>

          {/* Avatar Preview */}
          {user?.avatarUrl && (
            <div className="glass-card rounded-xl p-6 flex items-center gap-4">
              <Image
                src={user.avatarUrl}
                alt="Profile"
                width={64}
                height={64}
                className="w-16 h-16 rounded-full object-cover ring-4 ring-orange-50"
              />
              <div>
                <p className="font-bold text-sm">{user.name}</p>
                <p className="text-xs text-gray-500">{user.email}</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
