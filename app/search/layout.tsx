import { pageMetadata } from '@/lib/seo';

export const metadata = pageMetadata({
  title: 'Search Products',
  description: 'Search community-ranked products on RankBid.',
  path: '/search',
  noindex: true,
});

export default function SearchLayout({ children }: { children: React.ReactNode }) {
  return children;
}
