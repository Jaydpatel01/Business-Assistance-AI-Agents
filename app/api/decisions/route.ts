import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/config';
import { prisma } from '@/lib/db/connection';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Fetch all decisions for the user
    const decisions = await prisma.decision.findMany({
      where: {
        createdBy: session.user.id
      },
      orderBy: {
        createdAt: 'desc'
      },
      include: {
        session: {
          select: {
            name: true,
            scenarioId: true
          }
        }
      }
    });

    return NextResponse.json({
      success: true,
      data: decisions,
      total: decisions.length
    });

  } catch (error) {
    console.error('Error fetching decisions:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch decisions' },
      { status: 500 }
    );
  }
}
