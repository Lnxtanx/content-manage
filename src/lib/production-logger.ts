import { NextRequest, NextResponse } from 'next/server';

interface LogEntry {
  timestamp: string;
  level: 'info' | 'warn' | 'error';
  message: string;
  method?: string;
  url?: string;
  statusCode?: number;
  duration?: number;
  userAgent?: string;
  ip?: string;
}

class ProductionLogger {
  private static instance: ProductionLogger;

  private constructor() {}

  public static getInstance(): ProductionLogger {
    if (!ProductionLogger.instance) {
      ProductionLogger.instance = new ProductionLogger();
    }
    return ProductionLogger.instance;
  }

  private formatLog(entry: LogEntry): string {
    return JSON.stringify({
      ...entry,
      timestamp: new Date().toISOString(),
    });
  }

  public logRequest(req: NextRequest, res: NextResponse, duration: number): void {
    if (process.env.NODE_ENV !== 'production') return;

    const logEntry: LogEntry = {
      timestamp: new Date().toISOString(),
      level: res.status >= 400 ? 'error' : 'info',
      message: `${req.method} ${req.url} ${res.status}`,
      method: req.method,
      url: req.url,
      statusCode: res.status,
      duration,
      userAgent: req.headers.get('user-agent') || undefined,
      ip: req.headers.get('x-forwarded-for') || 
          req.headers.get('x-real-ip') || 
          'unknown',
    };

    console.log(this.formatLog(logEntry));
  }

  public logError(error: Error, context?: Record<string, any>): void {
    const logEntry: LogEntry = {
      timestamp: new Date().toISOString(),
      level: 'error',
      message: error.message,
      ...context,
    };

    console.error(this.formatLog(logEntry));
    
    // In production, you might want to send this to an external logging service
    // like CloudWatch, Datadog, or Sentry
  }

  public logInfo(message: string, context?: Record<string, any>): void {
    if (process.env.NODE_ENV !== 'production') return;

    const logEntry: LogEntry = {
      timestamp: new Date().toISOString(),
      level: 'info',
      message,
      ...context,
    };

    console.log(this.formatLog(logEntry));
  }

  public logWarning(message: string, context?: Record<string, any>): void {
    const logEntry: LogEntry = {
      timestamp: new Date().toISOString(),
      level: 'warn',
      message,
      ...context,
    };

    console.warn(this.formatLog(logEntry));
  }
}

export const logger = ProductionLogger.getInstance();

// Middleware function for automatic request logging
export function withLogging(handler: Function) {
  return async (req: NextRequest, ...args: any[]) => {
    const startTime = Date.now();
    
    try {
      const response = await handler(req, ...args);
      const duration = Date.now() - startTime;
      
      logger.logRequest(req, response, duration);
      return response;
    } catch (error) {
      const duration = Date.now() - startTime;
      logger.logError(error instanceof Error ? error : new Error(String(error)), {
        method: req.method,
        url: req.url,
        duration,
      });
      throw error;
    }
  };
}
