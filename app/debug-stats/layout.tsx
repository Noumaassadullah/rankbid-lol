import { pageMetadata } from '@/lib/seo';

export const metadata = pageMetadata({
  title: 'Debug',
  description: 'Debug.',
  path: '/debug-stats',
  noindex: true,
});

export default function DebugStatsLayout({ children }: { children: React.ReactNode }) {
  return children;
}
