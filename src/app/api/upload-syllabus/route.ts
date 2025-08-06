import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { uploadFileToS3 } from '@/lib/s3';

// Disable caching for this route
export const dynamic = 'force-dynamic';
export const revalidate = 0;

// Increase file size limits
export const runtime = 'nodejs';
export const maxDuration = 60; // 60 seconds timeout

export async function POST(request: NextRequest) {
  try {
    // Set response headers to prevent caching
    const headers = {
      'Cache-Control': 'no-store, no-cache, must-revalidate, max-age=0',
      'Pragma': 'no-cache',
      'Expires': '0'
    };

    const formData = await request.formData();

    const file = formData.get('file') as File;
    const schoolId = formData.get('schoolId');
    const classId = formData.get('classId');
    const subject_id = formData.get('subject_id');
    const lessonName = formData.get('lessonName');
    const lessonoutcomes = formData.get('lessonoutcomes');
    const lessonobjectives = formData.get('lessonobjectives');
    const isForAllSchools = formData.get('isForAllSchools') === 'true';

    // Validate required fields
    if (!file || !classId || !lessonName || !subject_id) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400, headers }
      );
    }

    // Validate file size (50MB limit)
    const maxSize = 50 * 1024 * 1024; // 50MB
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: 'File size exceeds 50MB limit' },
        { status: 400, headers }
      );
    }

    // Validate file type
    if (!file.type.includes('pdf')) {
      return NextResponse.json(
        { error: 'Only PDF files are allowed' },
        { status: 400, headers }
      );
    }

    // Convert file to buffer with streaming for large files
    const buffer = Buffer.from(await file.arrayBuffer());
    const fileName = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;

    // Upload to S3
    const pdfUrl = await uploadFileToS3(buffer, fileName);

    // Save to database
    const lessonPdf = await prisma.lessonPdf.create({
      data: {
        lessonName: lessonName as string,
        pdfUrl,
        classId: parseInt(classId as string),
        subject_id: parseInt(subject_id as string),
        lessonoutcomes: lessonoutcomes ? String(lessonoutcomes) : null,
        lessonobjectives: lessonobjectives ? String(lessonobjectives) : null,
        schoolId: isForAllSchools ? null : parseInt(schoolId as string),
        isForAllSchools,
      },
    });

    return NextResponse.json(lessonPdf, { headers });
  } catch (error) {
    console.error('Error uploading syllabus:', error);
    
    // Provide more specific error messages
    let errorMessage = 'Failed to upload syllabus';
    if (error instanceof Error) {
      if (error.message.includes('timeout')) {
        errorMessage = 'Upload timeout - file too large or slow connection';
      } else if (error.message.includes('S3')) {
        errorMessage = 'Failed to upload file to storage';
      } else if (error.message.includes('database')) {
        errorMessage = 'Failed to save file information to database';
      }
    }
    
    return NextResponse.json(
      { error: errorMessage },
      { 
        status: 500,
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate, max-age=0',
          'Pragma': 'no-cache',
          'Expires': '0'
        }
      }
    );
  }
}
