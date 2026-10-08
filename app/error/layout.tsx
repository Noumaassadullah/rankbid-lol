import { pageMetadata } from '@/lib/seo';

export const metadata = pageMetadata({
  title: 'Error',
  description: 'Something went wrong.',
  path: '/error',
  noindex: true,
});

export default function ErrorLayout({ children }: { children: React.ReactNode }) {
  return children;
}
