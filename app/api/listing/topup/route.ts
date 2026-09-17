import { prisma } from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';
import { MIN_LISTING_AMOUNT_CENTS } from '@/lib/constants';

interface TopupRequest {
  listingId: string;
  additionalAmount: number; // Amount to add in cents
}

export async function POST(req: NextRequest) {
  try {
    const { listingId, additionalAmount } = await req.json() as TopupRequest;

    if (!listingId) {
      return NextResponse.json(
        { error: 'Listing ID required' },
        { status: 400 }
      );
    }

    if (!additionalAmount || additionalAmount < 100) {
      return NextResponse.json(
        { error: 'Additional amount must be at least 1 PKR (100 cents)' },
        { status: 400 }
      );
    }

    // Verify listing exists
    const listing = await prisma.listing.findUnique({
      where: { id: listingId },
    });

    if (!listing) {
      return NextResponse.json(
        { error: 'Listing not found' },
        { status: 404 }
      );
    }

    // Create a payment record for the top-up
    const payment = await prisma.payment.create({
      data: {
        listingId,
        amount: additionalAmount,
        status: 'pending',
        provider: 'jazzcash',
      },
    });

    // Prepare checkout data
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const reference = `TOP-${listingId}-${payment.id}-${Date.now()}`;
    const paymentUrl = `${baseUrl}/payment/manual?amount=${additionalAmount}&ref=${reference}&paymentId=${payment.id}&isTopup=true`;

    return NextResponse.json({
      payment: {
        id: payment.id,
        listingId: payment.listingId,
        amount: payment.amount,
        currentAmount: listing.totalPaid,
        newTotalAmount: listing.totalPaid + additionalAmount,
      },
      checkoutUrl: paymentUrl,
      reference,
    });
  } catch (error) {
    console.error('Top-up error:', error);
    return NextResponse.json(
      { error: 'Failed to initiate top-up' },
      { status: 500 }
    );
  }
}

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
      select: {
        id: true,
        title: true,
        url: true,
        totalPaid: true,
        dayPaid: true,
        clickCount: true,
        category: true,
        createdAt: true,
      },
    });

    if (!listing) {
      return NextResponse.json(
        { error: 'Listing not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      listing,
      canTopup: true,
      minTopupAmount: 100, // Minimum 1 PKR
    });
  } catch (error) {
    console.error('Error fetching listing for top-up:', error);
    return NextResponse.json(
      { error: 'Failed to fetch listing' },
      { status: 500 }
    );
  }
}
