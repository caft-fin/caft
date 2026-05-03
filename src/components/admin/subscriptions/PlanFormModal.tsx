'use client';

import { useState, useEffect } from 'react';
import { X, Plus, Trash2, GripVertical } from 'lucide-react';
import { IconPicker } from './IconPicker';
import { ImageUploader } from '@/components/ui/ImageUploader';
import type { PlanItem, CreatePlanData, BillingCycleType } from '@/lib/apiClient';
import { BILLING_CYCLE_LABELS } from '@/lib/apiClient';

const ALL_CYCLES: BillingCycleType[] = ['DAILY','WEEKLY','BIWEEKLY','MONTHLY','QUARTERLY','HALFYEARLY','ANNUALLY'];

interface PlanFormModalProps {
  plan?: PlanItem | null;
  onClose: () => void;
  onSave: (data: CreatePlanData) => Promise<void>;
  loading?: boolean;
}

function slugify(text: string): string {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

export function PlanFormModal({ plan, onClose, onSave, loading }: PlanFormModalProps) {
  const isEditing = !!plan;

  // Basic Info
  const [name, setName] = useState(plan?.name || '');
  const [slug, setSlug] = useState(plan?.slug || '');
  const [autoSlug, setAutoSlug] = useState(!isEditing);
  const [description, setDescription] = useState(plan?.description || '');
  const [bannerBadge, setBannerBadge] = useState(plan?.bannerBadge || '');
  const [planType, setPlanType] = useState<'FREE' | 'PAID'>(plan?.planType || 'PAID');
  const [itemCategory, setItemCategory] = useState<'SUBSCRIPTION' | 'DIGITAL_PRODUCT' | 'PHYSICAL_PRODUCT' | 'SERVICE'>(plan?.itemCategory || 'SUBSCRIPTION');
  const [images, setImages] = useState<string[]>(plan?.images || []);
  const [isPopular, setIsPopular] = useState(plan?.isPopular || false);
  const [sortOrder, setSortOrder] = useState(plan?.sortOrder || 0);
  const [stockLimit, setStockLimit] = useState<number | ''>(plan?.stockLimit ?? '');
  const [taxPercentage, setTaxPercentage] = useState<number | ''>(plan?.taxPercentage ?? '');

  // One-time purchase
  const [isOneTime, setIsOneTime] = useState(plan?.isOneTime || false);
  const [oneTimePrice, setOneTimePrice] = useState<number>((plan?.oneTimePrice || 0) / 100);

  // Free trial
  const [freeTrialEnabled, setFreeTrialEnabled] = useState(plan?.freeTrialEnabled || false);
  const [freeTrialDays, setFreeTrialDays] = useState(plan?.freeTrialDays || 7);

  // Discount
  const [discountEnabled, setDiscountEnabled] = useState(!!(plan?.discountPercent && plan.discountPercent > 0));
  const [discountPercent, setDiscountPercent] = useState(plan?.discountPercent || 0);
  const [discountLabel, setDiscountLabel] = useState(plan?.discountLabel || '');

  // Pricing durations
  const [enabledCycles, setEnabledCycles] = useState<Set<BillingCycleType>>(() => {
    if (plan?.pricing) return new Set(plan.pricing.map(p => p.billingCycle));
    return new Set<BillingCycleType>(['MONTHLY']);
  });
  const [prices, setPrices] = useState<Record<string, number>>(() => {
    const map: Record<string, number> = {};
    if (plan?.pricing) {
      plan.pricing.forEach(p => { map[p.billingCycle] = p.price / 100; });
    }
    return map;
  });

  // Features
  const [features, setFeatures] = useState<{ name: string; included: boolean; value: string; icon: string }[]>(() => {
    if (plan?.features && plan.features.length > 0) {
      return plan.features.map(f => ({
        name: f.name,
        included: f.included,
        value: f.value || '',
        icon: f.icon || 'check-circle',
      }));
    }
    return [{ name: '', included: true, value: '', icon: 'check-circle' }];
  });

  // Auto-slug
  useEffect(() => {
    // eslint-disable-next-line
    if (autoSlug && name) setSlug(slugify(name));
  }, [name, autoSlug]);

  const toggleCycle = (cycle: BillingCycleType) => {
    const next = new Set(enabledCycles);
    if (next.has(cycle)) { next.delete(cycle); } else { next.add(cycle); }
    setEnabledCycles(next);
  };

  const updatePrice = (cycle: string, val: number) => {
    setPrices(prev => ({ ...prev, [cycle]: val }));
  };

  const addFeature = () => {
    setFeatures(prev => [...prev, { name: '', included: true, value: '', icon: 'check-circle' }]);
  };

  const removeFeature = (idx: number) => {
    setFeatures(prev => prev.filter((_, i) => i !== idx));
  };

  const updateFeature = (idx: number, field: string, val: string | boolean) => {
    setFeatures(prev => prev.map((f, i) => i === idx ? { ...f, [field]: val } : f));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const data: CreatePlanData = {
      name,
      slug,
      description,
      planType,
      itemCategory,
      bannerBadge: bannerBadge || undefined,
      images,
      isPopular,
      sortOrder,
      stockLimit: stockLimit !== '' ? Number(stockLimit) : undefined,
      taxPercentage: taxPercentage !== '' ? Number(taxPercentage) : undefined,
      isOneTime,
      oneTimePrice: isOneTime ? Math.round(oneTimePrice * 100) : undefined,
      freeTrialEnabled,
      freeTrialDays: freeTrialEnabled ? freeTrialDays : undefined,
      discountPercent: discountEnabled ? discountPercent : undefined,
      discountLabel: discountEnabled ? discountLabel : undefined,
      pricing: planType === 'PAID' && !isOneTime
        ? Array.from(enabledCycles).map(cycle => ({
            billingCycle: cycle,
            price: Math.round((prices[cycle] || 0) * 100),
          }))
        : [],
      features: features.filter(f => f.name.trim()).map((f, i) => ({
        name: f.name,
        included: f.included,
        value: f.value || undefined,
        icon: f.icon,
        sortOrder: i,
      })),
    };

    await onSave(data);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-start justify-end">
      <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-2xl h-full bg-white shadow-2xl overflow-y-auto animate-slide-in-right">
        {/* Header */}
        <div className="sticky top-0 z-10 bg-white border-b border-gray-100 px-8 py-5 flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-900">{isEditing ? 'Edit Plan' : 'Create Plan'}</h2>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-gray-100 transition-colors">
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-8">
          {/* ── Basic Info ── */}
          <section>
            <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4">Basic Information</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Plan Name *</label>
                <input type="text" value={name} onChange={e => setName(e.target.value)} required
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-orange-200 focus:border-orange-400 text-sm" placeholder="e.g. Pro Plan" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Slug *</label>
                <div className="flex gap-2">
                  <input type="text" value={slug} onChange={e => { setSlug(e.target.value); setAutoSlug(false); }} required
                    className="flex-1 px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-orange-200 focus:border-orange-400 text-sm font-mono" placeholder="pro-plan" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Description *</label>
                <textarea value={description} onChange={e => setDescription(e.target.value)} required rows={3}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-orange-200 focus:border-orange-400 text-sm resize-none" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Banner Badge</label>
                  <input type="text" value={bannerBadge} onChange={e => setBannerBadge(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-orange-200 focus:border-orange-400 text-sm" placeholder="e.g. Most Popular" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Sort Order</label>
                  <input type="number" value={sortOrder} onChange={e => setSortOrder(Number(e.target.value))}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-orange-200 focus:border-orange-400 text-sm" />
                </div>
              </div>
              {/* Product Category & Type Toggle */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6 pt-2">
                <div className="flex items-center gap-3">
                  <label className="text-sm font-semibold text-gray-700">Type:</label>
                  <div className="flex rounded-xl overflow-hidden border border-gray-200">
                    <button type="button" onClick={() => setPlanType('FREE')}
                      className={`px-4 py-2 text-sm font-semibold transition-colors ${planType === 'FREE' ? 'bg-green-500 text-white' : 'bg-white text-gray-600 hover:bg-gray-50'}`}>
                      FREE
                    </button>
                    <button type="button" onClick={() => setPlanType('PAID')}
                      className={`px-4 py-2 text-sm font-semibold transition-colors ${planType === 'PAID' ? 'bg-orange-500 text-white' : 'bg-white text-gray-600 hover:bg-gray-50'}`}>
                      PAID
                    </button>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <label className="text-sm font-semibold text-gray-700">Category:</label>
                  <select value={itemCategory} onChange={e => setItemCategory(e.target.value as 'SUBSCRIPTION' | 'DIGITAL_PRODUCT' | 'PHYSICAL_PRODUCT' | 'SERVICE')}
                    className="px-3 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-orange-200 focus:border-orange-400 bg-white cursor-pointer">
                    <option value="SUBSCRIPTION">Subscription</option>
                    <option value="DIGITAL_PRODUCT">Digital Product</option>
                    <option value="PHYSICAL_PRODUCT">Physical Product</option>
                    <option value="SERVICE">Service</option>
                  </select>
                </div>

                <label className="flex items-center gap-2 ml-auto cursor-pointer">
                  <input type="checkbox" checked={isPopular} onChange={e => setIsPopular(e.target.checked)} className="accent-orange-500 w-4 h-4" />
                  <span className="text-sm font-medium text-gray-600">Mark as Popular</span>
                </label>
              </div>

              {/* Product Media & Inventory */}
              {(itemCategory === 'DIGITAL_PRODUCT' || itemCategory === 'PHYSICAL_PRODUCT') && (
                <div className="grid grid-cols-1 gap-4 pt-4 border-t border-gray-100 mt-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">Product Images</label>
                    <ImageUploader images={images} onChange={setImages} />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1.5">Stock Limit</label>
                      <input type="number" min="0" value={stockLimit} onChange={e => setStockLimit(e.target.value === '' ? '' : Number(e.target.value))}
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-orange-200 focus:border-orange-400 text-sm" placeholder="e.g. 100 (Leave empty for infinite)" />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1.5">Tax Percentage (%)</label>
                      <input type="number" min="0" max="100" step="0.1" value={taxPercentage} onChange={e => setTaxPercentage(e.target.value === '' ? '' : Number(e.target.value))}
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-orange-200 focus:border-orange-400 text-sm" placeholder="e.g. 18" />
                    </div>
                  </div>
                </div>
              )}
            </div>
          </section>

          {/* ── Features ── */}
          <section>
            <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4">Features</h3>
            <div className="space-y-3">
              {features.map((f, idx) => (
                <div key={idx} className="flex items-center gap-2 bg-gray-50 rounded-xl px-3 py-2">
                  <GripVertical className="w-4 h-4 text-gray-300 flex-shrink-0" />
                  <IconPicker value={f.icon} onChange={val => updateFeature(idx, 'icon', val)} />
                  <input type="text" value={f.name} onChange={e => updateFeature(idx, 'name', e.target.value)} placeholder="Feature name"
                    className="flex-1 px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:border-orange-300" />
                  <input type="text" value={f.value} onChange={e => updateFeature(idx, 'value', e.target.value)} placeholder="Value"
                    className="w-24 px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:border-orange-300" />
                  <label className="flex items-center gap-1 cursor-pointer flex-shrink-0">
                    <input type="checkbox" checked={f.included} onChange={e => updateFeature(idx, 'included', e.target.checked)} className="accent-orange-500" />
                    <span className="text-xs text-gray-500">Incl.</span>
                  </label>
                  <button type="button" onClick={() => removeFeature(idx)} disabled={features.length <= 1}
                    className="p-1.5 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors disabled:opacity-30">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
              <button type="button" onClick={addFeature}
                className="flex items-center gap-2 text-sm font-semibold text-orange-600 hover:text-orange-700 px-3 py-2">
                <Plus className="w-4 h-4" /> Add Feature
              </button>
            </div>
          </section>

          {/* ── Pricing & Duration (PAID only) ── */}
          {planType === 'PAID' && (
            <section>
              <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4">Pricing & Duration</h3>

              {/* One-time toggle */}
              <label className="flex items-center gap-3 mb-4 cursor-pointer">
                <input type="checkbox" checked={isOneTime} onChange={e => setIsOneTime(e.target.checked)} className="accent-orange-500 w-4 h-4" />
                <span className="text-sm font-semibold text-gray-700">One-Time Purchase (Lifetime)</span>
              </label>

              {isOneTime ? (
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">One-Time Price (₹) *</label>
                  <input type="number" step="0.01" min="0" value={oneTimePrice} onChange={e => setOneTimePrice(Number(e.target.value))} required
                    className="w-48 px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-orange-200 focus:border-orange-400 text-sm" />
                </div>
              ) : (
                <>
                  <p className="text-xs text-gray-500 mb-3">Select durations and set pricing for each:</p>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-4">
                    {ALL_CYCLES.map(cycle => (
                      <label key={cycle} className={`flex items-center gap-2 px-3 py-2.5 rounded-xl border cursor-pointer transition-all ${
                        enabledCycles.has(cycle) ? 'border-orange-300 bg-orange-50 text-orange-700' : 'border-gray-200 text-gray-500 hover:border-gray-300'
                      }`}>
                        <input type="checkbox" checked={enabledCycles.has(cycle)} onChange={() => toggleCycle(cycle)} className="accent-orange-500" />
                        <span className="text-xs font-semibold">{BILLING_CYCLE_LABELS[cycle]}</span>
                      </label>
                    ))}
                  </div>
                  {Array.from(enabledCycles).length > 0 && (
                    <div className="space-y-3">
                      {Array.from(enabledCycles).map(cycle => (
                        <div key={cycle} className="flex items-center gap-3">
                          <span className="text-sm font-medium text-gray-600 w-28">{BILLING_CYCLE_LABELS[cycle]}</span>
                          <div className="relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">₹</span>
                            <input type="number" step="0.01" min="0" value={prices[cycle] || ''} onChange={e => updatePrice(cycle, Number(e.target.value))}
                              className="w-40 pl-7 pr-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-orange-200 focus:border-orange-400 text-sm" placeholder="0.00" />
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </>
              )}
            </section>
          )}

          {/* ── Trial & Discount ── */}
          <section>
            <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4">Trial & Discount</h3>
            <div className="space-y-4">
              <div className="flex items-start gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={freeTrialEnabled} onChange={e => setFreeTrialEnabled(e.target.checked)} className="accent-orange-500 w-4 h-4" />
                  <span className="text-sm font-semibold text-gray-700">Offer Free Trial</span>
                </label>
                {freeTrialEnabled && (
                  <input type="number" min="1" max="365" value={freeTrialDays} onChange={e => setFreeTrialDays(Number(e.target.value))}
                    className="w-24 px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:border-orange-300" placeholder="Days" />
                )}
                {freeTrialEnabled && <span className="text-sm text-gray-500 mt-1">days</span>}
              </div>
              <div>
                <label className="flex items-center gap-2 cursor-pointer mb-3">
                  <input type="checkbox" checked={discountEnabled} onChange={e => setDiscountEnabled(e.target.checked)} className="accent-orange-500 w-4 h-4" />
                  <span className="text-sm font-semibold text-gray-700">Apply Discount</span>
                </label>
                {discountEnabled && (
                  <div className="flex items-center gap-4 ml-6">
                    <div className="flex items-center gap-2">
                      <input type="range" min="0" max="100" step="1" value={discountPercent} onChange={e => setDiscountPercent(Number(e.target.value))}
                        className="w-32 accent-orange-500" />
                      <input type="number" min="0" max="100" value={discountPercent} onChange={e => setDiscountPercent(Number(e.target.value))}
                        className="w-16 px-2 py-1.5 rounded-lg border border-gray-200 text-sm text-center focus:outline-none focus:border-orange-300" />
                      <span className="text-sm text-gray-500">%</span>
                    </div>
                    <input type="text" value={discountLabel} onChange={e => setDiscountLabel(e.target.value)} placeholder="Label (e.g. Launch Offer)"
                      className="flex-1 px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:border-orange-300" />
                  </div>
                )}
              </div>
            </div>
          </section>

          {/* Actions */}
          <div className="flex gap-3 pt-4 border-t border-gray-100">
            <button type="button" onClick={onClose}
              className="flex-1 py-3 rounded-xl border border-gray-200 text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-colors">
              Cancel
            </button>
            <button type="submit" disabled={loading}
              className="flex-1 py-3 rounded-xl sun-gradient text-white text-sm font-bold shadow-lg hover:opacity-90 transition-all disabled:opacity-50">
              {loading ? 'Saving...' : (isEditing ? 'Update Plan' : 'Create Plan')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
