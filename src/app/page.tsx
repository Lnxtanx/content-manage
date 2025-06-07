'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { FaSchool, FaChalkboardTeacher, FaUserPlus, FaUsers, FaUpload, FaBook, FaList, FaExclamationTriangle } from 'react-icons/fa';
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
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [schoolsRes, teachersRes] = await Promise.all([
          fetch('/api/school-registration'),
          fetch('/api/teacher-registration'),
        ]);

        const schools = await schoolsRes.json();
        const teachers = await teachersRes.json();

        setStats({
          schoolCount: schools.length,
          teacherCount: teachers.length,
        });
      } catch (error) {
        console.error('Error fetching stats:', error);
      }
    };

    fetchStats();
  }, []);

  return (
    <div className={styles.stats}>
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
      <CautionBanner />
      <div className={styles.header}>
        <h1 className={styles.title}> Management Dashboard</h1>
        <p className={styles.subtitle}>Manage schools, teachers, and more from one place</p>
      </div>

      <div className={styles.grid}>
        {cards.map((card, index) => (
          <DashboardCard key={index} {...card} />
        ))}
      </div>

      <div className={styles.statsContainer}>
        <div className={styles.statsCard}>
          <h3>Quick Stats</h3>
          <StatsDisplay />
        </div>
      </div>
    </div>
  );
}
