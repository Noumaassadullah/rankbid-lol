import { pageMetadata } from '@/lib/seo';

export const metadata = pageMetadata({
  title: 'Platform Statistics',
  description: 'Live RankBid statistics: total products listed, votes cast, categories and community growth.',
  path: '/stats',
});

export default function StatsLayout({ children }: { children: React.ReactNode }) {
  return children;
}
