'use client';

import { useState, useEffect, useCallback } from 'react';
import { Plus, Pencil, Trash2, Copy, CreditCard, TrendingUp, Users, BarChart3, AlertTriangle, Package, Percent, ChevronDown } from 'lucide-react';
import { api, BILLING_CYCLE_LABELS } from '@/lib/apiClient';
import type { PlanItem, BillingCycleType, CreatePlanData, SubscriptionAnalytics, RevenueAnalytics, ChurnAnalytics, GrowthAnalytics } from '@/lib/apiClient';
import { PlanFormModal } from '@/components/admin/subscriptions/PlanFormModal';
import { getIconComponent } from '@/components/admin/subscriptions/IconPicker';

type Tab = 'plans' | 'bundles' | 'discounts' | 'analytics';

export default function ProductsPage() {
  const [tab, setTab] = useState<Tab>('plans');
  const [allPlans, setAllPlans] = useState<PlanItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingPlan, setEditingPlan] = useState<PlanItem | null>(null);
  const [saving, setSaving] = useState(false);
  const [analytics, setAnalytics] = useState<SubscriptionAnalytics | null>(null);
  const [revenue, setRevenue] = useState<RevenueAnalytics | null>(null);
  const [churn, setChurn] = useState<ChurnAnalytics | null>(null);
  const [growth, setGrowth] = useState<GrowthAnalytics | null>(null);

  const fetchPlans = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.admin.plans.all();
      setAllPlans(res.data);
    } catch { } finally { setLoading(false); }
  }, []);

  const plans = allPlans.filter(p => p.itemCategory !== 'SUBSCRIPTION');

  const fetchAnalytics = useCallback(async () => {
    try {
      const [a, r, c, g] = await Promise.all([
        api.admin.analytics.subscriptions(),
        api.admin.analytics.revenue(),
        api.admin.analytics.churn(),
        api.admin.analytics.growth(),
      ]);
      setAnalytics(a.data); setRevenue(r.data); setChurn(c.data); setGrowth(g.data);
    } catch { }
  }, []);

  useEffect(() => { fetchPlans(); }, [fetchPlans]);
  useEffect(() => { if (tab === 'analytics') fetchAnalytics(); }, [tab, fetchAnalytics]);

  const handleSave = async (data: CreatePlanData) => {
    setSaving(true);
    try {
      if (editingPlan) { await api.admin.plans.update(editingPlan.id, data); }
      else { await api.admin.plans.create(data); }
      setShowForm(false); setEditingPlan(null); fetchPlans();
    } catch (e: unknown) { alert(e instanceof Error ? e.message : 'Failed to save'); } finally { setSaving(false); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this plan?')) return;
    try { await api.admin.plans.delete(id); fetchPlans(); } catch { }
  };

  const handleDuplicate = async (id: string) => {
    try { await api.admin.plans.duplicate(id); fetchPlans(); } catch { }
  };

  const tabs: { id: Tab; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { id: 'plans', label: 'Plans', icon: CreditCard },
    { id: 'bundles', label: 'Bundles', icon: Package },
    { id: 'discounts', label: 'Discounts', icon: Percent },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
  ];

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-black text-gray-900">Product Management</h1>
          <p className="text-sm text-gray-500 mt-1">Manage digital and physical products, and view analytics</p>
        </div>
        {tab === 'plans' && (
          <button onClick={() => { setEditingPlan(null); setShowForm(true); }}
            className="flex items-center gap-2 px-5 py-3 rounded-xl sun-gradient text-white font-bold text-sm shadow-lg hover:opacity-90 transition-all active:scale-95">
            <Plus className="w-4 h-4" /> Add Product
          </button>
        )}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 rounded-xl p-1 mb-8 w-fit">
        {tabs.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold transition-all ${tab === t.id ? 'bg-white text-orange-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>
            <t.icon className="w-4 h-4" /> {t.label}
          </button>
        ))}
      </div>

      {/* Plans Tab */}
      {tab === 'plans' && (
        <div className="space-y-4">
          {loading ? (
            <div className="text-center py-20 text-gray-400">Loading products...</div>
          ) : plans.length === 0 ? (
            <div className="text-center py-20">
              <Package className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 font-medium">No products yet. Create your first product.</p>
            </div>
          ) : (
            plans.map(plan => (
              <div key={plan.id} className={`bg-white rounded-2xl border p-6 transition-all hover:shadow-md ${plan.isActive ? 'border-gray-100' : 'border-red-100 opacity-60'}`}>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-bold text-gray-900">{plan.name}</h3>
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${plan.planType === 'FREE' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'}`}>
                        {plan.planType}
                      </span>
                      {plan.bannerBadge && <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-purple-100 text-purple-700">{plan.bannerBadge}</span>}
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-blue-100 text-blue-700">{plan.itemCategory?.replace('_', ' ')}</span>
                      {!plan.isActive && <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-red-100 text-red-600">Inactive</span>}
                      {plan.stockLimit !== null && plan.stockLimit !== undefined && <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-gray-100 text-gray-700">Stock: {plan.stockLimit}</span>}
                      {plan.isOneTime && <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-indigo-100 text-indigo-700">Lifetime</span>}
                      {plan.freeTrialEnabled && <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-teal-100 text-teal-700">{plan.freeTrialDays}d Trial</span>}
                      {(plan.discountPercent ?? 0) > 0 && <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-pink-100 text-pink-700">{plan.discountPercent}% Off</span>}
                    </div>
                    <p className="text-sm text-gray-500 mb-3 max-w-xl">{plan.description}</p>
                    {/* Pricing */}
                    <div className="flex flex-wrap gap-2 mb-3">
                      {plan.isOneTime && plan.oneTimePrice ? (
                        <span className="text-sm font-bold text-gray-700 bg-gray-100 px-3 py-1 rounded-lg">₹{(plan.oneTimePrice / 100).toLocaleString()} one-time</span>
                      ) : null}
                      {plan.pricing?.map(p => (
                        <span key={p.billingCycle} className="text-sm font-medium text-gray-600 bg-gray-50 px-3 py-1 rounded-lg">
                          ₹{(p.price / 100).toLocaleString()}<span className="text-gray-400 text-xs">/{BILLING_CYCLE_LABELS[p.billingCycle as BillingCycleType]?.toLowerCase()}</span>
                        </span>
                      ))}
                    </div>
                    {/* Features preview */}
                    <div className="flex flex-wrap gap-x-4 gap-y-1">
                      {plan.features?.slice(0, 5).map((f, i) => {
                        const Icon = getIconComponent(f.icon);
                        return (
                          <span key={i} className={`flex items-center gap-1.5 text-xs ${f.included ? 'text-gray-600' : 'text-gray-400 line-through'}`}>
                            {Icon && <Icon className="w-3 h-3" />} {f.name}
                          </span>
                        );
                      })}
                      {(plan.features?.length || 0) > 5 && <span className="text-xs text-gray-400">+{(plan.features?.length || 0) - 5} more</span>}
                    </div>
                  </div>
                  {/* Actions */}
                  <div className="flex items-center gap-1 ml-4">
                    <span className="text-xs text-gray-400 mr-2">{plan._count?.subscriptions || 0} subs</span>
                    <button onClick={() => { setEditingPlan(plan); setShowForm(true); }} className="p-2 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-orange-600 transition-colors" title="Edit">
                      <Pencil className="w-4 h-4" />
                    </button>
                    <button onClick={() => handleDuplicate(plan.id)} className="p-2 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-blue-600 transition-colors" title="Duplicate">
                      <Copy className="w-4 h-4" />
                    </button>
                    <button onClick={() => handleDelete(plan.id)} className="p-2 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-600 transition-colors" title="Delete">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Bundles Tab */}
      {tab === 'bundles' && <BundlesTab plans={plans} />}

      {/* Discounts Tab */}
      {tab === 'discounts' && <DiscountsTab plans={plans} onRefresh={fetchPlans} />}

      {/* Analytics Tab */}
      {tab === 'analytics' && <AnalyticsTab analytics={analytics} revenue={revenue} churn={churn} growth={growth} />}

      {/* Plan Form Modal */}
      {showForm && (
        <PlanFormModal plan={editingPlan} onClose={() => { setShowForm(false); setEditingPlan(null); }} onSave={handleSave} loading={saving} />
      )}
    </div>
  );
}

/* ── Bundles Tab ── */
function BundlesTab({ plans }: { plans: PlanItem[] }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-8 text-center">
      <Package className="w-12 h-12 text-gray-300 mx-auto mb-4" />
      <h3 className="text-lg font-bold text-gray-700 mb-2">Plan Bundles</h3>
      <p className="text-sm text-gray-500 mb-6 max-w-md mx-auto">Bundle multiple plans together and offer them at a custom price.</p>
      <button className="px-5 py-3 rounded-xl sun-gradient text-white font-bold text-sm shadow-lg hover:opacity-90 transition-all">
        <Plus className="w-4 h-4 inline mr-2" /> Create Bundle
      </button>
    </div>
  );
}

/* ── Discounts Tab ── */
function DiscountsTab({ plans, onRefresh }: { plans: PlanItem[]; onRefresh: () => void }) {
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [pct, setPct] = useState(10);
  const [label, setLabel] = useState('');

  const togglePlan = (id: string) => {
    const next = new Set(selected);
    if (next.has(id)) { next.delete(id); } else { next.add(id); }
    setSelected(next);
  };

  const applyDiscount = async () => {
    if (selected.size === 0) return;
    try {
      await api.admin.plans.bulkDiscount(Array.from(selected), pct, label);
      onRefresh(); setSelected(new Set());
    } catch { }
  };

  const removeDiscount = async () => {
    if (selected.size === 0) return;
    try {
      await api.admin.plans.bulkRemoveDiscount(Array.from(selected));
      onRefresh(); setSelected(new Set());
    } catch { }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl border border-gray-100 p-6">
        <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4">Apply Bulk Discount</h3>
        <div className="flex items-end gap-4 mb-6">
          <div>
            <label className="text-xs font-semibold text-gray-600 block mb-1">Discount %</label>
            <input type="number" min="0" max="100" value={pct} onChange={e => setPct(Number(e.target.value))} className="w-24 px-3 py-2 rounded-lg border border-gray-200 text-sm" />
          </div>
          <div className="flex-1">
            <label className="text-xs font-semibold text-gray-600 block mb-1">Label</label>
            <input type="text" value={label} onChange={e => setLabel(e.target.value)} placeholder="e.g. Launch Offer" className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm" />
          </div>
          <button onClick={applyDiscount} disabled={selected.size === 0} className="px-4 py-2 rounded-lg bg-orange-500 text-white text-sm font-bold disabled:opacity-40">Apply</button>
          <button onClick={removeDiscount} disabled={selected.size === 0} className="px-4 py-2 rounded-lg bg-red-500 text-white text-sm font-bold disabled:opacity-40">Remove</button>
        </div>
        <div className="space-y-2">
          {plans.filter(p => p.planType === 'PAID').map(plan => (
            <label key={plan.id} className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all ${selected.has(plan.id) ? 'border-orange-300 bg-orange-50' : 'border-gray-100 hover:border-gray-200'}`}>
              <input type="checkbox" checked={selected.has(plan.id)} onChange={() => togglePlan(plan.id)} className="accent-orange-500" />
              <span className="text-sm font-medium text-gray-700 flex-1">{plan.name}</span>
              {(plan.discountPercent ?? 0) > 0 && <span className="text-xs font-bold text-pink-600 bg-pink-50 px-2 py-0.5 rounded-full">{plan.discountPercent}% off — {plan.discountLabel}</span>}
            </label>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ── Analytics Tab ── */
function AnalyticsTab({ analytics, revenue, churn, growth }: { analytics: SubscriptionAnalytics | null; revenue: RevenueAnalytics | null; churn: ChurnAnalytics | null; growth: GrowthAnalytics | null }) {
  if (!analytics) return <div className="text-center py-20 text-gray-400">Loading analytics...</div>;

  const kpis = [
    { label: 'Total Subscribers', value: analytics.totalSubscribers, icon: Users, color: 'bg-blue-50 text-blue-600' },
    { label: 'Active', value: analytics.activeSubscriptions, icon: TrendingUp, color: 'bg-green-50 text-green-600' },
    { label: 'Total Revenue', value: revenue ? `₹${(revenue.totalRevenue / 100).toLocaleString()}` : '—', icon: CreditCard, color: 'bg-orange-50 text-orange-600' },
    { label: 'MRR', value: revenue ? `₹${(revenue.mrr / 100).toLocaleString()}` : '—', icon: BarChart3, color: 'bg-purple-50 text-purple-600' },
    { label: 'ARR', value: revenue ? `₹${(revenue.arr / 100).toLocaleString()}` : '—', icon: TrendingUp, color: 'bg-indigo-50 text-indigo-600' },
    { label: 'Churn Rate (30d)', value: churn ? `${churn.churnRate30Day}%` : '—', icon: AlertTriangle, color: 'bg-red-50 text-red-600' },
  ];

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {kpis.map((k, i) => (
          <div key={i} className="bg-white rounded-2xl border border-gray-100 p-4">
            <div className={`w-9 h-9 rounded-xl ${k.color} flex items-center justify-center mb-3`}><k.icon className="w-4 h-4" /></div>
            <p className="text-xl font-black text-gray-900">{k.value}</p>
            <p className="text-[11px] text-gray-500 font-medium mt-1">{k.label}</p>
          </div>
        ))}
      </div>

      {/* Per-Plan Breakdown */}
      {analytics.perPlanBreakdown?.length > 0 && (
        <div className="bg-white rounded-2xl border border-gray-100 p-6">
          <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4">Subscribers by Plan</h3>
          <div className="space-y-3">
            {analytics.perPlanBreakdown.map((p) => (
              <div key={p.planId} className="flex items-center gap-4">
                <span className="text-sm font-medium text-gray-700 w-40">{p.planName}</span>
                <div className="flex-1 h-6 bg-gray-100 rounded-full overflow-hidden">
                  <div className="h-full sun-gradient rounded-full transition-all" style={{ width: `${Math.min(100, (p.activeSubscribers / Math.max(1, analytics.activeSubscriptions)) * 100)}%` }} />
                </div>
                <span className="text-sm font-bold text-gray-900 w-12 text-right">{p.activeSubscribers}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Revenue by Plan */}
      {revenue && revenue.revenueByPlan && revenue.revenueByPlan.length > 0 && (
        <div className="bg-white rounded-2xl border border-gray-100 p-6">
          <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4">Revenue by Plan</h3>
          <div className="space-y-3">
            {revenue.revenueByPlan.map((r) => (
              <div key={r.planId} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                <span className="text-sm font-medium text-gray-700">{r.planName}</span>
                <div className="flex items-center gap-4">
                  <span className="text-xs text-gray-400">{r.count} payments</span>
                  <span className="text-sm font-bold text-gray-900">₹{(r.revenue / 100).toLocaleString()}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Growth & Churn */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {growth && (
          <div className="bg-white rounded-2xl border border-gray-100 p-6">
            <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4">Growth (12 Months)</h3>
            <div className="space-y-2">
              {growth.newSubscriptionsMonthly?.map((m, i: number) => (
                <div key={i} className="flex items-center gap-3">
                  <span className="text-xs text-gray-500 w-16">{m.month}</span>
                  <div className="flex-1 h-4 bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full bg-green-400 rounded-full" style={{ width: `${Math.min(100, m.count * 10)}%` }} />
                  </div>
                  <span className="text-xs font-bold text-gray-700 w-8 text-right">+{m.count}</span>
                </div>
              ))}
            </div>
          </div>
        )}
        {churn && (
          <div className="bg-white rounded-2xl border border-gray-100 p-6">
            <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4">Churn Details</h3>
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="text-center p-3 bg-red-50 rounded-xl"><p className="text-xl font-black text-red-600">{churn.cancelledLast30Days}</p><p className="text-[10px] text-red-500 mt-1">Last 30 days</p></div>
              <div className="text-center p-3 bg-amber-50 rounded-xl"><p className="text-xl font-black text-amber-600">{churn.failedPayments}</p><p className="text-[10px] text-amber-500 mt-1">Failed Payments</p></div>
            </div>
            {churn.cancelReasons?.length > 0 && (
              <div>
                <p className="text-xs font-semibold text-gray-500 mb-2">Top Cancel Reasons</p>
                {churn.cancelReasons.slice(0, 5).map((r, i: number) => (
                  <div key={i} className="flex justify-between text-xs py-1"><span className="text-gray-600">{r.reason}</span><span className="font-bold text-gray-800">{r.count}</span></div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Trial & Abandoned */}
      {growth && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white rounded-2xl border border-gray-100 p-5 text-center">
            <p className="text-3xl font-black text-teal-600">{growth.trialConversionRate}%</p>
            <p className="text-xs text-gray-500 mt-1">Trial → Paid Conversion</p>
          </div>
          <div className="bg-white rounded-2xl border border-gray-100 p-5 text-center">
            <p className="text-3xl font-black text-amber-600">{growth.abandonedSubscriptions}</p>
            <p className="text-xs text-gray-500 mt-1">Abandoned Checkouts</p>
          </div>
          <div className="bg-white rounded-2xl border border-gray-100 p-5 text-center">
            <p className="text-3xl font-black text-indigo-600">{growth.typeBreakdown?.recurring || 0} / {growth.typeBreakdown?.oneTime || 0}</p>
            <p className="text-xs text-gray-500 mt-1">Recurring / One-time</p>
          </div>
        </div>
      )}
    </div>
  );
}
