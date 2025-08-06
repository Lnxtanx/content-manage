import { S3Client, PutObjectCommand, S3ClientConfig } from '@aws-sdk/client-s3';
import path from 'path';
import mime from 'mime-types';

// Validate required environment variables
const requiredEnvVars = ['AWS_REGION', 'AWS_ACCESS_KEY_ID', 'AWS_SECRET_ACCESS_KEY', 'S3_BUCKET_NAME'] as const;
for (const envVar of requiredEnvVars) {
  if (!process.env[envVar]) {
    throw new Error(`Missing required environment variable: ${envVar}`);
  }
}

// Create S3 client with optimized configuration for large files
const s3ClientConfig: S3ClientConfig = {
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID as string,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY as string,
  },
  maxAttempts: 5 // Retry failed uploads
};

const s3Client = new S3Client(s3ClientConfig);

/**
 * Sanitizes a file name for S3 storage
 * @param fileName - Original file name
 * @returns Sanitized file name
 */
function sanitizeFileName(fileName: string): string {
  // Remove any path traversal attempts and invalid characters
  const sanitized = path.basename(fileName)
    .replace(/[^a-zA-Z0-9._-]/g, '_')
    .replace(/_{2,}/g, '_');
  return sanitized;
}

/**
 * Uploads a file to AWS S3 bucket with improved error handling and type safety
 * @param file - File buffer to upload
 * @param fileName - Name to save the file as
 * @param folder - S3 folder to store the file in
 * @param contentType - Optional MIME type of the file
 * @returns Promise with the URL of the uploaded file
 * @throws Error if upload fails or parameters are invalid
 */
export async function uploadFileToS3(
  file: Buffer,
  fileName: string,
  folder: string = 'lessons',
  contentType?: string
): Promise<string> {
  if (!file || file.length === 0) {
    throw new Error('File buffer is empty or invalid');
  }

  if (!fileName) {
    throw new Error('File name is required');
  }

  try {
    const sanitizedFileName = sanitizeFileName(fileName);
    const detectedContentType = contentType || mime.lookup(fileName) || 'application/octet-stream';
    const key = `${folder}/${sanitizedFileName}`;

    const command = new PutObjectCommand({
      Bucket: process.env.S3_BUCKET_NAME as string,
      Key: key,
      Body: file,
      ContentType: detectedContentType,
      Metadata: {
        'upload-timestamp': new Date().toISOString(),
        'file-size': file.length.toString(),
        'original-name': fileName,
      },
      ACL: 'private',
    });

    console.log(`Starting upload of ${sanitizedFileName} (${file.length} bytes)`);
    const startTime = Date.now();
    
    await s3Client.send(command);
    
    const endTime = Date.now();
    console.log(`Successfully uploaded ${sanitizedFileName} in ${(endTime - startTime) / 1000} seconds`);
    
    // Construct the S3 URL using the bucket name and region from environment variables
    return `https://${process.env.S3_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    console.error(`S3 upload error for ${fileName}:`, error);
    throw new Error(`Failed to upload file to S3: ${errorMessage}`);
  }
}

/**
 * Generates a pre-signed URL for direct browser uploads
 * Useful for very large files to bypass the server
 * (Not implemented yet, but can be added if needed)
 */
// export async function getPresignedUploadUrl() {...}
