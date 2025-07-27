'use client';

import { useState, useEffect } from 'react';
import styles from '../styles.module.css';

interface TeacherSession {
  id: number;
  teacher_id: number;
  token: string;
  user_agent: string | null;
  ip_address: string | null;
  is_active: boolean;
  created_at: string;
  expires_at: string | null;
  last_activity: string;
  teachers: {
    teacherName: string;
    email: string;
    schools: {
      name: string;
    };
  };
}

export default function ActiveTeachers() {
  const [sessions, setSessions] = useState<TeacherSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSessions = async () => {
      try {
        const response = await fetch('/api/user_activity/active-teachers');
        if (!response.ok) {
          throw new Error('Failed to fetch sessions');
        }
        const data = await response.json();
        setSessions(data);
      } catch (error) {
        console.error('Error fetching sessions:', error);
        setError('Failed to load data. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchSessions();
  }, []);

  if (loading) {
    return <div className={styles.container}>Loading...</div>;
  }

  if (error) {
    return <div className={styles.container}><p className={styles.error}>{error}</p></div>;
  }

  // Safely render only when data is available
  return (
    <div className={styles.container}>
      <h1>Active Teachers</h1>
      {sessions && sessions.length > 0 ? (
        <div className={styles.queryContainer}>
          <table className={styles.queryTable}>
            <thead>
              <tr>
                <th>ID</th>
                <th>Teacher ID</th>
                <th>Teacher Name</th>
                <th>School</th>
                <th>Email</th>
                <th>Status</th>
                <th>Created At</th>
                <th>Expires At</th>
                <th>Last Activity</th>
                <th>IP Address</th>
                <th>User Agent</th>
              </tr>
            </thead>
            <tbody>
              {sessions.map((session) => (
                <tr key={session.id}>
                  <td>{session.id}</td>
                  <td>{session.teacher_id}</td>
                  <td>{session.teachers?.teacherName || 'N/A'}</td>
                  <td>{session.teachers?.schools?.name || 'N/A'}</td>
                  <td>{session.teachers?.email || 'N/A'}</td>
                  <td className={session.is_active ? styles.activeStatus : styles.inactiveStatus}>
                    {session.is_active ? 'Active' : 'Inactive'}
                  </td>
                  <td>{session.created_at ? new Date(session.created_at).toLocaleString() : 'N/A'}</td>
                  <td>{session.expires_at ? new Date(session.expires_at).toLocaleString() : 'N/A'}</td>
                  <td>{session.last_activity ? new Date(session.last_activity).toLocaleString() : 'N/A'}</td>
                  <td>{session.ip_address || 'N/A'}</td>
                  <td>{session.user_agent || 'N/A'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p>No active teachers found.</p>
      )}
    </div>
  );
}
