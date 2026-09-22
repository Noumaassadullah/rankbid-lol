import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json(
        { error: 'userId is required' },
        { status: 400 }
      );
    }

    const votes = await prisma.userVote.findMany({
      where: { userId },
      orderBy: { votedAt: 'desc' },
    });

    // Get listing details from Supabase for each vote
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    const formattedVotes = await Promise.all(
      votes.map(async (vote) => {
        let listing = null;

        if (supabaseUrl && supabaseKey) {
          try {
            const response = await fetch(
              `${supabaseUrl}/rest/v1/listings?id=eq.${vote.listingId}`,
              {
                headers: {
                  'apikey': supabaseKey,
                  'Authorization': `Bearer ${supabaseKey}`,
                },
              }
            );

            if (response.ok) {
              const listings = await response.json();
              if (listings.length > 0) {
                const listingData = listings[0];
                listing = {
                  id: listingData.id,
                  title: listingData.title,
                  description: listingData.description,
                  totalVotes: listingData.total_votes || 0,
                };
              }
            }
          } catch (err) {
            console.error('Error fetching listing from Supabase:', err);
          }
        }

        return {
          id: vote.id,
          listingId: vote.listingId,
          votedAt: vote.votedAt,
          listing,
        };
      })
    );

    return NextResponse.json(
      { votes: formattedVotes },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error fetching user votes:', error);
    return NextResponse.json(
      { error: 'Failed to fetch votes', votes: [] },
      { status: 500 }
    );
  }
}
