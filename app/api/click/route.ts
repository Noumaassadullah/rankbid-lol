import { prisma } from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const listingId = searchParams.get('id');

    if (!listingId) {
      return NextResponse.json(
        { error: 'Listing ID required' },
        { status: 400 }
      );
    }

    const listing = await prisma.listing.findUnique({
      where: { id: listingId },
    });

    if (!listing) {
      return NextResponse.json(
        { error: 'Listing not found' },
        { status: 404 }
      );
    }

    await prisma.listing.update({
      where: { id: listingId },
      data: { clickCount: listing.clickCount + 1 },
    });

    return NextResponse.redirect(listing.url, 302);
  } catch (error) {
    console.error('Click tracking error:', error);
    return NextResponse.json(
      { error: 'Click tracking failed' },
      { status: 500 }
    );
  }
}
