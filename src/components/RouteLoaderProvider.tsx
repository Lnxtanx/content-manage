"use client";
import { useEffect, useState, useCallback, memo } from 'react';
import { usePathname } from 'next/navigation';
import dynamic from 'next/dynamic';
import ErrorBoundary from '@/components/ErrorBoundary';
import { healthMonitor, componentHealth } from '@/lib/health-monitor';
import '@/lib/performance-types';

// Dynamically import Loader to prevent hydration issues
const Loader = dynamic(() => import('@/components/Loader'), {
  ssr: false,
  loading: () => null
});

// Track failed requests to implement automatic refresh
const failedRequestsThreshold = 3;
let consecutiveFailedRequests = 0;
let lastFailedTimestamp = 0;

// Memoized child components to prevent unnecessary re-renders
const MemoizedChildren = memo(
  ({ children }: { children: React.ReactNode }) => <>{children}</>,
  () => true // Always return true for maximum memoization
);

MemoizedChildren.displayName = 'MemoizedChildren';

export default function RouteLoaderProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [loading, setLoading] = useState(false);
  const [failedToLoad, setFailedToLoad] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Ensure component is mounted before doing any side effects
  useEffect(() => {
    setMounted(true);
  }, []);

  // Initialize health monitoring
  useEffect(() => {
    if (!mounted) return;

    try {
      // Start the health monitoring system
      healthMonitor.init();
      
      // Check for memory leaks
      const memoryCheckInterval = setInterval(() => {
        try {
          if (window.performance && window.performance.memory) {
            const usedHeapSizeMB = Math.round(window.performance.memory.usedJSHeapSize / (1024 * 1024));
            const totalHeapSizeMB = Math.round(window.performance.memory.totalJSHeapSize / (1024 * 1024));
            
            // If using too much memory, refresh the page
            if (usedHeapSizeMB > 150 || (totalHeapSizeMB > 0 && usedHeapSizeMB / totalHeapSizeMB > 0.85)) {
              console.warn(`Memory usage high (${usedHeapSizeMB}MB), refreshing application...`);
              healthMonitor.forceRefresh(1000);
            }
          }
        } catch (error) {
          console.error('Memory check error:', error);
        }
      }, 60000); // Check every minute
      
      return () => {
        clearInterval(memoryCheckInterval);
      };
    } catch (error) {
      console.error('Failed to initialize health monitoring:', error);
    }
  }, [mounted]);
  
  // Auto-refresh logic when too many failures occur
  useEffect(() => {
    if (!mounted) return;

    if (failedToLoad) {
      const currentTime = Date.now();
      
      // If failures happen too frequently, trigger a refresh
      if (currentTime - lastFailedTimestamp < 10000) { // 10 seconds
        consecutiveFailedRequests++;
      } else {
        consecutiveFailedRequests = 1;
      }
      
      lastFailedTimestamp = currentTime;
      
      // Auto refresh after threshold is reached
      if (consecutiveFailedRequests >= failedRequestsThreshold) {
        console.warn('Too many failures detected, refreshing application...');
        consecutiveFailedRequests = 0;
        try {
          healthMonitor.forceRefresh(1000);
        } catch (error) {
          console.error('Failed to force refresh:', error);
          window.location.reload();
        }
      }
    }
  }, [failedToLoad, mounted]);

  // Route change handler
  useEffect(() => {
    if (!mounted) return;

    // Reset failed state on route change
    setFailedToLoad(false);
    
    // Only show loader for actual route changes
    let isMounted = true;
    setLoading(true);
    
    // Optimize timeout with faster loading for returning visits
    // Browsers cache static assets, so we can reduce loading time for repeat visits
    const hasVisitedBefore = sessionStorage.getItem(`visited-${pathname}`);
    const loadTime = hasVisitedBefore ? 300 : 500; // Shorter time if returning to a route
    
    const timeout = setTimeout(() => {
      if (isMounted) {
        setLoading(false);
        try {
          sessionStorage.setItem(`visited-${pathname}`, 'true');
        } catch (error) {
          console.error('Failed to set session storage:', error);
        }
      }
    }, loadTime);
    
    return () => {
      isMounted = false;
      clearTimeout(timeout);
    };
  }, [pathname, mounted]);

  // Callback for manual refresh
  const handleRefresh = useCallback(() => {
    window.location.reload();
  }, []);

  // Don't render anything until mounted to prevent hydration mismatch
  if (!mounted) {
    return <MemoizedChildren>{children}</MemoizedChildren>;
  }

  return (
    <ErrorBoundary>
      {loading && <Loader />}
      {failedToLoad && (
        <div className="retry-overlay">
          <div className="retry-container">
            <h3>Connection issue detected</h3>
            <p>We're having trouble loading the page. Please try again.</p>
            <button onClick={handleRefresh} className="retry-button">
              Retry
            </button>
          </div>
          <style jsx>{`
            .retry-overlay {
              position: fixed;
              top: 0;
              left: 0;
              right: 0;
              bottom: 0;
              background: rgba(255,255,255,0.9);
              display: flex;
              align-items: center;
              justify-content: center;
              z-index: 1000;
            }
            .retry-container {
              padding: 2rem;
              background: white;
              border-radius: 8px;
              box-shadow: 0 4px 12px rgba(0,0,0,0.15);
              text-align: center;
              max-width: 400px;
            }
            .retry-button {
              background: #4CAF50;
              color: white;
              border: none;
              padding: 0.75rem 1.5rem;
              font-size: 1rem;
              border-radius: 4px;
              cursor: pointer;
              margin-top: 1rem;
            }
            .retry-button:hover {
              background: #45a049;
            }
          `}</style>
        </div>
      )}
      <MemoizedChildren>{children}</MemoizedChildren>
    </ErrorBoundary>
  );
}
