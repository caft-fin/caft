'use client';

import { useState, useEffect } from 'react';
import { api } from '@/lib/apiClient';
import type { PlanItem, PlanBundleItem, CreateBundleData } from '@/lib/apiClient';
import { Plus, Package, Edit, Trash2, Loader2, AlertTriangle, IndianRupee } from 'lucide-react';

export function BundlesTab({ plans }: { plans: PlanItem[] }) {
  const [bundles, setBundles] = useState<PlanBundleItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingBundle, setEditingBundle] = useState<PlanBundleItem | null>(null);
  const [saving, setSaving] = useState(false);

  const fetchBundles = async () => {
    try {
      const res = await api.admin.bundles.all();
      setBundles(res.data || []);
    } catch (err) {
      console.error('Failed to load bundles:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBundles();
  }, []);

  const handleSave = async (data: CreateBundleData) => {
    setSaving(true);
    try {
      if (editingBundle) {
        await api.admin.bundles.update(editingBundle.id, data);
      } else {
        await api.admin.bundles.create(data);
      }
      setShowForm(false);
      setEditingBundle(null);
      await fetchBundles();
    } catch (err: unknown) {
      const error = err as { message?: string };
      alert(error.message || 'Failed to save bundle');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this bundle? This action cannot be undone.')) return;
    try {
      await api.admin.bundles.delete(id);
      await fetchBundles();
    } catch (err: unknown) {
      const error = err as { message?: string };
      alert(error.message || 'Failed to delete bundle');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-400">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Plan Bundles</h2>
          <p className="text-sm text-gray-500">Group multiple plans together to offer them at a discounted combined price.</p>
        </div>
        <button 
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 px-4 py-2 sun-gradient text-white font-bold rounded-xl shadow-lg hover:opacity-90 transition-opacity text-sm"
        >
          <Plus className="w-4 h-4" /> Create Bundle
        </button>
      </div>

      {bundles.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center">
          <Package className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-gray-700 mb-2">No bundles yet</h3>
          <p className="text-sm text-gray-500 mb-6 max-w-md mx-auto">Create a bundle to offer your customers a group of plans at a special price.</p>
          <button 
            onClick={() => setShowForm(true)}
            className="px-5 py-3 rounded-xl sun-gradient text-white font-bold text-sm shadow-lg hover:opacity-90 transition-all"
          >
            Create Your First Bundle
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {bundles.map(bundle => (
            <div key={bundle.id} className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm flex flex-col">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-lg font-bold text-gray-900">{bundle.name}</h3>
                  <span className="text-xs font-mono text-gray-400">{bundle.slug}</span>
                </div>
                <div className="flex gap-1">
                  <button onClick={() => { setEditingBundle(bundle); setShowForm(true); }} className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                    <Edit className="w-4 h-4" />
                  </button>
                  <button onClick={() => handleDelete(bundle.id)} className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
              
              <div className="text-2xl font-black text-gray-900 mb-1">
                ₹{(bundle.price / 100).toLocaleString('en-IN')}
              </div>
              
              {bundle.description && (
                <p className="text-sm text-gray-500 mb-4 line-clamp-2">{bundle.description}</p>
              )}

              <div className="mt-auto pt-4 border-t border-gray-50">
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Included Plans</p>
                <div className="flex flex-wrap gap-2">
                  {bundle.plans.map(p => (
                    <span key={p.plan.id} className="px-2 py-1 bg-gray-100 text-gray-600 rounded-lg text-xs font-medium">
                      {p.plan.name}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {showForm && (
        <BundleFormModal 
          bundle={editingBundle} 
          plans={plans}
          onClose={() => { setShowForm(false); setEditingBundle(null); }} 
          onSave={handleSave}
          loading={saving}
        />
      )}
    </div>
  );
}

function BundleFormModal({ 
  bundle, 
  plans,
  onClose, 
  onSave, 
  loading 
}: { 
  bundle?: PlanBundleItem | null; 
  plans: PlanItem[];
  onClose: () => void; 
  onSave: (data: CreateBundleData) => Promise<void>;
  loading: boolean;
}) {
  const isEditing = !!bundle;
  const [name, setName] = useState(bundle?.name || '');
  const [slug, setSlug] = useState(bundle?.slug || '');
  const [autoSlug, setAutoSlug] = useState(!isEditing);
  const [description, setDescription] = useState(bundle?.description || '');
  const [price, setPrice] = useState((bundle?.price || 0) / 100);
  const [planIds, setPlanIds] = useState<Set<string>>(
    new Set(bundle?.plans.map(p => p.plan.id) || [])
  );

  useEffect(() => {
    if (autoSlug && name) {
      setSlug(name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''));
    }
  }, [name, autoSlug]);

  const togglePlan = (id: string) => {
    const next = new Set(planIds);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setPlanIds(next);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (planIds.size === 0) {
      alert('Please select at least one plan for this bundle.');
      return;
    }
    await onSave({
      name,
      slug,
      description,
      price: Math.round(price * 100),
      currency: 'INR',
      planIds: Array.from(planIds)
    });
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden animate-scale-in">
        <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-900">{isEditing ? 'Edit Bundle' : 'Create Bundle'}</h2>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Bundle Name *</label>
            <input type="text" value={name} onChange={e => setName(e.target.value)} required
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-orange-200 focus:border-orange-400 text-sm" placeholder="e.g. Pro Suite" />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Slug *</label>
            <input type="text" value={slug} onChange={e => { setSlug(e.target.value); setAutoSlug(false); }} required
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-orange-200 focus:border-orange-400 text-sm font-mono" placeholder="pro-suite" />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Description</label>
            <textarea value={description} onChange={e => setDescription(e.target.value)} rows={2}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-orange-200 focus:border-orange-400 text-sm resize-none" placeholder="Brief description of the bundle" />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Price (₹) *</label>
            <input type="number" step="0.01" min="0" value={price || ''} onChange={e => setPrice(Number(e.target.value))} required
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-orange-200 focus:border-orange-400 text-sm" placeholder="0.00" />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Included Plans ({planIds.size}) *</label>
            <div className="max-h-48 overflow-y-auto space-y-2 p-1">
              {plans.map(p => (
                <label key={p.id} className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-colors ${planIds.has(p.id) ? 'border-orange-500 bg-orange-50' : 'border-gray-200 hover:bg-gray-50'}`}>
                  <input type="checkbox" checked={planIds.has(p.id)} onChange={() => togglePlan(p.id)} className="accent-orange-500 w-4 h-4 rounded" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-gray-900 truncate">{p.name}</p>
                    <p className="text-xs text-gray-500 truncate">{p.description}</p>
                  </div>
                </label>
              ))}
            </div>
            {planIds.size === 0 && (
              <p className="text-xs text-red-500 mt-2 flex items-center gap-1">
                <AlertTriangle className="w-3 h-3" /> Please select at least one plan
              </p>
            )}
          </div>

          <div className="flex gap-3 pt-4 border-t border-gray-100">
            <button type="button" onClick={onClose}
              className="flex-1 py-3 rounded-xl border border-gray-200 text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-colors">
              Cancel
            </button>
            <button type="submit" disabled={loading || planIds.size === 0}
              className="flex-1 py-3 rounded-xl sun-gradient text-white text-sm font-bold shadow-lg hover:opacity-90 transition-all disabled:opacity-50 flex justify-center items-center gap-2">
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
              {loading ? 'Saving...' : (isEditing ? 'Update Bundle' : 'Create Bundle')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
