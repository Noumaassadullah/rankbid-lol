import { prisma } from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '');
const DOMAIN = process.env.NEXT_PUBLIC_DOMAIN || 'http://localhost:3000';

export async function POST(req: NextRequest) {
  try {
    const { listingId, amount } = await req.json();

    if (!listingId || !amount || amount < 100) {
      return NextResponse.json(
        { error: 'Valid listing ID and amount (min $1) required' },
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

    const payment = await prisma.payment.create({
      data: {
        listingId,
        amount,
        status: 'pending',
        provider: 'stripe',
      },
    });

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: `Bid for: ${listing.title || listing.url}`,
              description: `Rank your listing for $${(amount / 100).toFixed(2)}`,
            },
            unit_amount: amount,
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${DOMAIN}/success?session_id={CHECKOUT_SESSION_ID}&listing_id=${listingId}`,
      cancel_url: `${DOMAIN}/cancel?listing_id=${listingId}`,
      customer_email: undefined,
      metadata: {
        paymentId: payment.id,
        listingId,
      },
    });

    await prisma.payment.update({
      where: { id: payment.id },
      data: { stripeSessionId: session.id },
    });

    return NextResponse.json(
      { url: session.url, sessionId: session.id }
    );
  } catch (error) {
    console.error('Stripe checkout error:', error);
    return NextResponse.json(
      { error: 'Checkout failed' },
      { status: 500 }
    );
  }
}
