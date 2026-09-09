import { NextRequest, NextResponse } from 'next/server';
import { verifyJazzCashResponse } from '@/lib/jazzcash';
import { prisma } from '@/lib/prisma';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // Verify JazzCash response
    const isValid = verifyJazzCashResponse(
      body,
      process.env.JAZZCASH_PASSWORD!,
      process.env.JAZZCASH_INTEGRITY_CHECK_KEY!
    );

    if (!isValid) {
      console.error('Invalid JazzCash signature');
      return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
    }

    const responseCode = body.pp_response_code;
    const txnRef = body.pp_txn_ref;
    const orderRef = body.pp_order_ref;
    const amount = parseInt(body.pp_amount || '0') * 100; // Convert to cents

    // Extract listing ID from order ref (format: listingId-timestamp)
    const [listingId] = orderRef.split('-');

    if (!process.env.DATABASE_URL) {
      console.warn('Database not configured - payment recorded but not persisted');
      return NextResponse.json({ success: true });
    }

    try {
      if (responseCode === '000') {
        // Payment successful
        await prisma.payment.create({
          data: {
            listingId,
            amount,
            status: 'completed',
            transactionId: txnRef,
            provider: 'jazzcash',
            metadata: {
              responseCode,
              authCode: body.pp_auth_code,
            },
          },
        });

        // Get current listing data
        const listing = await prisma.listing.findUnique({
          where: { id: listingId },
        });

        if (!listing) {
          console.error('Listing not found:', listingId);
          return NextResponse.json({ error: 'Listing not found' }, { status: 404 });
        }

        // Update listing with total and day paid
        await prisma.listing.update({
          where: { id: listingId },
          data: {
            totalPaid: listing.totalPaid + amount,
            dayPaid: listing.dayPaid + amount,
            lastRaisedAt: new Date(),
          },
        });

        // Create or update daily rank
        const today = new Date();
        today.setUTCHours(0, 0, 0, 0);

        const existingDailyRank = await prisma.dailyRank.findUnique({
          where: {
            listingId_date: {
              listingId,
              date: today,
            },
          },
        });

        if (existingDailyRank) {
          await prisma.dailyRank.update({
            where: { id: existingDailyRank.id },
            data: { amount: existingDailyRank.amount + amount },
          });
        } else {
          await prisma.dailyRank.create({
            data: {
              listingId,
              date: today,
              amount,
            },
          });
        }
      } else {
        // Payment failed
        await prisma.payment.create({
          data: {
            listingId,
            amount,
            status: 'failed',
            transactionId: txnRef,
            provider: 'jazzcash',
            metadata: {
              responseCode,
              errorMessage: body.pp_response_message,
            },
          },
        });
      }
    } catch (dbError) {
      console.error('Database error processing payment:', dbError);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('JazzCash webhook error:', error);
    return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 });
  }
}
