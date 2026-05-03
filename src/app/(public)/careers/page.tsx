import { DynamicPage } from '@/components/ui/DynamicPage';

export default function CareersPage() {
  return (
    <DynamicPage
      slug="careers"
      fallback={{
        badge: 'Company',
        title: 'Careers',
        subtitle: 'Join our mission to democratize financial services.',
        sections: [
          { title: 'Health & Wellness', content: 'Comprehensive health insurance, mental health support, and fitness allowances for all employees.' },
          { title: 'Learning Budget', content: '₹50,000 annual learning budget for courses, conferences, and certifications.' },
          { title: 'Flexible Work', content: 'Remote-first culture with flexible hours and quarterly in-person meetups.' },
          { title: 'Open Positions', content: 'We currently don\'t have any open positions listed, but we\'re always looking for exceptional talent. Send your resume to careers@caftfin.com' },
        ],
      }}
    />
  );
}
