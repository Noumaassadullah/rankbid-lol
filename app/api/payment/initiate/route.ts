import { prisma } from '@/lib/prisma';
import { generateJazzCashCheckoutURL, generateEasypaisaCheckoutURL, parseAmount } from '@/lib/payment';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { listingId, amount, method, userId } = body;

    // Validation
    if (!listingId || !amount || !method || !userId) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    if (!['jazzcash', 'easypaisa'].includes(method)) {
      return NextResponse.json({ error: 'Invalid payment method' }, { status: 400 });
    }

    // Verify amount
    const amountCents = parseAmount(amount.toString());
    if (amountCents < 50000) {
      // Minimum Rs. 500
      return NextResponse.json({ error: 'Amount must be at least Rs. 500' }, { status: 400 });
    }

    // Get or verify listing
    const listing = await prisma.listing.findUnique({
      where: { id: listingId },
    });

    if (!listing) {
      return NextResponse.json({ error: 'Listing not found' }, { status: 404 });
    }

    // Check if user is trying to outrank #1
    if (amount <= listing.totalPaid) {
      return NextResponse.json({
        error: `Must pay at least Rs. ${(listing.totalPaid + 500) / 100} to outrank current #1`,
        required: (listing.totalPaid + 500) / 100,
      }, { status: 400 });
    }

    // Create payment record
    const payment = await prisma.payment.create({
      data: {
        userId,
        listingId,
        amount: amountCents,
        method,
        status: 'pending',
      },
    });

    // Generate checkout URL
    let checkoutURL: string;
    const returnURL = `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/payment/${method}/callback?paymentId=${payment.id}`;
    const notificationURL = `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/payment/${method}/webhook?paymentId=${payment.id}`;

    if (method === 'jazzcash') {
      checkoutURL = generateJazzCashCheckoutURL(
        process.env.JAZZCASH_MERCHANT_ID!,
        process.env.JAZZCASH_PASSWORD!,
        amountCents,
        payment.id,
        returnURL,
        notificationURL
      );
    } else {
      checkoutURL = generateEasypaisaCheckoutURL(
        process.env.EASYPAISA_MERCHANT_ID!,
        process.env.EASYPAISA_API_KEY!,
        amountCents,
        payment.id,
        returnURL
      );
    }

    return NextResponse.json({
      paymentId: payment.id,
      checkoutURL,
      amount: amountCents / 100,
      listingId,
    });
  } catch (error) {
    console.error('Error initiating payment:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
