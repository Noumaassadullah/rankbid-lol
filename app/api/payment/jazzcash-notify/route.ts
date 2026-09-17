import { NextRequest, NextResponse } from 'next/server';
import { verifyJazzCashResponse } from '@/lib/jazzcash';
import { extractMetadata } from '@/lib/metadata';

interface FormData {
  url?: string;
  handle?: string;
  description?: string;
  category: string;
  platform: string;
}

function generateUUID() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

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

    // Extract listing ID or form data from order ref
    let listingId = '';
    let formData: FormData | null = null;

    if (orderRef.startsWith('FRM-')) {
      // New flow: form data encoded in reference
      const [, formDataB64] = orderRef.split('-FRM-'.length > 0 ? 'FRM-' : 'FRM-');
      try {
        const formDataStr = Buffer.from(formDataB64.split('-')[0], 'base64').toString();
        formData = JSON.parse(formDataStr);
      } catch (e) {
        console.error('Failed to decode form data from reference:', e);
      }
    } else {
      // Old flow: listing ID in reference
      const parts = orderRef.split('-');
      listingId = parts[0];
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseKey) {
      console.warn('Supabase not configured - payment recorded but not persisted');
      return NextResponse.json({ success: true });
    }

    try {
      if (responseCode === '000') {
        // Payment successful
        if (formData) {
          // Create listing after payment (new flow)
          const normalizedUrl = formData.url ||
            (formData.platform === 'website' ? formData.handle : `https://${formData.platform}.com/${formData.handle}`);

          if (!normalizedUrl) {
            console.error('No URL provided in form data');
            return NextResponse.json({ success: true });
          }

          const newListingId = generateUUID();
          const now = new Date().toISOString();

          // Fetch metadata to get the website image/favicon
          let imageUrl: string | null = null;
          try {
            const metadata = await extractMetadata(normalizedUrl);
            imageUrl = metadata.image;
          } catch (err) {
            console.warn('Could not fetch metadata for image:', err);
          }

          // Create the listing using Supabase REST API
          const insertResponse = await fetch(`${supabaseUrl}/rest/v1/listings`, {
            method: 'POST',
            headers: {
              'apikey': supabaseKey,
              'Authorization': `Bearer ${supabaseKey}`,
              'Content-Type': 'application/json',
              'Prefer': 'return=representation',
            },
            body: JSON.stringify({
              id: newListingId,
              user_id: '550e8400-e29b-41d4-a716-446655440000',
              title: normalizedUrl,
              description: formData.description || normalizedUrl,
              category: formData.category || 'Other',
              status: 'active',
              location: normalizedUrl,
              price: amount,
              views: 0,
              image_url: imageUrl || null,
              created_at: now,
              updated_at: now,
            }),
          });

          if (insertResponse.ok) {
            listingId = newListingId;
          } else {
            console.error('Failed to create listing:', await insertResponse.text());
            return NextResponse.json({ success: true });
          }
        } else if (listingId) {
          // Old flow: update existing listing with payment amount
          const getResponse = await fetch(
            `${supabaseUrl}/rest/v1/listings?id=eq.${listingId}&select=price`,
            {
              headers: {
                'apikey': supabaseKey,
                'Authorization': `Bearer ${supabaseKey}`,
              },
            }
          );

          if (getResponse.ok) {
            const listings = await getResponse.json();
            const currentPrice = listings[0]?.price || 0;

            const updateResponse = await fetch(
              `${supabaseUrl}/rest/v1/listings?id=eq.${listingId}`,
              {
                method: 'PATCH',
                headers: {
                  'apikey': supabaseKey,
                  'Authorization': `Bearer ${supabaseKey}`,
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                  price: currentPrice + amount,
                  updated_at: new Date().toISOString(),
                }),
              }
            );

            if (!updateResponse.ok) {
              console.error('Failed to update listing:', await updateResponse.text());
            }
          }
        }
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
