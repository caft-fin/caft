import { DynamicPage } from '@/components/ui/DynamicPage';

export default function HelpCenterPage() {
  return (
    <DynamicPage
      slug="help_center"
      fallback={{
        badge: 'Support',
        title: 'Help Center',
        subtitle: 'Find answers to common questions and get the support you need.',
        sections: [
          { title: 'Getting Started', content: 'Learn how to create an account, verify your identity, and make your first investment. Our onboarding process takes less than 5 minutes.' },
          { title: 'Account & Billing', content: 'Manage your subscription, update payment methods, and understand your invoices. All billing is handled securely through Razorpay.' },
          { title: 'Investment Guide', content: 'Understand our investment strategies, risk profiles, and portfolio management tools. Our platform provides AI-driven insights to help you make informed decisions.' },
          { title: 'Troubleshooting', content: 'Having technical issues? Try clearing your browser cache and cookies, or updating to the latest browser version. If the issue persists, contact our support team.' },
          { title: 'Contact Support', content: 'Our support team is available Monday–Friday, 9 AM – 6 PM IST. Email us at support@caftfin.com or use the contact form on our About page.' },
        ],
      }}
    />
  );
}
