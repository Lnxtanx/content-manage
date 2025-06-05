import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import AWS from 'aws-sdk';

// Set up AWS SDK
const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION,
});

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const lessonId = parseInt(params.id);

    if (isNaN(lessonId)) {
      return NextResponse.json({ error: 'Invalid lesson ID' }, { status: 400 });
    }

    // Get the lesson details from the database to fetch the PDF URL
    const lesson = await prisma.lessonPdf.findUnique({
      where: {
        id: lessonId,
      },
    });

    if (!lesson) {
      return NextResponse.json({ error: 'Lesson not found' }, { status: 404 });
    }

    const pdfKey = lesson.pdfUrl; // Assuming pdfUrl is the key to the file in your S3 bucket    // Check if S3 bucket name is configured
    const bucketName = process.env.S3_BUCKET_NAME;
    if (!bucketName) {
      console.error('S3_BUCKET_NAME environment variable is not set');
      return NextResponse.json({ error: 'S3 configuration error' }, { status: 500 });
    }

    // Delete the PDF from the S3 bucket
    const s3Params = {
      Bucket: bucketName,
      Key: pdfKey,
    } as AWS.S3.DeleteObjectRequest;

    try {
      await s3.deleteObject(s3Params).promise();
      console.log(`Successfully deleted PDF file from S3: ${pdfKey}`);
    } catch (s3Error) {
      console.error('Error deleting file from S3:', s3Error);
      return NextResponse.json({ error: 'Failed to delete PDF from S3' }, { status: 500 });
    }

    // Delete the lesson from the database
    const deletedLesson = await prisma.lessonPdf.delete({
      where: {
        id: lessonId,
      },
    });

    return NextResponse.json({ message: 'Lesson and PDF deleted', data: deletedLesson });
  } catch (error) {
    console.error('Error deleting lesson:', error);
    return NextResponse.json({ error: 'Failed to delete lesson' }, { status: 500 });
  }
}
