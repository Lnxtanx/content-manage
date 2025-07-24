import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import bcrypt from 'bcrypt';
import { uploadFileToS3 } from '@/lib/s3';

export async function POST(request: NextRequest) {
  try {
    const contentType = request.headers.get('content-type') || '';
    let data: any = {};
    let profileImageUrl: string | null = null;
    if (contentType.includes('multipart/form-data')) {
      const formData = await request.formData();
      data = Object.fromEntries(formData.entries());
      const profileImage = formData.get('profileImage') as File | null;
      if (profileImage && profileImage.size > 0) {
        const buffer = Buffer.from(await profileImage.arrayBuffer());
        const fileName = `teacher-profiles/${Date.now()}-${profileImage.name}`;
        profileImageUrl = await uploadFileToS3(buffer, fileName, profileImage.type || 'image/png', 'teacher-profiles');
      }
    } else {
      data = await request.json();
    }
    const { schoolId, teacherName, dob, email, password, qualification, experienceYears, phone_number, aadhaar_number } = data;
    
    // Get array values from form data
    // Extract subject-class mappings from form data
    const subjectClassMappings: Array<{ subjectId: number; classIds: number[] }> = [];
    
    // Log all form data keys for debugging
    console.log("Form data keys:", Object.keys(data));
    
    // Create a more robust extraction method
    const subjectIndexes: number[] = [];
    
    // First, find all the distinct subject indexes by looking for subjectId keys
    for (const key of Object.keys(data)) {
      const match = key.match(/subjectClassMappings\[(\d+)\]\[subjectId\]/);
      if (match) {
        const index = parseInt(match[1]);
        if (!subjectIndexes.includes(index)) {
          subjectIndexes.push(index);
        }
      }
    }
    
    console.log("Found subject indexes:", subjectIndexes);
    
    // For each subject index, collect its subject ID and class IDs
    for (const index of subjectIndexes) {
      const subjectIdKey = `subjectClassMappings[${index}][subjectId]`;
      const subjectId = parseInt(data[subjectIdKey].toString());
      
      // Collect all class IDs for this subject by finding all class-related keys
      const classIds: number[] = [];
      
      // Look for pattern: subjectClassMappings[0][classIds][0], subjectClassMappings[0][classIds][1], etc.
      for (const key of Object.keys(data)) {
        const match = key.match(new RegExp(`subjectClassMappings\\[${index}\\]\\[classIds\\]\\[(\\d+)\\]`));
        if (match) {
          const classId = parseInt(data[key].toString());
          classIds.push(classId);
        }
      }
      
      // Also try to find keys like subjectClassMappings[0][classIds][] which might be used for arrays
      const classIdsArrayKey = `subjectClassMappings[${index}][classIds][]`;
      if (data[classIdsArrayKey]) {
        if (Array.isArray(data[classIdsArrayKey])) {
          data[classIdsArrayKey].forEach((id: string) => {
            classIds.push(parseInt(id));
          });
        } else {
          classIds.push(parseInt(data[classIdsArrayKey].toString()));
        }
      }
      
      // Only add if we have both a valid subject ID and at least one class ID
      if (!isNaN(subjectId) && classIds.length > 0) {
        // Remove duplicates
        const uniqueClassIds = Array.from(new Set(classIds));
        subjectClassMappings.push({ subjectId, classIds: uniqueClassIds });
        console.log(`Added mapping for subject ${subjectId} with classes: ${uniqueClassIds.join(', ')}`);
      }
    }
    
    // Log the extracted mappings
    console.log("Extracted subject-class mappings:", JSON.stringify(subjectClassMappings));

    const sections = data['sections[]'] ?
      Array.isArray(data['sections[]']) ? data['sections[]'] : [data['sections[]']] : [];
    const assignedclasses = data['assignedclasses[]'] ?
      Array.isArray(data['assignedclasses[]']) ? data['assignedclasses[]'] : [data['assignedclasses[]']] : [];

    // Validate input
    if (!schoolId || !teacherName || !email || !password || !dob || !phone_number || !aadhaar_number) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    if (subjectClassMappings.length === 0) {
      return NextResponse.json(
        { error: "At least one subject must be selected" },
        { status: 400 }
      );
    }

    const hasEmptyClasses = subjectClassMappings.some(mapping => mapping.classIds.length === 0);
    if (hasEmptyClasses) {
      return NextResponse.json(
        { error: "Please select at least one class for each selected subject" },
        { status: 400 }
      );
    }

    if (sections.length === 0) {
      return NextResponse.json(
        { error: "At least one section must be selected" },
        { status: 400 }
      );
    }

    // Check if teacher with email or aadhaar already exists
    const existingTeacher = await prisma.teacher.findFirst({
      where: { OR: [{ email }, { aadhaar_number }] },
    });

    if (existingTeacher) {
      return NextResponse.json(
        { error: "Teacher with this email or Aadhaar already exists" },
        { status: 400 }
      );
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new teacher with transaction to ensure all relations are created
    const teacher = await prisma.$transaction(async (prisma) => {
      // Create the teacher first
      const newTeacher = await prisma.teacher.create({
        data: {
          teacherName,
          dob: new Date(dob),
          email,
          password: hashedPassword,
          qualification,
          experienceYears: experienceYears ? parseInt(experienceYears) : undefined,
          phone_number,
          aadhaar_number,
          profileImage: profileImageUrl,
          updatedAt: new Date(),
          schools: {
            connect: {
              id: parseInt(schoolId),
            },
          },
        },
      });

      // Update teacher with class and section assignments using raw SQL
      await prisma.$executeRaw`
        UPDATE teachers 
        SET 
          assignedclasses = ${assignedclasses.map(String)},
          assignedsections = ${sections}
        WHERE id = ${newTeacher.id}
      `;

      // Fetch class names from class IDs
      const classDetails = await Promise.all(
        subjectClassMappings.flatMap(mapping => 
          mapping.classIds.map(async classId => {
            const classRecord = await prisma.class.findUnique({
              where: { id: classId }
            });
            return classRecord?.name || "";
          })
        )
      );
      
      // Filter out empty values and create unique array of class names
      const uniqueClassNames = Array.from(new Set(classDetails.filter(Boolean)));
      console.log(`Assigning classes to teacher: ${uniqueClassNames.join(', ')}`);
      
      // Update the teacher with arrays
      await prisma.teacher.update({
        where: { id: newTeacher.id },
        data: {
          assignedclasses: uniqueClassNames,
          assignedsections: sections,
        },
      });

      // Create teacher-class-subject relationships
      console.log(`Creating ${subjectClassMappings.length} subject mappings for teacher ID ${newTeacher.id}`);
      
      // Count how many relationships will be created
      const totalRelationships = subjectClassMappings.reduce(
        (count, mapping) => count + mapping.classIds.length, 
        0
      );
      console.log(`Will create a total of ${totalRelationships} teacher-class-subject relationships`);
      
      // Create all relationships with better error handling
      for (const mapping of subjectClassMappings) {
        for (const classId of mapping.classIds) {
          try {
            console.log(`Inserting relationship: teacher=${newTeacher.id}, subject=${mapping.subjectId}, class=${classId}`);
            
            // First check if the relationship already exists to avoid constraint violations
            const existing = await prisma.teacher_class_subject.findFirst({
              where: {
                teacher_id: newTeacher.id,
                subject_id: mapping.subjectId,
                class_id: classId
              }
            });
            
            if (!existing) {
              // Create the relationship using Prisma instead of raw SQL
              await prisma.teacher_class_subject.create({
                data: {
                  teacher_id: newTeacher.id,
                  subject_id: mapping.subjectId,
                  class_id: classId
                }
              });
              console.log(`Successfully created relationship`);
            } else {
              console.log(`Relationship already exists, skipping`);
            }
          } catch (error) {
            console.error(`Error creating relationship: ${error}`);
          }
        }
      }

      return newTeacher;
    });

    return NextResponse.json(teacher);
  } catch (error) {
    console.error("Error registering teacher:", error);
    return NextResponse.json(
      { error: "Error registering teacher" },
      { status: 500 }
    );
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const schoolId = searchParams.get("schoolId");

    // Use simpler Prisma queries instead of raw SQL for more reliability
    const whereClause = schoolId ? { schoolId: parseInt(schoolId) } : {};
    
    // Get all teachers with their school info
    const teachers = await prisma.teacher.findMany({
      where: whereClause,
      include: {
        schools: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    // For each teacher, get their subject and class relationships
    const teachersWithRelations = await Promise.all(
      teachers.map(async (teacher) => {
        const relations = await prisma.teacher_class_subject.findMany({
          where: { teacher_id: teacher.id },
          select: {
            class_id: true,
            subject_id: true,
          },
        });
        
        // Extract class and subject IDs using Array.from instead of spread
        const classIds = Array.from(new Set(relations.map((r) => r.class_id)));
        const subjectIds = Array.from(new Set(relations.map((r) => r.subject_id)));
        
        // Format the teacher object as expected by the frontend
        return {
          ...teacher,
          school_name: teacher.schools?.name || '',
          class_ids: classIds,
          subject_ids: subjectIds,
        };
      })
    );

    return NextResponse.json(teachersWithRelations);
  } catch (error) {
    console.error("Error fetching teachers:", error);
    return NextResponse.json(
      { error: "Error fetching teachers" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'Teacher ID is required' },
        { status: 400 }
      );
    }

    // Delete the teacher
    const teacher = await prisma.teacher.delete({
      where: {
        id: parseInt(id),
      },
    });

    return NextResponse.json({ message: 'Teacher deleted successfully' });
  } catch (error) {
    console.error('Error deleting teacher:', error);
    return NextResponse.json(
      { error: 'Error deleting teacher' },
      { status: 500 }
    );
  }
}
