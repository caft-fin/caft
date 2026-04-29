'use client';

import { useStore } from '@/store/useStore';
import { 
  TrendingUp, Users, Shield, Filter, Download, Edit2, Trash2, 
  CreditCard, Activity, Landmark, CircleDollarSign, AlertTriangle, 
  Table, PlusSquare, UploadCloud, Trash 
} from 'lucide-react';
import { 
  viewUserTableAction, addNewEntryAction, 
  bulkUpdateAction, truncateTableAction 
} from './actions';

export default function AdminDashboardPage() {
  const adminUsers = useStore(state => state.adminUsers);

  const handleAction = async (actionFn: () => Promise<any>) => {
    try {
      const result = await actionFn();
      alert(result.message);
    } catch (err: any) {
      alert('Error: ' + err.message);
    }
  };

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

      {/* Bento Grid for Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-gutter">
        <div className="md:col-span-2 glass-card rounded-2xl p-6 shadow-sm overflow-hidden relative group">
          <div className="absolute -right-10 -top-10 w-40 h-40 bg-orange-100/50 rounded-full group-hover:scale-110 transition-transform duration-700"></div>
          <h3 className="font-headline-sm text-headline-sm text-on-background mb-4">Total Assets Managed</h3>
          <div className="flex items-baseline gap-2">
            <span className="text-display-lg font-bold text-orange-600">₹8.42 Cr</span>
            <span className="text-green-500 font-bold flex items-center text-sm gap-1">
              <TrendingUp className="w-4 h-4" /> 12%
            </span>
          </div>
          <p className="text-on-surface-variant text-body-md mt-2">Aggregated from 1,240 user portfolios</p>
        </div>

        <div className="glass-card rounded-2xl p-6 shadow-sm">
          <Users className="text-orange-500 mb-2 w-6 h-6" />
          <h4 className="text-label-md text-on-surface-variant">Active Users</h4>
          <p className="text-headline-md font-bold mt-1">4,821</p>
          <div className="w-full bg-gray-100 h-1.5 rounded-full mt-4">
            <div className="bg-orange-500 h-1.5 rounded-full" style={{ width: '75%' }}></div>
          </div>
        </div>

        <div className="glass-card rounded-2xl p-6 shadow-sm">
          <Shield className="text-orange-500 mb-2 w-6 h-6" />
          <h4 className="text-label-md text-on-surface-variant">Security Score</h4>
          <p className="text-headline-md font-bold mt-1">98.2%</p>
          <p className="text-xs text-green-500 mt-2">Optimal Health</p>
        </div>
      </div>

      {/* User Management Table */}
      <section className="glass-card rounded-2xl shadow-sm overflow-hidden">
        <div className="px-6 py-5 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
          <h3 className="font-headline-sm text-headline-sm text-on-background">User Management</h3>
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
                <th className="px-6 py-4 font-semibold">Investment</th>
                <th className="px-6 py-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {adminUsers.map(user => (
                <tr key={user.id} className="hover:bg-orange-50/30 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${user.colorClass}`}>
                        {user.initials}
                      </div>
                      <div>
                        <p className="font-semibold text-on-background">{user.name}</p>
                        <p className="text-xs text-on-surface-variant">{user.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${user.status === 'ACTIVE' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                      {user.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-on-surface-variant">{user.plan}</td>
                  <td className="px-6 py-4 font-semibold text-on-background">
                    {new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(user.investment)}
                  </td>
                  <td className="px-6 py-4 text-right flex justify-end gap-2">
                    <button className="p-2 hover:text-orange-500 transition-colors"><Edit2 className="w-5 h-5" /></button>
                    <button className="p-2 hover:text-red-500 transition-colors"><Trash2 className="w-5 h-5" /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="px-6 py-4 border-t border-gray-100 flex justify-between items-center text-sm text-on-surface-variant">
          <span>Showing 1-3 of 4,821 users</span>
          <div className="flex gap-2">
            <button className="px-3 py-1 border border-gray-200 rounded-md hover:bg-gray-50 disabled:opacity-50" onClick={() => {}} disabled>Previous</button>
            <button className="px-3 py-1 bg-orange-600 text-white rounded-md hover:bg-orange-700" onClick={() => {}}>Next</button>
          </div>
        </div>
      </section>

      {/* Subscription Editor & Investment Tracking */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-gutter">
        {/* Subscription Plan Editor */}
        <section className="glass-card rounded-2xl p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-6">
            <CreditCard className="text-orange-500 w-6 h-6" />
            <h3 className="font-headline-sm text-headline-sm text-on-background">Subscription Editor</h3>
          </div>
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-label-md font-bold text-on-surface-variant">Basic Plan (Monthly)</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 font-semibold">₹</span>
                  <input className="w-full bg-gray-50 border-none rounded-xl pl-8 py-3 focus:ring-2 focus:ring-orange-500 outline-none" type="number" defaultValue="499" />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-label-md font-bold text-on-surface-variant">Premium Plan (Monthly)</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 font-semibold">₹</span>
                  <input className="w-full bg-gray-50 border-none rounded-xl pl-8 py-3 focus:ring-2 focus:ring-orange-500 outline-none" type="number" defaultValue="1499" />
                </div>
              </div>
            </div>

            <div className="p-4 bg-orange-50 rounded-xl border border-orange-100">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-semibold text-orange-800">Dynamic Pricing Forecast</span>
                <span className="text-xs text-orange-600">Simulating +15% Churn Risk</span>
              </div>
              <p className="text-xs text-orange-700 leading-relaxed">Updating the Premium price to ₹1,499 will projectedly increase annual recurring revenue (ARR) by ₹8.4M but may result in a 2.4% drop in renewal rate for Basic-tier users.</p>
            </div>

            <button className="w-full bg-orange-600 text-white font-button py-3 rounded-xl hover:bg-orange-700 transition-colors shadow-lg shadow-orange-500/10">
              Update All Pricing Tiers
            </button>
          </div>
        </section>

        {/* Investment Tracking */}
        <section className="glass-card rounded-2xl p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-6">
            <Activity className="text-orange-500 w-6 h-6" />
            <h3 className="font-headline-sm text-headline-sm text-on-background">Live Portfolio Pulse</h3>
          </div>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 sun-gradient rounded-lg flex items-center justify-center text-white">
                  <TrendingUp className="w-6 h-6" />
                </div>
                <div>
                  <p className="font-semibold">Tools</p>
                  <p className="text-xs text-on-surface-variant">842 Participants</p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-bold text-orange-600">₹4.2 Cr</p>
                <p className="text-[10px] text-green-500 font-bold">+1.8% TODAY</p>
              </div>
            </div>

            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center text-white">
                  <Landmark className="w-6 h-6" />
                </div>
                <div>
                  <p className="font-semibold">Algo</p>
                  <p className="text-xs text-on-surface-variant">312 Participants</p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-bold text-on-background">₹2.8 Cr</p>
                <p className="text-[10px] text-red-400 font-bold">-0.4% TODAY</p>
              </div>
            </div>

            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-purple-500 rounded-lg flex items-center justify-center text-white">
                  <CircleDollarSign className="w-6 h-6" />
                </div>
                <div>
                  <p className="font-semibold">Subscriptions</p>
                  <p className="text-xs text-on-surface-variant">54 Participants</p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-bold text-on-background">₹1.42 Cr</p>
                <p className="text-[10px] text-green-500 font-bold">+5.2% TODAY</p>
              </div>
            </div>
          </div>
        </section>
      </div>

      {/* Danger Zone (Direct Database Management) */}
      <section className="border-2 border-red-100 bg-red-50/30 rounded-2xl p-8 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-red-100 text-red-600 rounded-full flex items-center justify-center shadow-inner">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-headline-sm font-bold text-red-900">Danger Zone</h3>
              <p className="text-body-md text-red-700">Direct database table manipulation. Operations executed via secure server actions.</p>
            </div>
          </div>
          <div className="bg-red-900/10 px-4 py-2 rounded-lg border border-red-200">
            <span className="text-xs font-bold text-red-800 tracking-widest uppercase">Admin Token Required</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <button 
            onClick={() => handleAction(viewUserTableAction)}
            className="bg-white hover:bg-red-50 border border-red-200 p-6 rounded-xl flex flex-col items-center gap-3 transition-all group"
          >
            <Table className="text-red-400 group-hover:scale-110 transition-transform w-8 h-8" />
            <span className="font-bold text-on-background text-sm">View User Table</span>
          </button>

          <button 
            onClick={() => handleAction(addNewEntryAction)}
            className="bg-white hover:bg-red-50 border border-red-200 p-6 rounded-xl flex flex-col items-center gap-3 transition-all group"
          >
            <PlusSquare className="text-red-400 group-hover:scale-110 transition-transform w-8 h-8" />
            <span className="font-bold text-on-background text-sm">Add New Entry</span>
          </button>

          <button 
            onClick={() => handleAction(bulkUpdateAction)}
            className="bg-white hover:bg-red-50 border border-red-200 p-6 rounded-xl flex flex-col items-center gap-3 transition-all group"
          >
            <UploadCloud className="text-red-400 group-hover:scale-110 transition-transform w-8 h-8" />
            <span className="font-bold text-on-background text-sm">Bulk Update</span>
          </button>

          <button 
            onClick={() => handleAction(truncateTableAction)}
            className="bg-red-600 hover:bg-red-700 p-6 rounded-xl flex flex-col items-center gap-3 transition-all group shadow-lg shadow-red-200"
          >
            <Trash className="text-white group-hover:scale-110 transition-transform w-8 h-8" />
            <span className="font-bold text-white text-sm">Truncate Table</span>
          </button>
        </div>

        <div className="mt-8 p-4 bg-red-100/50 rounded-lg flex items-center gap-3">
          <AlertTriangle className="text-red-600 w-5 h-5" />
          <p className="text-xs text-red-800 font-medium">All actions in the Danger Zone are securely verified on the server and require a valid administrative session token.</p>
        </div>
      </section>
    </div>
  );
}
