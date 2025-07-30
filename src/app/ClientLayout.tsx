'use client';

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';

// Dynamically import WebsiteLock to prevent hydration issues
const WebsiteLock = dynamic(() => import('@/components/WebsiteLock'), {
  ssr: false,
  loading: () => (
    <div style={{ 
      position: 'fixed', 
      top: 0, 
      left: 0, 
      right: 0, 
      bottom: 0, 
      background: '#f5f5f5', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center' 
    }}>
      <div>Loading...</div>
    </div>
  )
});

interface ClientLayoutProps {
  children: React.ReactNode;
}

export default function ClientLayout({ children }: ClientLayoutProps) {
  const [leftSidebarCollapsed, setLeftSidebarCollapsed] = useState(false);
  const [rightSidebarCollapsed, setRightSidebarCollapsed] = useState(false);
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [mounted, setMounted] = useState(false);

  // Ensure component is mounted before checking unlock status
  useEffect(() => {
    setMounted(true);
  }, []);

  // Check if website is unlocked on component mount
  useEffect(() => {
    if (!mounted) return;

    const checkUnlockStatus = () => {
      try {
        if (typeof window !== 'undefined') {
          const unlocked = sessionStorage.getItem('websiteUnlocked') === 'true' || 
                          localStorage.getItem('websiteUnlocked') === 'true';
          setIsUnlocked(unlocked);
        }
      } catch (error) {
        console.error('Error checking unlock status:', error);
        setIsUnlocked(false);
      } finally {
        setIsLoading(false);
      }
    };

    checkUnlockStatus();
  }, [mounted]);

  // Listen for sidebar toggle events
  useEffect(() => {
    if (!mounted) return;

    const handleLeftSidebarToggle = (e: CustomEvent) => {
      setLeftSidebarCollapsed(e.detail.collapsed);
    };
    
    const handleRightSidebarToggle = (e: CustomEvent) => {
      setRightSidebarCollapsed(e.detail.collapsed);
    };
    
    window.addEventListener('leftSidebarToggle' as any, handleLeftSidebarToggle as any);
    window.addEventListener('rightSidebarToggle' as any, handleRightSidebarToggle as any);
    
    return () => {
      window.removeEventListener('leftSidebarToggle' as any, handleLeftSidebarToggle as any);
      window.removeEventListener('rightSidebarToggle' as any, handleRightSidebarToggle as any);
    };
  }, [mounted]);

  const handleUnlock = () => {
    setIsUnlocked(true);
  };

  // Generate class names for the body based on sidebar states
  const bodyClassName = [
    leftSidebarCollapsed ? 'leftSidebarCollapsed' : '',
    rightSidebarCollapsed ? 'rightSidebarCollapsed' : '',
  ].filter(Boolean).join(' ');

  // Apply classes to the body element directly using useEffect
  useEffect(() => {
    if (!mounted) return;

    try {
      if (typeof document !== 'undefined') {
        document.body.className = bodyClassName;
      }
    } catch (error) {
      console.error('Error setting body className:', error);
    }

    return () => {
      try {
        if (typeof document !== 'undefined') {
          document.body.className = '';
        }
      } catch (error) {
        console.error('Error clearing body className:', error);
      }
    };
  }, [bodyClassName, mounted]);

  // Don't render anything until mounted to prevent hydration mismatch
  if (!mounted) {
    return null;
  }

  // Show loading or lock screen
  if (isLoading) {
    return (
      <div style={{ 
        position: 'fixed', 
        top: 0, 
        left: 0, 
        right: 0, 
        bottom: 0, 
        background: '#f5f5f5', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center' 
      }}>
        <div>Loading...</div>
      </div>
    );
  }

  if (!isUnlocked) {
    return <WebsiteLock onUnlock={handleUnlock} />;
  }

  return <>{children}</>;
}
