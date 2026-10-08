import { pageMetadata } from '@/lib/seo';

export const metadata = pageMetadata({
  title: 'Daily Product Rankings',
  description: 'Today’s top new product launches on RankBid, ranked by community votes.',
  path: '/daily',
});

export default function DailyLayout({ children }: { children: React.ReactNode }) {
  return children;
}
