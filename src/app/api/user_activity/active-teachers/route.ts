import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    const sessions = await prisma.teacher_sessions.findMany({
      where: {
        is_active: true,
      },
      include: {
        teachers: {
          select: {
            teacherName: true,
            email: true,
            schools: {
              select: {
                name: true,
              },
            },
          },
        },
      },
      orderBy: {
        last_activity: 'desc',
      },
    });

    return NextResponse.json(sessions);
  } catch (error) {
    console.error('Error fetching teacher sessions:', error);
    return NextResponse.json(
      { error: 'Failed to fetch active teachers' },
      { status: 500 }
    );
  }
}
