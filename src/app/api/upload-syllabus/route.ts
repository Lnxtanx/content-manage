import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { uploadFileToS3 } from '@/lib/s3';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const schoolId = formData.get('schoolId');
    const classId = formData.get('classId');
    const lessonName = formData.get('lessonName');    if (!file || !classId || !lessonName) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const isForAllSchools = formData.get('isForAllSchools') === 'true';

    // Convert file to buffer
    const buffer = Buffer.from(await file.arrayBuffer());
    const fileName = `${Date.now()}-${file.name}`;
    
    // Upload to S3
    const pdfUrl = await uploadFileToS3(buffer, fileName);

    // Save to database
    const lessonPdf = await prisma.lessonPdf.create({
      data: {
        lessonName: lessonName as string,
        pdfUrl,
        classId: parseInt(classId as string),
        schoolId: isForAllSchools ? null : parseInt(schoolId as string),
        isForAllSchools,
      },
    });

    return NextResponse.json(lessonPdf);
  } catch (error) {
    console.error('Error uploading syllabus:', error);
    return NextResponse.json(
      { error: 'Failed to upload syllabus' },
      { status: 500 }
    );
  }
}
