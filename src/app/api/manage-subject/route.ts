import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    const subjects = await prisma.subject.findMany({
      orderBy: { name: 'asc' },
    });
    return NextResponse.json(subjects);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch subjects' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { name, code } = await request.json();
    if (!name) return NextResponse.json({ error: 'Name is required' }, { status: 400 });
    const subject = await prisma.subject.create({
      data: { name, code },
    });
    return NextResponse.json(subject);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create subject' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { id, name, code } = await request.json();
    
    if (!id || !name) {
      return NextResponse.json({ error: 'ID and name are required' }, { status: 400 });
    }

    // Check if subject exists
    const existingSubject = await prisma.subject.findUnique({
      where: { id: Number(id) },
    });

    if (!existingSubject) {
      return NextResponse.json({ error: 'Subject not found' }, { status: 404 });
    }

    // Update the subject
    const updatedSubject = await prisma.subject.update({
      where: { id: Number(id) },
      data: { name, code },
    });

    return NextResponse.json(updatedSubject);
  } catch (error) {
    console.error('Error updating subject:', error);
    return NextResponse.json({ error: 'Failed to update subject' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) return NextResponse.json({ error: 'ID is required' }, { status: 400 });
    await prisma.subject.delete({ where: { id: Number(id) } });
    return NextResponse.json({ message: 'Subject deleted' });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete subject' }, { status: 500 });
  }
}
