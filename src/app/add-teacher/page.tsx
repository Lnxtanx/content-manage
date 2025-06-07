import AddTeacherForm from './AddTeacherForm';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

async function getSchools() {
  try {
    const schools = await prisma.schools.findMany({
      orderBy: {
        name: 'asc'
      },
      select: {
        id: true,
        name: true,
      },
    });
    return schools;
  } catch (error) {
    console.error('Failed to fetch schools:', error);
    return [];
  }
}

export default async function AddTeacher() {
  const schools = await getSchools();
  
  return (
    <div className="container">
      <AddTeacherForm initialSchools={schools} />
    </div>
  );
}
