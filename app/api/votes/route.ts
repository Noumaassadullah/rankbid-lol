import { NextRequest, NextResponse } from 'next/server';
import { getListing, recordVote, sbHeaders, sbUrl, supabaseConfigured } from '@/lib/server/votes';
import { getSessionUser } from '@/lib/server/session';
import { ipHash, rateLimit } from '@/lib/server/rate-limit';

// Signed-in voting. The voter is whoever owns the session cookie; ids sent by the browser are ignored.

async function hasUserVote(userId: string, listingId: string): Promise<boolean> {
  const res = await fetch(
    sbUrl(`user_votes?user_id=eq.${encodeURIComponent(userId)}&listing_id=eq.${encodeURIComponent(listingId)}&select=id`),
    { headers: sbHeaders(), cache: 'no-store' }
  );
  const rows = res.ok ? await res.json() : [];
  return Array.isArray(rows) && rows.length > 0;
}

export async function POST(req: NextRequest) {
  try {
    if (!supabaseConfigured()) {
      return NextResponse.json({ error: 'Server configuration error' }, { status: 500 });
    }

    const user = await getSessionUser(req);
    if (!user) {
      return NextResponse.json({ error: 'Please sign in to vote' }, { status: 401 });
    }

    const body = await req.json().catch(() => ({}));
    const listingId = typeof body.listingId === 'string' ? body.listingId.trim() : '';
    if (!listingId || listingId.length > 100) {
      return NextResponse.json({ error: 'Missing listingId' }, { status: 400 });
    }

    // Slows down scripted voting from many accounts on one network.
    if (!(await rateLimit(`vote-ip:${ipHash(req)}`, 30, 60 * 60)) || !(await rateLimit(`vote-user:${user.id}`, 60, 60 * 60))) {
      return NextResponse.json({ error: 'Too many votes. Please try again later.' }, { status: 429 });
    }

    const listing = await getListing(listingId);
    if (!listing) {
      return NextResponse.json({ error: 'Listing not found' }, { status: 404 });
    }

    if (await hasUserVote(user.id, listing.id)) {
      return NextResponse.json({ error: 'Already voted', voted: true }, { status: 400 });
    }

    const result = await recordVote(listing.id, `user:${user.id}`);
    if (result.status === 'duplicate') {
      return NextResponse.json({ error: 'Already voted', voted: true }, { status: 400 });
    }

    const userVoteRes = await fetch(sbUrl('user_votes'), {
      method: 'POST',
      headers: sbHeaders({ 'Content-Type': 'application/json', Prefer: 'return=minimal' }),
      body: JSON.stringify({
        id: `uv_${crypto.randomUUID()}`,
        user_id: user.id,
        listing_id: listing.id,
        voted_at: new Date().toISOString(),
      }),
    });
    if (!userVoteRes.ok) {
      console.error('Failed to insert user vote:', userVoteRes.status, await userVoteRes.text());
    }

    return NextResponse.json(
      { success: true, voted: true, totalVotes: result.totalVotes, dayVotes: result.dayVotes },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error recording vote:', error);
    return NextResponse.json(
      { error: 'Failed to record vote. Please try again later.' },
      { status: 500 }
    );
  }
}

// GET ?listingId — vote count, and whether the signed-in user has voted.
export async function GET(req: NextRequest) {
  const listingId = req.nextUrl.searchParams.get('listingId');
  if (!listingId) {
    return NextResponse.json({ error: 'Missing listingId' }, { status: 400 });
  }
  if (!supabaseConfigured()) {
    return NextResponse.json({ voteCount: 0, userVoted: false });
  }

  try {
    const id = encodeURIComponent(listingId);
    const countRes = await fetch(sbUrl(`votes?listing_id=eq.${id}&select=id`), {
      method: 'HEAD',
      headers: sbHeaders({ Prefer: 'count=exact' }),
      cache: 'no-store',
    });
    const voteCount = parseInt(countRes.headers.get('content-range')?.split('/')[1] || '0') || 0;

    const user = await getSessionUser(req);
    const userVoted = user ? await hasUserVote(user.id, listingId) : false;

    return NextResponse.json({ voteCount, userVoted });
  } catch (error) {
    console.error('Error fetching votes:', error);
    return NextResponse.json({ voteCount: 0, userVoted: false });
  }
}
