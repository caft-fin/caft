'use client';

import { Sliders, ChevronDown, BellRing, Shield, ShieldCheck, CheckCircle2, Circle, FileJson, Copy, RefreshCcw, Database } from 'lucide-react';

export default function AdminSettingsPage() {
  return (
    <>
      <header className="mb-12">
        <h2 className="text-[40px] font-extrabold text-gray-900 font-headline-md tracking-tight">Admin Settings</h2>
        <p className="text-lg text-gray-500 mt-3 font-medium">Manage your core platform configurations and security parameters for CAFT Financial.</p>
      </header>

      <div className="grid grid-cols-12 gap-8">
        {/* General Settings Section */}
        <section className="col-span-12 lg:col-span-8 space-y-8">
          <div className="bg-white rounded-[2rem] p-10 border border-gray-50 shadow-sm">
            <div className="flex items-center gap-4 mb-10">
              <div className="w-14 h-14 rounded-2xl sun-gradient flex items-center justify-center text-white shadow-lg shadow-orange-200">
                <Sliders className="w-6 h-6" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900">General Settings</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-3">
                <label className="text-sm font-bold text-gray-700 ml-1">App Name</label>
                <input 
                  className="w-full bg-[#F8F9FB] border-2 border-transparent focus:border-orange-100 focus:bg-white rounded-2xl px-6 py-4 transition-all outline-none font-medium" 
                  type="text" 
                  defaultValue="CAFT Financial"
                />
              </div>
              <div className="space-y-3">
                <label className="text-sm font-bold text-gray-700 ml-1">Default Timezone</label>
                <div className="relative">
                  <select className="w-full bg-[#F8F9FB] border-2 border-transparent focus:border-orange-100 focus:bg-white rounded-2xl px-6 py-4 transition-all outline-none font-medium appearance-none">
                    <option>(GMT+05:30) Indian Standard Time</option>
                    <option>(GMT-08:00) Pacific Time (US &amp; Canada)</option>
                    <option>(GMT+00:00) London</option>
                    <option>(GMT+08:00) Singapore</option>
                  </select>
                  <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none w-5 h-5" />
                </div>
              </div>
              <div className="col-span-full space-y-3">
                <label className="text-sm font-bold text-gray-700 ml-1">Support Email</label>
                <input 
                  className="w-full bg-[#F8F9FB] border-2 border-transparent focus:border-orange-100 focus:bg-white rounded-2xl px-6 py-4 transition-all outline-none font-medium" 
                  type="email" 
                  defaultValue="ops@caft.financial"
                />
              </div>
            </div>
            
            <div className="mt-10 flex justify-end">
              <button className="sun-gradient text-white px-10 py-4 rounded-2xl font-bold shadow-xl shadow-orange-100 hover:scale-[1.02] transition-all active:scale-95">Save Changes</button>
            </div>
          </div>

          {/* Notification Settings */}
          <div className="bg-white rounded-[2rem] p-10 border border-gray-50 shadow-sm">
            <div className="flex items-center gap-4 mb-10">
              <div className="w-14 h-14 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-600">
                <BellRing className="w-6 h-6" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900">Notification Preferences</h3>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between p-6 bg-[#F8F9FB] rounded-2xl">
                <div>
                  <p className="font-bold text-gray-900 text-lg">System Alerts</p>
                  <p className="text-gray-500">Receive critical updates about system performance.</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" className="sr-only peer" defaultChecked />
                  <div className="w-14 h-8 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-6 peer-checked:after:border-white after:content-[''] after:absolute after:top-[4px] after:left-[4px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-[#E67E22]"></div>
                </label>
              </div>
              
              <div className="flex items-center justify-between p-6 bg-[#F8F9FB] rounded-2xl">
                <div>
                  <p className="font-bold text-gray-900 text-lg">Security Notifications</p>
                  <p className="text-gray-500">Notify admin on multiple failed login attempts.</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" className="sr-only peer" defaultChecked />
                  <div className="w-14 h-8 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-6 peer-checked:after:border-white after:content-[''] after:absolute after:top-[4px] after:left-[4px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-[#E67E22]"></div>
                </label>
              </div>
              
              <div className="flex items-center justify-between p-6 bg-[#F8F9FB] rounded-2xl opacity-60">
                <div>
                  <p className="font-bold text-gray-900 text-lg">User Activity Reports</p>
                  <p className="text-gray-500">Weekly summaries of user transaction volume.</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" className="sr-only peer" />
                  <div className="w-14 h-8 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-6 peer-checked:after:border-white after:content-[''] after:absolute after:top-[4px] after:left-[4px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-[#E67E22]"></div>
                </label>
              </div>
            </div>
          </div>
        </section>

        {/* Sidebar Content */}
        <aside className="col-span-12 lg:col-span-4 space-y-8">
          {/* Security Settings */}
          <div className="bg-white rounded-[2rem] p-10 border border-gray-50 shadow-sm">
            <div className="flex items-center gap-4 mb-8">
              <div className="w-14 h-14 rounded-2xl bg-red-50 flex items-center justify-center text-red-600">
                <Shield className="w-6 h-6" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900">Security</h3>
            </div>
            
            <div className="space-y-8">
              <div>
                <p className="text-xs font-black text-gray-400 uppercase tracking-widest mb-4">Authentication</p>
                <div className="flex items-center gap-4 p-5 bg-orange-50/50 rounded-2xl border border-orange-100/50">
                  <ShieldCheck className="text-[#E67E22] w-6 h-6" />
                  <div className="flex-1">
                    <p className="font-bold text-gray-900">2FA Required</p>
                    <p className="text-sm text-gray-500">Enforced for all admins</p>
                  </div>
                  <button className="text-sm font-bold text-[#E67E22] hover:underline">Change</button>
                </div>
              </div>
              
              <div>
                <p className="text-xs font-black text-gray-400 uppercase tracking-widest mb-4">Password Rules</p>
                <ul className="space-y-4">
                  <li className="flex items-center gap-3 text-sm font-medium text-gray-700">
                    <CheckCircle2 className="text-green-500 w-5 h-5 font-bold" />
                    Minimum 12 characters
                  </li>
                  <li className="flex items-center gap-3 text-sm font-medium text-gray-700">
                    <CheckCircle2 className="text-green-500 w-5 h-5 font-bold" />
                    Requires special characters
                  </li>
                  <li className="flex items-center gap-3 text-sm font-medium text-gray-400">
                    <Circle className="text-gray-200 w-5 h-5 font-bold" />
                    Force reset every 90 days
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* API Management */}
          <div className="bg-white rounded-[2rem] p-10 border border-gray-50 shadow-sm overflow-hidden">
            <div className="flex items-center gap-4 mb-8">
              <div className="w-14 h-14 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600">
                <FileJson className="w-6 h-6" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900">API Access</h3>
            </div>
            
            <div className="space-y-6">
              <div className="p-6 bg-[#F8F9FB] rounded-2xl space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-black text-gray-400 uppercase tracking-widest">Production Key</span>
                  <span className="px-3 py-1 bg-green-100 text-green-700 text-[10px] font-bold rounded-full uppercase">Active</span>
                </div>
                <div className="flex gap-3">
                  <input className="flex-1 bg-white border border-gray-100 text-sm font-mono rounded-xl px-4 py-3 outline-none" readOnly type="password" value="sk_live_51Mxxxxxxxxxxxxxx"/>
                  <button className="p-3 bg-white border border-gray-100 hover:bg-gray-50 rounded-xl transition-colors">
                    <Copy className="w-5 h-5 text-gray-500" />
                  </button>
                </div>
              </div>
              
              <div className="p-6 bg-[#F8F9FB] rounded-2xl space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-black text-gray-400 uppercase tracking-widest">Sandbox Key</span>
                  <span className="px-3 py-1 bg-orange-100 text-orange-700 text-[10px] font-bold rounded-full uppercase">Testing</span>
                </div>
                <div className="flex gap-3">
                  <input className="flex-1 bg-white border border-gray-100 text-sm font-mono rounded-xl px-4 py-3 outline-none" readOnly type="text" value="sk_test_51Mxxxxxxxxxxxxxx"/>
                  <button className="p-3 bg-white border border-gray-100 hover:bg-gray-50 rounded-xl transition-colors">
                    <Copy className="w-5 h-5 text-gray-500" />
                  </button>
                </div>
              </div>
              
              <button className="w-full border-2 border-orange-100 text-[#E67E22] py-4 rounded-2xl font-bold hover:bg-orange-50 transition-all active:scale-95">
                Revoke &amp; Regenerate Keys
              </button>
            </div>
          </div>
        </aside>
      </div>

      {/* System Health Footer Grid */}
      <section className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="p-8 rounded-[2rem] bg-white border border-gray-50 flex items-center gap-5 shadow-sm">
          <div className="w-3 h-3 rounded-full bg-green-500 animate-pulse"></div>
          <div>
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Server Status</p>
            <p className="text-lg font-bold text-gray-900">Operational • 99.9%</p>
          </div>
        </div>
        <div className="p-8 rounded-[2rem] bg-white border border-gray-50 flex items-center gap-5 shadow-sm">
          <RefreshCcw className="text-orange-500 w-8 h-8" />
          <div>
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Last Deployment</p>
            <p className="text-lg font-bold text-gray-900">2 hours ago (v2.4.1)</p>
          </div>
        </div>
        <div className="p-8 rounded-[2rem] bg-white border border-gray-50 flex items-center gap-5 shadow-sm">
          <Database className="text-blue-500 w-8 h-8" />
          <div className="flex-1">
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Storage Usage</p>
            <div className="w-full h-3 bg-gray-100 rounded-full mt-2 overflow-hidden">
              <div className="h-full bg-blue-500 rounded-full" style={{ width: '45%' }}></div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
