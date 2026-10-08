import { pageMetadata } from '@/lib/seo';

export const metadata = pageMetadata({
  title: 'Your Profile',
  description: 'Manage your RankBid submissions and votes.',
  path: '/profile',
  noindex: true,
});

export default function ProfileLayout({ children }: { children: React.ReactNode }) {
  return children;
}
