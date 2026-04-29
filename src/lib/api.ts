// Mock data services with fetch interfaces

export interface PricingPlan {
  id: string;
  name: string;
  price: number;
  description: string;
  features: { name: string; included: boolean }[];
  isPopular?: boolean;
}

const MOCK_PRICING_PLANS: PricingPlan[] = [
  {
    id: "basic",
    name: "Basic",
    price: 0,
    description: "Perfect for individuals starting their financial tracking journey.",
    features: [
      { name: "Personal Expense Tracking", included: true },
      { name: "Basic Savings Goals", included: true },
      { name: "Monthly Statements", included: true },
      { name: "Market Insights", included: false },
    ]
  },
  {
    id: "pro",
    name: "Pro",
    price: 999,
    description: "Advanced tools for serious investors and family wealth growth.",
    isPopular: true,
    features: [
      { name: "Everything in Basic", included: true },
      { name: "Stock Portfolio Sync", included: true },
      { name: "AI-Powered Market Insights", included: true },
      { name: "Tax Optimization Reports", included: true },
    ]
  },
  {
    id: "institutional",
    name: "Institutional",
    price: 4999,
    description: "Comprehensive suite for wealth managers and large organizations.",
    features: [
      { name: "Unlimited Portfolios", included: true },
      { name: "Custom API Access", included: true },
      { name: "Dedicated Advisor Support", included: true },
      { name: "Audit-Ready Compliance", included: true },
    ]
  }
];

export async function getPricingPlans(): Promise<PricingPlan[]> {
  try {
    const res = await fetch('/api/pricing');
    if (!res.ok) throw new Error('Failed to fetch pricing');
    return await res.json();
  } catch (error) {
    console.warn('Backend unavailable, using mock pricing plans', error);
    return MOCK_PRICING_PLANS;
  }
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

const MOCK_TRANSACTIONS: Transaction[] = [
  {
    id: "1",
    title: "HDFC Top 100 Fund",
    subtitle: "Mutual Fund SIP • Today",
    amount: 15000.00,
    status: "Success",
    icon: "account_balance",
    type: "debit"
  },
  {
    id: "2",
    title: "Digital Gold Purchase",
    subtitle: "Commodity • Yesterday",
    amount: 5000.00,
    status: "Success",
    icon: "grid_goldenratio",
    type: "debit"
  },
  {
    id: "3",
    title: "Dividend Payout",
    subtitle: "Stock Income • 2 days ago",
    amount: 1240.50,
    status: "Settled",
    icon: "download",
    type: "credit"
  }
];

export async function getRecentTransactions(): Promise<Transaction[]> {
  try {
    const res = await fetch('/api/transactions');
    if (!res.ok) throw new Error('Failed to fetch transactions');
    return await res.json();
  } catch (error) {
    console.warn('Backend unavailable, using mock transactions', error);
    return MOCK_TRANSACTIONS;
  }
}

export async function getDashboardStats() {
  try {
    const res = await fetch('/api/stats');
    if (!res.ok) throw new Error('Failed to fetch stats');
    return await res.json();
  } catch (error) {
    console.warn('Backend unavailable, using mock stats', error);
    return {
      totalValue: 1284930.00,
      profitLoss: 12400.00,
      allocation: {
        domesticEquity: 65,
        foreignAssets: 25,
        digitalGold: 10
      }
    };
  }
}
