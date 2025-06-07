'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import styles from './styles.module.css';
import { FaTrash, FaEdit } from 'react-icons/fa';

interface School {
  id: number;
  name: string;
  email: string;
  isActive: boolean;
  createdAt: string;
  _count: {
    teachers: number;
  };
}

export default function ViewSchools() {
  const [schools, setSchools] = useState<School[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deleteMessage, setDeleteMessage] = useState('');

  const fetchSchools = async () => {
    try {
      const response = await fetch('/api/school-registration');
      if (!response.ok) {
        throw new Error('Failed to fetch schools');
      }
      const data = await response.json();
      setSchools(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSchools();
  }, []);

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this school? This action cannot be undone.')) {
      return;
    }

    try {
      const response = await fetch(`/api/school-registration?id=${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete school');
      }

      setDeleteMessage('School deleted successfully');
      setTimeout(() => setDeleteMessage(''), 3000);
      fetchSchools(); // Refresh the list
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
        <h1 className={styles.title}>Registered Schools</h1>
        <Link href="/school-registration" className={styles.addButton}>
          Add New School
        </Link>
      </div>

      {deleteMessage && <div className={styles.success}>{deleteMessage}</div>}
      {error && <div className={styles.error}>{error}</div>}

      <div className={styles.tableContainer}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>School Name</th>
              <th>Email</th>
              <th>Status</th>
              <th>Teachers</th>
              <th>Registered Date</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {schools.map((school) => (
              <tr key={school.id}>
                <td>{school.name}</td>
                <td>{school.email}</td>
                <td>
                  <span className={`${styles.status} ${school.isActive ? styles.active : styles.inactive}`}>
                    {school.isActive ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td>{school._count.teachers}</td>
                <td>{new Date(school.createdAt).toLocaleDateString()}</td>
                <td className={styles.actions}>
                  <Link 
                    href={`/add-teacher?schoolId=${school.id}`} 
                    className={styles.actionButton}
                  >
                    Add Teacher
                  </Link>
                  <Link 
                    href={`/view-teachers?schoolId=${school.id}`} 
                    className={styles.actionButton}
                  >
                    View Teachers
                  </Link>
                  <button 
                    onClick={() => handleDelete(school.id)}
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
