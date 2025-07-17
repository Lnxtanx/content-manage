'use client';
import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import styles from './styles.module.css';

interface School {
  id: number;
  name: string;
}

interface Subject {
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
    qualification: '',
    subject_id: '',
    experienceYears: '',
    phone_number: '',
    aadhaar_number: '',
    status: 'active',
  });
  const [profileImage, setProfileImage] = useState<File | null>(null);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch('/api/teacher-registration/subject-list')
      .then(res => res.json())
      .then(data => setSubjects(data))
      .catch(() => setSubjects([]));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (!formData.subject_id) {
      setError('Please select a subject');
      setLoading(false);
      return;
    }
    if (!formData.phone_number) {
      setError('Phone number is required');
      setLoading(false);
      return;
    }
    if (!formData.aadhaar_number) {
      setError('Aadhaar number is required');
      setLoading(false);
      return;
    }
    try {
      const data = new FormData();
      data.append('schoolId', formData.schoolId);
      data.append('teacherName', formData.teacherName);
      data.append('dob', formData.dob);
      data.append('email', formData.email);
      data.append('password', formData.password);
      data.append('qualification', formData.qualification);
      data.append('subject_id', formData.subject_id);
      data.append('experienceYears', formData.experienceYears);
      data.append('phone_number', formData.phone_number);
      data.append('aadhaar_number', formData.aadhaar_number);
      data.append('status', formData.status);
      if (profileImage) {
        data.append('profileImage', profileImage);
      }
      const response = await fetch('/api/teacher-registration', {
        method: 'POST',
        body: data,
      });
      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.error || 'Failed to register teacher');
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

  const handleProfileImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setProfileImage(e.target.files[0]);
    }
  };

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Add New Teacher</h1>
      {error && <div className={styles.error}>{error}</div>}
      <form onSubmit={handleSubmit} className={styles.form} encType="multipart/form-data">
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
          <label htmlFor="profileImage">Profile Image</label>
          <input
            type="file"
            id="profileImage"
            name="profileImage"
            accept="image/*"
            onChange={handleProfileImageChange}
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
          <label htmlFor="subject_id">Subject</label>
          <select
            id="subject_id"
            name="subject_id"
            value={formData.subject_id}
            onChange={handleChange}
            required
            className={styles.select}
          >
            <option value="">Select a subject</option>
            {subjects.map((subject) => (
              <option key={subject.id} value={subject.id}>{subject.name}</option>
            ))}
          </select>
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
        <div className={styles.formGroup}>
          <label htmlFor="phone_number">Phone Number</label>
          <input
            type="text"
            id="phone_number"
            name="phone_number"
            value={formData.phone_number}
            onChange={handleChange}
            required
            className={styles.input}
          />
        </div>
        <div className={styles.formGroup}>
          <label htmlFor="aadhaar_number">Aadhaar Number</label>
          <input
            type="text"
            id="aadhaar_number"
            name="aadhaar_number"
            value={formData.aadhaar_number}
            onChange={handleChange}
            required
            className={styles.input}
            maxLength={12}
          />
        </div>
        <div className={styles.formGroup}>
          <label htmlFor="status">Status</label>
          <select
            id="status"
            name="status"
            value={formData.status}
            onChange={handleChange}
            className={styles.select}
          >
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>
        <button type="submit" disabled={loading} className={styles.button}>
          {loading ? 'Adding...' : 'Add Teacher'}
        </button>
      </form>
    </div>
  );
}
