import { pageMetadata } from '@/lib/seo';

export const metadata = pageMetadata({
  title: 'Analytics Test',
  description: 'Analytics test.',
  path: '/analytics-test',
  noindex: true,
});

export default function AnalyticsTestLayout({ children }: { children: React.ReactNode }) {
  return children;
}
