import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      schoolId,
      teacherName,
      dob,
      email,
      password,
      qualification,
      subjectAssigned,
      classAssigned,
      experienceYears,
    } = body;

    // Validate input
    if (!schoolId || !teacherName || !email || !password || !dob) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Check if teacher with email already exists
    const existingTeacher = await prisma.teacher.findUnique({
      where: { email },
    });

    if (existingTeacher) {
      return NextResponse.json(
        { error: "Teacher with this email already exists" },
        { status: 400 }
      );
    }    // Create new teacher
    const teacher = await prisma.teacher.create({
      data: {
        teacherName,
        dob: new Date(dob),
        email,
        password, // Note: In production, password should be hashed
        qualification,
        subjectAssigned,
        classAssigned,
        experienceYears,
        updatedAt: new Date(),
        schools: {
          connect: {
            id: schoolId,
          },
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
