'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { FaTrash } from 'react-icons/fa';
import styles from './styles.module.css';

interface Teacher {
  id: number;
  teacherName: string;
  email: string;
  qualification: string | null;
  subjectAssigned: string | null;
  classAssigned: string | null;
  experienceYears: number | null;
  status: string;
  schools: {
    name: string;
  };
}

export default function ViewTeachers() {
  const searchParams = useSearchParams();
  const schoolId = searchParams.get('schoolId');

  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deleteMessage, setDeleteMessage] = useState('');

  const fetchTeachers = async () => {
    try {
      const url = schoolId 
        ? `/api/teacher-registration?schoolId=${schoolId}`
        : '/api/teacher-registration';
      
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error('Failed to fetch teachers');
      }
      const data = await response.json();
      setTeachers(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTeachers();
  }, [schoolId]);

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this teacher? This action cannot be undone.')) {
      return;
    }

    try {
      const response = await fetch(`/api/teacher-registration?id=${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete teacher');
      }

      setDeleteMessage('Teacher deleted successfully');
      setTimeout(() => setDeleteMessage(''), 3000);
      fetchTeachers(); // Refresh the list
    } catch (err: any) {
      setError(err.message);
      setTimeout(() => setError(''), 3000);
    }
  };

  if (loading) {
    return <div className={styles.loading}>Loading...</div>;
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>
          {schoolId ? 'School Teachers' : 'All Teachers'}
        </h1>
        <Link href="/add-teacher" className={styles.addButton}>
          Add New Teacher
        </Link>
      </div>

      {deleteMessage && <div className={styles.success}>{deleteMessage}</div>}
      {error && <div className={styles.error}>{error}</div>}

      <div className={styles.tableContainer}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Teacher Name</th>
              <th>School</th>
              <th>Email</th>
              <th>Qualification</th>
              <th>Subject</th>
              <th>Class</th>
              <th>Experience (Years)</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {teachers.map((teacher) => (
              <tr key={teacher.id}>
                <td>{teacher.teacherName}</td>
                <td>{teacher.schools.name}</td>
                <td>{teacher.email}</td>
                <td>{teacher.qualification || '-'}</td>
                <td>{teacher.subjectAssigned || '-'}</td>
                <td>{teacher.classAssigned || '-'}</td>
                <td>{teacher.experienceYears || '-'}</td>
                <td>
                  <span className={`${styles.status} ${teacher.status === 'active' ? styles.active : styles.inactive}`}>
                    {teacher.status}
                  </span>
                </td>
                <td>
                  <button 
                    onClick={() => handleDelete(teacher.id)}
                    className={styles.deleteButton}
                  >
                    <FaTrash /> Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
