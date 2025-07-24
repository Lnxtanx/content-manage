import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import bcrypt from 'bcrypt';
import { uploadFileToS3 } from '@/lib/s3';

export async function POST(request: NextRequest) {
  try {
    const contentType = request.headers.get('content-type') || '';
    let data: any = {};
    let logoUrl: string | null = null;
    if (contentType.includes('multipart/form-data')) {
      const formData = await request.formData();
      data = Object.fromEntries(formData.entries());
      const logo = formData.get('logo') as File | null;
      if (logo && logo.size > 0) {
        const buffer = Buffer.from(await logo.arrayBuffer());
        const fileName = `${Date.now()}-${logo.name}`;
        logoUrl = await uploadFileToS3(buffer, fileName, logo.type || 'image/png', 'school-logos');
      }
    } else {
      data = await request.json();
    }
    const { name, email, password, address, principal_name, location, school_address } = data;

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
        logo: logoUrl,
        address: address || null,
        principal_name: principal_name || null,
        location: location || null,
        school_address: school_address || null,
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
        updatedAt: true,
        logo: true,
        address: true,
        principal_name: true,
        location: true,
        school_address: true,
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
