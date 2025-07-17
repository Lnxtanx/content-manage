'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  FaSchool, 
  FaChalkboardTeacher, 
  FaUserPlus, 
  FaUsers,
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

export default function Navigation() {
  const pathname = usePathname();

  return (
    <nav className={styles.nav}>
      <div className={styles.logoRow}>
        <div className={styles.logo}>
          <FaGraduationCap size={24} />
          <span>Management system </span>
        </div>
        <Link href="/notifications" className={styles.notificationIcon} title="Notifications">
          <FaBell size={22} />
        </Link>
      </div>
      <ul className={styles.navList}>
        {navItems.map((item) => (
          <li key={item.href}>
            <Link
              href={item.href}
              className={`${styles.navLink} ${
                pathname === item.href ? styles.active : ''
              }`}
            >
              <span className={styles.icon}>{item.icon}</span>
              {item.label}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
