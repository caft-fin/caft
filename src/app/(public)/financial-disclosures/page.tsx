import { DynamicPage } from '@/components/ui/DynamicPage';

export default function FinancialDisclosuresPage() {
  return (
    <DynamicPage
      slug="financial_disclosures"
      fallback={{
        badge: 'Legal',
        title: 'Financial Disclosures',
        subtitle: 'Last updated: May 1, 2026',
        sections: [
          { title: 'Investment Risk Disclaimer', content: 'All investments carry risk. Past performance does not guarantee future results. The value of investments may go down as well as up, and you may receive back less than your original investment.' },
          { title: 'Regulatory Information', content: 'CAFT Financial Services operates under applicable Indian financial regulations. We are committed to transparency and compliance with all regulatory requirements governing financial services and investment advisory.' },
          { title: 'Fee Structure', content: 'Our fee structure is transparent and fully disclosed during the subscription process. Management fees, if applicable, are calculated as a percentage of assets under management. There are no hidden charges. All fees are clearly stated on our pricing page.' },
          { title: 'Conflicts of Interest', content: 'CAFT Financial may earn referral fees or commissions from third-party financial products recommended on our platform. We are committed to disclosing any potential conflicts of interest and always acting in the best interest of our clients.' },
          { title: 'Data Accuracy', content: 'While we strive to provide accurate and timely financial data, we cannot guarantee the completeness or accuracy of all market data displayed on our platform. Users should verify critical information through official sources before making investment decisions.' },
          { title: 'Not Financial Advice', content: 'The information provided through CAFT Financial services is for informational and educational purposes only and should not be construed as personalized financial advice. We recommend consulting with a qualified financial advisor before making significant financial decisions.' },
        ],
      }}
    />
  );
}
