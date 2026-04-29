'use client';

import { Megaphone, FileText, Lock, PartyPopper, PlusCircle, Edit2, AlertTriangle, ChevronRight } from 'lucide-react';

export default function AdminEmailsPage() {
  return (
    <>
      {/* Dashboard Header */}
      <div className="flex items-end justify-between mb-stack-lg">
        <div>
          <h2 className="font-headline-md text-headline-md text-on-surface">Email Campaigns</h2>
          <p className="font-body-lg text-body-lg text-gray-500 mt-2">Manage your outreach and community engagement programs.</p>
        </div>
        <button className="sun-gradient text-white px-6 py-3 rounded-xl font-button text-button shadow-glow hover:scale-[1.02] transition-transform active:scale-95 flex items-center gap-2">
          <Megaphone className="w-5 h-5" />
          Create Campaign
        </button>
      </div>

      <div className="grid grid-cols-12 gap-gutter">
        {/* Bulk Sender UI (Bento Tile) */}
        <div className="col-span-12 lg:col-span-4 glass-card p-6 rounded-2xl shadow-soft">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-headline-sm text-headline-sm text-on-surface">Active Dispatch</h3>
            <span className="px-3 py-1 bg-orange-100 text-primary text-xs font-bold rounded-full uppercase tracking-wider">Sending</span>
          </div>
          <div className="space-y-stack-md">
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-gray-500">Quarterly Newsletter Q3</span>
                <span className="font-bold text-primary">84%</span>
              </div>
              <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                <div className="h-full sun-gradient rounded-full" style={{ width: '84%' }}></div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gray-50/50 p-4 rounded-xl border border-gray-100">
                <p className="text-xs text-gray-500 uppercase font-bold mb-1">Delivered</p>
                <p className="text-headline-sm font-headline-md text-on-surface">12,402</p>
              </div>
              <div className="bg-gray-50/50 p-4 rounded-xl border border-gray-100">
                <p className="text-xs text-gray-500 uppercase font-bold mb-1">Pending</p>
                <p className="text-headline-sm font-headline-md text-on-surface">2,358</p>
              </div>
            </div>
            <button className="w-full py-3 border-2 border-orange-100 text-primary rounded-xl font-button hover:bg-orange-50 transition-colors">
              Pause Dispatch
            </button>
          </div>
        </div>

        {/* Campaign Stats Table */}
        <div className="col-span-12 lg:col-span-8 glass-card rounded-2xl shadow-soft overflow-hidden">
          <div className="p-6 border-b border-gray-100 flex items-center justify-between">
            <h3 className="font-headline-sm text-headline-sm text-on-surface">Recent Campaigns</h3>
            <button className="text-sm font-bold text-primary hover:underline">View All Reports</button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50/50">
                  <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest">Name</th>
                  <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest">Status</th>
                  <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest">Open Rate</th>
                  <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest">Click Rate</th>
                  <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                <tr className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-orange-50 flex items-center justify-center text-primary">
                        <FileText className="w-5 h-5" />
                      </div>
                      <span className="font-medium text-on-surface">Summer Savings Guide</span>
                    </div>
                  </td>
                  <td className="px-6 py-4"><span className="px-2.5 py-1 bg-green-100 text-green-700 text-xs font-bold rounded-full">Completed</span></td>
                  <td className="px-6 py-4 font-semibold text-on-surface">42.5%</td>
                  <td className="px-6 py-4 font-semibold text-on-surface">18.2%</td>
                  <td className="px-6 py-4 text-gray-500">Oct 12, 2023</td>
                </tr>
                <tr className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600">
                        <Lock className="w-5 h-5" />
                      </div>
                      <span className="font-medium text-on-surface">Security Alert Protocol</span>
                    </div>
                  </td>
                  <td className="px-6 py-4"><span className="px-2.5 py-1 bg-green-100 text-green-700 text-xs font-bold rounded-full">Completed</span></td>
                  <td className="px-6 py-4 font-semibold text-on-surface">89.1%</td>
                  <td className="px-6 py-4 font-semibold text-on-surface">54.0%</td>
                  <td className="px-6 py-4 text-gray-500">Oct 08, 2023</td>
                </tr>
                <tr className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-purple-50 flex items-center justify-center text-purple-600">
                        <PartyPopper className="w-5 h-5" />
                      </div>
                      <span className="font-medium text-on-surface">Yearly Anniversary Perks</span>
                    </div>
                  </td>
                  <td className="px-6 py-4"><span className="px-2.5 py-1 bg-orange-100 text-primary text-xs font-bold rounded-full">Scheduled</span></td>
                  <td className="px-6 py-4 text-gray-400">--</td>
                  <td className="px-6 py-4 text-gray-400">--</td>
                  <td className="px-6 py-4 text-gray-500">Oct 24, 2023</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Templates Section */}
        <div className="col-span-12 lg:col-span-7 space-y-stack-md">
          <div className="flex items-center justify-between mt-8">
            <h3 className="font-headline-sm text-headline-sm text-on-surface">Saved Templates</h3>
            <button className="text-sm font-bold text-primary flex items-center gap-1 hover:underline">
              <PlusCircle className="w-4 h-4" />
              New Template
            </button>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="group relative bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-soft hover:border-orange-200 transition-all cursor-pointer">
              <div className="h-32 w-full bg-gray-50/50 relative overflow-hidden">
                <div className="absolute inset-4 space-y-2">
                  <div className="h-4 w-3/4 bg-gray-200 rounded"></div>
                  <div className="h-2 w-full bg-gray-100 rounded"></div>
                  <div className="h-2 w-full bg-gray-100 rounded"></div>
                  <div className="h-8 w-20 bg-orange-100 rounded mt-4"></div>
                </div>
              </div>
              <div className="p-4 flex items-center justify-between">
                <div>
                  <p className="font-bold text-on-surface">Investor Update</p>
                  <p className="text-xs text-gray-400">Last used 2 days ago</p>
                </div>
                <Edit2 className="text-gray-400 group-hover:text-primary w-5 h-5" />
              </div>
            </div>
            
            <div className="group relative bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-soft hover:border-orange-200 transition-all cursor-pointer">
              <div className="h-32 w-full bg-gray-50/50 relative overflow-hidden">
                <div className="absolute inset-4 space-y-2">
                  <div className="h-8 w-8 bg-orange-100 rounded-full mx-auto mb-4"></div>
                  <div className="h-2 w-1/2 bg-gray-200 rounded mx-auto"></div>
                  <div className="h-2 w-1/3 bg-gray-100 rounded mx-auto"></div>
                </div>
              </div>
              <div className="p-4 flex items-center justify-between">
                <div>
                  <p className="font-bold text-on-surface">Welcome Series</p>
                  <p className="text-xs text-gray-400">Last used 1 week ago</p>
                </div>
                <Edit2 className="text-gray-400 group-hover:text-primary w-5 h-5" />
              </div>
            </div>
          </div>
        </div>

        {/* Failed Emails Report */}
        <div className="col-span-12 lg:col-span-5 glass-card p-6 rounded-2xl shadow-soft mt-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-error-container text-on-error-container rounded-lg">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <h3 className="font-headline-sm text-headline-sm text-on-surface">Delivery Issues</h3>
          </div>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-gray-50/50 rounded-xl border border-gray-100 border-l-4 border-l-error cursor-pointer hover:bg-gray-100/50 transition-colors">
              <div>
                <p className="text-sm font-bold text-on-surface">Hard Bounce Detected</p>
                <p className="text-xs text-gray-500">142 addresses removed automatically</p>
              </div>
              <ChevronRight className="text-gray-400 w-5 h-5" />
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-50/50 rounded-xl border border-gray-100 border-l-4 border-l-secondary-container cursor-pointer hover:bg-gray-100/50 transition-colors">
              <div>
                <p className="text-sm font-bold text-on-surface">Spam Complaints</p>
                <p className="text-xs text-gray-500">8 reports from "Wealth Management" campaign</p>
              </div>
              <ChevronRight className="text-gray-400 w-5 h-5" />
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-50/50 rounded-xl border border-gray-100 border-l-4 border-l-error cursor-pointer hover:bg-gray-100/50 transition-colors">
              <div>
                <p className="text-sm font-bold text-on-surface">Invalid Mail Servers</p>
                <p className="text-xs text-gray-500">23 corporate domains unreachable</p>
              </div>
              <ChevronRight className="text-gray-400 w-5 h-5" />
            </div>
          </div>
          <button className="w-full mt-6 py-3 bg-surface-container-high text-on-surface font-button rounded-xl hover:bg-surface-container-highest transition-colors">
            Download Failure Report (.csv)
          </button>
        </div>
      </div>
    </>
  );
}
