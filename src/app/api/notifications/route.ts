import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    const notifications = await prisma.notification.findMany({
      orderBy: { created_at: 'desc' },
    });
    return NextResponse.json(notifications);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch notifications' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { title, message, type } = await request.json();
    if (!title || !type) return NextResponse.json({ error: 'Title and type are required' }, { status: 400 });
    const notification = await prisma.notification.create({
      data: { title, message, type },
    });
    return NextResponse.json(notification);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create notification' }, { status: 500 });
  }
}
