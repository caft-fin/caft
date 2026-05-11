'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { api, type PlanItem, BILLING_CYCLE_LABELS, type BillingCycleType } from '@/lib/apiClient';
import { useStore } from '@/store/useStore';
import { useRouter } from 'next/navigation';
import {
  Star, ShieldCheck, ArrowRight, Zap, TrendingUp, Package,
  Monitor, Wrench, Loader2, Check
} from 'lucide-react';

type Category = 'DIGITAL_PRODUCT' | 'PHYSICAL_PRODUCT' | 'SERVICE';

const TABS: { key: Category; label: string; icon: React.ReactNode }[] = [
  { key: 'DIGITAL_PRODUCT', label: 'Digital Products', icon: <Monitor className="w-4 h-4" /> },
  { key: 'PHYSICAL_PRODUCT', label: 'Physical Products', icon: <Package className="w-4 h-4" /> },
  { key: 'SERVICE', label: 'Services', icon: <Wrench className="w-4 h-4" /> },
];

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[...Array(5)].map((_, i) => (
        <Star key={i} className={`w-3.5 h-3.5 ${i < Math.floor(rating) ? 'fill-orange-400 text-orange-400' : 'fill-gray-200 text-gray-200'}`} />
      ))}
      <span className="ml-1 text-xs font-semibold text-gray-600">{rating.toFixed(1)}</span>
    </div>
  );
}

