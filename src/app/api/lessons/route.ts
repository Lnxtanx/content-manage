import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const classId = searchParams.get('classId');

    if (!classId) {
      return NextResponse.json(
        { error: 'Class ID is required' },
        { status: 400 }
      );
    }

    const lessons = await prisma.lessonPdf.findMany({
      where: {
        classId: parseInt(classId),
      },
      include: {
        school: {
          select: {
            schoolName: true,
          },
        },
      },
    });

    const formattedLessons = lessons.map(lesson => ({
      id: lesson.id,
      lessonName: lesson.lessonName,
      pdfUrl: lesson.pdfUrl,
      schoolName: lesson.school?.schoolName,
    }));

    return NextResponse.json(formattedLessons);
  } catch (error) {
    console.error('Error fetching lessons:', error);
    return NextResponse.json(
      { error: 'Failed to fetch lessons' },
      { status: 500 }
    );
  }
}
