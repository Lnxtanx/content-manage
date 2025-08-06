import { NextResponse } from 'next/server';
import { logger } from './production-logger';

export class AppError extends Error {
  public statusCode: number;
  public isOperational: boolean;

  constructor(message: string, statusCode: number = 500, isOperational: boolean = true) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    
    Error.captureStackTrace(this, this.constructor);
  }
}

export class ValidationError extends AppError {
  constructor(message: string) {
    super(message, 400);
  }
}

export class NotFoundError extends AppError {
  constructor(message: string = 'Resource not found') {
    super(message, 404);
  }
}

export class UnauthorizedError extends AppError {
  constructor(message: string = 'Unauthorized access') {
    super(message, 401);
  }
}

export class ForbiddenError extends AppError {
  constructor(message: string = 'Access forbidden') {
    super(message, 403);
  }
}

export function handleApiError(error: unknown): NextResponse {
  // Log the error
  if (error instanceof Error) {
    logger.logError(error);
  } else {
    logger.logError(new Error(String(error)));
  }

  // Handle known errors
  if (error instanceof AppError) {
    return NextResponse.json(
      { 
        error: process.env.NODE_ENV === 'production' 
          ? 'An error occurred while processing your request'
          : error.message,
        code: error.statusCode 
      },
      { status: error.statusCode }
    );
  }

  // Handle Prisma errors
  if (error && typeof error === 'object' && 'code' in error) {
    const prismaError = error as any;
    
    switch (prismaError.code) {
      case 'P2002':
        return NextResponse.json(
          { error: 'This record already exists' },
          { status: 409 }
        );
      case 'P2025':
        return NextResponse.json(
          { error: 'Record not found' },
          { status: 404 }
        );
      case 'P2003':
        return NextResponse.json(
          { error: 'Invalid reference to related record' },
          { status: 400 }
        );
      default:
        return NextResponse.json(
          { error: 'Database error occurred' },
          { status: 500 }
        );
    }
  }

  // Handle unknown errors
  return NextResponse.json(
    { 
      error: process.env.NODE_ENV === 'production'
        ? 'Internal server error'
        : error instanceof Error ? error.message : 'Unknown error occurred'
    },
    { status: 500 }
  );
}

// Async error handler wrapper
export function asyncHandler(fn: Function) {
  return (req: any, ...args: any[]) => {
    return Promise.resolve(fn(req, ...args)).catch((error) => {
      return handleApiError(error);
    });
  };
}
