import { NextRequest, NextResponse } from 'next/server';
import { generateJazzCashCheckout } from '@/lib/jazzcash';

export async function POST(req: NextRequest) {
  try {
    const { listingId, amount } = await req.json();

    if (!listingId || !amount) {
      return NextResponse.json(
        { error: 'Missing listingId or amount' },
        { status: 400 }
      );
    }

    if (amount < 10000) {
      return NextResponse.json(
        { error: 'Minimum amount is PKR 100' },
        { status: 400 }
      );
    }

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const orderId = `${listingId}-${Date.now()}`;

    const { url, payload } = generateJazzCashCheckout(
      amount,
      orderId,
      `${baseUrl}/payment/jazzcash-return`,
      `${baseUrl}/api/payment/jazzcash-notify`
    );

    return NextResponse.json({
      url,
      orderId,
      payload,
    });
  } catch (error) {
    console.error('JazzCash checkout error:', error);
    return NextResponse.json(
      { error: 'Failed to create checkout' },
      { status: 500 }
    );
  }
}
