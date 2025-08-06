import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// Disable caching for this route to ensure fresh data
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
  try {
    const schools = await prisma.schools.findMany({
      select: {
        id: true,
        name: true, // corrected from `schoolName`
      },
    });
    
    return NextResponse.json(schools, {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate, max-age=0',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    });
  } catch (error) {
    console.error('Error fetching schools:', error);
    return NextResponse.json(
      { error: 'Failed to fetch schools' },
      { status: 500 }
    );
  }
}
