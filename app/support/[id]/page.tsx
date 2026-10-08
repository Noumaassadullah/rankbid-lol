import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import SupportVoteForm from '@/components/SupportVoteForm';
import { getListing } from '@/lib/server/votes';

// Public page behind a maker's shareable link: anyone can vote with just a name + email.

type Props = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const listing = await getListing(id);
  if (!listing) return { title: 'Support a maker on RankBid' };

  const title = `Support ${listing.title} on RankBid`;
  const description = `Vote for ${listing.title} in under 10 seconds. No account needed.`;
  return {
    title,
    description,
    openGraph: { title, description, type: 'website' },
    twitter: { card: 'summary', title, description },
  };
}

export default async function SupportPage({ params }: Props) {
  const { id } = await params;
  const listing = await getListing(id);
  if (!listing) notFound();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Minimal brand bar: guests land here from a shared link */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-3xl mx-auto px-3 sm:px-4 h-14 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <span className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#0F3460] to-[#1a5490] text-white flex items-center justify-center font-black text-sm shadow-sm">R</span>
            <span className="text-lg font-black text-[#0F3460] tracking-tight">RankBid</span>
          </Link>
          <span className="text-xs font-semibold text-[#1F2937]/50">Community-voted rankings</span>
        </div>
      </div>

      <SupportVoteForm listing={listing} />
    </div>
  );
}
