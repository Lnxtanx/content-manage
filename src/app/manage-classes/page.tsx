'use client';

import { useState, useEffect } from 'react';
import styles from './styles.module.css';

interface Class {
  id: number;
  name: string;
}

export default function ManageClasses() {
  const [classes, setClasses] = useState<Class[]>([]);
  const [newClassName, setNewClassName] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchClasses();
  }, []);

  const fetchClasses = async () => {
    try {
      const response = await fetch('/api/classes');
      const data = await response.json();
      setClasses(data);
    } catch (error) {
      console.error('Error fetching classes:', error);
      setMessage('Failed to fetch classes');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      const response = await fetch('/api/classes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name: newClassName }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage('✓ Class created successfully!');
        setNewClassName('');
        fetchClasses(); // Refresh the class list
      } else {
        setMessage(`Error: ${data.error || 'Failed to create class'}`);
      }
    } catch (error) {
      setMessage('Error: Network error or server not responding');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <h1 className={styles.header}>Manage Classes</h1>
      
      {message && (
        <div className={`${styles.message} ${message.includes('✓') ? styles.success : styles.error}`}>
          {message}
        </div>
      )}

      <form onSubmit={handleSubmit} className={styles.form}>
        <div className={styles.formGroup}>
          <label htmlFor="className">New Class Name</label>
          <input
            type="text"
            id="className"
            className={styles.formControl}
            value={newClassName}
            onChange={(e) => setNewClassName(e.target.value)}
            required
            placeholder="Enter class name (e.g., Class 1, Class 2)"
          />
        </div>

        <button
          type="submit"
          className={`${styles.btn} ${loading ? styles.loading : ''}`}
          disabled={loading}
        >
          {loading ? 'Creating...' : 'Create Class'}
        </button>
      </form>

      <div className={styles.classesContainer}>
        <h2>Existing Classes</h2>
        {classes.length > 0 ? (
          <ul className={styles.classList}>
            {classes.map((cls) => (
              <li key={cls.id} className={styles.classItem}>
                {cls.name}
              </li>
            ))}
          </ul>
        ) : (
          <p className={styles.noClasses}>No classes found.</p>
        )}
      </div>
    </div>
  );
}
