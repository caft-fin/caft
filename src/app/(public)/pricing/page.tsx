'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { CheckCircle2, XCircle, Sparkles, ArrowRight, Loader2 } from 'lucide-react';
import { getIconComponent } from '@/components/admin/subscriptions/IconPicker';
import { api, BILLING_CYCLE_LABELS, BILLING_CYCLE_SHORT } from '@/lib/apiClient';
import type { BillingCycleType } from '@/lib/apiClient';
import { openRazorpayCheckout, openRazorpayPayment } from '@/lib/razorpay';
import { useStore } from '@/store/useStore';
import { useToast } from '@/components/ui/Toast';

interface PricingPlan {
  id: string;
  name: string;
  price: number;
  description: string;
  planType: 'FREE' | 'PAID';
  itemCategory?: 'SUBSCRIPTION' | 'DIGITAL_PRODUCT' | 'PHYSICAL_PRODUCT' | 'SERVICE';
  bannerBadge?: string | null;
  isOneTime: boolean;
  oneTimePrice?: number | null;
  freeTrialEnabled: boolean;
  freeTrialDays?: number | null;
  discountPercent?: number | null;
  discountLabel?: string | null;
  features: { name: string; included: boolean; icon?: string | null }[];
  pricing: { billingCycle: string; price: number }[];
  isPopular: boolean;
}

