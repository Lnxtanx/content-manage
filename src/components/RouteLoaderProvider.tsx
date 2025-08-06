"use client";
import { useEffect, useState, memo } from 'react';
import { usePathname } from 'next/navigation';
import dynamic from 'next/dynamic';
import ErrorBoundary from '@/components/ErrorBoundary';

// Dynamically import Loader to prevent hydration issues
const Loader = dynamic(() => import('@/components/Loader'), {
  ssr: false,
  loading: () => null
});

// Memoized child components to prevent unnecessary re-renders
const MemoizedChildren = memo(
  ({ children }: { children: React.ReactNode }) => <>{children}</>,
  () => true // Always return true for maximum memoization
);

MemoizedChildren.displayName = 'MemoizedChildren';

export default function RouteLoaderProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [loading, setLoading] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Ensure component is mounted before doing any side effects
  useEffect(() => {
    setMounted(true);
  }, []);

  // Route change handler
  useEffect(() => {
    if (!mounted) return;
    
    // Only show loader for actual route changes
    let isMounted = true;
    setLoading(true);
    
    // Simple loading timeout
    const timeout = setTimeout(() => {
      if (isMounted) {
        setLoading(false);
      }
    }, 300);
    
    return () => {
      isMounted = false;
      clearTimeout(timeout);
    };
  }, [pathname, mounted]);

  // Don't render anything until mounted to prevent hydration mismatch
  if (!mounted) {
    return <MemoizedChildren>{children}</MemoizedChildren>;
  }

  return (
    <ErrorBoundary>
      {loading && <Loader />}
      <MemoizedChildren>{children}</MemoizedChildren>
    </ErrorBoundary>
  );
}
