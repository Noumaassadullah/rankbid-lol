import { NextRequest, NextResponse } from 'next/server';

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
    const reference = `REF-${listingId}-${Date.now()}`;

    // Redirect to manual payment page showing account details
    const paymentUrl = `${baseUrl}/payment/manual?amount=${amount}&listingId=${listingId}&ref=${reference}`;

    return NextResponse.json({
      url: paymentUrl,
      reference,
    });
  } catch (error) {
    console.error('Payment checkout error:', error);
    return NextResponse.json(
      { error: 'Failed to create checkout' },
      { status: 500 }
    );
  }
}
