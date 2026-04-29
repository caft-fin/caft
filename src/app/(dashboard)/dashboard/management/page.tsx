'use client';

import { TrendingUp, Monitor, Receipt, Lock, Star, Download, RefreshCw, Settings, Plus } from 'lucide-react';

const tools = [
  {
    icon: <Monitor className="w-7 h-7 text-orange-600" />,
    name: 'Global Market Feed',
    desc: 'Real-time terminal for NASDAQ, NSE, and Crypto markets.',
    price: '₹899',
    status: 'ACTIVE',
    statusClass: 'bg-green-100 text-green-700',
    active: true,
  },
  {
    icon: <Receipt className="w-7 h-7 text-orange-600" />,
    name: 'Smart Tax Assistant',
    desc: 'Automated GST filing and ITR preparation for individuals.',
    price: '₹1,499',
    status: 'ACTIVE',
    statusClass: 'bg-green-100 text-green-700',
    active: true,
  },
  {
    icon: <Lock className="w-7 h-7 text-gray-400" />,
    name: 'Portfolio Deep Dive',
    desc: 'Advanced risk analysis and correlation mapping tools.',
    price: '₹2,999',
    status: 'EXPIRED',
    statusClass: 'bg-gray-100 text-gray-500',
    active: false,
  },
];

const orders = [
  {
    icon: <Star className="w-5 h-5 text-orange-600" />,
    iconBg: 'bg-orange-100',
    name: 'Enterprise Annual Plan',
    id: 'CAFT-8829-X',
    date: 'Oct 14, 2023',
    status: 'Paid',
    statusClass: 'bg-green-50 text-green-700',
    dotClass: 'bg-green-500',
    amount: '₹24,999',
    action: <Download className="w-5 h-5" />,
    actionClass: 'text-orange-600 hover:text-orange-700',
  },
  {
    icon: <Monitor className="w-5 h-5 text-orange-600" />,
    iconBg: 'bg-orange-100',
    name: 'Market Feed Pro (Monthly)',
    id: 'CAFT-7612-Y',
    date: 'Sep 28, 2023',
    status: 'Paid',
    statusClass: 'bg-green-50 text-green-700',
    dotClass: 'bg-green-500',
    amount: '₹899',
    action: <Download className="w-5 h-5" />,
    actionClass: 'text-orange-600 hover:text-orange-700',
  },
  {
    icon: <Star className="w-5 h-5 text-red-600" />,
    iconBg: 'bg-red-100',
    name: 'Wealth Insights Pack',
    id: 'CAFT-3392-Z',
    date: 'Sep 15, 2023',
    status: 'Failed',
    statusClass: 'bg-red-50 text-red-700',
    dotClass: 'bg-red-500',
    amount: '₹4,999',
    action: <RefreshCw className="w-5 h-5" />,
    actionClass: 'text-gray-400 hover:text-gray-600',
  },
];

