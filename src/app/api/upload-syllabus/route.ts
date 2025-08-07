import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { uploadFileToS3 } from '@/lib/s3';

// Disable caching for this route
export const dynamic = 'force-dynamic';
export const revalidate = 0;

// Increase file size limits
export const runtime = 'nodejs';
export const maxDuration = 120; // 120 seconds timeout for large file uploads

export async function POST(request: NextRequest) {
  // Check content length before processing
  const contentLength = request.headers.get('content-length');
  if (contentLength && parseInt(contentLength) > 10 * 1024 * 1024) { // 10MB limit to match AWS defaults
    return NextResponse.json(
      { error: 'File size exceeds 10MB limit' },
      { status: 413 }
    );
  }
  try {
    // Set response headers to prevent caching
    const headers = {
      'Cache-Control': 'no-store, no-cache, must-revalidate, max-age=0',
      'Pragma': 'no-cache',
      'Expires': '0'
    };

    // Log request details for debugging
    console.log(`Upload request started, content-type: ${request.headers.get('content-type')}, content-length: ${request.headers.get('content-length')}`);

    // Process the form data
    const formData = await request.formData();

    const file = formData.get('file') as File;
    const schoolId = formData.get('schoolId');
    const classId = formData.get('classId');
    const subject_id = formData.get('subject_id');
    const lessonName = formData.get('lessonName');
    const lessonoutcomes = formData.get('lessonoutcomes');
    const lessonobjectives = formData.get('lessonobjectives');
    const isForAllSchools = formData.get('isForAllSchools') === 'true';

    // Log form data for debugging
    console.log(`Form data received: file=${file?.name}, size=${file?.size}, classId=${classId}, subjectId=${subject_id}`);

    // Validate required fields
    if (!file || !classId || !lessonName || !subject_id) {
      console.warn('Missing required fields in upload request');
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400, headers }
      );
    }

    // Validate file size (10MB limit to match AWS defaults)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      console.warn(`File size exceeds limit: ${file.size} bytes`);
      return NextResponse.json(
        { error: `File size exceeds 10MB limit (received: ${Math.round(file.size / (1024 * 1024))}MB)` },
        { status: 400, headers }
      );
    }

    // Validate file type
    if (!file.type.includes('pdf')) {
      console.warn(`Invalid file type: ${file.type}`);
      return NextResponse.json(
        { error: 'Only PDF files are allowed' },
        { status: 400, headers }
      );
    }

    console.log('Starting file processing...');
    
    // Convert file to buffer with streaming for large files
    const buffer = Buffer.from(await file.arrayBuffer());
    const fileName = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;

    console.log(`File converted to buffer, size: ${buffer.length} bytes`);

    // Upload to S3
    console.log('Starting S3 upload...');
    const pdfUrl = await uploadFileToS3(buffer, fileName);
    console.log(`S3 upload complete: ${pdfUrl}`);

    // Save to database
    console.log('Saving to database...');
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
    console.log(`Database entry created with ID: ${lessonPdf.id}`);

    return NextResponse.json(
      { 
        success: true, 
        message: 'File uploaded successfully',
        data: lessonPdf 
      }, 
      { headers }
    );
  } catch (error) {
    console.error('Error uploading syllabus:', error);
    
    // Provide more specific error messages
    let errorMessage = 'Failed to upload syllabus';
    let statusCode = 500;
    
    if (error instanceof Error) {
      console.error('Error details:', error.message, error.stack);
      
      if (error.message.includes('timeout') || error.message.includes('ETIMEDOUT')) {
        errorMessage = 'Upload timeout - file too large or slow connection';
        statusCode = 504; // Gateway Timeout
      } else if (error.message.includes('S3') || error.message.includes('AccessDenied')) {
        errorMessage = 'Failed to upload file to storage service';
        statusCode = 500;
      } else if (error.message.includes('database') || error.message.includes('prisma')) {
        errorMessage = 'Failed to save file information to database';
        statusCode = 500;
      } else if (error.message.includes('too large') || error.message.includes('exceeded') || error.message.includes('limit')) {
        errorMessage = 'File size exceeds server limits';
        statusCode = 413; // Payload Too Large
      } else if (error.message.includes('network') || error.message.includes('ECONNRESET')) {
        errorMessage = 'Network error during upload - please try again';
        statusCode = 503; // Service Unavailable
      }
    }
    
    return NextResponse.json(
      { 
        error: errorMessage,
        success: false,
        details: process.env.NODE_ENV !== 'production' ? (error as Error).message : undefined
      },
      { 
        status: statusCode,
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate, max-age=0',
          'Pragma': 'no-cache',
          'Expires': '0'
        }
      }
    );
  }
}
