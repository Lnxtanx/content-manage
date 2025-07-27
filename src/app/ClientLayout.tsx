'use client';

import { useState, useEffect } from 'react';
import WebsiteLock from '@/components/WebsiteLock';

interface ClientLayoutProps {
  children: React.ReactNode;
}

export default function ClientLayout({ children }: ClientLayoutProps) {
  const [leftSidebarCollapsed, setLeftSidebarCollapsed] = useState(false);
  const [rightSidebarCollapsed, setRightSidebarCollapsed] = useState(false);
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Check if website is unlocked on component mount
  useEffect(() => {
    const checkUnlockStatus = () => {
      if (typeof window !== 'undefined') {
        const unlocked = sessionStorage.getItem('websiteUnlocked') === 'true' || 
                        localStorage.getItem('websiteUnlocked') === 'true';
        setIsUnlocked(unlocked);
      }
      setIsLoading(false);
    };

    checkUnlockStatus();
  }, []);

  // Listen for sidebar toggle events
  useEffect(() => {
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
  }, []);

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
    if (typeof document !== 'undefined') {
      document.body.className = bodyClassName;
    }
    return () => {
      if (typeof document !== 'undefined') {
        document.body.className = '';
      }
    };
  }, [bodyClassName]);

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
