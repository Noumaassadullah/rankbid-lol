import { pageMetadata } from '@/lib/seo';

export const metadata = pageMetadata({
  title: 'Product Leaderboard',
  description: 'The live RankBid leaderboard: all-time top products, websites and creator profiles ranked purely by community votes.',
  path: '/leaderboard',
});

export default function LeaderboardLayout({ children }: { children: React.ReactNode }) {
  return children;
}
