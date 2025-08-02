'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  FaSchool, 
  FaChalkboardTeacher, 
  FaUserPlus, 
  FaBook,
  FaUpload,
  FaList,
  FaGraduationCap,
  FaBell,
  FaChevronLeft,
  FaChevronRight,
  FaInfoCircle,
  FaChartBar,
  FaServer,
  FaUserCog
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
    label: 'Reports',
    href: '/reports',
    icon: <FaChartBar />,
  },
  {
    label: 'FAQ',
    href: '/faq',
    icon: <FaBook />,
  },
];

// Memoized NavLink component for better performance
const NavLink = React.memo(({ 
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
        prefetch={false}
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
  const [leftSidebarCollapsed, setLeftSidebarCollapsed] = useState(false);
  const [rightSidebarCollapsed, setRightSidebarCollapsed] = useState(false);

  const toggleLeftSidebar = () => {
    const newState = !leftSidebarCollapsed;
    setLeftSidebarCollapsed(newState);
    
    // Dispatch custom event to notify layout
    const event = new CustomEvent('leftSidebarToggle', { 
      detail: { collapsed: newState }
    });
    window.dispatchEvent(event);
  };

  const toggleRightSidebar = () => {
    const newState = !rightSidebarCollapsed;
    setRightSidebarCollapsed(newState);
    
    // Dispatch custom event to notify layout
    const event = new CustomEvent('rightSidebarToggle', { 
      detail: { collapsed: newState }
    });
    window.dispatchEvent(event);
  };

  // Monitor network status
  useEffect(() => {
    const handleOnline = () => {
      console.log('Connection restored');
    };
    
    const handleOffline = () => {
      console.log('Connection lost, waiting to restore...');
    };
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
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
      <header className={`${styles.header} ${leftSidebarCollapsed ? styles.headerExpanded : ''} ${rightSidebarCollapsed ? '' : styles.headerWithRightSidebar}`}>
        <div className={styles.headerContent}>
          <div className={styles.headerLogo}>
            <FaGraduationCap size={24} />
            <span>Sportal Ed</span>
          </div>
          <div className={styles.headerRight}>
            <div className={styles.notificationSection}>
              <span className={styles.notificationLabel}>Notifications</span>
              <Link href="/notifications" className={styles.notificationIcon} title="Notifications">
                <FaBell size={22} />
              </Link>
            </div>
            <div className={styles.profileSection}>
              <Link href="/admin-settings" className={styles.profileIcon} title="Admin Settings">
                <FaUserCog size={22} />
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Left Sidebar */}
      <nav className={`${styles.nav} ${leftSidebarCollapsed ? styles.collapsed : ''}`}>
        <div className={styles.logoRow}>
          <Link href="/" className={styles.logo}>
            <FaGraduationCap size={24} />
            {!leftSidebarCollapsed && <span>Admin system</span>}
          </Link>
        </div>
        <button 
          className={styles.toggleButton} 
          onClick={toggleLeftSidebar}
          aria-label={leftSidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {leftSidebarCollapsed ? <FaChevronRight /> : <FaChevronLeft />}
        </button>
        <ul className={styles.navList}>
          {navItems.map((item) => (
            <NavLink
              key={item.href}
              href={item.href}
              isActive={pathname === item.href}
              icon={item.icon}
              label={leftSidebarCollapsed ? '' : item.label}
            />
          ))}
        </ul>
      </nav>

      {/* Right Sidebar */}
      <aside className={`${styles.rightSidebar} ${rightSidebarCollapsed ? styles.collapsed : ''}`}>
        <div className={styles.logoRow}>
          <Link href="/system-logs" className={styles.logo}>
            <FaGraduationCap size={24} />
            {!rightSidebarCollapsed && <span>User Activity</span>}
          </Link>
        </div>
        <button 
          className={styles.toggleButton} 
          onClick={toggleRightSidebar}
          aria-label={rightSidebarCollapsed ? "Expand right sidebar" : "Collapse right sidebar"}
        >
          {rightSidebarCollapsed ? <FaChevronLeft /> : <FaChevronRight />}
        </button>
        
        <ul className={styles.navList}>
          {/* User activity group */}
          {!rightSidebarCollapsed && (
            <li className={styles.navGroupTitle}>
              <div className={styles.groupDivider}>User Activity</div>
            </li>
          )}
          <li>
            <Link
              href="/user_activity/active-teachers"
              className={`${styles.navLink} ${pathname === '/user_activity/active-teachers' ? styles.active : ''}`}
            >
              <span className={styles.icon}><FaChalkboardTeacher /></span>
              {!rightSidebarCollapsed && "Active Teachers"}
            </Link>
          </li>
          <li>
            <Link
              href="/user_activity/active-principals"
              className={`${styles.navLink} ${pathname === '/user_activity/active-principals' ? styles.active : ''}`}
            >
              <span className={styles.icon}><FaGraduationCap /></span>
              {!rightSidebarCollapsed && "Active Principals"}
            </Link>
          </li>
        </ul>
      </aside>
    </>
  );
}

export default React.memo(Navigation);