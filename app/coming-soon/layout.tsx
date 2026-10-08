import { pageMetadata } from '@/lib/seo';

export const metadata = pageMetadata({
  title: 'Coming Soon',
  description: 'RankBid is launching soon. Join the waitlist.',
  path: '/coming-soon',
  noindex: true,
});

export default function ComingSoonLayout({ children }: { children: React.ReactNode }) {
  return children;
}
