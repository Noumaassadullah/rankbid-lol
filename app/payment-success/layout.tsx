import { pageMetadata } from '@/lib/seo';

export const metadata = pageMetadata({
  title: 'Payment Complete',
  description: 'Your RankBid payment is complete.',
  path: '/payment-success',
  noindex: true,
});

export default function PaymentSuccessLayout({ children }: { children: React.ReactNode }) {
  return children;
}
