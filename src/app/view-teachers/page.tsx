import prisma from '@/lib/prisma';
import TeachersList from './TeachersList';

export const dynamic = 'force-dynamic';

// Define types to help with TypeScript errors
type Teacher = any; // Expanded type definition would be better but 'any' works for now
type School = { id: number; name: string };
type Subject = { id: number; name: string };
type Class = { id: number; name: string };

async function getTeachers(schoolId: string | null) {
  try {
    console.log("Starting teacher data fetch with schoolId:", schoolId);
    
    // Use a more detailed error handling approach
    let teachers: Teacher[] = [];
    let schools: School[] = [];
    let subjects: Subject[] = [];
    let classes: Class[] = [];
    
    try {
      teachers = await prisma.teacher.findMany({
        where: schoolId ? { schoolId: parseInt(schoolId) } : undefined,
        orderBy: {
          teacherName: 'asc',
        },
        include: {
          schools: {
            select: {
              id: true,
              name: true,
            },
          },
          teacher_class_subject: {
            include: {
              subject: true,
              Class: true,
            }
          },
        },
      });
      console.log(`Successfully fetched ${teachers.length} teachers`);
    } catch (error) {
      console.error('Error fetching teachers:', error);
      teachers = [];
    }
    
    try {
      schools = await prisma.schools.findMany({
        select: {
          id: true,
          name: true,
        },
      });
      console.log(`Successfully fetched ${schools.length} schools`);
    } catch (error) {
      console.error('Error fetching schools:', error);
      schools = [];
    }
    
    try {
      subjects = await prisma.subject.findMany({
        select: {
          id: true,
          name: true,
        },
      });
      console.log(`Successfully fetched ${subjects.length} subjects`);
    } catch (error) {
      console.error('Error fetching subjects:', error);
      subjects = [];
    }
    
    try {
      classes = await prisma.class.findMany({
        select: {
          id: true,
          name: true,
        },
      });
      console.log(`Successfully fetched ${classes.length} classes`);
    } catch (error) {
      console.error('Error fetching classes:', error);
      classes = [];
    }
    
    return {
      teachers,
      schools,
      subjects,
      classes
    };
  } catch (error) {
    console.error('Failed to fetch teachers:', error);
    return {
      teachers: [],
      schools: [],
      subjects: [],
      classes: []
    };
  }
}

import { Suspense } from 'react';

export default async function ViewTeachers({
  searchParams,
}: {
  searchParams: { schoolId?: string };
}) {
  try {
    console.log("Fetching teachers with schoolId:", searchParams.schoolId || null);
    const { teachers, schools, subjects, classes } = await getTeachers(searchParams.schoolId || null);
    
    console.log(`Retrieved ${teachers.length} teachers, ${schools.length} schools, ${subjects.length} subjects, ${classes.length} classes`);
    
    // Type cast to match the component's expected props
    const typeSafeTeachers = teachers as any[];
    
    return (
      <div className="container">
        <Suspense fallback={<div>Loading...</div>}>
          <TeachersList 
            initialTeachers={typeSafeTeachers} 
            schools={schools}
            subjects={subjects}
            classes={classes}
          />
        </Suspense>
      </div>
    );
  } catch (error) {
    console.error("Error in ViewTeachers page:", error);
    return (
      <div className="error" style={{ padding: '2rem', color: 'red' }}>
        <h1>Error loading teachers</h1>
        <p>Please try again later.</p>
        {process.env.NODE_ENV === 'development' && (
          <pre>{JSON.stringify(error, null, 2)}</pre>
        )}
      </div>
    );
  }
}
