import { NextRequest, NextResponse } from 'next/server';
import { MIN_LISTING_AMOUNT_CENTS } from '@/lib/constants';

interface FormData {
  url?: string;
  handle?: string;
  description?: string;
  category: string;
  platform: string;
}

export async function POST(req: NextRequest) {
  try {
    const { formData, listingId, amount } = await req.json();

    // Support both old (listingId) and new (formData) formats for backward compatibility
    if (!amount) {
      return NextResponse.json(
        { error: 'Missing amount' },
        { status: 400 }
      );
    }

    if (!formData && !listingId) {
      return NextResponse.json(
        { error: 'Missing formData or listingId' },
        { status: 400 }
      );
    }

    if (amount < MIN_LISTING_AMOUNT_CENTS) {
      const minAmountPKR = MIN_LISTING_AMOUNT_CENTS / 100;
      return NextResponse.json(
        { error: `Minimum amount is PKR ${minAmountPKR.toLocaleString()}` },
        { status: 400 }
      );
    }

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

    // If formData is provided (new flow), encode it in the reference
    let reference: string;
    if (formData) {
      const formDataStr = Buffer.from(JSON.stringify(formData)).toString('base64');
      reference = `FRM-${formDataStr}-${Date.now()}`;
    } else {
      // Old flow: use listingId
      reference = `REF-${listingId}-${Date.now()}`;
    }

    // Redirect to manual payment page showing account details
    const paymentUrl = `${baseUrl}/payment/manual?amount=${amount}&ref=${reference}${listingId ? `&listingId=${listingId}` : ''}`;

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
