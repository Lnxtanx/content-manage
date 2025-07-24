'use client';

import { memo, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import dynamic from 'next/dynamic';
import { memoryOptimizer, performanceMonitor } from '@/lib/performance-optimizer';
import { 
  FaSchool, 
  FaChalkboardTeacher, 
  FaUserPlus, 
  FaBook,
  FaUpload,
  FaList,
  FaGraduationCap,
  FaBell
} from 'react-icons/fa';
import styles from './Navigation.module.css';

const navItems = [
  {
    label: 'Dashboard',
    href: '/',
    icon: <FaGraduationCap />,
  },
  {
    label: 'Register School',
    href: '/school-registration',
    icon: <FaSchool />,
  },
  {
    label: 'View Schools',
    href: '/view-schools',
    icon: <FaSchool />,
  },
  {
    label: 'Add Teacher',
    href: '/add-teacher',
    icon: <FaUserPlus />,
  },
  {
    label: 'View Teachers',
    href: '/view-teachers',
    icon: <FaChalkboardTeacher />,
  },
  {
    label: 'Upload Syllabus',
    href: '/upload-syllabus',
    icon: <FaUpload />,
  },
  {
    label: 'View Syllabuses',
    href: '/view-syllabuses',
    icon: <FaBook />,
  },
  {
    label: 'Manage Classes',
    href: '/manage-classes',
    icon: <FaList />,
  },
  {
    label: 'Manage Subjects',
    href: '/manage-subject',
    icon: <FaBook />,
  },
  {
    label: 'Job Posts',
    href: '/job-posts',
    icon: <FaList />,
  },
  {
    label: 'FAQ',
    href: '/faq',
    icon: <FaBook />,
  },
];

// Memoized NavLink component for better performance
const NavLink = memo(({ 
  href, 
  isActive, 
  icon, 
  label 
}: { 
  href: string; 
  isActive: boolean; 
  icon: React.ReactNode; 
  label: string;
}) => {
  return (
    <li>
      <Link
        href={href}
        className={`${styles.navLink} ${isActive ? styles.active : ''}`}
        prefetch={false} // Disable prefetching for less important routes
      >
        <span className={styles.icon}>{icon}</span>
        {label}
      </Link>
    </li>
  );
});

NavLink.displayName = 'NavLink';

function Navigation() {
  const pathname = usePathname();

  // Refresh connection monitor
  useEffect(() => {
    performanceMonitor.start('navigation-render');
    
    // Monitor network status for potential refresh
    const handleOnline = () => {
      console.log('Connection restored');
    };
    
    const handleOffline = () => {
      console.log('Connection lost, waiting to restore...');
    };
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    // Implement memory optimization for this component
    memoryOptimizer.trackObject(navItems, { 
      type: 'navigation',
      component: 'Navigation'
    });
    
    performanceMonitor.end('navigation-render');
    
    // Clean up event listeners
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);
  
  // Auto-refresh on critical errors
  useEffect(() => {
    const handleError = (event: ErrorEvent) => {
      if (
        event.error?.toString().includes('ChunkLoadError') || 
        event.error?.toString().includes('Loading chunk') ||
        event.error?.toString().includes('Failed to fetch dynamically imported module')
      ) {
        console.error('Critical navigation error, refreshing application...');
        // Wait a moment before refreshing
        setTimeout(() => window.location.reload(), 1000);
      }
    };
    
    window.addEventListener('error', handleError);
    return () => window.removeEventListener('error', handleError);
  }, []);

  return (
    <>
      <header className={styles.header}>
        <div className={styles.headerContent}>
          <div className={styles.headerLogo}>
            <FaGraduationCap size={24} />
            <span>Sportal Foundation</span>
          </div>
          <div className={styles.headerRight}>
            <div className={styles.notificationSection}>
              <span className={styles.notificationLabel}>Notifications</span>
              <Link href="/notifications" className={styles.notificationIcon} title="Notifications">
                <FaBell size={22} />
              </Link>
            </div>
          </div>
        </div>
      </header>

      <nav className={styles.nav}>
        <div className={styles.logoRow}>
          <Link href="/" className={styles.logo}>
            <FaGraduationCap size={24} />
            <span>Admin system </span>
          </Link>
        </div>
        <ul className={styles.navList}>
          {navItems.map((item) => (
            <NavLink
              key={item.href}
              href={item.href}
              isActive={pathname === item.href}
              icon={item.icon}
              label={item.label}
            />
          ))}
        </ul>
      </nav>
    </>
  );
}

// Use memo to prevent unnecessary re-renders
export default memo(Navigation);