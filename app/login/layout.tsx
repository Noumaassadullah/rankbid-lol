import { pageMetadata } from '@/lib/seo';

export const metadata = pageMetadata({
  title: 'Log In',
  description: 'Log in to RankBid to submit products and vote.',
  path: '/login',
  noindex: true,
});

export default function LoginLayout({ children }: { children: React.ReactNode }) {
  return children;
}
