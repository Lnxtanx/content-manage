import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    // Check database connectivity
    await prisma.$queryRaw`SELECT 1`;
    
    // Check system memory usage
    const memoryUsage = process.memoryUsage();
    const heapUsed = Math.round(memoryUsage.heapUsed / 1024 / 1024);
    const heapTotal = Math.round(memoryUsage.heapTotal / 1024 / 1024);
    const rss = Math.round(memoryUsage.rss / 1024 / 1024);
    
    // Check if memory usage is healthy (less than 80% of heap)
    const memoryHealthy = heapUsed < (heapTotal * 0.8);
    
    return NextResponse.json(
      { 
        status: 'healthy', 
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        environment: process.env.NODE_ENV,
        memory: {
          healthy: memoryHealthy,
          heapUsedMB: heapUsed,
          heapTotalMB: heapTotal, 
          rssMB: rss,
          usagePercentage: Math.round((heapUsed / heapTotal) * 100)
        },
        serverLoadAverage: typeof process.cpuUsage === 'function' ? process.cpuUsage() : 'unavailable'
      },
      { 
        status: 200,
        headers: {
          'Cache-Control': 'no-store, max-age=0',
          'Content-Type': 'application/json'
        }
      }
    );
  } catch (error) {
    console.error('Health check failed:', error);
    return NextResponse.json(
      { 
        status: 'unhealthy', 
        timestamp: new Date().toISOString(),
        error: 'Database connection failed',
        message: String(error)
      },
      { 
        status: 503,
        headers: {
          'Cache-Control': 'no-store, max-age=0',
          'Content-Type': 'application/json'
        } 
      }
    );
  }
}

// Define options for the route - ensure fresh data every time
export const dynamic = 'force-dynamic';
export const revalidate = 0; 