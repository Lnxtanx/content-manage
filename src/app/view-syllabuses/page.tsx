'use client';

import { useState, useEffect } from 'react';
import styles from './styles.module.css';

interface Class {
  id: number;
  name: string;
}

interface Subject {
  id: number;
  name: string;
}

interface LessonPdf {
  id: number;
  lessonName: string;
  pdfUrl: string;
  schoolName: string;
  className: string;
  subjectName: string;
  isGlobal: boolean;
  lessonoutcomes?: string | null;
  lessonobjectives?: string | null;
}

export default function ViewSyllabuses() {
  const [classes, setClasses] = useState<Class[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [lessons, setLessons] = useState<LessonPdf[]>([]);
  const [filteredLessons, setFilteredLessons] = useState<LessonPdf[]>([]);
  const [filters, setFilters] = useState({
    subject: '',
    class: ''
  });
  const [loading, setLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingLesson, setEditingLesson] = useState<LessonPdf | null>(null);

  useEffect(() => {
    // Fetch classes and subjects
    Promise.all([
      fetch('/api/classes').then(res => res.json()),
      fetch('/api/teacher-registration/subject-list').then(res => res.json())
    ])
      .then(([classesData, subjectsData]) => {
        setClasses(classesData);
        setSubjects(subjectsData);
      })
      .catch(error => console.error('Error fetching data:', error));

    // Fetch all lessons
    fetchAllLessons();
  }, []);
  
  // Apply filters when they change
  useEffect(() => {
    if (!lessons.length) return;
    
    const filtered = lessons.filter(lesson => {
      const matchesSubject = !filters.subject || lesson.subjectName === filters.subject;
      const matchesClass = !filters.class || lesson.className === filters.class;
      return matchesSubject && matchesClass;
    });
    
    setFilteredLessons(filtered);
  }, [filters, lessons]);

  const fetchAllLessons = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/lessons/all');
      if (response.ok) {
        const data = await response.json();
        setLessons(data);
        setFilteredLessons(data);
      } else {
        console.error('Failed to fetch lessons');
      }
    } catch (error) {
      console.error('Error fetching lessons:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (field: 'subject' | 'class', value: string) => {
    setFilters(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const editLesson = (lesson: LessonPdf) => {
    setEditingLesson(lesson);
    setIsEditing(true);
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingLesson) return;
    
    setLoading(true);
    try {
      const response = await fetch(`/api/lessons/${editingLesson.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          lessonName: editingLesson.lessonName,
          lessonoutcomes: editingLesson.lessonoutcomes,
          lessonobjectives: editingLesson.lessonobjectives,
        }),
      });

      if (response.ok) {
        // Update the lessons state with edited lesson
        const updatedLessons = lessons.map(lesson => 
          lesson.id === editingLesson.id ? { ...lesson, ...editingLesson } : lesson
        );
        setLessons(updatedLessons);
        setIsEditing(false);
        setEditingLesson(null);
        alert('Lesson updated successfully!');
      } else {
        alert('Failed to update lesson.');
      }
    } catch (error) {
      console.error('Error updating lesson:', error);
      alert('Error occurred while updating the lesson.');
    } finally {
      setLoading(false);
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
    <>
      <h1 className={styles.title}>View Syllabuses</h1>

      <div className={styles.filterSection}>
        <div className={styles.filterItem}>
          <label htmlFor="subject">Filter by Subject</label>
          <select
            id="subject"
            className={styles.formControl}
            value={filters.subject}
            onChange={(e) => handleFilterChange('subject', e.target.value)}
          >
            <option value="">All Subjects</option>
            {subjects.map((subject) => (
              <option key={subject.id} value={subject.name}>
                {subject.name}
              </option>
            ))}
          </select>
        </div>

        <div className={styles.filterItem}>
          <label htmlFor="class">Filter by Class</label>
          <select
            id="class"
            className={styles.formControl}
            value={filters.class}
            onChange={(e) => handleFilterChange('class', e.target.value)}
          >
            <option value="">All Classes</option>
            {classes.map((cls) => (
              <option key={cls.id} value={cls.name}>
                {cls.name}
              </option>
            ))}
          </select>
        </div>
        
        <div className={styles.filterItem} style={{ display: 'flex', alignItems: 'flex-end' }}>
          <button 
            className={styles.clearButton} 
            onClick={() => setFilters({ subject: '', class: '' })}
            style={{ marginTop: '1.5rem' }}
          >
            Clear Filters
          </button>
        </div>
      </div>

      {loading ? (
        <div className={styles.loading}>Loading syllabuses...</div>
      ) : filteredLessons.length > 0 ? (
        <div className={styles.tableContainer}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th style={{width: '15%'}}>Name</th>
                <th style={{width: '8%'}}>Class</th>
                <th style={{width: '10%'}}>Subject</th>
                <th style={{width: '12%'}}>Availability</th>
                <th style={{width: '20%'}}>Objectives</th>
                <th style={{width: '20%'}}>Outcomes</th>
                <th style={{width: '15%'}}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredLessons.map((lesson) => (
                <tr key={lesson.id}>
                  <td>{lesson.lessonName}</td>
                  <td>{lesson.className}</td>
                  <td>{lesson.subjectName}</td>
                  <td>
                    <span className={`${styles.schoolBadge} ${lesson.isGlobal ? styles.allSchools : styles.schoolSpecific}`}>
                      {lesson.isGlobal ? '👥 All Schools' : `📍 ${lesson.schoolName}`}
                    </span>
                  </td>
                  <td>
                    <div className={styles.textCellContent}>
                      {lesson.lessonobjectives || 'Not specified'}
                    </div>
                  </td>
                  <td>
                    <div className={styles.textCellContent}>
                      {lesson.lessonoutcomes || 'Not specified'}
                    </div>
                  </td>
                  <td>
                    <div className={styles.actionButtons}>
                      <a
                        href={lesson.pdfUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={styles.btn}
                      >
                        PDF
                      </a>
                      <button
                        className={`${styles.btn} ${styles.editBtn}`}
                        onClick={() => editLesson(lesson)}
                      >
                        Edit
                      </button>
                      <button
                        className={`${styles.btn} ${styles.deleteBtn}`}
                        onClick={() => deleteLesson(lesson.id)}
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className={styles.noData}>
          {filters.subject || filters.class 
            ? 'No syllabuses found with the selected filters.' 
            : 'No syllabuses available.'}
        </div>
      )}

      {/* Edit Modal */}
      {isEditing && editingLesson && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal}>
            <div className={styles.modalHeader}>
              <h3>Edit Lesson</h3>
              <button 
                className={styles.closeBtn} 
                onClick={() => {setIsEditing(false); setEditingLesson(null);}}
              >
                &times;
              </button>
            </div>
            <form onSubmit={handleEditSubmit}>
              <div className={styles.formGroup}>
                <label>Lesson Name</label>
                <input 
                  type="text"
                  className={styles.formControl}
                  value={editingLesson.lessonName}
                  onChange={(e) => setEditingLesson({...editingLesson, lessonName: e.target.value})}
                  required
                />
              </div>
              <div className={styles.formGroup}>
                <label>Lesson Objectives</label>
                <textarea 
                  className={styles.formControl}
                  value={editingLesson.lessonobjectives || ''}
                  onChange={(e) => setEditingLesson({...editingLesson, lessonobjectives: e.target.value})}
                  rows={3}
                />
              </div>
              <div className={styles.formGroup}>
                <label>Lesson Outcomes</label>
                <textarea 
                  className={styles.formControl}
                  value={editingLesson.lessonoutcomes || ''}
                  onChange={(e) => setEditingLesson({...editingLesson, lessonoutcomes: e.target.value})}
                  rows={3}
                />
              </div>
              <div className={styles.modalActions}>
                <button 
                  type="button" 
                  className={styles.cancelBtn}
                  onClick={() => {setIsEditing(false); setEditingLesson(null);}}
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className={styles.saveBtn}
                  disabled={loading}
                >
                  {loading ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
