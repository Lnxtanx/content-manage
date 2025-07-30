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

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, name } = body as { id: number; name: string };

    if (!id || !name) {
      return NextResponse.json(
        { error: 'Class ID and name are required' },
        { status: 400 }
      );
    }

    // Check if another class with this name already exists (excluding current class)
    const existingClass = await prisma.class.findFirst({
      where: { 
        name,
        NOT: { id }
      },
    });

    if (existingClass) {
      return NextResponse.json(
        { error: 'A class with this name already exists' },
        { status: 400 }
      );
    }

    // Update the class
    const updatedClass = await prisma.class.update({
      where: { id },
      data: { name },
      select: {
        id: true,
        name: true,
      },
    });

    return NextResponse.json(updatedClass);
  } catch (error) {
    console.error('Error updating class:', error);
    return NextResponse.json(
      { error: 'Failed to update class' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'Class ID is required' },
        { status: 400 }
      );
    }

    // Check if class exists
    const existingClass = await prisma.class.findUnique({
      where: { id: parseInt(id) },
    });

    if (!existingClass) {
      return NextResponse.json(
        { error: 'Class not found' },
        { status: 404 }
      );
    }

    // Delete the class
    await prisma.class.delete({
      where: { id: parseInt(id) },
    });

    return NextResponse.json({ message: 'Class deleted successfully' });
  } catch (error) {
    console.error('Error deleting class:', error);
    return NextResponse.json(
      { error: 'Failed to delete class' },
      { status: 500 }
    );
  }
}

