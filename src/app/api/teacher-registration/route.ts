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
    const { schoolId, teacherName, dob, email, password, qualification, subject_id, experienceYears, phone_number, aadhaar_number } = data;
    // Validate input
    if (!schoolId || !teacherName || !email || !password || !dob || !subject_id || !phone_number || !aadhaar_number) {
      return NextResponse.json(
        { error: "Missing required fields" },
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

    // Create new teacher
    const teacher = await prisma.teacher.create({
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
        subject: {
          connect: { id: parseInt(subject_id) },
        },
      },
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

    const whereClause = schoolId ? { schoolId: parseInt(schoolId) } : {};

    const teachers = await prisma.teacher.findMany({
      where: whereClause,
      select: {
        id: true,
        teacherName: true,
        email: true,
        qualification: true,
        subjectAssigned: true,
        classAssigned: true,
        experienceYears: true,
        status: true,
        schools: {
          select: {
            name: true,
          },
        },
      },
    });

    return NextResponse.json(teachers);
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
