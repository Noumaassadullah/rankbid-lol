import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { query } from '@/lib/db';

/**
 * Webhook handler for Rapid Gateway payment notifications
 * Rapid Gateway sends signed JSON webhooks to this endpoint
 *
 * Signature verification:
 * expected = HMAC_SHA256(signingSecret, timestamp + "." + rawBody)
 */
export async function POST(req: NextRequest) {
  try {
    // Get headers for signature verification
    const signature = req.headers.get('x-rapidgateway-signature');
    const timestamp = req.headers.get('x-rapidgateway-timestamp');
    const eventType = req.headers.get('x-rapidgateway-event');

    // Validate required headers
    if (!signature || !timestamp || !eventType) {
      console.error('Missing webhook headers:', { signature: !!signature, timestamp: !!timestamp, eventType: !!eventType });
      return NextResponse.json(
        { error: 'Invalid webhook headers' },
        { status: 400 }
      );
    }

    // Get the raw body for signature verification
    const rawBody = await req.text();
    const body = JSON.parse(rawBody);

    // Validate required payload fields
    const { eventType: payloadEventType, merchantTransactionId, status, amount, gatewayTxnRef } = body;

    if (!payloadEventType || !merchantTransactionId || !status) {
      console.error('Missing payload fields:', { payloadEventType, merchantTransactionId, status });
      return NextResponse.json(
        { error: 'Invalid webhook payload' },
        { status: 400 }
      );
    }

    // Get signing salt
    const signingSecret = process.env.RAPID_GATEWAY_SIGNING_SALT || '';
    if (!signingSecret) {
      console.error('RAPID_GATEWAY_SIGNING_SALT not configured');
      return NextResponse.json(
        { error: 'Webhook verification not configured' },
        { status: 500 }
      );
    }

    // Verify signature: HMAC_SHA256(secret, timestamp + "." + rawBody)
    const payload = `${timestamp}.${rawBody}`;
    const expectedSignature = crypto
      .createHmac('sha256', signingSecret)
      .update(payload)
      .digest('hex')
      .toUpperCase();

    if (signature.toUpperCase() !== expectedSignature) {
      console.error('Webhook signature verification failed', {
        expected: expectedSignature,
        received: signature.toUpperCase(),
      });
      return NextResponse.json(
        { error: 'Signature verification failed' },
        { status: 403 }
      );
    }

    // Verify timestamp is recent (within 5 minutes)
    const webhookTime = parseInt(timestamp);
    const currentTime = Math.floor(Date.now() / 1000);
    const timeDiff = Math.abs(currentTime - webhookTime);

    if (timeDiff > 300) {
      console.error('Webhook timestamp too old:', timeDiff, 'seconds');
      return NextResponse.json(
        { error: 'Webhook timestamp expired' },
        { status: 403 }
      );
    }

    console.log('✅ Webhook verified - Event:', eventType, 'Status:', status);

    // Only process completed/failed payments
    if (eventType !== 'transaction.completed' && eventType !== 'transaction.failed') {
      console.log('ℹ️ Ignoring event type:', eventType);
      return NextResponse.json({ success: true, message: 'Event ignored' });
    }

    // Extract premium listing ID from merchantTransactionId (BASKET_ID)
    // Format: {premiumListingId}-{timestamp}
    const premiumListingId = merchantTransactionId.split('-')[0];

    if (eventType === 'transaction.completed' && status === 'SUCCESS') {
      // Update premium listing status to confirmed
      try {
        const result = await query(
          `UPDATE premium_listings
           SET payment_status = 'confirmed',
               payment_txn_ref = $1,
               payment_amount = $2,
               payment_verified_at = NOW(),
               updated_at = NOW()
           WHERE id = $3
           RETURNING *`,
          [gatewayTxnRef || merchantTransactionId, amount, premiumListingId]
        );

        if (result.rows.length === 0) {
          console.error(`Premium listing not found for ID: ${premiumListingId}`);
          return NextResponse.json(
            { error: 'Premium listing not found' },
            { status: 404 }
          );
        }

        console.log('✅ Premium listing confirmed:', premiumListingId);

        return NextResponse.json({
          success: true,
          message: 'Payment confirmed',
          premiumListingId,
        });
      } catch (dbError: any) {
        console.error('Database error updating premium listing:', dbError);
        return NextResponse.json(
          { error: 'Failed to update payment status' },
          { status: 500 }
        );
      }
    } else if (eventType === 'transaction.failed' || status !== 'SUCCESS') {
      // Mark payment as failed
      try {
        const result = await query(
          `UPDATE premium_listings
           SET payment_status = 'failed',
               payment_txn_ref = $1,
               updated_at = NOW()
           WHERE id = $2
           RETURNING *`,
          [gatewayTxnRef || merchantTransactionId, premiumListingId]
        );

        console.log('❌ Payment failed for listing:', premiumListingId);

        return NextResponse.json({
          success: true,
          message: 'Payment failure recorded',
          premiumListingId,
        });
      } catch (dbError: any) {
        console.error('Database error recording payment failure:', dbError);
        return NextResponse.json(
          { error: 'Failed to record payment failure' },
          { status: 500 }
        );
      }
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Rapid Gateway webhook error:', error);
    return NextResponse.json(
      { error: error.message || 'Webhook processing failed' },
      { status: 500 }
    );
  }
}

/**
 * GET handler for browser-based redirect flow
 * NOTE: Rapid Gateway docs state SUCCESS_URL/FAILURE_URL don't receive parameters
 * The basket_id should be passed through the URL, and webhook is the source of truth
 */
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const basketId = searchParams.get('basket_id');

  if (!basketId) {
    return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/error?message=Invalid payment response`);
  }

  // Extract premium listing ID from basket_id
  const premiumListingId = basketId.split('-')[0];

  // Redirect to success page with basket_id for client-side tracking
  // The webhook will be the authoritative source
  const successUrl = new URL('/payment-success', process.env.NEXT_PUBLIC_APP_URL);
  successUrl.searchParams.set('basket_id', basketId);
  successUrl.searchParams.set('listing_id', premiumListingId);

  return NextResponse.redirect(successUrl.toString());
}
