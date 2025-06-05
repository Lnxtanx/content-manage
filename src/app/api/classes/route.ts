import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { NextRequest } from 'next/server';

export async function GET() {
  try {
    const classes = await prisma.class.findMany({
      orderBy: {
        name: 'asc'
      },
      select: {
        id: true,
        name: true,
      },
    });
    return NextResponse.json(classes);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch classes' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name } = body as { name: string };

    if (!name) {
      return NextResponse.json(
        { error: 'Class name is required' },
        { status: 400 }
      );
    }

    // Check if class with this name already exists
    const existingClass = await prisma.class.findFirst({
      where: { name },
    });

    if (existingClass) {
      return NextResponse.json(
        { error: 'A class with this name already exists' },
        { status: 400 }
      );
    }

    // Create new class
    const newClass = await prisma.$executeRaw`
      INSERT INTO "Class" (name) 
      VALUES (${name})
      RETURNING id, name;
    `;

    const createdClass = await prisma.class.findFirst({
      where: { name },
      select: {
        id: true,
        name: true,
      },
    });

    return NextResponse.json(createdClass);
  } catch (error) {
    console.error('Error creating class:', error);
    return NextResponse.json(
      { error: 'Failed to create class' },
      { status: 500 }
    );
  }
}

