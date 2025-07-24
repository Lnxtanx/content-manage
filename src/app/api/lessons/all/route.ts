import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// Configure this route as dynamic
export const dynamic = 'force-dynamic';

// Define the type for the lesson from Prisma with additional fields
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

// GET endpoint to fetch all lessons with subjects and classes
export async function GET() {
  try {
    // Fetch all lessons with their relations
    const lessons = await prisma.lessonPdf.findMany({
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

    // Format the lessons with all needed information
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
    console.error('Error fetching all lessons:', error);
    return NextResponse.json(
      { error: 'Failed to fetch lessons' },
      { status: 500 }
    );
  }
}
