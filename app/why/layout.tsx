import { pageMetadata } from '@/lib/seo';

export const metadata = pageMetadata({
  title: 'Why Launch on RankBid',
  description: 'Why makers launch on RankBid: free listings, no gatekeepers, live community votes and a public rank page for every product. Votes, not budgets, decide who rises.',
  path: '/why',
});

export default function WhyLayout({ children }: { children: React.ReactNode }) {
  return children;
}
