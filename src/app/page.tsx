'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { FaSchool, FaChalkboardTeacher, FaUserPlus, FaUsers, FaUpload, FaBook, FaList, FaExclamationTriangle } from 'react-icons/fa';
// Import CSS normally
import styles from './dashboard.module.css';

const CautionBanner = () => (
  <div className={styles.cautionBanner}>
    <FaExclamationTriangle className={styles.cautionIcon} />
    <div className={styles.cautionContent}>
      <h2>⚠️ Important Notice</h2>
      <p>Please exercise caution when managing data in this system. Once data is deleted from the database, it <strong>cannot be retrieved</strong>. Make sure to double-check before performing any deletion operations.</p>
    </div>
  </div>
);

const DashboardCard = ({ title, description, icon, link }: {
  title: string;
  description: string;
  icon: React.ReactNode;
  link: string;
}) => (
  <Link href={link} className={styles.card}>
    <div className={styles.cardIcon}>{icon}</div>
    <h3 className={styles.cardTitle}>{title}</h3>
    <p className={styles.cardDescription}>{description}</p>
  </Link>
);

function StatsDisplay() {
  const [stats, setStats] = useState({ 
    schoolCount: 0,
    teacherCount: 0,
    classCount: 0,
    subjectCount: 0,
    lessonCount: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    const fetchStats = async () => {
      setLoading(true);
      try {
        // Create a new endpoint that will fetch all stats in one request
        const statsRes = await fetch('/api/dashboard-stats');
        if (statsRes.ok) {
          const statsData = await statsRes.json();
          setStats({
            schoolCount: statsData.schoolCount || 0,
            teacherCount: statsData.teacherCount || 0,
            classCount: statsData.classCount || 0,
            subjectCount: statsData.subjectCount || 0,
            lessonCount: statsData.lessonCount || 0,
          });
        } else {
          // Fallback to individual requests if the combined endpoint fails
          // Fetch schools
          const schoolsRes = await fetch('/api/school-registration');
          const schoolsData = schoolsRes.ok ? await schoolsRes.json() : [];
          const schoolCount = Array.isArray(schoolsData) ? schoolsData.length : 0;
          
          // Fetch teachers - using a more direct approach to avoid issues
          const teachersRes = await fetch('/api/teacher-registration');
          const teachersData = teachersRes.ok ? await teachersRes.json() : [];
          const teacherCount = Array.isArray(teachersData) ? teachersData.length : 0;
          
          // Get classes count
          const classesRes = await fetch('/api/classes');
          const classesData = classesRes.ok ? await classesRes.json() : [];
          const classCount = Array.isArray(classesData) ? classesData.length : 0;
          
          // Get subjects count
          const subjectsRes = await fetch('/api/manage-subject');
          const subjectsData = subjectsRes.ok ? await subjectsRes.json() : [];
          const subjectCount = Array.isArray(subjectsData) ? subjectsData.length : 0;
          
          // Get lessons count
          const lessonsRes = await fetch('/api/lessons/all');
          const lessonsData = lessonsRes.ok ? await lessonsRes.json() : [];
          const lessonCount = Array.isArray(lessonsData) ? lessonsData.length : 0;
          
          setStats({
            schoolCount,
            teacherCount,
            classCount,
            subjectCount,
            lessonCount,
          });
        }
      } catch (error) {
        console.error('Error fetching stats:', error);
        setError(true);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  return (
    <div className={styles.stats}>
      {loading ? (
        <div className={styles.loading}>Loading stats...</div>
      ) : (
        <>
          <div className={styles.statItem}>
            <FaSchool size={20} />
            <span>{stats.schoolCount}</span>
            <p>Schools</p>
          </div>
          <div className={styles.statItem}>
            <FaUsers size={20} />
            <span>{stats.teacherCount}</span>
            <p>Teachers</p>
          </div>
          <div className={styles.statItem}>
            <FaList size={20} />
            <span>{stats.classCount}</span>
            <p>Classes</p>
          </div>
          <div className={styles.statItem}>
            <FaBook size={20} />
            <span>{stats.subjectCount}</span>
            <p>Subjects</p>
          </div>
          <div className={styles.statItem}>
            <FaUpload size={20} />
            <span>{stats.lessonCount}</span>
            <p>Lessons</p>
          </div>
        </>
      )}
    </div>
  );
}

export default function Home() {  const cards = [
    {
      title: 'Register School',
      description: 'Add a new school to the system',
      icon: <FaSchool size={24} />,
      link: '/school-registration',
    },
    {
      title: 'View Schools',
      description: 'Manage and view all registered schools',
      icon: <FaSchool size={24} />,
      link: '/view-schools',
    },
    {
      title: 'Add Teacher',
      description: 'Register a new teacher to a school',
      icon: <FaUserPlus size={24} />,
      link: '/add-teacher',
    },
    {
      title: 'View Teachers',
      description: 'Manage and view all registered teachers',
      icon: <FaChalkboardTeacher size={24} />,
      link: '/view-teachers',
    },
    {
      title: 'Upload Syllabus',
      description: 'Upload a new syllabus PDF',
      icon: <FaUpload size={24} />,
      link: '/upload-syllabus',
    },
    {
      title: 'View Syllabuses',
      description: 'View and manage uploaded syllabuses',
      icon: <FaBook size={24} />,
      link: '/view-syllabuses',
    },
    {
      title: 'Manage Classes',
      description: 'Add and manage school classes',
      icon: <FaList size={24} />,
      link: '/manage-classes',
    }
  ];

  return (
    <div className={styles.container}>
      {/* All content will be positioned on top of the background logo */}
      <div style={{ position: 'relative', zIndex: 1 }}>
        <div className={styles.logoContainer}>
          <img 
            src="/Sportal corporate logo 2.png" 
            alt="Sportal Foundation Logo" 
            className={styles.logo}
          />
        </div>
        
        <div className={styles.statsContainer}>
          <div className={styles.statsCard}>
            <h3>Quick Stats</h3>
            <StatsDisplay />
          </div>
        </div>

        <div className={styles.grid}>
          {cards.map((card, index) => (
            <DashboardCard key={index} {...card} />
          ))}
        </div>
      </div>
    </div>
  );
}
