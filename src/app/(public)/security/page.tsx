import { DynamicPage } from '@/components/ui/DynamicPage';

export default function SecurityPage() {
  return (
    <DynamicPage
      slug="security"
      fallback={{
        badge: 'Company',
        title: 'Security',
        subtitle: 'Your financial data deserves the highest level of protection.',
        sections: [
          { title: 'End-to-End Encryption', content: 'All data is encrypted in transit using TLS 1.3 and at rest using AES-256 encryption. Your sensitive information is never stored in plaintext.' },
          { title: 'Multi-Factor Authentication', content: 'We support biometric authentication, OTP-based verification, and hardware security keys to ensure only you can access your account.' },
          { title: 'Real-Time Fraud Monitoring', content: 'Our AI systems continuously monitor transactions for suspicious activity, alerting you immediately of any unauthorized access attempts.' },
          { title: 'SOC 2 Compliant Infrastructure', content: 'Our systems are hosted on enterprise-grade cloud infrastructure with 99.99% uptime, regular security audits, and disaster recovery protocols.' },
          { title: 'Report a Security Issue', content: 'Found a vulnerability? Contact us at security@caftfin.com. We take all reports seriously and respond within 24 hours.' },
        ],
      }}
    />
  );
}
