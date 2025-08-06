import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { logger } from '@/lib/production-logger';

interface HealthCheck {
  status: 'healthy' | 'unhealthy' | 'degraded';
  timestamp: string;
  version: string;
  uptime: number;
  environment: string;
  services: {
    database: 'healthy' | 'unhealthy';
    storage: 'healthy' | 'unhealthy';
    memory: 'healthy' | 'warning' | 'critical';
  };
  metrics: {
    memoryUsage: {
      used: number;
      total: number;
      percentage: number;
    };
    responseTime: number;
  };
}

async function checkDatabase(): Promise<'healthy' | 'unhealthy'> {
  try {
    await prisma.$queryRaw`SELECT 1`;
    return 'healthy';
  } catch (error) {
    logger.logError(error instanceof Error ? error : new Error('Database health check failed'));
    return 'unhealthy';
  }
}

async function checkStorage(): Promise<'healthy' | 'unhealthy'> {
  try {
    // Check if AWS credentials are configured
    const hasAwsConfig = process.env.AWS_ACCESS_KEY_ID && 
                        process.env.AWS_SECRET_ACCESS_KEY && 
                        process.env.S3_BUCKET_NAME;
    return hasAwsConfig ? 'healthy' : 'unhealthy';
  } catch (error) {
    logger.logError(error instanceof Error ? error : new Error('Storage health check failed'));
    return 'unhealthy';
  }
}

function getMemoryStatus(): { status: 'healthy' | 'warning' | 'critical'; metrics: any } {
  const usage = process.memoryUsage();
  const totalMB = usage.heapTotal / 1024 / 1024;
  const usedMB = usage.heapUsed / 1024 / 1024;
  const percentage = (usedMB / totalMB) * 100;

  let status: 'healthy' | 'warning' | 'critical' = 'healthy';
  if (percentage > 90) status = 'critical';
  else if (percentage > 75) status = 'warning';

  return {
    status,
    metrics: {
      used: Math.round(usedMB),
      total: Math.round(totalMB),
      percentage: Math.round(percentage),
    },
  };
}

export async function GET() {
  const startTime = Date.now();

  try {
    // Run health checks in parallel
    const [databaseStatus, storageStatus] = await Promise.all([
      checkDatabase(),
      checkStorage(),
    ]);

    const memoryCheck = getMemoryStatus();
    const responseTime = Date.now() - startTime;

    // Determine overall status
    let overallStatus: 'healthy' | 'unhealthy' | 'degraded' = 'healthy';
    
    if (databaseStatus === 'unhealthy' || storageStatus === 'unhealthy') {
      overallStatus = 'unhealthy';
    } else if (memoryCheck.status === 'critical') {
      overallStatus = 'degraded';
    } else if (memoryCheck.status === 'warning') {
      overallStatus = 'degraded';
    }

    const healthCheck: HealthCheck = {
      status: overallStatus,
      timestamp: new Date().toISOString(),
      version: process.env.npm_package_version || '1.0.0',
      uptime: process.uptime(),
      environment: process.env.NODE_ENV || 'development',
      services: {
        database: databaseStatus,
        storage: storageStatus,
        memory: memoryCheck.status,
      },
      metrics: {
        memoryUsage: memoryCheck.metrics,
        responseTime,
      },
    };

    // Log health check if unhealthy
    if (overallStatus !== 'healthy') {
      logger.logWarning('Health check indicates issues', healthCheck);
    }

    const statusCode = overallStatus === 'healthy' ? 200 : 
                      overallStatus === 'degraded' ? 200 : 503;

    return NextResponse.json(healthCheck, {
      status: statusCode,
      headers: {
        'Cache-Control': 'no-store, max-age=0',
        'Content-Type': 'application/json',
      },
    });

  } catch (error) {
    logger.logError(error instanceof Error ? error : new Error('Health check failed'));
    
    const errorResponse: HealthCheck = {
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      version: process.env.npm_package_version || '1.0.0',
      uptime: process.uptime(),
      environment: process.env.NODE_ENV || 'development',
      services: {
        database: 'unhealthy',
        storage: 'unhealthy',
        memory: 'critical',
      },
      metrics: {
        memoryUsage: { used: 0, total: 0, percentage: 0 },
        responseTime: Date.now() - startTime,
      },
    };

    return NextResponse.json(errorResponse, {
      status: 503,
      headers: {
        'Cache-Control': 'no-store, max-age=0',
        'Content-Type': 'application/json',
      },
    });
  }
}

// Define options for the route - ensure fresh data every time
export const dynamic = 'force-dynamic';
export const revalidate = 0; 