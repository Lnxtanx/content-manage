'use client';

import { useState, useEffect } from 'react';
import styles from './styles.module.css';

interface Class {
  id: number;
  name: string;
}

interface LessonPdf {
  id: number;
  lessonName: string;
  pdfUrl: string;
  schoolName: string;
  isGlobal: boolean;
}

export default function ViewSyllabuses() {
  const [classes, setClasses] = useState<Class[]>([]);
  const [selectedClass, setSelectedClass] = useState('');
  const [lessons, setLessons] = useState<LessonPdf[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Fetch classes
    fetch('/api/classes')
      .then((res) => res.json())
      .then((data) => setClasses(data))
      .catch((error) => console.error('Error fetching classes:', error));
  }, []);

  const fetchLessons = async (classId: string) => {
    setLoading(true);
    try {
      const response = await fetch(`/api/lessons?classId=${classId}`);
      const data = await response.json();
      setLessons(data);
    } catch (error) {
      console.error('Error fetching lessons:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleClassChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const classId = e.target.value;
    setSelectedClass(classId);
    if (classId) {
      fetchLessons(classId);
    } else {
      setLessons([]);
    }
  };

  const deleteLesson = async (lessonId: number) => {
    const confirmDelete = window.confirm('Are you sure you want to delete this lesson?');
    if (confirmDelete) {
      try {
        const response = await fetch(`/api/lessons/${lessonId}`, {
          method: 'DELETE',
        });

        if (response.ok) {
          setLessons(lessons.filter(lesson => lesson.id !== lessonId));
          alert('Lesson deleted successfully.');
        } else {
          alert('Failed to delete lesson.');
        }
      } catch (error) {
        console.error('Error deleting lesson:', error);
        alert('Error occurred while deleting the lesson.');
      }
    }
  };

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>View Syllabuses</h1>

      <div className={styles.formGroup}>
        <label htmlFor="class">Select Class</label>
        <select
          id="class"
          className={styles.formControl}
          value={selectedClass}
          onChange={handleClassChange}
        >
          <option value="">Select a class</option>
          {classes.map((cls) => (
            <option key={cls.id} value={cls.id}>
              {cls.name}
            </option>
          ))}
        </select>
      </div>

      {loading ? (
        <div className={styles.loading}>Loading lessons...</div>
      ) : lessons.length > 0 ? (
        <div className={styles.tableWrapper}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Lesson Name</th>
                <th>Availability</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {lessons.map((lesson) => (
                <tr key={lesson.id}>
                  <td>{lesson.lessonName}</td>
                  <td>
                    <span className={`${styles.badge} ${lesson.isGlobal ? styles.globalBadge : styles.schoolBadge}`}>
                      {lesson.isGlobal ? '👥 All Schools' : `📍 ${lesson.schoolName}`}
                    </span>
                  </td>
                  <td>
                    <a
                      href={lesson.pdfUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={styles.btn}
                    >
                      View PDF
                    </a>
                    <button
                      className={`${styles.btn} ${styles.deleteBtn}`}
                      onClick={() => deleteLesson(lesson.id)}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : selectedClass ? (
        <div className={styles.noData}>No lessons found for this class.</div>
      ) : null}
    </div>
  );
}
