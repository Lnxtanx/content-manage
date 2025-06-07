'use client';
import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import styles from './styles.module.css';

interface School {
  id: number;
  name: string;
}

interface AddTeacherFormProps {
  initialSchools: School[];
}

export default function AddTeacherForm({ initialSchools }: AddTeacherFormProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialSchoolId = searchParams.get('schoolId');

  const [formData, setFormData] = useState({
    schoolId: initialSchoolId || '',
    teacherName: '',
    dob: '',
    email: '',
    password: '',
    confirmPassword: '',
    qualification: '',
    subjectAssigned: '',
    classAssigned: '',
    experienceYears: '',
  });

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    try {
      const response = await fetch('/api/teacher-registration', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          schoolId: parseInt(formData.schoolId),
          teacherName: formData.teacherName,
          dob: formData.dob,
          email: formData.email,
          password: formData.password,
          qualification: formData.qualification || undefined,
          subjectAssigned: formData.subjectAssigned || undefined,
          classAssigned: formData.classAssigned || undefined,
          experienceYears: formData.experienceYears ? parseInt(formData.experienceYears) : undefined,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to register teacher');
      }

      router.push('/view-teachers');
      router.refresh();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Add New Teacher</h1>
      {error && <div className={styles.error}>{error}</div>}
      <form onSubmit={handleSubmit} className={styles.form}>
        <div className={styles.formGroup}>
          <label htmlFor="schoolId">School</label>
          <select
            id="schoolId"
            name="schoolId"
            value={formData.schoolId}
            onChange={handleChange}
            required
            className={styles.select}
          >
            <option value="">Select a school</option>
            {initialSchools.map((school) => (
              <option key={school.id} value={school.id}>
                {school.name}
              </option>
            ))}
          </select>
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="teacherName">Teacher Name</label>
          <input
            type="text"
            id="teacherName"
            name="teacherName"
            value={formData.teacherName}
            onChange={handleChange}
            required
            className={styles.input}
          />
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="dob">Date of Birth</label>
          <input
            type="date"
            id="dob"
            name="dob"
            value={formData.dob}
            onChange={handleChange}
            required
            className={styles.input}
          />
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="email">Email</label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
            className={styles.input}
          />
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="password">Password</label>
          <input
            type="password"
            id="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            required
            className={styles.input}
          />
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="confirmPassword">Confirm Password</label>
          <input
            type="password"
            id="confirmPassword"
            name="confirmPassword"
            value={formData.confirmPassword}
            onChange={handleChange}
            required
            className={styles.input}
          />
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="qualification">Qualification</label>
          <input
            type="text"
            id="qualification"
            name="qualification"
            value={formData.qualification}
            onChange={handleChange}
            className={styles.input}
          />
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="subjectAssigned">Subject Assigned</label>
          <input
            type="text"
            id="subjectAssigned"
            name="subjectAssigned"
            value={formData.subjectAssigned}
            onChange={handleChange}
            className={styles.input}
          />
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="classAssigned">Class Assigned</label>
          <input
            type="text"
            id="classAssigned"
            name="classAssigned"
            value={formData.classAssigned}
            onChange={handleChange}
            className={styles.input}
          />
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="experienceYears">Years of Experience</label>
          <input
            type="number"
            id="experienceYears"
            name="experienceYears"
            value={formData.experienceYears}
            onChange={handleChange}
            className={styles.input}
          />
        </div>

        <button type="submit" disabled={loading} className={styles.button}>
          {loading ? 'Adding...' : 'Add Teacher'}
        </button>
      </form>
    </div>
  );
}
