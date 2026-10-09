// Server-only helpers for the premium #1-#3 bidding ladder (see supabase/migrations/premium_bidding.sql).
import { sbHeaders, sbUrl } from '@/lib/server/votes';

export const PREMIUM_POSITIONS = [1, 2, 3] as const;

/** Starting price (USD) of an empty spot. Must match `base` in activate_premium_bid. */
export const BASE_PRICES_USD: Record<number, number> = { 1: 5, 2: 3, 3: 1 };

/** A held spot can be taken by paying the holder's bid plus this much. */
export const OUTBID_STEP_USD = 1;

/** Rapid Gateway charges PKR; prices are set in USD and converted at this rate. */
export function usdToPkr(usd: number): number {
  const rate = Number(process.env.USD_TO_PKR) || 280;
  return Math.round(usd * rate);
}

export interface PremiumHolder {
  id: string;
  listingId: string;
  position: number;
  bidUsd: number;
  expiresAt: string;
  founderName: string | null;
  founderEmail: string | null;
  founderPhone: string | null;
  founderWebsite: string | null;
  founderTwitter: string | null;
  founderLinkedin: string | null;
  founderInstagram: string | null;
  founderFacebook: string | null;
  founderTiktok: string | null;
  founderYoutube: string | null;
  founderGithub: string | null;
}

export interface LadderSpot {
  position: number;
  holder: PremiumHolder | null;
  /** Lowest bid (USD) that takes this spot right now. */
  minBidUsd: number;
}

/** Current holders of #1-#3 (expired holders are ignored). */
export async function getActiveHolders(): Promise<PremiumHolder[]> {
  const res = await fetch(
    sbUrl(`premium_listings?payment_status=eq.active&expires_at=gt.${encodeURIComponent(new Date().toISOString())}&order=position.asc&select=*`),
    { headers: sbHeaders(), cache: 'no-store' }
  );
  if (!res.ok) {
    console.error('Failed to read premium holders:', res.status, await res.text());
    return [];
  }
  const rows: any[] = await res.json();
  return rows.map(r => ({
    id: r.id,
    listingId: r.listing_id,
    position: r.position,
    bidUsd: Number(r.bid_usd ?? r.payment_amount ?? r.amount_paid ?? 0),
    expiresAt: r.expires_at,
    founderName: r.founder_name,
    founderEmail: r.founder_email,
    founderPhone: r.founder_phone,
    founderWebsite: r.founder_website,
    founderTwitter: r.founder_twitter,
    founderLinkedin: r.founder_linkedin,
    founderInstagram: r.founder_instagram,
    founderFacebook: r.founder_facebook,
    founderTiktok: r.founder_tiktok,
    founderYoutube: r.founder_youtube,
    founderGithub: r.founder_github,
  }));
}

export function buildLadder(holders: PremiumHolder[]): LadderSpot[] {
  return PREMIUM_POSITIONS.map(position => {
    const holder = holders.find(h => h.position === position) || null;
    return {
      position,
      holder,
      minBidUsd: holder ? holder.bidUsd + OUTBID_STEP_USD : BASE_PRICES_USD[position],
    };
  });
}

export async function getLadder(): Promise<LadderSpot[]> {
  return buildLadder(await getActiveHolders());
}

export interface ActivationResult {
  status: 'active' | 'needs_refund' | 'not_found' | string;
  position?: number;
  required?: number;
}

/** Places a paid bid on the ladder, pushing lower holders down. Safe to call more than once. */
export async function activatePremiumBid(premiumListingId: string): Promise<ActivationResult> {
  const res = await fetch(sbUrl('rpc/activate_premium_bid'), {
    method: 'POST',
    headers: sbHeaders({ 'Content-Type': 'application/json' }),
    body: JSON.stringify({ p_id: premiumListingId }),
    cache: 'no-store',
  });
  if (!res.ok) {
    throw new Error(`activate_premium_bid failed: ${res.status} ${await res.text()}`);
  }
  return res.json();
}

export async function getPremiumListing(id: string): Promise<any | null> {
  const res = await fetch(sbUrl(`premium_listings?id=eq.${encodeURIComponent(id)}&select=*`), {
    headers: sbHeaders(),
    cache: 'no-store',
  });
  if (!res.ok) return null;
  const [row] = await res.json();
  return row || null;
}

export async function updatePremiumListing(id: string, patch: Record<string, unknown>): Promise<void> {
  const res = await fetch(sbUrl(`premium_listings?id=eq.${encodeURIComponent(id)}`), {
    method: 'PATCH',
    headers: sbHeaders({ 'Content-Type': 'application/json' }),
    body: JSON.stringify({ ...patch, updated_at: new Date().toISOString() }),
  });
  if (!res.ok) {
    throw new Error(`Failed to update premium listing ${id}: ${res.status} ${await res.text()}`);
  }
}
