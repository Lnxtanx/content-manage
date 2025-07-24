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

export default function UploadSyllabus() {
  const [classes, setClasses] = useState<Class[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('');
  const [lessonName, setLessonName] = useState('');
  const [lessonOutcomes, setLessonOutcomes] = useState('');
  const [lessonObjectives, setLessonObjectives] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [isGlobalSyllabus, setIsGlobalSyllabus] = useState(true);

  useEffect(() => {
    // Fetch classes and subjects in parallel
    Promise.all([
      fetch('/api/classes').then(res => res.json()),
      fetch('/api/teacher-registration/subject-list').then(res => res.json())
    ])
      .then(([classesData, subjectsData]) => {
        setClasses(classesData);
        setSubjects(subjectsData);
      })
      .catch(error => console.error('Error fetching data:', error));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedClass || !selectedSubject || !lessonName || !file) {
      setMessage('Please fill in all required fields');
      setTimeout(() => setMessage(''), 5000);
      return;
    }

    if (!file.type.includes('pdf')) {
      setMessage('Please upload a PDF file only');
      setTimeout(() => setMessage(''), 5000);
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setMessage('File size should be less than 10MB');
      setTimeout(() => setMessage(''), 5000);
      return;
    }

    setLoading(true);
    setMessage('');
    
    const formData = new FormData();
    formData.append('classId', selectedClass);
    formData.append('lessonName', lessonName);
    formData.append('subject_id', selectedSubject);
    formData.append('lessonoutcomes', lessonOutcomes);
    formData.append('lessonobjectives', lessonObjectives);
    formData.append('file', file);
    formData.append('isForAllSchools', isGlobalSyllabus.toString());

    try {
      const response = await fetch('/api/upload-syllabus', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (response.ok) {
        setMessage('✓ Syllabus uploaded successfully!');
        setSelectedClass('');
        setSelectedSubject('');
        setLessonName('');
        setLessonOutcomes('');
        setLessonObjectives('');
        setFile(null);
        setIsGlobalSyllabus(true);
        setTimeout(() => setMessage(''), 5000);

        const fileInput = document.getElementById('file') as HTMLInputElement;
        if (fileInput) fileInput.value = '';
      } else {
        setMessage(`Error: ${data.error || 'Failed to upload syllabus'}`);
        setTimeout(() => setMessage(''), 5000);
      }
    } catch (error) {
      setMessage('Error: Network error or server not responding');
      setTimeout(() => setMessage(''), 5000);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <h1 className={styles.header}>Upload Syllabus</h1>
      {message && (
        <div className={`${styles.message} ${message.includes('✓') ? styles.success : styles.error}`}>
          {message}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className={styles.formRow}>
          <div className={styles.formGroup}>
            <label htmlFor="class">Select Class</label>
            <select
              id="class"
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
              required
              className={styles.select}
            >
              <option value="">Select a class</option>
              {classes.map((cls) => (
                <option key={cls.id} value={cls.id}>
                  {cls.name}
                </option>
              ))}
            </select>
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="subject">Select Subject</label>
            <select
              id="subject"
              value={selectedSubject}
              onChange={(e) => setSelectedSubject(e.target.value)}
              required
              className={styles.select}
            >
              <option value="">Select a subject</option>
              {subjects.map((subject) => (
                <option key={subject.id} value={subject.id}>
                  {subject.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="lessonName">Lesson Name</label>
          <input
            type="text"
            id="lessonName"
            value={lessonName}
            onChange={(e) => setLessonName(e.target.value)}
            required
            className={styles.input}
            placeholder="Enter lesson name"
          />
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="lessonObjectives">Lesson Objectives</label>
          <textarea
            id="lessonObjectives"
            value={lessonObjectives}
            onChange={(e) => setLessonObjectives(e.target.value)}
            className={styles.textarea}
            placeholder="Enter lesson objectives"
            rows={3}
          />
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="lessonOutcomes">Lesson Outcomes</label>
          <textarea
            id="lessonOutcomes"
            value={lessonOutcomes}
            onChange={(e) => setLessonOutcomes(e.target.value)}
            className={styles.textarea}
            placeholder="Enter expected learning outcomes"
            rows={3}
          />
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="file">Upload PDF (max 10MB)</label>
          <input
            type="file"
            id="file"
            accept=".pdf"
            onChange={(e) => setFile(e.target.files?.[0] || null)}
            required
            className={styles.fileInput}
          />
        </div>

        <div className={styles.formGroup}>
          <label className={styles.checkbox}>
            <input
              type="checkbox"
              checked={isGlobalSyllabus}
              onChange={(e) => setIsGlobalSyllabus(e.target.checked)}
            />
            Make this syllabus available to all schools
          </label>
        </div>

        <button type="submit" disabled={loading} className={styles.button}>
          {loading ? 'Uploading...' : 'Upload Syllabus'}
        </button>
      </form>
    </div>
  );
}
