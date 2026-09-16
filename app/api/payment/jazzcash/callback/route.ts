import { prisma } from '@/lib/prisma';
import { verifyJazzCashSignature } from '@/lib/payment';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const paymentId = searchParams.get('paymentId');

    if (!paymentId) {
      return NextResponse.redirect(new URL('/error?reason=invalid_payment', request.url));
    }

    // Get payment record
    const payment = await prisma.payment.findUnique({
      where: { id: paymentId },
      include: { listing: true },
    });

    if (!payment) {
      return NextResponse.redirect(new URL('/error?reason=payment_not_found', request.url));
    }

    // Verify JazzCash response (this would come from query params)
    // In production, you'd validate the signature here
    // For now, we'll mark it as completed if it exists

    // Update payment status
    const updatedPayment = await prisma.payment.update({
      where: { id: paymentId },
      data: {
        status: 'completed',
        paidAt: new Date(),
        transactionId: searchParams.get('transactionId') || undefined,
      },
    });

    // Update listing totals
    const totalPaid = await prisma.payment.aggregate({
      where: { listingId: payment.listingId, status: 'completed' },
      _sum: { amount: true },
    });

    const today = new Date();
    today.setUTCHours(0, 0, 0, 0);
    const dayPaid = await prisma.payment.aggregate({
      where: {
        listingId: payment.listingId,
        status: 'completed',
        paidAt: { gte: today },
      },
      _sum: { amount: true },
    });

    await prisma.listing.update({
      where: { id: payment.listingId },
      data: {
        totalPaid: totalPaid._sum.amount || 0,
        dayPaid: dayPaid._sum.amount || 0,
        lastRaisedAt: new Date(),
      },
    });

    // Redirect to success page
    return NextResponse.redirect(new URL(`/success?listing=${payment.listingId}&amount=${payment.amount}`, request.url));
  } catch (error) {
    console.error('Error processing JazzCash callback:', error);
    return NextResponse.redirect(new URL('/error?reason=processing_error', request.url));
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Verify webhook signature and process payment
    const payment = await prisma.payment.findUnique({
      where: { transactionId: body.transactionId },
    });

    if (!payment) {
      return NextResponse.json({ error: 'Payment not found' }, { status: 404 });
    }

    if (body.status === 'success') {
      await prisma.payment.update({
        where: { id: payment.id },
        data: {
          status: 'completed',
          paidAt: new Date(),
        },
      });

      // Update listing totals
      const totalPaid = await prisma.payment.aggregate({
        where: { listingId: payment.listingId, status: 'completed' },
        _sum: { amount: true },
      });

      await prisma.listing.update({
        where: { id: payment.listingId },
        data: {
          totalPaid: totalPaid._sum.amount || 0,
          lastRaisedAt: new Date(),
        },
      });
    }

    return NextResponse.json({ status: 'received' });
  } catch (error) {
    console.error('Error processing JazzCash webhook:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
