import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    const sessions = await prisma.school_sessions.findMany({
      where: {
        is_active: true,
      },
      include: {
        schools: {
          select: {
            name: true,
            principal_name: true,
            email: true,
          },
        },
      },
      orderBy: {
        last_activity: 'desc',
      },
    });

    return NextResponse.json(sessions);
  } catch (error) {
    console.error('Error fetching principal sessions:', error);
    return NextResponse.json(
      { error: 'Failed to fetch active principals' },
      { status: 500 }
    );
  }
}
