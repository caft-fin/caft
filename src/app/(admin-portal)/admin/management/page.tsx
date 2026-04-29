'use client';

import { useStore } from '@/store/useStore';
import { UserPlus, TrendingUp, Timer, ShieldCheck, ChevronDown, MoreVertical, ChevronLeft, ChevronRight } from 'lucide-react';
import Image from 'next/image';

export default function AdminManagementPage() {
  const adminUsers = useStore(state => state.adminUsers);

  return (
    <>
      {/* Hero Header Section */}
      <section className="mt-8 mb-10 flex flex-col md:flex-row md:items-end justify-between gap-gutter">
        <div>
          <h2 className="font-headline-md text-[40px] text-on-surface tracking-tight">User Management</h2>
          <p className="text-body-lg text-gray-500 mt-2">Control access levels and monitor team activity across the organization.</p>
        </div>
        <button className="sun-gradient text-white px-8 py-4 rounded-2xl font-button flex items-center gap-2 shadow-[0_20px_40px_rgba(140,80,0,0.2)] hover:-translate-y-1 transition-all active:scale-95">
          <UserPlus className="w-6 h-6" />
          Create New User
        </button>
      </section>

      {/* Stats Overview (Bento Style) */}
      <section className="grid grid-cols-1 md:grid-cols-4 gap-gutter mb-stack-lg">
        <div className="glass-card p-8 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
          <p className="text-label-md text-gray-400 uppercase tracking-widest text-[11px]">Total Users</p>
          <h3 className="text-4xl font-headline-md text-on-surface mt-2">1,284</h3>
          <div className="mt-4 flex items-center gap-1.5 text-green-600 text-sm font-bold">
            <TrendingUp className="w-4 h-4" />
            12% from last month
          </div>
        </div>
        
        <div className="glass-card p-8 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
          <p className="text-label-md text-gray-400 uppercase tracking-widest text-[11px]">Active Now</p>
          <h3 className="text-4xl font-headline-md text-on-surface mt-2">42</h3>
          <div className="mt-4 flex items-center gap-2">
            <div className="flex -space-x-2">
              <Image alt="Active user 1" className="w-7 h-7 rounded-full border-2 border-white object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuAo5iDReTpAfyJzo6R_FnHjv2-AQfiBXr8onMeMsyYExuwb-5tbZbJX4SxfMc72RaV2MlPtkIyNIG9VTO1wb7L8FNGb5U5LanWVkM1-KZSiKSr0FNTqUiln9cpq4shtqLOHO43W65aTEKvErpC2BedBD8jco9eMUSqMR2oPRYzJrYQPoqDwK8OPBPlKDQCv2SaSnp7eSJ6q6loJA65VdyNPyGKwnRCzz-7iKx1mT9__-VyxX0wO6-HzKRadEVdW9ijtVpPOv5t7MzI" width={28} height={28} />
              <Image alt="Active user 2" className="w-7 h-7 rounded-full border-2 border-white object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDF-sboCyfEvrmJLStwIhYwmacx4sOoqZXYa49M3JtHh4t4vOsbCLWSEiCDGLyiW_DYk8wDONgWGGwAgBsOTb30pi0CLzOcfC3T9ZqCOg2IGvvFUGpqHQAl9sQW3yyeYoICi_SJvYwyFwA0JDPfpx-eBCOWfUAFJD4cBileSMPMsqOIGltihAUVWGIczs0LTQEYsoqntXWVi6wtDHZHW-qEettx1NmrUOjdCwkwVlnqwC-EdytX5-cw4XVNWI7hrzYdysl3DUSP4vM" width={28} height={28} />
              <div className="w-7 h-7 rounded-full bg-orange-100 border-2 border-white flex items-center justify-center text-[10px] text-orange-600 font-black">+39</div>
            </div>
          </div>
        </div>
        
        <div className="glass-card p-8 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
          <p className="text-label-md text-gray-400 uppercase tracking-widest text-[11px]">Pending Approvals</p>
          <h3 className="text-4xl font-headline-md text-on-surface mt-2">7</h3>
          <div className="mt-4 flex items-center gap-1.5 text-orange-500 text-sm font-bold">
            <Timer className="w-4 h-4" />
            Action required
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

      {/* Table & Filters Section */}
      <section className="bg-white rounded-[32px] shadow-[0_10px_40px_rgba(0,0,0,0.02)] border border-gray-50 overflow-hidden">
        <div className="p-8 border-b border-gray-50 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="relative">
              <select className="appearance-none bg-gray-50 border-none rounded-xl pl-5 pr-12 py-3 text-sm font-bold text-gray-700 focus:ring-2 focus:ring-orange-500/20 focus:bg-white transition-all cursor-pointer outline-none">
                <option>All Roles</option>
                <option>Administrator</option>
                <option>Manager</option>
                <option>Analyst</option>
                <option>User</option>
              </select>
              <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none w-5 h-5" />
            </div>
            <div className="relative">
              <select className="appearance-none bg-gray-50 border-none rounded-xl pl-5 pr-12 py-3 text-sm font-bold text-gray-700 focus:ring-2 focus:ring-orange-500/20 focus:bg-white transition-all cursor-pointer outline-none">
                <option>All Status</option>
                <option>Active</option>
                <option>Inactive</option>
                <option>Suspended</option>
              </select>
              <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none w-5 h-5" />
            </div>
          </div>
          <div className="text-sm text-gray-400 font-medium">
            Showing <span className="text-on-surface font-bold">1-10</span> of <span className="text-on-surface font-bold">1,284</span> users
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/30 text-[11px] text-gray-400 uppercase tracking-[0.15em] font-black">
                <th className="px-10 py-5">User Details</th>
                <th className="px-8 py-5">Role</th>
                <th className="px-8 py-5">Status</th>
                <th className="px-8 py-5">Last Active</th>
                <th className="px-10 py-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {adminUsers.map(user => (
                <tr key={user.id} className="hover:bg-orange-50/20 transition-colors group">
                  <td className="px-10 py-6">
                    <div className="flex items-center gap-4">
                      <div className={`w-11 h-11 rounded-full flex items-center justify-center font-black ring-2 ring-white shadow-sm ${user.colorClass}`}>
                        {user.initials}
                      </div>
                      <div>
                        <p className="font-bold text-on-surface text-base">{user.name}</p>
                        <p className="text-sm text-gray-400">{user.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <span className={`px-3 py-1 rounded-lg text-[11px] font-black uppercase tracking-wider ${user.status === 'ACTIVE' ? 'bg-purple-50 text-purple-600' : 'bg-orange-50 text-orange-600'}`}>
                      {user.status === 'ACTIVE' ? 'Administrator' : 'Analyst'}
                    </span>
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-2.5">
                      <div className={`w-2.5 h-2.5 rounded-full ${user.status === 'ACTIVE' ? 'bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.4)]' : 'bg-gray-300'}`}></div>
                      <span className="text-sm font-bold text-gray-700">{user.status === 'ACTIVE' ? 'Active' : 'Inactive'}</span>
                    </div>
                  </td>
                  <td className="px-8 py-6 text-sm font-medium text-gray-400">{user.status === 'ACTIVE' ? '2 mins ago' : '2 days ago'}</td>
                  <td className="px-10 py-6 text-right">
                    <button className="p-2.5 text-gray-300 hover:text-orange-600 hover:bg-orange-50 rounded-xl transition-all">
                      <MoreVertical className="w-6 h-6" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {/* Pagination */}
        <div className="p-8 bg-gray-50/30 flex items-center justify-between">
          <button className="flex items-center gap-2 text-sm font-bold text-gray-400 hover:text-orange-600 disabled:opacity-30 transition-colors" disabled>
            <ChevronLeft className="w-5 h-5" /> Previous
          </button>
          <div className="flex items-center gap-2">
            <button className="w-10 h-10 rounded-xl bg-orange-600 text-white text-sm font-black shadow-lg shadow-orange-200">1</button>
            <button className="w-10 h-10 rounded-xl hover:bg-orange-50 text-gray-500 text-sm font-bold transition-all">2</button>
            <button className="w-10 h-10 rounded-xl hover:bg-orange-50 text-gray-500 text-sm font-bold transition-all">3</button>
            <span className="text-gray-300 mx-2">...</span>
            <button className="w-10 h-10 rounded-xl hover:bg-orange-50 text-gray-500 text-sm font-bold transition-all">12</button>
          </div>
          <button className="flex items-center gap-2 text-sm font-bold text-gray-400 hover:text-orange-600 transition-colors">
            Next <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </section>
    </>
  );
}
