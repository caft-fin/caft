import { DynamicPage } from '@/components/ui/DynamicPage';

export default function PrivacyPolicyPage() {
  return (
    <DynamicPage
      slug="privacy_policy"
      fallback={{
        badge: 'Legal',
        title: 'Privacy Policy',
        subtitle: 'Last updated: May 1, 2026',
        sections: [
          { title: '1. Information We Collect', content: 'We collect information you provide directly to us, including your name, email address, phone number, and financial data necessary to provide our services. We also collect information automatically when you use our platform, including IP address, browser type, and usage data.' },
          { title: '2. How We Use Your Information', content: 'We use the information we collect to provide, maintain, and improve our services, process transactions, send transactional communications, and comply with legal obligations. We may also use your information to personalize your experience and send marketing communications with your consent.' },
          { title: '3. Information Sharing', content: 'We do not sell your personal information. We may share your information with service providers who assist us in operating our platform, payment processors, and as required by law. All third parties are bound by contractual obligations to protect your data.' },
          { title: '4. Data Security', content: 'We implement industry-standard security measures including AES-256 encryption at rest, TLS 1.3 encryption in transit, regular security audits, and strict access controls. We maintain SOC 2 compliance and conduct regular penetration testing.' },
          { title: '5. Your Rights', content: 'You have the right to access, update, or delete your personal information at any time. You may also request data portability, restrict processing, or withdraw consent for marketing communications by contacting us or through your account settings.' },
          { title: '6. Contact Us', content: 'If you have questions about this Privacy Policy, please contact us at privacy@caftfin.com or write to CAFT Financial Services, India.' },
        ],
      }}
    />
  );
}
