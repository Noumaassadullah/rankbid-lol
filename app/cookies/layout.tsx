import { pageMetadata } from '@/lib/seo';

export const metadata = pageMetadata({
  title: 'Cookie Policy',
  description: 'Which cookies RankBid uses, why, and how to manage your cookie settings.',
  path: '/cookies',
});

export default function CookiesLayout({ children }: { children: React.ReactNode }) {
  return children;
}