export default function PricingPage() {
  const router = useRouter();
  const { user, isAuthenticated } = useStore();
  const { toast } = useToast();
  const [plans, setPlans] = useState<PricingPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [subscribing, setSubscribing] = useState<string | null>(null);
  const [selectedCycle, setSelectedCycle] = useState<BillingCycleType>('MONTHLY');
  const [accessiblePlanIds, setAccessiblePlanIds] = useState<string[]>([]);

  useEffect(() => {
    fetch('/api/pricing').then(r => r.json()).then(data => {
      setPlans(Array.isArray(data) ? data : []);
      // Determine the best default cycle
      if (Array.isArray(data) && data.length > 0) {
        const allCycles = new Set<string>();
        data.forEach((p: PricingPlan) => p.pricing?.forEach(pr => allCycles.add(pr.billingCycle)));
        if (allCycles.has('MONTHLY')) setSelectedCycle('MONTHLY');
        else if (allCycles.has('ANNUALLY')) setSelectedCycle('ANNUALLY');
        else if (allCycles.size > 0) setSelectedCycle(Array.from(allCycles)[0] as BillingCycleType);
      }
    }).catch(() => { }).finally(() => setLoading(false));

    // Fetch user access data (only if authenticated).
    // Use raw fetch to avoid the apiClient's global 401→/login redirect,
    // which fires when the access token has silently expired on a public page.
    if (isAuthenticated) {
      fetch('/api/purchases/my-access', { credentials: 'include' })
        .then(r => (r.ok ? r.json() : Promise.resolve({ data: null })))
        .then((body) => {
          if (body?.data?.accessiblePlanIds) setAccessiblePlanIds(body.data.accessiblePlanIds);
        })
        .catch(() => {});
    }
  }, [isAuthenticated]);

  // Get all available billing cycles across plans
  const availableCycles: BillingCycleType[] = [];
  const cycleSet = new Set<string>();
  plans.forEach(p => p.pricing?.forEach(pr => { if (!cycleSet.has(pr.billingCycle) && pr.billingCycle !== 'ONETIME') { cycleSet.add(pr.billingCycle); availableCycles.push(pr.billingCycle as BillingCycleType); } }));
  const cycleOrder: BillingCycleType[] = ['DAILY', 'WEEKLY', 'BIWEEKLY', 'MONTHLY', 'QUARTERLY', 'HALFYEARLY', 'ANNUALLY'];
  availableCycles.sort((a, b) => cycleOrder.indexOf(a) - cycleOrder.indexOf(b));

  const recurringPlans = plans.filter(p => !p.isOneTime);
  const oneTimePlans = plans.filter(p => p.isOneTime);

  const getPriceForCycle = (plan: PricingPlan, cycle: BillingCycleType) => {
    const pr = plan.pricing?.find(p => p.billingCycle === cycle);
    return pr ? pr.price : null;
  };

  const handleSubscribe = async (plan: PricingPlan, cycle: BillingCycleType) => {
    if (!isAuthenticated) {
      sessionStorage.setItem('caft_post_login_redirect', '/pricing');
      router.push('/login');
      return;
    }

    if (plan.planType === 'FREE') {
      router.push('/dashboard');
      return;
    }

    // Already has access
    if (accessiblePlanIds.includes(plan.id)) {
      router.push('/dashboard');
      return;
    }

    setSubscribing(plan.id);
    try {
      const isPurchaseFlow = (
        plan.itemCategory === 'PHYSICAL_PRODUCT' ||
        ((plan.itemCategory === 'DIGITAL_PRODUCT' || plan.itemCategory === 'SERVICE') && plan.isOneTime && cycle === 'ONETIME')
      );

      if (isPurchaseFlow) {
        // ── Purchase Flow (Razorpay Orders) ────────────────
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
            // Show loading toast while verifying
            const toastId = toast.loading('Verifying Payment', 'Please wait while we confirm your purchase...');

            try {
              await api.purchases.verify({
                razorpayPaymentId: paymentId,
                razorpayOrderId: ordId,
                razorpaySignature: signature,
                purchaseId: data.purchaseId,
              });

              toast.success('Payment Successful! 🎉', `You now have access to ${plan.name}.`);
              
              // Brief delay to show success toast, then redirect
              setTimeout(() => {
                router.push('/dashboard?payment=success');
              }, 1500);
            } catch (verifyError) {
              console.error('Payment verification failed:', verifyError);
              toast.warning(
                'Payment Received',
                'Your payment was received but verification is pending. Your access will be activated shortly.'
              );
              setTimeout(() => {
                router.push('/dashboard?payment=pending');
              }, 2000);
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

      } else if (plan.isOneTime && cycle === 'ONETIME') {
        // ── Legacy One-Time Subscription Flow ──────────────
        const res = await api.subscriptions.create(plan.id, cycle);
        const data = res.data as unknown as {
          orderId?: string; subscriptionId?: string; amount?: number; currency?: string;
        };
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
            const toastId = toast.loading('Verifying Payment', 'Please wait while we activate your access...');

            try {
              // Verify one-time payment
              await api.purchases.verify({
                razorpayPaymentId: paymentId,
                razorpayOrderId: ordId,
                razorpaySignature: signature,
                purchaseId: data.subscriptionId || '',
              });

              toast.success('Purchase Complete! 🎉', `You now have lifetime access to ${plan.name}.`);
              setTimeout(() => {
                router.push('/dashboard?payment=success');
              }, 1500);
            } catch {
              toast.warning(
                'Payment Received',
                'Your payment was received but verification is pending. Your access will be activated shortly.'
              );
              setTimeout(() => {
                router.push('/dashboard?payment=pending');
              }, 2000);
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
        const res = await api.subscriptions.create(plan.id, cycle);
        const data = res.data as unknown as {
          razorpaySubscriptionId?: string; shortUrl?: string;
        };
        if (!data.razorpaySubscriptionId) {
          toast.error('Payment Error', 'Subscription could not be created. Please try again.');
          return;
        }

        const price = getPriceForCycle(plan, cycle) || 0;
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
            const toastId = toast.loading('Verifying Subscription', 'Please wait while we activate your subscription...');

            try {
              // ── CRITICAL FIX: Actually verify the subscription payment ──
              // This was missing before! Without this call, the subscription
              // stays in CREATED status and never transitions to AUTHENTICATED.
              await api.subscriptions.verify({
                razorpay_payment_id: paymentId,
                razorpay_subscription_id: subId,
                razorpay_signature: signature,
              });

              toast.success('Subscription Active! 🎉', `Welcome to ${plan.name}. Your subscription is now active.`);
              setTimeout(() => {
                router.push('/dashboard?payment=success');
              }, 1500);
            } catch (verifyError) {
              console.error('Subscription verification failed:', verifyError);
              toast.warning(
                'Payment Received',
                'Your payment was received. Subscription will activate shortly via webhook.'
              );
              setTimeout(() => {
                router.push('/dashboard?payment=pending');
              }, 2000);
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
    } catch (error: unknown) {
      console.error('Subscription error:', error);
      const message = error instanceof Error ? error.message : 'Failed to initiate payment';
      toast.error('Something Went Wrong', message);
    } finally {
      setSubscribing(null);
    }
  };

  return (
    <>
      {/* Hero */}
      <section className="relative pt-24 pb-16 px-6 text-center overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full -z-10 opacity-10">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary-container rounded-full blur-[100px]" />
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-secondary-container rounded-full blur-[100px]" />
        </div>
        <h1 className="font-display-lg text-display-lg text-on-surface mb-stack-sm">Plans for every financial journey.</h1>
        <p className="font-body-lg text-body-lg text-on-surface-variant max-w-2xl mx-auto mb-12">
          Choose the level of precision and insight that fits your wealth goals.
        </p>

        {/* Cycle Toggle */}
        {availableCycles.length > 1 && (
          <div className="flex items-center justify-center gap-1 bg-gray-100 rounded-2xl p-1 w-fit mx-auto mb-16">
            {availableCycles.map(cycle => (
              <button key={cycle} onClick={() => setSelectedCycle(cycle)}
                className={`px-5 py-2.5 rounded-xl text-sm font-semibold transition-all ${selectedCycle === cycle ? 'bg-white text-orange-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>
                {BILLING_CYCLE_LABELS[cycle]}
              </button>
            ))}
          </div>
        )}
      </section>

      {/* Plans Grid */}
      <section className="max-w-7xl mx-auto px-6 pb-24">
        {loading ? (
          <div className="text-center py-20 text-gray-400">Loading plans...</div>
        ) : recurringPlans.length === 0 && oneTimePlans.length === 0 ? (
          <div className="text-center py-20 text-gray-500">No plans available yet.</div>
        ) : (
          <>
            <div className={`grid grid-cols-1 gap-8 ${recurringPlans.length === 2 ? 'md:grid-cols-2 max-w-4xl mx-auto' : recurringPlans.length >= 3 ? 'md:grid-cols-3' : 'max-w-md mx-auto'}`}>
              {recurringPlans.map(plan => {
                const price = plan.planType === 'FREE' ? 0 : getPriceForCycle(plan, selectedCycle);
                const hasDiscount = (plan.discountPercent ?? 0) > 0 && price !== null;
                const discountedPrice = hasDiscount ? Math.round(price! * (1 - (plan.discountPercent || 0) / 100)) : price;

                return (
                  <div key={plan.id} id={`plan-${plan.id}`} className={`relative rounded-3xl p-8 flex flex-col transition-all duration-300 hover:translate-y-[-4px] scroll-mt-24 ${plan.isPopular
                      ? 'sun-gradient text-white shadow-2xl scale-[1.03]'
                      : 'bg-white border border-gray-100 shadow-sm'
                    }`}>
                    {/* Badge */}
                    {plan.bannerBadge && (
                      <span className={`absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${plan.isPopular ? 'bg-white text-orange-600' : 'bg-orange-100 text-orange-700'
                        }`}>{plan.bannerBadge}</span>
                    )}

                    <div className="mb-6">
                      <h3 className={`text-xl font-bold mb-2 ${plan.isPopular ? '' : 'text-gray-900'}`}>{plan.name}</h3>
                      <div className="flex items-baseline gap-2">
                        {hasDiscount && <span className="text-lg line-through opacity-50">₹{price}</span>}
                        <span className="text-4xl font-black">{plan.planType === 'FREE' ? 'Free' : price !== null ? `₹${discountedPrice}` : '—'}</span>
                        {price !== null && plan.planType !== 'FREE' && (
                          <span className={`text-sm ${plan.isPopular ? 'text-white/70' : 'text-gray-400'}`}>{BILLING_CYCLE_SHORT[selectedCycle]}</span>
                        )}
                      </div>
                      {hasDiscount && plan.discountLabel && (
                        <span className={`inline-block mt-2 text-xs font-bold px-2 py-0.5 rounded-full ${plan.isPopular ? 'bg-white/20' : 'bg-pink-100 text-pink-700'}`}>
                          {plan.discountLabel}
                        </span>
                      )}
                      {plan.freeTrialEnabled && plan.freeTrialDays && (
                        <span className={`inline-block mt-2 ml-1 text-xs font-bold px-2 py-0.5 rounded-full ${plan.isPopular ? 'bg-white/20' : 'bg-teal-100 text-teal-700'}`}>
                          {plan.freeTrialDays}-day free trial
                        </span>
                      )}
                      <p className={`text-sm mt-3 ${plan.isPopular ? 'text-white/80' : 'text-gray-500'}`}>{plan.description}</p>
                    </div>

                    <ul className="flex-grow space-y-3 mb-8">
                      {plan.features.map((f, i) => {
                        const Icon = f.included ? (getIconComponent(f.icon) || CheckCircle2) : XCircle;
                        return (
                          <li key={i} className={`flex items-center gap-3 text-sm ${f.included ? '' : (plan.isPopular ? 'opacity-40' : 'text-gray-400')
                            }`}>
                            <Icon className="w-4 h-4 flex-shrink-0" />
                            <span>{f.name}</span>
                          </li>
                        );
                      })}
                    </ul>

                    <button
                      onClick={() => handleSubscribe(plan, selectedCycle)}
                      disabled={subscribing !== null || accessiblePlanIds.includes(plan.id)}
                      className={`w-full py-3.5 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2 ${accessiblePlanIds.includes(plan.id)
                          ? 'bg-green-100 text-green-700 cursor-default'
                          : plan.isPopular
                            ? 'bg-white text-orange-600 hover:bg-orange-50 shadow-lg'
                            : 'sun-gradient text-white shadow-md hover:opacity-90'
                        }`}
                    >
                      {accessiblePlanIds.includes(plan.id) ? (
                        <><CheckCircle2 className="w-4 h-4" /> Subscribed</>
                      ) : subscribing === plan.id ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <>
                          {plan.planType === 'FREE' ? 'Get Started Free' : 'Subscribe Now'}
                          <ArrowRight className="w-4 h-4" />
                        </>
                      )}
                    </button>
                  </div>
                );
              })}
            </div>

            {/* One-Time Plans */}
            {oneTimePlans.length > 0 && (
              <div className="mt-20">
                <div className="text-center mb-12">
                  <span className="text-xs font-bold text-orange-600 uppercase tracking-widest">Lifetime Access</span>
                  <h2 className="font-headline-md text-headline-md text-on-surface mt-2">One-Time Purchase</h2>
                </div>
                <div className={`grid grid-cols-1 gap-8 max-w-4xl mx-auto ${oneTimePlans.length >= 2 ? 'md:grid-cols-2' : ''}`}>
                  {oneTimePlans.map(plan => (
                    <div key={plan.id} id={`plan-${plan.id}`} className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-3xl p-8 border border-indigo-100 flex flex-col scroll-mt-24">
                      {plan.bannerBadge && <span className="self-start px-3 py-1 rounded-full text-xs font-bold bg-indigo-100 text-indigo-700 mb-4">{plan.bannerBadge}</span>}
                      <h3 className="text-xl font-bold text-gray-900 mb-2">{plan.name}</h3>
                      <div className="flex items-baseline gap-2 mb-3">
                        <span className="text-4xl font-black text-indigo-700">₹{plan.oneTimePrice?.toLocaleString()}</span>
                        <span className="text-sm text-indigo-400">one-time</span>
                      </div>
                      <p className="text-sm text-gray-500 mb-6">{plan.description}</p>
                      <ul className="flex-grow space-y-3 mb-8">
                        {plan.features.map((f, i) => {
                          const Icon = getIconComponent(f.icon) || CheckCircle2;
                          return <li key={i} className="flex items-center gap-3 text-sm text-gray-700"><Icon className="w-4 h-4 text-indigo-500" />{f.name}</li>;
                        })}
                      </ul>
                      <button
                        onClick={() => handleSubscribe(plan, 'ONETIME')}
                        disabled={subscribing !== null || accessiblePlanIds.includes(plan.id)}
                        className={`w-full py-3.5 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2 ${accessiblePlanIds.includes(plan.id)
                            ? 'bg-green-100 text-green-700 cursor-default'
                            : 'bg-indigo-600 text-white shadow-md hover:bg-indigo-700'
                          }`}
                      >
                        {accessiblePlanIds.includes(plan.id) ? (
                          <><CheckCircle2 className="w-4 h-4" /> Purchased</>
                        ) : subscribing === plan.id ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <>Buy and Access for Life</>
                        )}
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </section>

      {/* Trust Section */}
      <section className="py-24 max-w-7xl mx-auto px-6">
        <div className="rounded-[40px] sun-gradient p-12 lg:p-20 text-white text-center relative overflow-hidden shadow-2xl">
          <div className="absolute inset-0 opacity-10 pointer-events-none">
            <div className="absolute top-0 left-0 w-64 h-64 border-[40px] border-white rounded-full -translate-x-1/2 -translate-y-1/2" />
            <div className="absolute bottom-0 right-0 w-96 h-96 border-[60px] border-white rounded-full translate-x-1/2 translate-y-1/2" />
          </div>
          <div className="relative z-10">
            <h2 className="font-display-lg text-display-lg mb-6">Start building your legacy today</h2>
            <p className="text-white/90 text-body-lg max-w-xl mx-auto mb-10">
              Join thousands of investors who trust CAFT Financial for smarter wealth management.
            </p>
            <Link
              href="/login"
              className="inline-block bg-white text-primary px-10 py-4 rounded-xl font-button shadow-xl hover:scale-105 transition-all"
            >
              Get Started Free
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
