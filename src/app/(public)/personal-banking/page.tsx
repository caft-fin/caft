import { DynamicPage } from '@/components/ui/DynamicPage';

export default function PersonalBankingPage() {
  return (
    <DynamicPage
      slug="personal_banking"
      fallback={{
        badge: 'Platform',
        title: 'Personal Banking',
        sections: [
          { title: 'Zero-Fee Accounts', content: 'No monthly maintenance fees, no minimum balance requirements. Banking that respects your money. Open a savings or current account in minutes with zero paperwork.' },
          { title: 'Mobile-First Banking', content: 'Full banking capabilities from your phone. Deposit checks, transfer funds, and track spending instantly. Our app is designed for the modern professional who needs banking on the go.' },
          { title: 'Bank-Grade Security', content: '256-bit encryption, biometric authentication, and real-time fraud monitoring to keep your money safe. Every transaction is protected by multiple layers of security.' },
        ],
      }}
    />
  );
}
