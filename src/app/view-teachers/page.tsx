import prisma from '@/lib/prisma';
import TeachersList from './TeachersList';

export const dynamic = 'force-dynamic';

async function getTeachers(schoolId: string | null) {
  try {
    const teachers = await prisma.teacher.findMany({
      where: schoolId ? { schoolId: parseInt(schoolId) } : undefined,
      orderBy: {
        teacherName: 'asc',
      },
      select: {
        id: true,
        teacherName: true,
        email: true,
        qualification: true,
        experienceYears: true,
        status: true,
        dob: true,
        phone_number: true,
        aadhaar_number: true,
        profileImage: true,
        schools: {
          select: {
            id: true,
            name: true,
          },
        },
        subject: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });
    return teachers;
  } catch (error) {
    console.error('Failed to fetch teachers:', error);
    return [];
  }
}

import { Suspense } from 'react';

export default async function ViewTeachers({
  searchParams,
}: {
  searchParams: { schoolId?: string };
}) {  try {
    const teachers = await getTeachers(searchParams.schoolId || null);
    
    return (
      <div className="container">
        <Suspense fallback={<div>Loading...</div>}>
          <TeachersList initialTeachers={teachers} />
        </Suspense>
      </div>
    );
  } catch (error) {
    return (
      <div className="error">
        <h1>Error loading teachers</h1>
        <p>Please try again later.</p>
      </div>
    );
  }
}
