import { prisma } from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const { listingId, voterId } = await req.json();

    if (!listingId || !voterId) {
      return NextResponse.json(
        { error: 'Missing listingId or voterId' },
        { status: 400 }
      );
    }

    // Check if vote already exists
    const existingVote = await prisma.vote.findUnique({
      where: {
        listingId_voterId: {
          listingId,
          voterId,
        },
      },
    });

    if (existingVote) {
      return NextResponse.json(
        { error: 'Already voted', voted: true },
        { status: 400 }
      );
    }

    // Create vote record
    await prisma.vote.create({
      data: {
        id: `vote_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        listingId,
        voterId,
      },
    });

    // Increment listing's vote counts
    const today = new Date();
    today.setUTCHours(0, 0, 0, 0);

    // Count today's votes
    const dayVoteCount = await prisma.vote.count({
      where: {
        listingId,
        votedAt: { gte: today },
      },
    });

    // Count all-time votes
    const totalVoteCount = await prisma.vote.count({
      where: { listingId },
    });

    // Update listing with vote counts
    await prisma.listing.update({
      where: { id: listingId },
      data: {
        dayVotes: dayVoteCount,
        totalVotes: totalVoteCount,
      },
    });

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

    // Get vote count for listing
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