export default function UserManagementPage() {
  return (
    <div className="p-gutter max-w-container-max mx-auto w-full">
      {/* Page Header */}
      <div className="mb-stack-lg flex flex-col md:flex-row md:items-end justify-between gap-4 pt-8">
        <div>
          <h1 className="font-display-lg text-display-lg text-on-background mb-2">Subscription Center</h1>
          <p className="font-body-lg text-body-lg text-on-surface-variant max-w-2xl">
            Manage your connected financial tools, upgrade your limits, and review your investment history.
          </p>
        </div>
        <div className="flex gap-3 shrink-0">
          <button className="px-6 py-3 bg-white border border-outline-variant text-primary font-button rounded-xl hover:bg-orange-50 transition-colors shadow-sm">
            Add New Service
          </button>
          <button className="px-6 py-3 sun-gradient text-white font-button rounded-xl hover:shadow-lg hover:shadow-orange-500/20 transition-all active:scale-95">
            Upgrade to Pro
          </button>
        </div>
      </div>

      {/* Featured Bento */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-gutter mb-stack-lg">
        {/* Enterprise Card */}
        <div className="md:col-span-2 relative overflow-hidden rounded-3xl sun-gradient p-8 text-white shadow-xl shadow-orange-500/10 min-h-[240px] flex flex-col justify-between">
          <div className="relative z-10">
            <span className="inline-block px-3 py-1 bg-white/20 backdrop-blur-md rounded-full text-xs font-bold mb-4">YEARLY SAVINGS ACTIVE</span>
            <h3 className="font-headline-md text-headline-md mb-2">Enterprise Suite</h3>
            <p className="text-white/80 max-w-sm">Full access to advanced tax modeling, crypto portfolio tracking, and dedicated advisory.</p>
          </div>
          <div className="relative z-10 flex items-center justify-between mt-6">
            <div>
              <p className="text-sm text-white/70">Next renewal</p>
              <p className="font-bold text-xl">Oct 14, 2024</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-white/70">Price</p>
              <p className="font-bold text-xl">₹24,999<span className="text-sm font-normal text-white/70">/yr</span></p>
            </div>
          </div>
          <div className="absolute -right-10 -top-10 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
          <div className="absolute right-0 bottom-0 opacity-10">
            <Star className="w-36 h-36" />
          </div>
        </div>

        {/* Usage Limits */}
        <div className="glass-card rounded-3xl p-8 flex flex-col justify-center">
          <div className="w-12 h-12 rounded-2xl bg-tertiary-container flex items-center justify-center mb-4">
            <TrendingUp className="w-6 h-6 text-on-tertiary-container" />
          </div>
          <h4 className="font-headline-sm text-headline-sm text-on-background mb-2">Usage Limits</h4>
          <p className="font-body-md text-body-md text-on-surface-variant mb-6">You&apos;ve used 82% of your monthly report quota.</p>
          <div className="w-full bg-surface-container-highest h-2.5 rounded-full mb-2">
            <div className="sun-gradient h-full rounded-full" style={{ width: '82%' }}></div>
          </div>
          <div className="flex justify-between text-xs font-bold text-on-surface-variant">
            <span>41 / 50 Reports</span>
            <span className="text-orange-600">9 Left</span>
          </div>
        </div>
      </div>

      {/* Active Subscribed Tools */}
      <div className="mb-stack-lg">
        <div className="flex items-center justify-between mb-stack-md">
          <h3 className="font-headline-sm text-headline-sm text-on-background">Active Subscribed Tools</h3>
          <a href="#" className="text-orange-600 font-bold text-sm hover:underline">Manage All</a>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {tools.map((tool) => (
            <div
              key={tool.name}
              className={`glass-card rounded-2xl p-6 transition-all hover:shadow-md ${!tool.active ? 'opacity-75 grayscale hover:grayscale-0 hover:opacity-100' : ''}`}
            >
              <div className="flex justify-between items-start mb-4">
                <div className="w-12 h-12 rounded-xl bg-gray-100 flex items-center justify-center">
                  {tool.icon}
                </div>
                <span className={`px-2 py-1 rounded text-[10px] font-extrabold tracking-wider ${tool.statusClass}`}>{tool.status}</span>
              </div>
              <h4 className="font-bold text-gray-900 mb-1">{tool.name}</h4>
              <p className="text-xs text-gray-500 mb-6">{tool.desc}</p>
              <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                <div>
                  <span className="text-[10px] text-gray-400 block">Monthly Price</span>
                  <span className="font-bold text-gray-900">{tool.price}</span>
                </div>
                {tool.active ? (
                  <div className="flex gap-2">
                    <button className="p-2 text-gray-400 hover:text-orange-500 transition-colors">
                      <Settings className="w-5 h-5" />
                    </button>
                    <button className="px-3 py-1.5 text-xs font-bold text-orange-600 hover:bg-orange-50 rounded-lg transition-colors border border-orange-100">Renew</button>
                  </div>
                ) : (
                  <button className="px-4 py-1.5 text-xs font-bold bg-gray-900 text-white rounded-lg hover:bg-black transition-colors">Reactivate</button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Order History */}
      <div className="mb-stack-lg">
        <h3 className="font-headline-sm text-headline-sm text-on-background mb-stack-md">Order History</h3>
        <div className="glass-card rounded-3xl overflow-hidden shadow-sm">
          <table className="w-full text-left">
            <thead className="bg-surface-container-low border-b border-gray-100">
              <tr>
                <th className="px-6 py-4 font-label-md text-label-md text-on-surface-variant uppercase tracking-wider">Purchase Details</th>
                <th className="px-6 py-4 font-label-md text-label-md text-on-surface-variant uppercase tracking-wider">Date</th>
                <th className="px-6 py-4 font-label-md text-label-md text-on-surface-variant uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 font-label-md text-label-md text-on-surface-variant uppercase tracking-wider">Amount</th>
                <th className="px-6 py-4 font-label-md text-label-md text-on-surface-variant text-right">Invoice</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {orders.map((order) => (
                <tr key={order.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-6 py-5">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${order.iconBg}`}>
                        {order.icon}
                      </div>
                      <div>
                        <p className="font-bold text-gray-900 text-sm">{order.name}</p>
                        <p className="text-xs text-gray-500">ID: {order.id}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-5 text-sm text-gray-600">{order.date}</td>
                  <td className="px-6 py-5">
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold ${order.statusClass}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${order.dotClass}`}></span>
                      {order.status}
                    </span>
                  </td>
                  <td className="px-6 py-5 font-bold text-gray-900">{order.amount}</td>
                  <td className="px-6 py-5 text-right">
                    <button className={`transition-colors ${order.actionClass}`}>
                      {order.action}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="px-6 py-4 border-t border-gray-100 flex justify-between items-center bg-gray-50/30">
            <span className="text-xs text-gray-500">Showing 3 of 24 transactions</span>
            <div className="flex gap-2">
              <button className="px-3 py-1 text-xs font-bold text-gray-600 hover:text-orange-600 border border-gray-200 rounded-lg bg-white">Previous</button>
              <button className="px-3 py-1 text-xs font-bold text-gray-600 hover:text-orange-600 border border-gray-200 rounded-lg bg-white">Next</button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile FAB */}
      <button className="lg:hidden fixed bottom-20 right-6 z-40 w-14 h-14 sun-gradient text-white rounded-full shadow-xl shadow-orange-500/30 flex items-center justify-center active:scale-95 transition-all">
        <Plus className="w-6 h-6" />
      </button>
    </div>
  );
}
