import { DynamicPage } from '@/components/ui/DynamicPage';

export default function WealthManagementPage() {
  return (
    <DynamicPage
      slug="wealth_management"
      fallback={{
        badge: 'Platform',
        title: 'Wealth Management',
        sections: [
          { title: 'Risk Management', content: 'Advanced algorithms that continuously monitor and hedge your portfolio against market volatility. Our risk engine analyzes thousands of market scenarios in real-time to protect your investments.' },
          { title: 'Growth Strategies', content: 'Tailored growth plans based on your risk tolerance, investment horizon, and financial goals. Whether you prefer aggressive growth or stable returns, we build a personalized strategy for you.' },
          { title: 'Asset Allocation', content: 'Smart diversification across asset classes including equities, bonds, gold, and alternative investments. Our AI-driven allocation engine rebalances your portfolio automatically to maintain optimal risk-return ratios.' },
          { title: 'Get Started', content: 'Start with a free consultation and discover how CAFT Financial can help you achieve your financial dreams. Our wealth advisors are available Monday–Friday, 9 AM – 6 PM IST.' },
        ],
      }}
    />
  );
}
