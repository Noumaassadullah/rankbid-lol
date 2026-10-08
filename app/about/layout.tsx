import { pageMetadata } from '@/lib/seo';

export const metadata = pageMetadata({
  title: 'About Us: Our Mission & How Ranking Works',
  description: 'RankBid is a free, community-driven product discovery platform. Learn our mission, how ranking by public votes works, and what we stand for.',
  path: '/about',
});

export default function AboutLayout({ children }: { children: React.ReactNode }) {
  return children;
}
