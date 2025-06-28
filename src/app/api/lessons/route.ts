import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// Define the type for the lesson from Prisma
type LessonWithRelations = {
  id: number;
  lessonName: string;
  pdfUrl: string;
  isForAllSchools: boolean;
  Class?: {
    name: string;
  } | null;
  schools?: {
    name: string;
  } | null;
};

// GET endpoint to fetch lessons
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

    // Fetch both global lessons and school-specific lessons
    const lessons = await prisma.lessonPdf.findMany({
      where: {
        classId: parseInt(classId),
        OR: [
          { isForAllSchools: true }, // Get global lessons
          {
            AND: [
              { isForAllSchools: false },
              { schoolId: { not: null } } // Get school-specific lessons
            ]
          }
        ]
      },
      include: {
        Class: {
          select: {
            name: true,
          },
        },
        schools: {
          select: {
            name: true,
          },
        },
      },
    });

    // Format the lessons, clearly indicating global vs school-specific
    const formattedLessons = lessons.map((lesson: LessonWithRelations) => ({
      id: lesson.id,
      lessonName: lesson.lessonName,
      pdfUrl: lesson.pdfUrl,
      className: lesson.Class?.name || 'Unknown',
      schoolName: lesson.isForAllSchools ? 'All Schools' : lesson.schools?.name || 'Unknown',
      isGlobal: !!lesson.isForAllSchools,
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
