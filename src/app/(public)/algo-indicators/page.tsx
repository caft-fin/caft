'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { api, type PlanItem, BILLING_CYCLE_LABELS, type BillingCycleType } from '@/lib/apiClient';
import { useStore } from '@/store/useStore';
import { useRouter } from 'next/navigation';
import { openRazorpayCheckout, openRazorpayPayment } from '@/lib/razorpay';
import { useToast } from '@/components/ui/Toast';
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
  const { user, isAuthenticated } = useStore();
  const { toast } = useToast();
  const [allPlans, setAllPlans] = useState<PlanItem[]>([]);
  const [activeTab, setActiveTab] = useState<Category>('DIGITAL_PRODUCT');
  const [loading, setLoading] = useState(true);
  const [buyingId, setBuyingId] = useState<string | null>(null);
  const [accessiblePlanIds, setAccessiblePlanIds] = useState<string[]>([]);

  useEffect(() => {
    api.plans.list()
      .then(res => setAllPlans((res.data || []) as PlanItem[]))
      .catch(err => console.error('Failed to load products:', err))
      .finally(() => setLoading(false));

    // Fetch user access data
    if (isAuthenticated) {
      api.purchases.myAccess().then(res => {
        if (res.data?.accessiblePlanIds) setAccessiblePlanIds(res.data.accessiblePlanIds);
      }).catch(() => {});
    }
  }, [isAuthenticated]);

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
      sessionStorage.setItem('caft_post_login_redirect', '/algo-indicators');
      router.push('/login');
      return;
    }

    // Already has access
    if (accessiblePlanIds.includes(plan.id)) {
      toast.info('Already Purchased', `You already have access to ${plan.name}.`);
      return;
    }

    setBuyingId(plan.id);
    try {
      // Determine the correct flow based on plan type
      const isPurchaseFlow = (
        plan.itemCategory === 'PHYSICAL_PRODUCT' ||
        ((plan.itemCategory === 'DIGITAL_PRODUCT' || plan.itemCategory === 'SERVICE') && plan.isOneTime)
      );

      if (isPurchaseFlow) {
        // ── Purchase Flow (One-time / Physical — Razorpay Orders) ──
        const res = await api.purchases.create(plan.id);
        const data = res.data as { purchaseId: string; orderId: string; amount: number; currency: string };

        if (!data.orderId) {
          toast.error('Payment Error', 'Order could not be created. Please try again.');
          return;
        }

        await openRazorpayPayment({
          orderId: data.orderId,
          planName: plan.name,
          amount: data.amount || 0,
          currency: data.currency || 'INR',
          userEmail: user?.email || '',
          userName: user?.name || '',
          onSuccess: async (paymentId, ordId, signature) => {
            const toastId = toast.loading('Verifying Payment', 'Please wait while we confirm your purchase...');

            try {
              await api.purchases.verify({
                razorpayPaymentId: paymentId,
                razorpayOrderId: ordId,
                razorpaySignature: signature,
                purchaseId: data.purchaseId,
              });

              toast.success('Purchase Complete! 🎉', `You now have access to ${plan.name}.`);
              // Refresh access list
              api.purchases.myAccess().then(r => {
                if (r.data?.accessiblePlanIds) setAccessiblePlanIds(r.data.accessiblePlanIds);
              }).catch(() => {});
            } catch (verifyError) {
              console.error('Payment verification failed:', verifyError);
              toast.warning(
                'Payment Received',
                'Your payment was received but verification is pending. Your access will be activated shortly.'
              );
            }
          },
          onFailure: (error) => {
            if (error === '__USER_CANCELLED__') {
              toast.info('Payment Cancelled', 'No charges were made. You can try again anytime.');
            } else {
              toast.error('Payment Failed', error);
            }
          }
        });

      } else {
        // ── Recurring Subscription Flow ────────────────────
        const cycle = (plan.pricing[0]?.billingCycle || 'MONTHLY') as BillingCycleType;
        const res = await api.subscriptions.create(plan.id, cycle);
        const data = res.data as unknown as {
          razorpaySubscriptionId?: string; shortUrl?: string;
        };

        if (!data.razorpaySubscriptionId) {
          toast.error('Payment Error', 'Subscription could not be created. Please try again.');
          return;
        }

        const price = plan.pricing.length > 0
          ? plan.pricing.reduce((min, p) => p.price < min.price ? p : min, plan.pricing[0]).price
          : 0;
        const discountedPrice = (plan.discountPercent ?? 0) > 0
          ? Math.round(price * (1 - (plan.discountPercent || 0) / 100))
          : price;

        await openRazorpayCheckout({
          subscriptionId: data.razorpaySubscriptionId,
          planName: plan.name,
          amount: discountedPrice,
          userEmail: user?.email || '',
          userName: user?.name || '',
          onSuccess: async (paymentId, subId, signature) => {
            const toastId = toast.loading('Verifying Subscription', 'Activating your subscription...');

            try {
              await api.subscriptions.verify({
                razorpay_payment_id: paymentId,
                razorpay_subscription_id: subId,
                razorpay_signature: signature,
              });

              toast.success('Subscription Active! 🎉', `Welcome to ${plan.name}.`);
              // Refresh access list
              api.purchases.myAccess().then(r => {
                if (r.data?.accessiblePlanIds) setAccessiblePlanIds(r.data.accessiblePlanIds);
              }).catch(() => {});
            } catch (verifyError) {
              console.error('Subscription verification failed:', verifyError);
              toast.warning(
                'Payment Received',
                'Your subscription will activate shortly.'
              );
            }
          },
          onFailure: (error) => {
            if (error === '__USER_CANCELLED__') {
              toast.info('Payment Cancelled', 'No charges were made. You can subscribe anytime.');
            } else {
              toast.error('Payment Failed', error);
            }
          }
        });
      }
    } catch (err: any) {
      const message = err?.message || 'Failed to initiate purchase. Please try again.';
      toast.error('Something Went Wrong', message);
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
                      disabled={buyingId === plan.id || accessiblePlanIds.includes(plan.id)}
                      className={`w-full py-3.5 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2 ${
                        accessiblePlanIds.includes(plan.id)
                          ? 'bg-green-100 text-green-700 cursor-default'
                          : 'text-white sun-gradient shadow-lg hover:shadow-xl hover:-translate-y-0.5 active:scale-95 disabled:opacity-60'
                      }`}
                    >
                      {accessiblePlanIds.includes(plan.id) ? (
                        <><Check className="w-4 h-4" /> Purchased</>
                      ) : buyingId === plan.id ? (
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
