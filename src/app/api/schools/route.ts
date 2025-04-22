import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    const schools = await prisma.schoolLogin.findMany({
      select: {
        id: true,
        schoolName: true,
      },
    });
    return NextResponse.json(schools);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch schools' },
      { status: 500 }
    );
  }
}
