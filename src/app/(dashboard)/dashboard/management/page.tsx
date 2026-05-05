'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/apiClient';
import type { SubscriptionInfo, PaymentItem, PlanItem } from '@/lib/apiClient';
import { 
  CreditCard, CheckCircle2, AlertCircle, Calendar, 
  Download, ArrowRight, Star, ShieldCheck, Zap,
  Loader2, RefreshCw
} from 'lucide-react';


export default function SubscriptionManagementPage() {
  const [activeSub, setActiveSub] = useState<SubscriptionInfo | null>(null);
  const [payments, setPayments] = useState<PaymentItem[]>([]);
  const [plans, setPlans] = useState<PlanItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const [subRes, paymentsRes, plansRes] = await Promise.all([
          api.subscriptions.active().catch(() => ({ data: null })),
          api.payments.history(1, 10).catch(() => ({ data: [] })),
          api.plans.list().catch(() => ({ data: [] }))
        ]);
        
        setActiveSub(subRes.data as SubscriptionInfo | null);
        setPayments(paymentsRes.data as PaymentItem[]);
        setPlans((plansRes.data as PlanItem[]).filter(p => p.isActive !== false));
      } catch (err) {
        console.error('Failed to fetch subscription data:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const formatCurrency = (amount: number) => 
    new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amount / 100);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 text-orange-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto w-full space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Subscription Management</h1>
          <p className="text-gray-500 max-w-2xl text-sm">
            Manage your active plans, explore available upgrades, and review your billing history.
          </p>
        </div>
        {activeSub && (
          <button className="px-5 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-xl transition-colors text-sm flex items-center gap-2 w-fit">
            <RefreshCw className="w-4 h-4" /> Cancel Plan
          </button>
        )}
      </div>

      {/* Current Plan Card */}
      <div className={`relative overflow-hidden rounded-[2rem] border p-8 shadow-sm ${activeSub ? 'bg-white border-gray-100' : 'bg-gradient-to-br from-white via-orange-50 to-yellow-50 border-orange-100'}`}>
        
        {activeSub ? (
          <div className="relative z-10 flex flex-col md:flex-row justify-between gap-8">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-4">
                <span className="px-3 py-1 bg-green-50 text-green-600 border border-green-100 rounded-full text-xs font-bold uppercase tracking-wider flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Active Plan
                </span>
                {activeSub.plan?.isPopular && (
                  <span className="px-3 py-1 bg-orange-50 text-orange-600 border border-orange-100 rounded-full text-xs font-bold uppercase tracking-wider flex items-center gap-1">
                    <Star className="w-3.5 h-3.5" /> Popular
                  </span>
                )}
              </div>
              <h2 className="text-4xl font-bold text-gray-900 mb-2">{activeSub.plan?.name || 'Pro Subscription'}</h2>
              <p className="text-gray-500 max-w-md text-sm mb-8 leading-relaxed">
                {activeSub.plan?.description || 'You are currently enjoying the premium features of our platform.'}
              </p>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                <div>
                  <p className="text-gray-400 text-xs uppercase tracking-wider font-semibold mb-1">Billing Cycle</p>
                  <p className="font-medium text-gray-900 capitalize">{activeSub.billingCycle.toLowerCase()}</p>
                </div>
                <div>
                  <p className="text-gray-400 text-xs uppercase tracking-wider font-semibold mb-1">Next Renewal</p>
                  <p className="font-medium text-gray-900">
                    {activeSub.currentPeriodEnd ? new Intl.DateTimeFormat('en-US', { month: 'short', day: '2-digit', year: 'numeric' }).format(new Date(activeSub.currentPeriodEnd)) : 'N/A'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="relative z-10 flex flex-col items-center text-center py-12 px-4 max-w-3xl mx-auto">
            <div className="absolute top-0 right-0 w-64 h-64 bg-orange-200/40 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-yellow-200/40 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2"></div>
            
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4 relative z-10">Elevate Your Portfolio</h2>
            <p className="text-gray-600 max-w-xl text-base mb-8 leading-relaxed relative z-10">
              You are currently on the free tier. Unlock the full potential of your investments with advanced analytics, real-time tracking, and priority wealth advisory.
            </p>
            <button 
              onClick={() => document.getElementById('plans-section')?.scrollIntoView({ behavior: 'smooth' })}
              className="bg-gradient-to-r from-orange-600 to-orange-500 hover:from-orange-700 hover:to-orange-600 text-white px-8 py-3.5 rounded-xl font-semibold text-sm transition-all shadow-lg shadow-orange-500/25 flex items-center gap-2 relative z-10 active:scale-95"
            >
              Explore Premium Plans <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      {/* Available Plans */}
      <div className="pt-4" id="plans-section">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-gray-900">Available Plans</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {plans.map((plan) => (
            <div key={plan.id} className={`bg-white rounded-2xl border ${plan.isPopular ? 'border-orange-500 shadow-orange-500/10 shadow-lg relative' : 'border-gray-200 shadow-sm'} p-6 flex flex-col`}>
              {plan.isPopular && (
                <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-orange-500 text-white px-4 py-1 rounded-full text-xs font-bold tracking-wider uppercase shadow-sm">
                  Most Popular
                </div>
              )}
              <h4 className="text-lg font-bold text-gray-900 mb-2">{plan.name}</h4>
              <p className="text-sm text-gray-500 mb-6 flex-1">{plan.description}</p>
              
              <div className="mb-6">
                <span className="text-3xl font-black text-gray-900">
                  {plan.pricing && plan.pricing.length > 0 ? formatCurrency(plan.pricing[0].price) : 'Free'}
                </span>
                {plan.pricing && plan.pricing.length > 0 && (
                  <span className="text-sm text-gray-500 font-medium">/{plan.pricing[0].billingCycle.toLowerCase()}</span>
                )}
              </div>

              <ul className="space-y-3 mb-8">
                {plan.features?.slice(0, 4).map((feature, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-sm text-gray-600">
                    <CheckCircle2 className={`w-5 h-5 shrink-0 ${feature.included ? 'text-green-500' : 'text-gray-300'}`} />
                    <span className={feature.included ? '' : 'text-gray-400 line-through'}>{feature.name}</span>
                  </li>
                ))}
              </ul>

              <button className={`w-full py-3 rounded-xl font-semibold text-sm transition-all ${
                activeSub?.planId === plan.id 
                  ? 'bg-gray-100 text-gray-500 cursor-not-allowed'
                  : plan.isPopular 
                    ? 'bg-orange-600 hover:bg-orange-700 text-white shadow-md shadow-orange-600/20'
                    : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 hover:border-gray-300'
              }`}>
                {activeSub?.planId === plan.id ? 'Current Plan' : 'Upgrade Plan'}
              </button>
            </div>
          ))}
          {plans.length === 0 && (
            <div className="col-span-full py-12 text-center bg-gray-50 rounded-2xl border border-gray-100 border-dashed">
              <Zap className="w-8 h-8 text-gray-400 mx-auto mb-2" />
              <p className="text-gray-500 font-medium">No other plans available at the moment.</p>
            </div>
          )}
        </div>
      </div>

      {/* Payment History */}
      <div className="pt-4 pb-12">
        <h3 className="text-xl font-bold text-gray-900 mb-6">Payment History</h3>
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
          {payments.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead className="bg-gray-50/80 border-b border-gray-100">
                  <tr>
                    <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Date</th>
                    <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Description</th>
                    <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Amount</th>
                    <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider text-right">Invoice</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {payments.map((payment) => (
                    <tr key={payment.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {new Intl.DateTimeFormat('en-US', { month: 'short', day: '2-digit', year: 'numeric' }).format(new Date(payment.createdAt))}
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-sm font-medium text-gray-900">{payment.description || 'Subscription Payment'}</p>
                        <p className="text-xs text-gray-500 font-mono mt-0.5">{payment.id.split('-')[0]}</p>
                      </td>
                      <td className="px-6 py-4 text-sm font-semibold text-gray-900">
                        {formatCurrency(payment.amount)}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                          payment.status === 'SUCCESS' || payment.status === 'PAID' ? 'bg-green-100 text-green-700' :
                          payment.status === 'FAILED' ? 'bg-red-100 text-red-700' : 'bg-orange-100 text-orange-700'
                        }`}>
                          {payment.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button className="p-2 text-gray-400 hover:text-orange-600 transition-colors rounded-lg hover:bg-orange-50">
                          <Download className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="py-16 flex flex-col items-center justify-center text-center">
              <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                <CreditCard className="w-8 h-8 text-gray-300" />
              </div>
              <p className="text-gray-900 font-medium mb-1">No payment history</p>
              <p className="text-gray-500 text-sm">You haven&apos;t made any payments yet.</p>
            </div>
          )}
        </div>
      </div>

    </div>
  );
}
