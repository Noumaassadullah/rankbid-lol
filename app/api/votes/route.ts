import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(req: NextRequest) {
  try {
    const { listingId, voterId, userId } = await req.json();

    console.log('Vote request received:', { listingId, voterId, userId });

    if (!listingId || !voterId) {
      console.log('Missing parameters');
      return NextResponse.json(
        { error: 'Missing listingId or voterId' },
        { status: 400 }
      );
    }

    // Check if vote already exists
    console.log('Checking for existing vote...');
    const existingVote = await prisma.vote.findUnique({
      where: {
        listingId_voterId: {
          listingId,
          voterId,
        },
      },
    });

    if (existingVote) {
      console.log('Vote already exists for this user and listing');
      return NextResponse.json(
        { error: 'Already voted', voted: true },
        { status: 400 }
      );
    }

    // Create vote record
    console.log('Creating new vote record...');
    const newVote = await prisma.vote.create({
      data: {
        listingId,
        voterId,
        votedAt: new Date(),
      },
    });
    console.log('Vote created:', newVote.id);

    // Record user vote if userId provided
    if (userId) {
      try {
        await prisma.userVote.create({
          data: {
            userId,
            listingId,
          },
        });
        console.log('User vote recorded');
      } catch (error: any) {
        if (error.code !== 'P2002') {
          console.error('Error recording user vote:', error);
        }
      }
    }

    // Calculate vote counts
    console.log('Counting votes...');
    const today = new Date();
    today.setUTCHours(0, 0, 0, 0);

    const dayVoteCount = await prisma.vote.count({
      where: {
        listingId,
        votedAt: { gte: today },
      },
    });
    console.log('Day vote count:', dayVoteCount);

    const totalVoteCount = await prisma.vote.count({
      where: {
        listingId,
      },
    });
    console.log('Total vote count:', totalVoteCount);

    // Update listing with new vote counts
    console.log('Updating listing vote counts...');
    const updatedListing = await prisma.listing.update({
      where: { id: listingId },
      data: {
        totalVotes: totalVoteCount,
        dayVotes: dayVoteCount,
      },
    });
    console.log('Listing updated:', updatedListing.id);

    console.log(`Vote recorded for listing ${listingId}. Total: ${totalVoteCount}, Today: ${dayVoteCount}`);

    return NextResponse.json(
      { success: true, voted: true, totalVotes: totalVoteCount, dayVotes: dayVoteCount },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error recording vote:', error);
    return NextResponse.json(
      {
        error: 'Failed to record vote. Please try again later.',
        details: process.env.NODE_ENV === 'development' ? String(error) : undefined,
      },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const listingId = searchParams.get('listingId');
    const voterId = searchParams.get('voterId');

    if (!listingId) {
      return NextResponse.json(
        { error: 'Missing listingId' },
        { status: 400 }
      );
    }

    // Get vote count
    const voteCount = await prisma.vote.count({
      where: { listingId },
    });

    let userVoted = false;
    if (voterId) {
      const userVote = await prisma.vote.findUnique({
        where: {
          listingId_voterId: {
            listingId,
            voterId,
          },
        },
      });
      userVoted = !!userVote;
    }

    return NextResponse.json({ voteCount, userVoted });
  } catch (error) {
    console.error('Error fetching votes:', error);
    return NextResponse.json(
      { voteCount: 0, userVoted: false, error: 'Failed to fetch votes' },
      { status: 200 }
    );
  }
}
