'use client';

import { useState, useEffect } from 'react';
import { api } from '@/lib/apiClient';
import type { CategoryPricingItem, PricingMode } from '@/lib/apiClient';
import { Loader2, Save, Tag } from 'lucide-react';

const CATEGORIES = [
  { id: 'SUBSCRIPTION', label: 'Subscriptions' },
  { id: 'DIGITAL_PRODUCT', label: 'Digital Products' },
  { id: 'PHYSICAL_PRODUCT', label: 'Physical Products' },
  { id: 'SERVICE', label: 'Services' },
] as const;

export function CategoryPricingTab() {
  const [pricing, setPricing] = useState<CategoryPricingItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);

  useEffect(() => {
    fetchPricing();
  }, []);

  const fetchPricing = async () => {
    try {
      const res = await api.admin.categoryPricing.all();
      setPricing(res.data);
    } catch (err) {
      console.error('Failed to load category pricing:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (itemCategory: 'SUBSCRIPTION' | 'DIGITAL_PRODUCT' | 'PHYSICAL_PRODUCT' | 'SERVICE', data: Partial<CategoryPricingItem>) => {
    setSaving(itemCategory);
    try {
      await api.admin.categoryPricing.upsert({ ...data, itemCategory });
      await fetchPricing();
      alert('Saved successfully!');
    } catch (err: any) {
      alert(err.message || 'Failed to save');
    } finally {
      setSaving(null);
    }
  };

  if (loading) {
    return <div className="text-center py-20 text-gray-400">Loading pricing rules...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="mb-6">
        <h2 className="text-lg font-bold text-gray-900">Category Pricing Rules</h2>
        <p className="text-sm text-gray-500">Configure default tax and fee structures for different product categories. These can be overridden on individual plans.</p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {CATEGORIES.map(cat => {
          const catPricing = pricing.find(p => p.itemCategory === cat.id) || {
            gstMode: 'PERCENT' as PricingMode, gstValue: 0,
            gatewayChargeMode: 'PERCENT' as PricingMode, gatewayChargeValue: 0,
            serviceFeeMode: 'FLAT' as PricingMode, serviceFeeValue: 0,
            processingFeeMode: 'FLAT' as PricingMode, processingFeeValue: 0,
            platformChargeMode: 'PERCENT' as PricingMode, platformChargeValue: 0,
          };

          return (
            <PricingCard 
              key={cat.id}
              title={cat.label}
              itemCategory={cat.id}
              initialData={catPricing}
              onSave={(data) => handleSave(cat.id, data)}
              saving={saving === cat.id}
            />
          );
        })}
      </div>
    </div>
  );
}

function PricingCard({ 
  title, 
  itemCategory, 
  initialData, 
  onSave, 
  saving 
}: { 
  title: string; 
  itemCategory: 'SUBSCRIPTION' | 'DIGITAL_PRODUCT' | 'PHYSICAL_PRODUCT' | 'SERVICE'; 
  initialData: Partial<CategoryPricingItem>; 
  onSave: (data: Partial<CategoryPricingItem>) => void;
  saving: boolean;
}) {
  const [data, setData] = useState(initialData);

  const updateField = (field: keyof CategoryPricingItem, value: any) => {
    setData(prev => ({ ...prev, [field]: value }));
  };

  const fields = [
    { key: 'gst', label: 'GST' },
    { key: 'gatewayCharge', label: 'Gateway Charge' },
    { key: 'serviceFee', label: 'Service Fee' },
    { key: 'processingFee', label: 'Processing Fee' },
    { key: 'platformCharge', label: 'Platform Charge' },
  ] as const;

  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
      <div className="flex items-center gap-3 mb-6 border-b border-gray-100 pb-4">
        <div className="w-10 h-10 rounded-xl bg-orange-50 flex items-center justify-center">
          <Tag className="w-5 h-5 text-orange-600" />
        </div>
        <h3 className="text-lg font-bold text-gray-900">{title}</h3>
      </div>

      <div className="space-y-5">
        {fields.map(f => {
          const modeKey = `${f.key}Mode` as keyof CategoryPricingItem;
          const valKey = `${f.key}Value` as keyof CategoryPricingItem;
          const mode = data[modeKey] as PricingMode || 'PERCENT';
          const val = data[valKey] as number || 0;

          return (
            <div key={f.key} className="flex items-center gap-4">
              <label className="text-sm font-semibold text-gray-700 w-32 shrink-0">{f.label}</label>
              <div className="flex-1 flex items-center gap-2">
                <div className="relative flex-1">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm font-medium">
                    {mode === 'FLAT' ? '₹' : ''}
                  </div>
                  <input 
                    type="number" 
                    className={`w-full text-sm border-gray-200 rounded-lg focus:ring-orange-500 focus:border-orange-500 ${mode === 'FLAT' ? 'pl-7' : 'pl-3'}`}
                    value={mode === 'PERCENT' ? val : val / 100}
                    onChange={(e) => updateField(valKey, mode === 'PERCENT' ? parseFloat(e.target.value) || 0 : Math.round((parseFloat(e.target.value) || 0) * 100))}
                  />
                  {mode === 'PERCENT' && (
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm font-medium">%</div>
                  )}
                </div>
                <select 
                  className="text-sm border-gray-200 rounded-lg focus:ring-orange-500 focus:border-orange-500 bg-gray-50 text-gray-600 font-medium w-28"
                  value={mode}
                  onChange={(e) => {
                    updateField(modeKey, e.target.value);
                    updateField(valKey, 0); // Reset value when switching modes
                  }}
                >
                  <option value="PERCENT">Percent</option>
                  <option value="FLAT">Flat ₹</option>
                </select>
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-6 pt-6 border-t border-gray-100 flex justify-end">
        <button 
          onClick={() => onSave(data)}
          disabled={saving}
          className="flex items-center gap-2 px-5 py-2.5 bg-orange-600 hover:bg-orange-700 text-white rounded-xl text-sm font-bold transition-all disabled:opacity-50"
        >
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          Save {title} Pricing
        </button>
      </div>
    </div>
  );
}
