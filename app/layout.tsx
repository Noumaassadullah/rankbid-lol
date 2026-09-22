import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

export const dynamic = 'force-dynamic';
import { ThemeProvider } from '@/components/ThemeProvider';
import { Providers } from '@/components/Providers';
import Footer from '@/components/Footer';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'RankBid - World Ranking Platform for Products',
  description: 'Community-driven product rankings with transparent voting. No algorithms, no politics, just pure voting power.',
  icons: { icon: '/favicon.ico' },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.className} bg-white dark:bg-black text-black dark:text-white flex flex-col min-h-screen`}>
        <Providers>
          <ThemeProvider>
            <main className="flex-1">{children}</main>
            <Footer />
          </ThemeProvider>
        </Providers>
      </body>
    </html>
  );
}
