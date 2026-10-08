import { pageMetadata } from '@/lib/seo';

export const metadata = pageMetadata({
  title: 'Admin',
  description: 'RankBid admin.',
  path: '/admin',
  noindex: true,
});

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return children;
}
