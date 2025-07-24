import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    // Get counts in parallel using Promise.all for better performance
    const [
      schoolCount,
      teacherCount,
      classCount,
      subjectCount,
      lessonCount,
    ] = await Promise.all([
      prisma.schools.count(),
      prisma.teacher.count(),
      prisma.class.count(),
      prisma.subject.count(),
      prisma.lessonPdf.count(),
    ]);

    return NextResponse.json({
      schoolCount,
      teacherCount,
      classCount,
      subjectCount,
      lessonCount,
    });
  } catch (error) {
    console.error("Error fetching dashboard stats:", error);
    return NextResponse.json(
      { error: "Failed to fetch dashboard stats" },
      { status: 500 }
    );
  }
}
