'use client';

import { useEffect, useState } from 'react';
import { api, type CampaignItem, type EmailTemplate, ApiError } from '@/lib/apiClient';
import { Megaphone, FileText, PlusCircle, Edit2, AlertTriangle, ChevronRight, Loader2, Mail, Send, Clock, CheckCircle2 } from 'lucide-react';

export default function AdminEmailsPage() {
  const [campaigns, setCampaigns] = useState<CampaignItem[]>([]);
  const [templates, setTemplates] = useState<EmailTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const loadData = async () => {
    try {
      setLoading(true);
      const [campaignsRes, templatesRes] = await Promise.allSettled([
        api.admin.campaigns.list(),
        api.admin.templates.list(),
      ]);
      if (campaignsRes.status === 'fulfilled') setCampaigns(campaignsRes.value.data);
      if (templatesRes.status === 'fulfilled') setTemplates(templatesRes.value.data);
    } catch (err) {
      console.error('Failed to load email data:', err);
      setError(err instanceof ApiError ? err.message : 'Failed to load email data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      DRAFT: 'bg-gray-100 text-gray-600',
      SCHEDULED: 'bg-orange-100 text-orange-700',
      SENDING: 'bg-blue-100 text-blue-700',
      PAUSED: 'bg-yellow-100 text-yellow-700',
      COMPLETED: 'bg-green-100 text-green-700',
      FAILED: 'bg-red-100 text-red-700',
    };
    return styles[status] || 'bg-gray-100 text-gray-600';
  };

  const getStatusIcon = (status: string) => {
    if (status === 'COMPLETED') return <CheckCircle2 className="w-5 h-5" />;
    if (status === 'SENDING') return <Send className="w-5 h-5" />;
    if (status === 'SCHEDULED') return <Clock className="w-5 h-5" />;
    return <Mail className="w-5 h-5" />;
  };

  const formatDate = (dateStr: string) =>
    new Date(dateStr).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' });

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 text-orange-500 animate-spin" />
      </div>
    );
  }

  // Calculate stats from actual data
  const activeCampaign = campaigns.find(c => c.status === 'SENDING');
  const totalDelivered = campaigns.reduce((sum, c) => sum + c.totalDelivered, 0);
  const totalSent = campaigns.reduce((sum, c) => sum + c.totalSent, 0);
  const totalFailed = campaigns.reduce((sum, c) => sum + c.totalFailed, 0);

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

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700 flex items-center gap-3">
          <AlertTriangle className="w-5 h-5 shrink-0" />
          {error}
        </div>
      )}

      <div className="grid grid-cols-12 gap-gutter">
        {/* Active Dispatch / Overview */}
        <div className="col-span-12 lg:col-span-4 glass-card p-6 rounded-2xl shadow-soft">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-headline-sm text-headline-sm text-on-surface">Campaign Overview</h3>
            {activeCampaign && (
              <span className="px-3 py-1 bg-blue-100 text-blue-700 text-xs font-bold rounded-full uppercase tracking-wider">Active</span>
            )}
          </div>
          <div className="space-y-stack-md">
            {activeCampaign ? (
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-gray-500">{activeCampaign.name}</span>
                  <span className="font-bold text-primary">{activeCampaign.totalSent > 0 ? Math.round((activeCampaign.totalDelivered / activeCampaign.totalSent) * 100) : 0}%</span>
                </div>
                <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div className="h-full sun-gradient rounded-full" style={{ width: `${activeCampaign.totalSent > 0 ? (activeCampaign.totalDelivered / activeCampaign.totalSent * 100) : 0}%` }}></div>
                </div>
              </div>
            ) : (
              <p className="text-sm text-gray-400">No active dispatch running.</p>
            )}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gray-50/50 p-4 rounded-xl border border-gray-100">
                <p className="text-xs text-gray-500 uppercase font-bold mb-1">Total Delivered</p>
                <p className="text-headline-sm font-headline-md text-on-surface">{totalDelivered.toLocaleString()}</p>
              </div>
              <div className="bg-gray-50/50 p-4 rounded-xl border border-gray-100">
                <p className="text-xs text-gray-500 uppercase font-bold mb-1">Total Sent</p>
                <p className="text-headline-sm font-headline-md text-on-surface">{totalSent.toLocaleString()}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Campaign Table */}
        <div className="col-span-12 lg:col-span-8 glass-card rounded-2xl shadow-soft overflow-hidden">
          <div className="p-6 border-b border-gray-100 flex items-center justify-between">
            <h3 className="font-headline-sm text-headline-sm text-on-surface">Campaigns</h3>
            <span className="text-sm text-gray-400">{campaigns.length} total</span>
          </div>
          {campaigns.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-gray-400">
              <Mail className="w-12 h-12 mb-4 text-gray-200" />
              <p className="font-semibold text-gray-500">No campaigns yet</p>
              <p className="text-sm">Create your first email campaign to get started.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50/50">
                    <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest">Name</th>
                    <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest">Status</th>
                    <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest">Delivered</th>
                    <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest">Failed</th>
                    <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {campaigns.map(campaign => (
                    <tr key={campaign.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${getStatusBadge(campaign.status).replace('text-', 'bg-').split(' ')[0]}`}>
                            {getStatusIcon(campaign.status)}
                          </div>
                          <div>
                            <span className="font-medium text-on-surface">{campaign.name}</span>
                            <p className="text-xs text-gray-400">{campaign.subject}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2.5 py-1 text-xs font-bold rounded-full ${getStatusBadge(campaign.status)}`}>{campaign.status}</span>
                      </td>
                      <td className="px-6 py-4 font-semibold text-on-surface">{campaign.totalDelivered.toLocaleString()}</td>
                      <td className="px-6 py-4 font-semibold text-red-500">{campaign.totalFailed > 0 ? campaign.totalFailed.toLocaleString() : '—'}</td>
                      <td className="px-6 py-4 text-gray-500">{formatDate(campaign.createdAt)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
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
          {templates.length === 0 ? (
            <div className="glass-card p-8 rounded-2xl text-center text-gray-400">
              <FileText className="w-10 h-10 mx-auto mb-3 text-gray-200" />
              <p className="font-semibold text-gray-500">No templates saved yet</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4">
              {templates.map(template => (
                <div key={template.id} className="group relative bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-soft hover:border-orange-200 transition-all cursor-pointer">
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
                      <p className="font-bold text-on-surface">{template.name}</p>
                      <p className="text-xs text-gray-400">{template.subject}</p>
                    </div>
                    <Edit2 className="text-gray-400 group-hover:text-primary w-5 h-5" />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Stats Summary */}
        <div className="col-span-12 lg:col-span-5 glass-card p-6 rounded-2xl shadow-soft mt-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-orange-50 text-orange-600 rounded-lg">
              <Megaphone className="w-5 h-5" />
            </div>
            <h3 className="font-headline-sm text-headline-sm text-on-surface">Email Stats</h3>
          </div>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-gray-50/50 rounded-xl border border-gray-100 border-l-4 border-l-green-500">
              <div>
                <p className="text-sm font-bold text-on-surface">Total Delivered</p>
                <p className="text-xs text-gray-500">{totalDelivered.toLocaleString()} emails successfully delivered</p>
              </div>
              <ChevronRight className="text-gray-400 w-5 h-5" />
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-50/50 rounded-xl border border-gray-100 border-l-4 border-l-blue-500">
              <div>
                <p className="text-sm font-bold text-on-surface">Total Sent</p>
                <p className="text-xs text-gray-500">{totalSent.toLocaleString()} emails dispatched</p>
              </div>
              <ChevronRight className="text-gray-400 w-5 h-5" />
            </div>
            {totalFailed > 0 && (
              <div className="flex items-center justify-between p-3 bg-gray-50/50 rounded-xl border border-gray-100 border-l-4 border-l-red-500">
                <div>
                  <p className="text-sm font-bold text-on-surface">Failures</p>
                  <p className="text-xs text-gray-500">{totalFailed.toLocaleString()} emails failed to deliver</p>
                </div>
                <ChevronRight className="text-gray-400 w-5 h-5" />
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