export default function AlgoIndicatorsPage() {
  const router = useRouter();
  const isAuthenticated = useStore(s => s.isAuthenticated);
  const [allPlans, setAllPlans] = useState<PlanItem[]>([]);
  const [activeTab, setActiveTab] = useState<Category>('DIGITAL_PRODUCT');
  const [loading, setLoading] = useState(true);
  const [buyingId, setBuyingId] = useState<string | null>(null);

  useEffect(() => {
    api.plans.list()
      .then(res => setAllPlans((res.data || []) as PlanItem[]))
      .catch(err => console.error('Failed to load products:', err))
      .finally(() => setLoading(false));
  }, []);

  const filteredPlans = allPlans.filter(p => p.itemCategory === activeTab);

  const getDisplayPrice = (plan: PlanItem): string => {
    if (plan.isOneTime && plan.oneTimePrice) {
      return `₹${(plan.oneTimePrice / 100).toLocaleString('en-IN')}`;
    }
    if (plan.pricing.length > 0) {
      const lowest = plan.pricing.reduce((min, p) => p.price < min.price ? p : min, plan.pricing[0]);
      return `₹${(lowest.price / 100).toLocaleString('en-IN')}/${BILLING_CYCLE_LABELS[lowest.billingCycle as BillingCycleType]?.replace(/ly$/, '') || 'mo'}`;
    }
    return 'Free';
  };

  const handleBuy = async (plan: PlanItem) => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }
    setBuyingId(plan.id);
    try {
      // For one-time products, use the subscription create endpoint
      // which handles both recurring and one-time purchases
      const cycle = plan.isOneTime ? 'ONETIME' : (plan.pricing[0]?.billingCycle || 'MONTHLY');
      const res = await api.subscriptions.create(plan.id, cycle as BillingCycleType);
      const data = res.data as { subscriptionId?: string; shortUrl?: string; orderId?: string };
      if (data.shortUrl) {
        window.location.assign(data.shortUrl);
      }
    } catch (err: unknown) {
      const error = err as { message?: string };
      alert(error?.message || 'Failed to initiate purchase. Please try again.');
    } finally {
      setBuyingId(null);
    }
  };

  return (
    <div className="min-h-screen bg-background pt-32 pb-24 relative overflow-hidden">
      {/* Background Decorators */}
      <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-orange-200/40 rounded-full blur-[100px] -translate-x-1/2 -translate-y-1/2 mix-blend-multiply" />
      <div className="absolute bottom-0 right-0 w-[600px] h-[600px] bg-yellow-200/40 rounded-full blur-[120px] translate-x-1/3 translate-y-1/3 mix-blend-multiply" />

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        {/* Header Section */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-orange-50 border border-orange-100 text-orange-600 font-semibold text-sm mb-6 shadow-sm">
            <Zap className="w-4 h-4" />
            <span>Courses & Tools</span>
          </div>
          <h1 className="text-5xl md:text-6xl font-black text-gray-900 tracking-tighter mb-6 leading-tight">
            Courses & <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#ff9500] to-[#ffb874]">Tools</span>
          </h1>
          <p className="text-xl text-gray-600 leading-relaxed">
            Supercharge your trading with our professional suite of market analysis tools, courses, and premium services.
          </p>
        </div>

        {/* Category Tabs */}
        <div className="flex justify-center mb-12">
          <div className="inline-flex bg-white rounded-2xl p-1.5 shadow-lg border border-gray-100 gap-1">
            {TABS.map(tab => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-bold transition-all ${
                  activeTab === tab.key
                    ? 'sun-gradient text-white shadow-md'
                    : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                }`}
              >
                {tab.icon}
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Products Grid */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
          </div>
        ) : filteredPlans.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredPlans.map(plan => (
              <div key={plan.id} className="glass-card rounded-2xl overflow-hidden shadow-soft hover:shadow-glow transition-all duration-300 group border border-orange-100/50 flex flex-col bg-white/60">
                {/* Image */}
                <div className="relative h-56 overflow-hidden bg-gray-900">
                  {plan.images?.[0] ? (
                    <Image src={plan.images[0]} alt={plan.name} fill className="object-cover group-hover:scale-105 transition-transform duration-500 opacity-90 group-hover:opacity-100" />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-gray-800 to-gray-900">
                      <TrendingUp className="w-16 h-16 text-gray-600" />
                    </div>
                  )}
                  <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-md px-3 py-1 rounded-full text-xs font-bold text-gray-900 shadow-sm">
                    {getDisplayPrice(plan)}
                  </div>
                  {plan.bannerBadge && (
                    <div className="absolute top-4 left-4 sun-gradient px-3 py-1 rounded-full text-xs font-bold text-white shadow-sm">
                      {plan.bannerBadge}
                    </div>
                  )}
                  {plan.discountPercent && plan.discountPercent > 0 && (
                    <div className="absolute bottom-4 left-4 bg-red-500 px-3 py-1 rounded-full text-xs font-bold text-white shadow-sm">
                      {plan.discountLabel || `${plan.discountPercent}% OFF`}
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="p-6 flex flex-col flex-1">
                  <h3 className="text-xl font-bold text-gray-900 mb-2">{plan.name}</h3>
                  <p className="text-sm text-gray-600 leading-relaxed mb-4 line-clamp-3 flex-1">{plan.description}</p>

                  {/* Features */}
                  {plan.features.length > 0 && (
                    <div className="space-y-1.5 mb-5">
                      {plan.features.filter(f => f.included).slice(0, 4).map((f, i) => (
                        <div key={i} className="flex items-center gap-2 text-xs text-gray-600">
                          <Check className="w-3.5 h-3.5 text-green-500 flex-shrink-0" />
                          <span>{f.name}{f.value ? `: ${f.value}` : ''}</span>
                        </div>
                      ))}
                      {plan.features.filter(f => f.included).length > 4 && (
                        <p className="text-xs text-gray-400 pl-5">+{plan.features.filter(f => f.included).length - 4} more features</p>
                      )}
                    </div>
                  )}

                  {/* CTA */}
                  <div className="mt-auto pt-5 border-t border-gray-100">
                    <button
                      onClick={() => handleBuy(plan)}
                      disabled={buyingId === plan.id}
                      className="w-full py-3.5 rounded-xl text-white font-bold sun-gradient shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all active:scale-95 flex items-center justify-center gap-2 disabled:opacity-60"
                    >
                      {buyingId === plan.id ? (
                        <><Loader2 className="w-4 h-4 animate-spin" /> Processing...</>
                      ) : (
                        <><span>{plan.isOneTime ? 'Buy Now' : 'Subscribe Now'}</span><ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" /></>
                      )}
                    </button>
                    <div className="mt-3 flex items-center justify-center gap-1.5 text-xs text-gray-500">
                      <ShieldCheck className="w-3.5 h-3.5 text-green-500" />
                      <span>Secure payment via Razorpay</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-20 bg-white/60 backdrop-blur-sm rounded-3xl border border-gray-100">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
              {TABS.find(t => t.key === activeTab)?.icon}
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">No {TABS.find(t => t.key === activeTab)?.label} Available</h3>
            <p className="text-gray-500 text-sm max-w-md mx-auto">
              We haven&apos;t added any {TABS.find(t => t.key === activeTab)?.label.toLowerCase()} yet. Check back soon or explore other categories.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
