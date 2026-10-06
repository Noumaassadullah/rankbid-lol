import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';
import { Resend } from 'resend';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseKey);
const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const email = body.email?.trim().toLowerCase();

    if (!email || !email.includes('@')) {
      return NextResponse.json(
        { error: 'Please provide a valid email address' },
        { status: 400 }
      );
    }

    // Check if email already exists
    const { data: existing, error: checkError } = await supabase
      .from('waitlist')
      .select('id')
      .eq('email', email)
      .maybeSingle();

    if (checkError && checkError.code !== 'PGRST116') {
      console.error('Check error:', checkError);
      return NextResponse.json(
        { error: `Database error: ${checkError.message}` },
        { status: 500 }
      );
    }

    if (existing) {
      return NextResponse.json(
        { error: 'This email is already on the waitlist' },
        { status: 409 }
      );
    }

    // Add to waitlist
    const { data, error } = await supabase
      .from('waitlist')
      .insert({
        email: email,
        createdAt: new Date().toISOString(),
      })
      .select();

    if (error) {
      console.error('Insert error:', error);
      return NextResponse.json(
        { error: error.message || 'Failed to join waitlist', details: error.details },
        { status: 500 }
      );
    }

    if (!data || data.length === 0) {
      console.error('Insert succeeded but no data returned');
      return NextResponse.json(
        { error: 'Email was not saved. Please try again.' },
        { status: 500 }
      );
    }

    // Send email notification to admin
    if (process.env.RESEND_API_KEY && process.env.ADMIN_EMAIL) {
      try {
        await resend.emails.send({
          from: 'RankBid <noreply@rankbid.click>',
          to: process.env.ADMIN_EMAIL,
          subject: '🎉 New Waitlist Signup',
          html: `
            <h2>New waitlist member!</h2>
            <p><strong>Email:</strong> ${email}</p>
            <p><strong>Time:</strong> ${new Date().toLocaleString()}</p>
            <p><a href="https://www.rankbid.click/admin">View waitlist →</a></p>
          `,
        });
      } catch (emailError) {
        console.error('Failed to send email notification:', emailError);
        // Don't fail the request if email sending fails
      }
    }

    return NextResponse.json(
      { success: true, data },
      { status: 201 }
    );
  } catch (error) {
    console.error('Waitlist error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
