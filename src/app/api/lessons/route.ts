import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// Configure this route as dynamic
export const dynamic = 'force-dynamic';

// Define the type for the lesson from Prisma
type LessonWithRelations = {
  id: number;
  lessonName: string;
  pdfUrl: string;
  isForAllSchools: boolean;
  lessonoutcomes?: string | null;
  lessonobjectives?: string | null;
  Class?: {
    name: string;
  } | null;
  schools?: {
    name: string;
  } | null;
  subject?: {
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
        subject: {
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
      subjectName: lesson.subject?.name || 'Not Assigned',
      isGlobal: !!lesson.isForAllSchools,
      lessonoutcomes: lesson.lessonoutcomes,
      lessonobjectives: lesson.lessonobjectives,
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
