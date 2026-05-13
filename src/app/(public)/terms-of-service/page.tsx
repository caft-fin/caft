import { DynamicPage } from '@/components/ui/DynamicPage';

export default function TermsOfServicePage() {
  return (
    <DynamicPage
      slug="terms_of_service"
      fallback={{
        badge: 'Legal',
        title: 'Terms of Service',
        subtitle: 'Last updated: May 1, 2026',
        sections: [
          { title: '1. Acceptance of Terms', content: 'By accessing or using CAFT Financial services, you agree to be bound by these Terms of Service. If you do not agree, you may not use our services. These terms constitute a legally binding agreement between you and CAFT Financial Services.' },
          { title: '2. Eligibility', content: 'You must be at least 18 years of age and a resident of India to use our services. You must provide accurate, complete information during registration and keep your account credentials secure.' },
          { title: '3. Services', content: 'CAFT Financial provides wealth management, investment advisory, and financial analytics services. Our services are informational and educational in nature. Investment decisions are ultimately your own responsibility.' },
          { title: '4. Fees and Payments', content: 'Certain services require a subscription. Fees are charged based on the plan you select. All payments are processed securely through Razorpay. Subscription renewals are automatic unless cancelled before the billing date.' },
          { title: '5. Intellectual Property', content: 'All content, trademarks, logos, and intellectual property on the platform are owned by CAFT Financial Services. You may not reproduce, distribute, or create derivative works without our express written permission.' },
          { title: '6. Limitation of Liability', content: 'CAFT Financial is not liable for any investment losses, market fluctuations, or financial outcomes resulting from the use of our services. Past performance does not guarantee future results.' },
          { title: '7. Termination', content: 'We reserve the right to suspend or terminate your account for violation of these terms. You may close your account at any time by contacting support.' },
          { title: '8. Contact', content: 'For questions regarding these Terms of Service, contact us at support@caftfin.com.' },
        ],
      }}
    />
  );
}
