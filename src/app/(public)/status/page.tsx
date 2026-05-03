import { DynamicPage } from '@/components/ui/DynamicPage';

export default function StatusPage() {
  return (
    <DynamicPage
      slug="status"
      fallback={{
        badge: 'Support',
        title: 'System Status',
        sections: [
          { title: 'API Server', content: 'Operational — 99.99% uptime over the last 90 days.' },
          { title: 'Web Application', content: 'Operational — All frontend services running normally.' },
          { title: 'Payment Processing', content: 'Operational — Razorpay integration functioning as expected.' },
          { title: 'Email Service', content: 'Operational — AWS SES delivering emails without delays.' },
          { title: 'Database', content: 'Operational — PostgreSQL running with full redundancy.' },
          { title: 'Recent Incidents', content: 'No incidents reported in the last 90 days.' },
        ],
      }}
    />
  );
}
