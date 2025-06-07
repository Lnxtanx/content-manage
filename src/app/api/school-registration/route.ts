import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import bcrypt from 'bcrypt';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, email, password } = body;

    // Validate input
    if (!name || !email || !password) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Check if school with email already exists
    const existingSchool = await prisma.schools.findUnique({
      where: { email },
    });

    if (existingSchool) {
      return NextResponse.json(
        { error: "School with this email already exists" },
        { status: 400 }
      );
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new school
    const school = await prisma.schools.create({
      data: {
        name,
        email,
        password: hashedPassword,
        updatedAt: new Date(),
      },
    });

    return NextResponse.json(school);
  } catch (error) {
    console.error("Error registering school:", error);
    return NextResponse.json(
      { error: "Error registering school" },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const schools = await prisma.schools.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        isActive: true,
        createdAt: true,
        _count: {
          select: {
            teachers: true,
          },
        },
      },
    });

    return NextResponse.json(schools);
  } catch (error) {
    console.error("Error fetching schools:", error);
    return NextResponse.json(
      { error: "Error fetching schools" },
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
        { error: 'School ID is required' },
        { status: 400 }
      );
    }

    // Delete the school
    const school = await prisma.schools.delete({
      where: {
        id: parseInt(id),
      },
    });

    return NextResponse.json({ message: 'School deleted successfully' });
  } catch (error) {
    console.error('Error deleting school:', error);
    return NextResponse.json(
      { error: 'Error deleting school' },
      { status: 500 }
    );
  }
}
