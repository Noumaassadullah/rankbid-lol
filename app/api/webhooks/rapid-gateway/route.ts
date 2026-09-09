import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { updatePaymentStatus } from '@/lib/supabase-payments';

interface WebhookPayload {
  transactionId: string;
  status: 'completed' | 'failed' | 'refunded';
  amount: number;
  reference: string;
  timestamp: string;
  [key: string]: any;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const signature = request.headers.get('X-RapidGateway-Signature');

    if (!signature) {
      return NextResponse.json(
        { error: 'Missing signature header' },
        { status: 401 }
      );
    }

    // Verify webhook signature
    const salt = process.env.RAPID_GATEWAY_SIGNING_SALT;
    if (!salt) {
      console.error('RAPID_GATEWAY_SIGNING_SALT not configured');
      return NextResponse.json(
        { error: 'Server configuration error' },
        { status: 500 }
      );
    }

    const payload = JSON.stringify(body);
    const expectedSignature = crypto
      .createHmac('sha256', salt)
      .update(payload)
      .digest('hex');

    if (signature !== expectedSignature) {
      console.error('Invalid webhook signature');
      return NextResponse.json(
        { error: 'Invalid signature' },
        { status: 401 }
      );
    }

    // Handle webhook payload
    const webhookData: WebhookPayload = body;

    console.log('Webhook received:', {
      transactionId: webhookData.transactionId,
      status: webhookData.status,
      reference: webhookData.reference,
    });

    // Update payment status in Supabase
    const result = await updatePaymentStatus(
      webhookData.transactionId,
      webhookData.status,
      {
        webhook_received_at: new Date().toISOString(),
        ...webhookData,
      }
    );

    if (!result.success) {
      console.error('Failed to update payment status:', result.error);
      return NextResponse.json(
        { error: 'Failed to update payment status' },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { success: true, transactionId: webhookData.transactionId },
      { status: 200 }
    );
  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
