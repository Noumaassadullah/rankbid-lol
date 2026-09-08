import { prisma } from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '');
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET || '';

export async function POST(req: NextRequest) {
  const body = await req.text();
  const sig = req.headers.get('stripe-signature') || '';

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, sig, webhookSecret);
  } catch (error) {
    console.error('Webhook signature verification failed:', error);
    return NextResponse.json(
      { error: 'Invalid signature' },
      { status: 400 }
    );
  }

  try {
    switch (event.type) {
      case 'charge.succeeded': {
        const charge = event.data.object as Stripe.Charge;

        const payment = await prisma.payment.findUnique({
          where: { stripePaymentId: charge.id },
        });

        if (!payment) {
          console.log('Payment not found for charge:', charge.id);
          break;
        }

        await prisma.payment.update({
          where: { id: payment.id },
          data: {
            status: 'completed',
            paidAt: new Date(),
            stripePaymentId: charge.id,
          },
        });

        const listing = await prisma.listing.findUnique({
          where: { id: payment.listingId },
        });

        if (!listing) {
          console.log('Listing not found:', payment.listingId);
          break;
        }

        const today = new Date();
        today.setUTCHours(0, 0, 0, 0);

        await prisma.listing.update({
          where: { id: payment.listingId },
          data: {
            totalPaid: listing.totalPaid + payment.amount,
            dayPaid: listing.dayPaid + payment.amount,
            lastRaisedAt: new Date(),
          },
        });

        const existingDailyRank = await prisma.dailyRank.findUnique({
          where: {
            listingId_date: {
              listingId: payment.listingId,
              date: today,
            },
          },
        });

        if (existingDailyRank) {
          await prisma.dailyRank.update({
            where: { id: existingDailyRank.id },
            data: { amount: existingDailyRank.amount + payment.amount },
          });
        } else {
          await prisma.dailyRank.create({
            data: {
              listingId: payment.listingId,
              date: today,
              amount: payment.amount,
            },
          });
        }

        console.log('Payment processed:', {
          paymentId: payment.id,
          listingId: payment.listingId,
          amount: payment.amount,
        });
        break;
      }

      case 'charge.failed': {
        const charge = event.data.object as Stripe.Charge;

        const payment = await prisma.payment.findUnique({
          where: { stripePaymentId: charge.id },
        });

        if (payment) {
          await prisma.payment.update({
            where: { id: payment.id },
            data: { status: 'failed' },
          });
        }
        break;
      }

      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;

        const payment = await prisma.payment.findUnique({
          where: { stripeSessionId: session.id },
        });

        if (payment && session.payment_intent) {
          const paymentIntent = await stripe.paymentIntents.retrieve(
            session.payment_intent as string
          );

          if (paymentIntent.charges.data[0]) {
            await prisma.payment.update({
              where: { id: payment.id },
              data: {
                stripePaymentId: paymentIntent.charges.data[0].id,
              },
            });
          }
        }
        break;
      }
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Webhook processing error:', error);
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    );
  }
}
