import { pageMetadata } from '@/lib/seo';

export const metadata = pageMetadata({
  title: 'Browse Products by Platform',
  description: 'Browse community-voted rankings by platform: websites, X (Twitter), LinkedIn, Instagram, TikTok and Facebook profiles, ranked by real votes on RankBid.',
  path: '/platforms',
});

export default function PlatformsLayout({ children }: { children: React.ReactNode }) {
  return children;
}
