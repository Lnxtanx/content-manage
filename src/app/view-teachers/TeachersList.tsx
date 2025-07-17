'use client';
import { useState } from 'react';
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
  dob: string;
  phone_number: string | null;
  aadhaar_number: string | null;
  profileImage: string | null;
  schools: {
    id: number;
    name: string;
  };
  subject: {
    id: number;
    name: string;
  } | null;
}

interface TeachersListProps {
  initialTeachers: Teacher[];
}

export default function TeachersList({ initialTeachers }: TeachersListProps) {
  const [teachers, setTeachers] = useState(initialTeachers);
  const [error, setError] = useState('');
  const [deleteMessage, setDeleteMessage] = useState('');

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

      <div className={styles.tableContainer}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Teacher Name</th>
              <th>School</th>
              <th>Email</th>
              <th>Qualification</th>
              <th>Subject</th>
              <th>Phone</th>
              <th>Aadhaar</th>
              <th>DOB</th>
              <th>Profile Image</th>
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
                <td>{teacher.subject ? teacher.subject.name : '-'}</td>
                <td>{teacher.phone_number || '-'}</td>
                <td>{teacher.aadhaar_number || '-'}</td>
                <td>{teacher.dob ? new Date(teacher.dob).toLocaleDateString() : '-'}</td>
                <td>{teacher.profileImage ? <img src={teacher.profileImage} alt="Profile" style={{width:40,height:40,borderRadius:'50%'}} /> : '-'}</td>
                <td>{teacher.experienceYears || '-'}</td>
                <td>{teacher.status}</td>
                <td>
                  <button
                    onClick={() => handleDelete(teacher.id)}
                    className={styles.deleteButton}
                  >
                    <FaTrash />
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
