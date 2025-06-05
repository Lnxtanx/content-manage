import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function migrateClasses() {
  try {
    // 1. Get all existing classes grouped by name
    const classes = await prisma.class.findMany({
      orderBy: { name: 'asc' },
    });

    const classGroups: { [key: string]: any[] } = {};
    classes.forEach(cls => {
      if (!classGroups[cls.name]) {
        classGroups[cls.name] = [];
      }
      classGroups[cls.name].push(cls);
    });

    // 2. For each class name, keep one class and update references
    for (const [className, duplicates] of Object.entries(classGroups)) {
      if (duplicates.length > 1) {
        console.log(`Processing duplicate classes for: ${className}`);
        // Keep the first class as the main one
        const mainClass = duplicates[0];
        const duplicateClasses = duplicates.slice(1);

        for (const dupClass of duplicateClasses) {
          console.log(`Migrating data from class ID ${dupClass.id} to ${mainClass.id}`);
          // Update LessonLog references
          await prisma.lessonLog.updateMany({
            where: { classId: dupClass.id },
            data: { classId: mainClass.id },
          });

          // Update LessonPdf references
          await prisma.lessonPdf.updateMany({
            where: { classId: dupClass.id },
            data: { classId: mainClass.id },
          });

          // Delete the duplicate class
          await prisma.class.delete({
            where: { id: dupClass.id },
          });
          console.log(`Deleted duplicate class: ${dupClass.id}`);
        }
      }
    }

    console.log('Migration completed successfully!');
  } catch (error) {
    console.error('Migration failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

migrateClasses();
