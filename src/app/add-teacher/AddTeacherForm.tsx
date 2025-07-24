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

interface Class {
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

  interface SubjectClassMapping {
    subjectId: number;
    classIds: number[];
  }

  const [formData, setFormData] = useState({
    schoolId: initialSchoolId || '',
    teacherName: '',
    dob: '',
    email: '',
    password: '',
    qualification: '',
    experienceYears: '',
    phone_number: '',
    aadhaar_number: '',
    status: 'active',
    sections: [] as string[],
    subjectClassMappings: [] as SubjectClassMapping[],
  });
  const [profileImage, setProfileImage] = useState<File | null>(null);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [classes, setClasses] = useState<Class[]>([]);
  const [selectedSubjects, setSelectedSubjects] = useState<number[]>([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Fetch subjects
    fetch('/api/teacher-registration/subject-list')
      .then(res => res.json())
      .then(data => setSubjects(data))
      .catch(() => setSubjects([]));
    
    // Fetch classes
    fetch('/api/classes')
      .then(res => res.json())
      .then(data => setClasses(data))
      .catch(() => setClasses([]));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (formData.subjectClassMappings.length === 0) {
      setError('Please select at least one subject and its corresponding classes');
      setLoading(false);
      return;
    }

    // Check if at least one class is selected for each subject
    const hasEmptyClasses = formData.subjectClassMappings.some(mapping => mapping.classIds.length === 0);
    if (hasEmptyClasses) {
      setError('Please select at least one class for each selected subject');
      setLoading(false);
      return;
    }
    
    if (formData.sections.length === 0) {
      setError('Please select at least one section');
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
      
      // Log the subject-class mappings for debugging
      console.log("Subject-class mappings to send:", formData.subjectClassMappings);
      
      // Append subject-class mappings more explicitly for better FormData handling
      formData.subjectClassMappings.forEach((mapping, index) => {
        data.append(`subjectClassMappings[${index}][subjectId]`, mapping.subjectId.toString());
        
        // For each class ID, create a separate entry with unique key
        if (mapping.classIds && mapping.classIds.length > 0) {
          mapping.classIds.forEach((classId, classIndex) => {
            data.append(`subjectClassMappings[${index}][classIds][${classIndex}]`, classId.toString());
          });
        }
      });
      
      // Get all unique class IDs for the teacher table
      const allClassIds = Array.from(new Set(
        formData.subjectClassMappings.flatMap(mapping => mapping.classIds)
      ));

      // Get all subject IDs for the teacher table
      const allSubjectIds = formData.subjectClassMappings.map(mapping => mapping.subjectId);

      // Convert class IDs to class names for the teacher table
      const classNames = allClassIds.map(id => 
        classes.find(c => c.id === id)?.name || ''
      ).filter(Boolean);

      // Add each class ID separately for the backend
      allClassIds.forEach(classId => {
        data.append('assignedclasses[]', classId.toString());
      });
      
      formData.sections.forEach(section => {
        data.append('sections[]', section);
      });
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
          <label>Subjects and Classes</label>
          <div className={styles.checkboxGroup}>
            {subjects.map((subject) => (
              <div key={subject.id} className={styles.subjectGroup}>
                <label className={styles.checkboxLabel}>
                  <input
                    type="checkbox"
                    checked={selectedSubjects.includes(subject.id)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedSubjects(prev => [...prev, subject.id]);
                        setFormData(prev => ({
                          ...prev,
                          subjectClassMappings: [
                            ...prev.subjectClassMappings,
                            { subjectId: subject.id, classIds: [] }
                          ]
                        }));
                      } else {
                        setSelectedSubjects(prev => prev.filter(id => id !== subject.id));
                        setFormData(prev => ({
                          ...prev,
                          subjectClassMappings: prev.subjectClassMappings.filter(
                            mapping => mapping.subjectId !== subject.id
                          )
                        }));
                      }
                    }}
                    className={styles.checkbox}
                  />
                  {subject.name}
                </label>
                {selectedSubjects.includes(subject.id) && (
                  <div className={styles.classesSubGroup}>
                    <label>Select classes for {subject.name}:</label>
                    <div className={styles.classCheckboxes}>
                      {classes.map((cls) => (
                        <label key={cls.id} className={styles.checkboxLabel}>
                          <input
                            type="checkbox"
                            checked={formData.subjectClassMappings
                              .find(mapping => mapping.subjectId === subject.id)
                              ?.classIds.includes(cls.id) || false}
                            onChange={(e) => {
                              setFormData(prev => ({
                                ...prev,
                                subjectClassMappings: prev.subjectClassMappings.map(mapping =>
                                  mapping.subjectId === subject.id
                                    ? {
                                        ...mapping,
                                        classIds: e.target.checked
                                          ? [...mapping.classIds, cls.id]
                                          : mapping.classIds.filter(id => id !== cls.id)
                                      }
                                    : mapping
                                )
                              }));
                            }}
                            className={styles.checkbox}
                          />
                          {cls.name}
                        </label>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
        <div className={styles.formGroup}>
          <label htmlFor="sections">Sections</label>
          <input
            type="text"
            id="sections"
            value={formData.sections.join(', ')}
            onChange={(e) => {
              const sections = e.target.value.split(',').map(s => s.trim()).filter(Boolean);
              setFormData(prev => ({
                ...prev,
                sections
              }));
            }}
            placeholder="Enter sections separated by commas (e.g., A, B, C)"
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
