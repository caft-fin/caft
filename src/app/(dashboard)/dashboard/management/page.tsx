'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/apiClient';
import type { SubscriptionInfo, PaymentItem, PlanItem } from '@/lib/apiClient';
import { 
  CreditCard, CheckCircle2, 
  Download, ArrowRight, Star, Zap,
  Loader2, RefreshCw, X
} from 'lucide-react';


export default function SubscriptionManagementPage() {
  const [activeSub, setActiveSub] = useState<SubscriptionInfo | null>(null);
  const [payments, setPayments] = useState<PaymentItem[]>([]);
  const [plans, setPlans] = useState<PlanItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [cancelModal, setCancelModal] = useState(false);
  const [cancelReason, setCancelReason] = useState('');
  const [cancelling, setCancelling] = useState(false);

  const fetchData = async () => {
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
  };

  useEffect(() => {
    fetchData();
  }, []);

  const formatCurrency = (amount: number) => 
    new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amount / 100);

  const handleCancelPlan = async () => {
    setCancelling(true);
    try {
      await api.subscriptions.cancel(cancelReason || undefined);
      setCancelModal(false);
      setCancelReason('');
      // Refresh data to reflect cancellation
      setLoading(true);
      await fetchData();
    } catch (err) {
      console.error('Failed to cancel subscription:', err);
      alert('Failed to cancel subscription. Please try again.');
    } finally {
      setCancelling(false);
    }
  };

  const handleDownloadInvoice = (payment: PaymentItem) => {
    const invoiceHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Invoice - ${payment.id.split('-')[0]}</title>
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 700px; margin: 0 auto; padding: 40px 20px; color: #333; }
          .header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 40px; border-bottom: 3px solid #ea580c; padding-bottom: 20px; }
          .logo { font-size: 24px; font-weight: 800; color: #ea580c; }
          .invoice-label { font-size: 28px; font-weight: 300; color: #999; text-transform: uppercase; letter-spacing: 4px; }
          .meta { display: grid; grid-template-columns: 1fr 1fr; gap: 30px; margin-bottom: 40px; }
          .meta-block label { font-size: 10px; text-transform: uppercase; letter-spacing: 1.5px; color: #999; font-weight: 700; display: block; margin-bottom: 4px; }
          .meta-block p { font-size: 14px; font-weight: 500; margin: 0; }
          table { width: 100%; border-collapse: collapse; margin-bottom: 30px; }
          th { text-align: left; padding: 12px 16px; font-size: 11px; text-transform: uppercase; letter-spacing: 1px; color: #999; font-weight: 700; border-bottom: 2px solid #f0f0f0; }
          td { padding: 16px; font-size: 14px; border-bottom: 1px solid #f5f5f5; }
          .amount { text-align: right; font-weight: 700; }
          .total-row td { font-size: 16px; font-weight: 700; border-top: 2px solid #ea580c; border-bottom: none; color: #ea580c; }
          .status { display: inline-block; padding: 4px 12px; border-radius: 20px; font-size: 11px; font-weight: 700; text-transform: uppercase; }
          .status-success { background: #dcfce7; color: #16a34a; }
          .status-failed { background: #fee2e2; color: #dc2626; }
          .status-pending { background: #fff7ed; color: #ea580c; }
          .footer { margin-top: 40px; padding-top: 20px; border-top: 1px solid #f0f0f0; text-align: center; font-size: 12px; color: #999; }
          @media print { body { padding: 0; } }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="logo">CAFT Financial</div>
          <div class="invoice-label">Invoice</div>
        </div>
        <div class="meta">
          <div class="meta-block">
            <label>Invoice Number</label>
            <p>${payment.id.split('-')[0].toUpperCase()}</p>
          </div>
          <div class="meta-block">
            <label>Date</label>
            <p>${new Intl.DateTimeFormat('en-US', { month: 'long', day: '2-digit', year: 'numeric' }).format(new Date(payment.createdAt))}</p>
          </div>
          <div class="meta-block">
            <label>Payment Method</label>
            <p>${payment.method || 'Online Payment'}</p>
          </div>
          <div class="meta-block">
            <label>Status</label>
            <p><span class="status ${payment.status === 'SUCCESS' || payment.status === 'PAID' || payment.status === 'CAPTURED' ? 'status-success' : payment.status === 'FAILED' ? 'status-failed' : 'status-pending'}">${payment.status}</span></p>
          </div>
        </div>
        <table>
          <thead>
            <tr>
              <th>Description</th>
              <th>Currency</th>
              <th class="amount">Amount</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>${payment.description || 'Subscription Payment'}</td>
              <td>${payment.currency || 'INR'}</td>
              <td class="amount">₹${(payment.amount / 100).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
            </tr>
            <tr class="total-row">
              <td colspan="2">Total</td>
              <td class="amount">₹${(payment.amount / 100).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
            </tr>
          </tbody>
        </table>
        <div class="footer">
          <p>CAFT Financial • This is a computer-generated invoice and does not require a signature.</p>
          <p>Transaction ID: ${payment.id}</p>
        </div>
      </body>
      </html>
    `;

    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(invoiceHtml);
      printWindow.document.close();
      // Auto-trigger print dialog after a short delay
      setTimeout(() => {
        printWindow.print();
      }, 500);
    }
  };

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
          <button
            onClick={() => setCancelModal(true)}
            className="px-5 py-2.5 bg-gray-100 hover:bg-red-50 hover:text-red-600 text-gray-700 font-medium rounded-xl transition-colors text-sm flex items-center gap-2 w-fit"
          >
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
                  {plan.isOneTime && plan.oneTimePrice
                    ? formatCurrency(plan.oneTimePrice)
                    : plan.pricing && plan.pricing.length > 0
                      ? formatCurrency(plan.pricing[0].price)
                      : 'Free'}
                </span>
                {plan.isOneTime && plan.oneTimePrice ? (
                  <span className="text-sm text-gray-500 font-medium"> one-time</span>
                ) : plan.pricing && plan.pricing.length > 0 ? (
                  <span className="text-sm text-gray-500 font-medium">/{plan.pricing[0].billingCycle.toLowerCase()}</span>
                ) : null}
              </div>

              <ul className="space-y-3 mb-8">
                {plan.features?.slice(0, 4).map((feature, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-sm text-gray-600">
                    <CheckCircle2 className={`w-5 h-5 shrink-0 ${feature.included ? 'text-green-500' : 'text-gray-300'}`} />
                    <span className={feature.included ? '' : 'text-gray-400 line-through'}>{feature.name}</span>
                  </li>
                ))}
              </ul>

              <button
                onClick={() => window.location.href = '/pricing#plan-' + plan.id}
                disabled={activeSub?.planId === plan.id}
                className={`w-full py-3 rounded-xl font-semibold text-sm transition-all ${
                  activeSub?.planId === plan.id 
                    ? 'bg-gray-100 text-gray-500 cursor-not-allowed'
                    : plan.isPopular 
                      ? 'bg-orange-600 hover:bg-orange-700 text-white shadow-md shadow-orange-600/20'
                      : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 hover:border-gray-300'
                }`}>
                {activeSub?.planId === plan.id 
                  ? 'Current Plan' 
                  : 'View Details'}
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
                          payment.status === 'SUCCESS' || payment.status === 'PAID' || payment.status === 'CAPTURED' ? 'bg-green-100 text-green-700' :
                          payment.status === 'FAILED' ? 'bg-red-100 text-red-700' : 'bg-orange-100 text-orange-700'
                        }`}>
                          {payment.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={() => handleDownloadInvoice(payment)}
                          className="p-2 text-gray-400 hover:text-orange-600 transition-colors rounded-lg hover:bg-orange-50"
                          title="Download Invoice"
                        >
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

      {/* Cancel Plan Modal */}
      {cancelModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-8 w-full max-w-md shadow-2xl">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-gray-900">Cancel Subscription</h3>
              <button onClick={() => setCancelModal(false)} className="text-gray-400 hover:text-gray-600 p-1">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-xl">
              <p className="text-sm text-red-700 font-medium">
                Are you sure you want to cancel your <strong>{activeSub?.plan?.name}</strong> subscription? 
                You will lose access to premium features at the end of your current billing period.
              </p>
            </div>
            <div className="mb-6">
              <label className="text-sm font-bold text-gray-600 block mb-2">
                Reason for cancellation (optional)
              </label>
              <textarea
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-orange-500/30 resize-none"
                rows={3}
                placeholder="Tell us why you're leaving..."
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
              />
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setCancelModal(false)}
                className="flex-1 py-3 rounded-xl font-semibold text-sm bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors"
              >
                Keep Plan
              </button>
              <button
                onClick={handleCancelPlan}
                disabled={cancelling}
                className="flex-1 py-3 rounded-xl font-semibold text-sm bg-red-600 text-white hover:bg-red-700 transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
              >
                {cancelling ? <><Loader2 className="w-4 h-4 animate-spin" /> Cancelling...</> : 'Cancel Subscription'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
