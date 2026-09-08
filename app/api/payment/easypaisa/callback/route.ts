import { prisma } from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const paymentId = searchParams.get('paymentId');
    const status = searchParams.get('status');

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

    if (status === 'success') {
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

      const dayPaid = await prisma.payment.aggregate({
        where: {
          listingId: payment.listingId,
          status: 'completed',
          paidAt: { gte: new Date(Date.now() - 24 * 60 * 60 * 1000) },
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

      return NextResponse.redirect(new URL(`/success?listing=${payment.listingId}&amount=${payment.amount}`, request.url));
    } else {
      // Payment failed
      await prisma.payment.update({
        where: { id: paymentId },
        data: { status: 'failed' },
      });

      return NextResponse.redirect(new URL('/error?reason=payment_failed', request.url));
    }
  } catch (error) {
    console.error('Error processing EasyPaisa callback:', error);
    return NextResponse.redirect(new URL('/error?reason=processing_error', request.url));
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Verify webhook and process payment
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
    console.error('Error processing EasyPaisa webhook:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
