'use client';

import { Edit2, Mail, MapPin, Shield, MonitorSmartphone, IdCard, KeyRound, UploadCloud, ChevronRight } from 'lucide-react';
import Image from 'next/image';

export default function AdminProfilePage() {
  return (
    <>
      {/* Breadcrumbs / Page Header */}
      <div className="flex items-center justify-between mb-stack-lg">
        <div>
          <h1 className="font-headline-sm text-headline-sm text-on-surface">Account Settings</h1>
          <p className="text-sm text-gray-500 mt-1">Manage your professional profile and security preferences.</p>
        </div>
      </div>

      {/* Hero Bento Grid Section */}
      <section className="grid grid-cols-12 gap-gutter mb-stack-lg">
        {/* Profile Header Card */}
        <div className="col-span-12 lg:col-span-8 glass-card rounded-xl p-8 flex flex-col md:flex-row items-center gap-8 shadow-[0_10px_20px_rgba(0,0,0,0.04)]">
          <div className="relative group">
            <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-white shadow-lg ring-2 ring-orange-100">
              <Image 
                alt="Arjun Mehta" 
                className="w-full h-full object-cover" 
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuBvccidtrIbGKmuuIdjAa4zzkolToQqNiQMbnr07olOOUZiWHWkhkDcWwjPAoGYi9nJS056fEnVrX6BWTmE925erL9AEA7EAto4OQyGoFEek3QhebmcciRuWV-TKwZLf1uuatXW-znRqTDdrQrfvPF7pzNEGuL264mgMYJBRexRmAvqJ36zg7GgukEUr-npKf8pJKtr1v-dyRh8HL24d1Lp7IcOB4udUs4AkPTkScls-KqQTJwX3FyM1hfr9Gwh1dLpIPQtNROvqT8"
                width={128}
                height={128}
              />
            </div>
            <button className="absolute bottom-1 right-1 sun-gradient text-white p-2 rounded-full shadow-lg hover:scale-110 active:scale-95 transition-all duration-200">
              <Edit2 className="w-4 h-4" />
            </button>
          </div>
          <div className="text-center md:text-left flex-1">
            <div className="flex flex-col md:flex-row md:items-center gap-3 mb-2">
              <h2 className="font-headline-md text-headline-md text-on-surface">Arjun Mehta</h2>
              <span className="inline-flex items-center px-3 py-1 rounded-full bg-orange-100 text-orange-700 text-xs font-bold uppercase tracking-wider">Administrator</span>
            </div>
            <p className="font-body-lg text-body-lg text-gray-500 mb-6 max-w-lg leading-relaxed">
              Overseeing the financial ecosystem of CAFT Finance. Responsible for security protocols and high-level system configurations.
            </p>
            <div className="flex flex-wrap gap-4">
              <div className="flex items-center gap-2 text-gray-600 bg-gray-50 px-4 py-2 rounded-lg">
                <Mail className="text-orange-500 w-5 h-5" />
                <span className="text-sm font-medium">arjun.mehta@caft.financial</span>
              </div>
              <div className="flex items-center gap-2 text-gray-600 bg-gray-50 px-4 py-2 rounded-lg">
                <MapPin className="text-orange-500 w-5 h-5" />
                <span className="text-sm font-medium">Mumbai, IN</span>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Quick View */}
        <div className="col-span-12 lg:col-span-4 space-y-gutter">
          <div className="sun-gradient rounded-xl p-8 text-white shadow-xl relative overflow-hidden h-[180px]">
            <div className="relative z-10">
              <p className="font-label-md text-label-md opacity-80 mb-2">Account Security</p>
              <h3 className="font-headline-sm text-headline-sm mb-4">Very High</h3>
              <div className="h-2 w-full bg-white/20 rounded-full mb-2">
                <div className="h-full w-[94%] bg-white rounded-full"></div>
              </div>
              <p className="text-xs opacity-90">Last security audit: 2 hours ago</p>
            </div>
            <Shield className="absolute -right-4 -bottom-4 text-white/10 w-32 h-32 pointer-events-none" />
          </div>
          <div className="glass-card rounded-xl p-6 shadow-sm border border-gray-100 h-[calc(100%-204px)] min-h-[140px]">
            <div className="flex items-center justify-between mb-4">
              <h4 className="font-button text-button text-on-surface">Active Sessions</h4>
              <MonitorSmartphone className="text-orange-500 w-6 h-6" />
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-500">MacBook Pro 16"</span>
                <span className="font-semibold text-on-surface">Current</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-500">iPhone 15 Pro</span>
                <span className="text-green-500 font-medium">Active</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Settings Form Sections */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-gutter mb-stack-lg">
        {/* Profile Edit Form */}
        <div className="glass-card rounded-xl p-8 shadow-sm">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 rounded-lg bg-orange-50 flex items-center justify-center">
              <IdCard className="text-orange-600 w-6 h-6" />
            </div>
            <div>
              <h3 className="font-headline-sm text-headline-sm text-on-surface">Personal Information</h3>
              <p className="text-sm text-gray-500">Update your primary account details</p>
            </div>
          </div>
          
          <form className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700">First Name</label>
                <input className="w-full px-4 py-3 rounded-lg border-none bg-gray-50 focus:ring-2 focus:ring-orange-500 focus:bg-white transition-all outline-none" type="text" defaultValue="Arjun" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700">Last Name</label>
                <input className="w-full px-4 py-3 rounded-lg border-none bg-gray-50 focus:ring-2 focus:ring-orange-500 focus:bg-white transition-all outline-none" type="text" defaultValue="Mehta" />
              </div>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700">Email Address</label>
              <input className="w-full px-4 py-3 rounded-lg border-none bg-gray-50 focus:ring-2 focus:ring-orange-500 focus:bg-white transition-all outline-none" type="email" defaultValue="arjun.mehta@caft.financial" />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700">Role</label>
              <input className="w-full px-4 py-3 rounded-lg border-none bg-gray-100 text-gray-500 cursor-not-allowed outline-none" readOnly type="text" defaultValue="Senior System Administrator" />
            </div>
            
            <div className="pt-4 flex justify-end gap-4">
              <button className="px-6 py-3 rounded-lg font-button text-button text-gray-500 hover:bg-gray-50 transition-colors" type="button">Discard</button>
              <button className="px-8 py-3 rounded-lg font-button text-button text-white sun-gradient shadow-lg hover:scale-[1.02] active:scale-95 transition-all" type="button">Save Changes</button>
            </div>
          </form>
        </div>

        {/* Password and Security Section */}
        <div className="space-y-gutter">
          {/* Change Password Card */}
          <div className="glass-card rounded-xl p-8 shadow-sm">
            <div className="flex items-center gap-3 mb-8">
              <div className="w-10 h-10 rounded-lg bg-orange-50 flex items-center justify-center">
                <KeyRound className="text-orange-600 w-6 h-6" />
              </div>
              <div>
                <h3 className="font-headline-sm text-headline-sm text-on-surface">Security</h3>
                <p className="text-sm text-gray-500">Manage your password and auth methods</p>
              </div>
            </div>
            
            <form className="space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700">Current Password</label>
                <input className="w-full px-4 py-3 rounded-lg border-none bg-gray-50 focus:ring-2 focus:ring-orange-500 focus:bg-white transition-all outline-none" placeholder="••••••••••••" type="password" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700">New Password</label>
                <input className="w-full px-4 py-3 rounded-lg border-none bg-gray-50 focus:ring-2 focus:ring-orange-500 focus:bg-white transition-all outline-none" placeholder="Enter new password" type="password" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700">Confirm New Password</label>
                <input className="w-full px-4 py-3 rounded-lg border-none bg-gray-50 focus:ring-2 focus:ring-orange-500 focus:bg-white transition-all outline-none" placeholder="Confirm new password" type="password" />
              </div>
              <button className="w-full py-3 rounded-lg font-button text-button text-orange-600 border-2 border-orange-200 hover:bg-orange-50 transition-all active:scale-95" type="button">
                Update Password
              </button>
            </form>
          </div>
          
          {/* Profile Picture Upload Area */}
          <div className="glass-card rounded-xl p-8 shadow-sm border-dashed border-2 border-orange-200 bg-orange-50/30">
            <div className="flex flex-col items-center text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-white flex items-center justify-center shadow-sm">
                <UploadCloud className="text-orange-500 w-8 h-8" />
              </div>
              <div>
                <h4 className="font-button text-button text-on-surface">Change Profile Picture</h4>
                <p className="text-sm text-gray-500 mt-1">Drag and drop or click to browse</p>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-400">JPG, PNG or GIF. Max size of 800K</span>
              </div>
              <input className="hidden" id="file-upload" type="file" />
              <label className="cursor-pointer px-6 py-2 bg-white border border-gray-200 rounded-full text-sm font-semibold text-gray-600 hover:border-orange-300 transition-colors" htmlFor="file-upload">
                Choose File
              </label>
            </div>
          </div>
        </div>
      </section>

      {/* Activity Log */}
      <section className="glass-card rounded-xl p-8 shadow-sm">
        <div className="flex items-center justify-between mb-8">
          <h3 className="font-headline-sm text-headline-sm text-on-surface">Recent Activity</h3>
          <button className="text-orange-600 text-sm font-bold flex items-center gap-1 hover:underline">
            View Full Logs <ChevronRight className="w-4 h-4" />
          </button>
        </div>
        <div className="space-y-6">
          <div className="flex gap-4">
            <div className="mt-1 w-2 h-2 rounded-full bg-orange-500 flex-shrink-0"></div>
            <div className="flex-1">
              <p className="text-sm font-bold text-on-surface">System configuration updated</p>
              <p className="text-xs text-gray-500">Updated merchant API keys and routing tables.</p>
              <span className="text-[10px] uppercase font-bold text-gray-400 mt-2 block">Today at 14:24</span>
            </div>
          </div>
          <div className="flex gap-4">
            <div className="mt-1 w-2 h-2 rounded-full bg-gray-300 flex-shrink-0"></div>
            <div className="flex-1">
              <p className="text-sm font-bold text-on-surface">Password changed successfully</p>
              <p className="text-xs text-gray-500">Security credentials updated following quarterly policy.</p>
              <span className="text-[10px] uppercase font-bold text-gray-400 mt-2 block">Oct 24, 2023</span>
            </div>
          </div>
          <div className="flex gap-4">
            <div className="mt-1 w-2 h-2 rounded-full bg-gray-300 flex-shrink-0"></div>
            <div className="flex-1">
              <p className="text-sm font-bold text-on-surface">New login detected from New Delhi</p>
              <p className="text-xs text-gray-500">System verified login via secondary hardware token.</p>
              <span className="text-[10px] uppercase font-bold text-gray-400 mt-2 block">Oct 21, 2023</span>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
