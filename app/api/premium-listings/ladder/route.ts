import { NextResponse } from 'next/server';
import { getLadder, usdToPkr } from '@/lib/server/premium';

export const dynamic = 'force-dynamic';

/** Current holder and minimum bid for each premium spot, for the premium modal. */
export async function GET() {
  const ladder = await getLadder();
  return NextResponse.json({
    spots: ladder.map(spot => ({
      position: spot.position,
      held: Boolean(spot.holder),
      heldByListingId: spot.holder?.listingId ?? null,
      currentBidUsd: spot.holder?.bidUsd ?? null,
      expiresAt: spot.holder?.expiresAt ?? null,
      minBidUsd: spot.minBidUsd,
      minBidPkr: usdToPkr(spot.minBidUsd),
    })),
  });
}
