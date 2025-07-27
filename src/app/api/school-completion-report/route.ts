import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    // Fetch all schools
    const schools = await prisma.schools.findMany({
      select: {
        id: true,
        name: true,
      },
    });
    return NextResponse.json({ schools });
  } catch (error) {
    console.error('Error fetching schools:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const { schoolId } = await request.json();

    // Fetch all lessons from LessonPdf
    const allLessons = await prisma.lessonPdf.findMany({
      where: {
        OR: [
          { schoolId: parseInt(schoolId) },
          { isForAllSchools: true }
        ]
      },
      select: {
        id: true,
        lessonName: true,
        lessonoutcomes: true,
        lessonobjectives: true,
        Class: {
          select: {
            name: true
          }
        }
      }
    });

    // Fetch completed lessons from ClassResponse
    const completedLessons = await prisma.classResponse.findMany({
      where: {
        schoolId: parseInt(schoolId),
        status: 'completed'
      },
      select: {
        lessonName: true,
        classLevel: true,
        status: true,
        submittedAt: true,
        teachers: {
          select: {
            teacherName: true
          }
        }
      }
    });

    // Map completion status to lessons
    const lessonReport = allLessons.map(lesson => {
      const completed = completedLessons.find(cl => 
        cl.lessonName === lesson.lessonName
      );

      return {
        ...lesson,
        status: completed ? 'completed' : 'incomplete',
        completedBy: completed?.teachers.teacherName || null,
        completedAt: completed?.submittedAt || null
      };
    });

    return NextResponse.json({ lessonReport });
  } catch (error) {
    console.error('Error fetching completion report:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
