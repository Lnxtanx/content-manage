"use client";

/**
 * Memory and Performance Optimizer for Next.js
 * This utility provides functions to optimize memory usage and monitor performance.
 */

// Configuration
const config = {
  memoryThreshold: 150, // MB - threshold for cleanup
  gcInterval: 60000, // 1 minute - interval between garbage collection attempts
  imageOptimizationEnabled: true,
  logPerformance: process.env.NODE_ENV === 'development',
};

/**
 * Garbage collection helper
 * Helps reduce memory usage by cleaning up resources
 */
export const memoryOptimizer = {
  // Track objects that might cause memory leaks
  trackedObjects: new WeakMap(),
  
  // Initialize memory optimization
  init: () => {
    if (typeof window === 'undefined') return;
    
    // Setup periodic cleanup
    setInterval(() => {
      memoryOptimizer.attemptCleanup();
    }, config.gcInterval);
    
    // Listen for visibility changes to optimize when tab is not active
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        memoryOptimizer.attemptCleanup(true);
      }
    });
    
    // Clean up on low memory warning
    if ('onmemorywarning' in performance) {
      // @ts-ignore - Non-standard API
      performance.onmemorywarning = () => memoryOptimizer.attemptCleanup(true);
    }
    
    console.log('Memory optimizer initialized');
  },
  
  // Track an object that might cause memory leaks
  trackObject: (obj: any, metadata: any) => {
    if (!obj) return;
    memoryOptimizer.trackedObjects.set(obj, {
      timestamp: Date.now(),
      ...metadata,
    });
  },
  
  // Attempt to clean up memory
  attemptCleanup: (force = false) => {
    if (typeof window === 'undefined') return;
    
    // Check if we should attempt cleanup
    if (window.performance && 'memory' in window.performance) {
      // @ts-ignore - Non-standard API
      const usedHeapSize = window.performance.memory.usedJSHeapSize / (1024 * 1024);
      const shouldCleanup = force || usedHeapSize > config.memoryThreshold;
      
      if (config.logPerformance) {
        console.log(`Memory usage: ${Math.round(usedHeapSize)} MB`);
      }
      
      if (shouldCleanup) {
        if (config.logPerformance) {
          console.log('Attempting memory cleanup');
        }
        
        // Clear image cache if enabled
        if (config.imageOptimizationEnabled) {
          const images = document.querySelectorAll('img[src^="data:"]');
          images.forEach(img => {
            if (!isElementInViewport(img)) {
              (img as HTMLImageElement).src = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7'; // 1x1 transparent GIF
            }
          });
        }
        
        // Clear console in production
        if (process.env.NODE_ENV === 'production' && console.clear) {
          console.clear();
        }
        
        // Suggest garbage collection
        if (window.gc) {
          try {
            // @ts-ignore - Non-standard API
            window.gc();
          } catch (e) {
            // GC not available
          }
        }
      }
    }
  }
};

/**
 * Check if an element is in the viewport
 */
function isElementInViewport(el: Element) {
  const rect = el.getBoundingClientRect();
  return (
    rect.top >= 0 &&
    rect.left >= 0 &&
    rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
    rect.right <= (window.innerWidth || document.documentElement.clientWidth)
  );
}

/**
 * Performance monitoring utilities
 */
export const performanceMonitor = {
  marks: {} as Record<string, number>,
  
  // Start timing an operation
  start: (label: string) => {
    if (config.logPerformance) {
      performanceMonitor.marks[label] = performance.now();
    }
  },
  
  // End timing and log the result
  end: (label: string) => {
    if (config.logPerformance && performanceMonitor.marks[label]) {
      const duration = performance.now() - performanceMonitor.marks[label];
      console.log(`⏱️ ${label}: ${duration.toFixed(2)}ms`);
      delete performanceMonitor.marks[label];
      return duration;
    }
    return 0;
  },
  
  // Measure a function's execution time
  measure: <T>(label: string, fn: () => T): T => {
    performanceMonitor.start(label);
    const result = fn();
    performanceMonitor.end(label);
    return result;
  },
  
  // Measure an async function's execution time
  measureAsync: async <T>(label: string, fn: () => Promise<T>): Promise<T> => {
    performanceMonitor.start(label);
    const result = await fn();
    performanceMonitor.end(label);
    return result;
  }
};

/**
 * Network optimization utilities
 */
export const networkOptimizer = {
  // Initialize network optimization
  init: () => {
    if (typeof window === 'undefined') return;
    
    // Implement connection-aware fetching
    const originalFetch = window.fetch;
    window.fetch = async (...args) => {
      // Check connection quality
      // @ts-ignore - Non-standard API
      const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
      const isSlowConnection = connection && (
        connection.saveData || 
        connection.effectiveType === 'slow-2g' ||
        connection.effectiveType === '2g'
      );
      
      // For slow connections, prioritize critical requests
      if (isSlowConnection) {
        const url = typeof args[0] === 'string' ? args[0] : args[0] instanceof URL ? args[0].href : args[0].url;
        if (url && !isHighPriorityRequest(url)) {
          await new Promise(resolve => setTimeout(resolve, 500)); // Delay non-critical requests
        }
      }
      
      // Continue with the fetch
      return originalFetch.apply(window, args);
    };
    
    console.log('Network optimizer initialized');
  }
};

// Helper to determine if a request is high priority
function isHighPriorityRequest(url: string): boolean {
  return url.includes('/api/') || url.includes('_next/data');
}

// Auto-init optimizers if we're in the browser
if (typeof window !== 'undefined') {
  setTimeout(() => {
    memoryOptimizer.init();
    networkOptimizer.init();
  }, 0);
}
