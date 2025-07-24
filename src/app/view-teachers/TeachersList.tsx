'use client';
import { useState, useMemo } from 'react';
import Link from 'next/link';
import { FaTrash } from 'react-icons/fa';
import styles from './styles.module.css';

interface Teacher {
  id: number;
  teacherName: string;
  email: string;
  qualification: string | null;
  experienceYears: number | null;
  status: string;
  dob: Date; // Changed from string to Date to match schema
  phone_number: string | null;
  aadhaar_number: string | null;
  profileImage: string | null;
  assignedclasses?: string[];
  assignedsections?: string[];
  schools: {
    id: number;
    name: string;
  };
  teacher_class_subject: Array<{
    id: number;
    teacher_id: number;
    subject_id: number;
    class_id: number;
    subject: {
      id: number;
      name: string;
      code?: string | null;
    };
    Class: {
      id: number;
      name: string;
    };
  }>;
}

interface School {
  id: number;
  name: string;
}

interface Subject {
  id: number;
  name: string;
}

interface Class {
  id: number;
  name: string;
}

interface TeachersListProps {
  initialTeachers: Teacher[];
  schools: School[];
  subjects: Subject[];
  classes: Class[];
}

export default function TeachersList({ initialTeachers, schools, subjects, classes }: TeachersListProps) {
  const [teachers, setTeachers] = useState(initialTeachers);
  const [error, setError] = useState('');
  const [deleteMessage, setDeleteMessage] = useState('');
  const [filters, setFilters] = useState({
    school: '',
    subject: '',
    class: ''
  });

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

      setTeachers(teachers.filter(teacher => teacher.id !== id));
      setDeleteMessage('Teacher deleted successfully');
      setTimeout(() => setDeleteMessage(''), 3000);
    } catch (err: any) {
      setError(err.message);
      setTimeout(() => setError(''), 3000);
    }
  };

  const filteredTeachers = useMemo(() => {
    return teachers.filter(teacher => {
      const matchesSchool = !filters.school || teacher.schools.id === parseInt(filters.school);
      const matchesSubject = !filters.subject || teacher.teacher_class_subject.some(
        tcs => tcs.subject.id === parseInt(filters.subject)
      );
      const matchesClass = !filters.class || teacher.teacher_class_subject.some(
        tcs => tcs.Class.id === parseInt(filters.class)
      );
      return matchesSchool && matchesSubject && matchesClass;
    });
  }, [teachers, filters]);

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>
          {location.search.includes('schoolId') ? 'School Teachers' : 'All Teachers'}
        </h1>
        <Link href="/add-teacher" className={styles.addButton}>
          Add New Teacher
        </Link>
      </div>

      {deleteMessage && <div className={styles.success}>{deleteMessage}</div>}
      {error && <div className={styles.error}>{error}</div>}

      <div className={styles.filterSection}>
        <select 
          className={styles.select}
          value={filters.school}
          onChange={(e) => setFilters(prev => ({ ...prev, school: e.target.value }))}
        >
          <option value="">All Schools</option>
          {schools.map(school => (
            <option key={school.id} value={school.id}>{school.name}</option>
          ))}
        </select>

        <select
          className={styles.select}
          value={filters.subject}
          onChange={(e) => setFilters(prev => ({ ...prev, subject: e.target.value }))}
        >
          <option value="">All Subjects</option>
          {subjects.map(subject => (
            <option key={subject.id} value={subject.id}>{subject.name}</option>
          ))}
        </select>

        <select
          className={styles.select}
          value={filters.class}
          onChange={(e) => setFilters(prev => ({ ...prev, class: e.target.value }))}
        >
          <option value="">All Classes</option>
          {classes.map(cls => (
            <option key={cls.id} value={cls.id}>{cls.name}</option>
          ))}
        </select>
      </div>

      <div className={styles.tableContainer}>
        <table className={styles.teachersTable}>
          <thead>
            <tr>
              <th>Photo</th>
              <th>Name</th>
              <th>School</th>
              <th>Email</th>
              <th>Phone</th>
              <th>Qualification</th>
              <th>Subjects & Classes</th>
              <th>Sections</th>
              <th>Date of Birth</th>
              <th>Experience</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredTeachers.length > 0 ? (
              filteredTeachers.map((teacher) => (
                <tr key={teacher.id}>
                  <td>
                    {teacher.profileImage ? (
                      <img 
                        src={teacher.profileImage} 
                        alt="Profile" 
                        className={styles.profileThumb} 
                      />
                    ) : (
                      <div className={styles.profilePlaceholder} />
                    )}
                  </td>
                  <td>{teacher.teacherName}</td>
                  <td>{teacher.schools.name}</td>
                  <td>{teacher.email}</td>
                  <td>{teacher.phone_number || '-'}</td>
                  <td>{teacher.qualification || '-'}</td>
                  <td>
                    {teacher.teacher_class_subject && teacher.teacher_class_subject.length > 0 ? (
                      <ul className={styles.noBulletList}>
                        {teacher.teacher_class_subject.map(({ subject, Class }, index) => (
                          <li key={index}>
                            {subject?.name || 'Unknown Subject'} - {Class?.name || 'Unknown Class'}
                          </li>
                        ))}
                      </ul>
                    ) : (
                      'None'
                    )}
                  </td>
                  <td>{teacher.assignedsections?.join(', ') || '-'}</td>
                  <td>{new Date(teacher.dob).toLocaleDateString()}</td>
                  <td>{teacher.experienceYears || '-'} years</td>
                  <td>
                    <span className={`${styles.statusBadge} ${styles[teacher.status]}`}>
                      {teacher.status}
                    </span>
                  </td>
                  <td>
                    <button
                      onClick={() => handleDelete(teacher.id)}
                      className={styles.deleteButton}
                      title="Delete Teacher"
                    >
                      <FaTrash />
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={12} className={styles.noData}>
                  No teachers found. Please adjust your filters or add teachers.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
