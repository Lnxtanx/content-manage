'use client';

import { useState, useEffect } from 'react';
import styles from './styles.module.css';

interface School {
  id: number;
  schoolName: string;
}

interface Class {
  id: number;
  name: string;
}

export default function Home() {
  const [schools, setSchools] = useState<School[]>([]);
  const [classes, setClasses] = useState<Class[]>([]);
  const [selectedSchool, setSelectedSchool] = useState('');
  const [selectedClass, setSelectedClass] = useState('');
  const [lessonName, setLessonName] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    // Fetch schools
    fetch('/api/schools')
      .then((res) => res.json())
      .then((data) => setSchools(data))
      .catch((error) => console.error('Error fetching schools:', error));

    // Fetch classes
    fetch('/api/classes')
      .then((res) => res.json())
      .then((data) => setClasses(data))
      .catch((error) => console.error('Error fetching classes:', error));
  }, []);
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form fields
    if (!selectedSchool || !selectedClass || !lessonName || !file) {
      setMessage('Please fill in all fields');
      setTimeout(() => setMessage(''), 5000); // Clear message after 5 seconds
      return;
    }

    // Validate file type
    if (!file.type.includes('pdf')) {
      setMessage('Please upload a PDF file only');
      setTimeout(() => setMessage(''), 5000);
      return;
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      setMessage('File size should be less than 10MB');
      setTimeout(() => setMessage(''), 5000);
      return;
    }

    setLoading(true);
    setMessage('');    const formData = new FormData();
    formData.append('schoolId', selectedSchool === 'all' ? '' : selectedSchool);
    formData.append('isForAllSchools', selectedSchool === 'all' ? 'true' : 'false');
    formData.append('classId', selectedClass);
    formData.append('lessonName', lessonName);
    formData.append('file', file);

    try {
      const response = await fetch('/api/upload-syllabus', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (response.ok) {
        setMessage('✓ Syllabus uploaded successfully!');
        // Reset form
        setSelectedSchool('');
        setSelectedClass('');
        setLessonName('');
        setFile(null);
        // Clear success message after 5 seconds
        setTimeout(() => setMessage(''), 5000);
        
        // Reset file input
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
        <div className={`${styles.message} ${message.includes('success') ? styles.success : styles.error}`}>
          {message}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className={styles.formGroup}>
          <label htmlFor="school">Select School</label>
          <select
            id="school"
            className={styles.formControl}
            value={selectedSchool}
            onChange={(e) => setSelectedSchool(e.target.value)}
            required
          >
            <option value="">Select a school</option>
            <option value="all">All Schools</option>
            {schools.map((school) => (
              <option key={school.id} value={school.id}>
                {school.schoolName}
              </option>
            ))}
          </select>
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="class">Select Class</label>
          <select
            id="class"
            className={styles.formControl}
            value={selectedClass}
            onChange={(e) => setSelectedClass(e.target.value)}
            required
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
          <label htmlFor="lessonName">Lesson Name</label>
          <input
            type="text"
            id="lessonName"
            className={styles.formControl}
            value={lessonName}
            onChange={(e) => setLessonName(e.target.value)}
            required
          />
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="file">Upload PDF</label>
          <input
            type="file"
            id="file"
            className={styles.formControl}
            accept="application/pdf"
            onChange={(e) => setFile(e.target.files?.[0] || null)}
            required
          />
        </div>
        <button 
          type="submit" 
          className={`${styles.btn} ${loading ? styles.loading : ''}`} 
          disabled={loading}
        >
          {loading ? 'Uploading...' : 'Upload Syllabus'}
        </button>
      </form>
    </div>
  );
}
