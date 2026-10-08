import { pageMetadata } from '@/lib/seo';

export const metadata = pageMetadata({
  title: 'Rankings Archive',
  description: 'Past daily winners on RankBid: every day’s top community-voted products, saved in the rankings archive.',
  path: '/archive',
});

export default function ArchiveLayout({ children }: { children: React.ReactNode }) {
  return children;
}
