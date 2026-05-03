// ─────────────────────────────────────────────────────────
// CAFT Financial — Data Fetching Layer
// Uses real backend API with graceful fallback to mock data
// ─────────────────────────────────────────────────────────

import { api, type PlanItem, type TransactionItem } from './apiClient';

export interface PricingPlan {
  id: string;
  name: string;
  price: number;
  description: string;
  features: { name: string; included: boolean }[];
  isPopular?: boolean;
}

export interface Transaction {
  id: string;
  title: string;
  subtitle: string;
  amount: number;
  status: string;
  icon: string;
  type: 'debit' | 'credit';
}

// ── Fallback mock data (used when backend is unreachable) ──

const MOCK_PRICING_PLANS: PricingPlan[] = [
  {
    id: "basic", name: "Basic", price: 0,
    description: "Perfect for individuals starting their financial tracking journey.",
    features: [
      { name: "Personal Expense Tracking", included: true },
      { name: "Basic Savings Goals", included: true },
      { name: "Monthly Statements", included: true },
      { name: "Market Insights", included: false },
    ]
  },
  {
    id: "pro", name: "Pro", price: 999, isPopular: true,
    description: "Advanced tools for serious investors and family wealth growth.",
    features: [
      { name: "Everything in Basic", included: true },
      { name: "Stock Portfolio Sync", included: true },
      { name: "AI-Powered Market Insights", included: true },
      { name: "Tax Optimization Reports", included: true },
    ]
  },
  {
    id: "institutional", name: "Institutional", price: 4999,
    description: "Comprehensive suite for wealth managers and large organizations.",
    features: [
      { name: "Unlimited Portfolios", included: true },
      { name: "Custom API Access", included: true },
      { name: "Dedicated Advisor Support", included: true },
      { name: "Audit-Ready Compliance", included: true },
    ]
  }
];

const MOCK_TRANSACTIONS: Transaction[] = [
  { id: "1", title: "HDFC Top 100 Fund", subtitle: "Mutual Fund SIP • Today", amount: 15000, status: "Success", icon: "account_balance", type: "debit" },
  { id: "2", title: "Digital Gold Purchase", subtitle: "Commodity • Yesterday", amount: 5000, status: "Success", icon: "grid_goldenratio", type: "debit" },
  { id: "3", title: "Dividend Payout", subtitle: "Stock Income • 2 days ago", amount: 1240.5, status: "Settled", icon: "download", type: "credit" },
];

// ── Public API Functions ──────────────────────────────

/** Fetch plans from API, fallback to mocks */
export async function getPricingPlans(): Promise<PricingPlan[]> {
  try {
    const res = await api.plans.list();
    return res.data.map((plan: PlanItem) => {
      const monthlyPricing = plan.pricing?.find(p => p.billingCycle === 'MONTHLY');
      return {
        id: plan.slug,
        name: plan.name,
        price: monthlyPricing ? monthlyPricing.price / 100 : 0,
        description: plan.description,
        features: plan.features.map((f) => ({ name: f.name, included: f.included })),
        isPopular: plan.isPopular,
      };
    });
  } catch {
    console.warn('Backend unavailable, using mock pricing plans');
    return MOCK_PRICING_PLANS;
  }
}

/** Fetch recent transactions from API, fallback to mocks */
export async function getRecentTransactions(): Promise<Transaction[]> {
  try {
    const res = await api.user.transactions(10);
    return res.data.map((tx: TransactionItem) => ({
      id: tx.id,
      title: tx.title,
      subtitle: tx.subtitle ?? '',
      amount: tx.amount,
      status: tx.status,
      icon: tx.icon ?? 'account_balance',
      type: tx.type,
    }));
  } catch {
    console.warn('Backend unavailable, using mock transactions');
    return MOCK_TRANSACTIONS;
  }
}

/** Fetch dashboard stats from API, fallback to mocks */
export async function getDashboardStats() {
  try {
    const res = await api.stats.dashboard();
    return res.data;
  } catch {
    console.warn('Backend unavailable, using mock stats');
    return {
      totalValue: 1284930.00,
      profitLoss: 12400.00,
      allocation: { domesticEquity: 65, foreignAssets: 25, digitalGold: 10 }
    };
  }
}
