import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

export const dynamic = 'force-dynamic';
import { Providers } from '@/components/Providers';
import Footer from '@/components/Footer';
import { VisitorTracker } from '@/components/visitor-tracker';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'RankBid - World Ranking Platform for Products',
  description: 'Community-driven product rankings with transparent voting. No algorithms, no politics, just pure voting power.',
  icons: { icon: '/favicon.ico' },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-white text-gray-900 flex flex-col min-h-screen`}>
        <VisitorTracker />
        <Providers>
          <main className="flex-1">{children}</main>
          <Footer />
        </Providers>
      </body>
    </html>
  );
}
