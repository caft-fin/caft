import { DynamicPage } from '@/components/ui/DynamicPage';

export default function InvestmentPage() {
  return (
    <DynamicPage
      slug="investment"
      fallback={{
        badge: 'Platform',
        title: 'Investment',
        sections: [
          { title: 'Market Analytics', content: 'Real-time market data, technical indicators, and AI-powered insights to inform your decisions. Access institutional-grade tools previously available only to high-net-worth individuals.' },
          { title: 'Goal-Based Investing', content: 'Set financial goals and let our engine build optimized portfolios to reach them. Whether it is retirement, a home purchase, or education funding, we map out the path.' },
          { title: 'Instant Execution', content: 'Execute trades instantly across multiple asset classes with competitive pricing. Begin with as little as ₹500 and build your portfolio over time.' },
        ],
      }}
    />
  );
}
