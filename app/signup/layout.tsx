import { pageMetadata } from '@/lib/seo';

export const metadata = pageMetadata({
  title: 'Create a Free Account',
  description: 'Create a free RankBid account to submit products and vote.',
  path: '/signup',
  noindex: true,
});

export default function SignupLayout({ children }: { children: React.ReactNode }) {
  return children;
}
