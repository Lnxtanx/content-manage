'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import styles from './styles.module.css';
import { FaTrash, FaEdit } from 'react-icons/fa';

interface School {
  id: number;
  name: string;
  email: string;
  password?: string;
  createdAt: string;
  updatedAt: string;
  isActive: boolean;
  logo?: string;
  address?: string;
  principal_name?: string;
  location?: string;
  school_address?: string;
  _count: {
    teachers: number;
  };
}

const indianStates = [
  'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh',
  'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand',
  'Karnataka', 'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur',
  'Meghalaya', 'Mizoram', 'Nagaland', 'Odisha', 'Punjab',
  'Rajasthan', 'Sikkim', 'Tamil Nadu', 'Telangana', 'Tripura',
  'Uttar Pradesh', 'Uttarakhand', 'West Bengal',
  'Andaman and Nicobar Islands', 'Chandigarh', 'Dadra and Nagar Haveli and Daman and Diu',
  'Delhi', 'Jammu and Kashmir', 'Ladakh', 'Lakshadweep', 'Puducherry'
];

export default function ViewSchools() {
  const [schools, setSchools] = useState<School[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deleteMessage, setDeleteMessage] = useState('');
  const [search, setSearch] = useState('');
  const [stateFilter, setStateFilter] = useState('');

  const fetchSchools = async () => {
    try {
      const response = await fetch('/api/school-registration');
      if (!response.ok) {
        throw new Error('Failed to fetch schools');
      }
      const data = await response.json();
      setSchools(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSchools();
  }, []);

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this school? This action cannot be undone.')) {
      return;
    }

    try {
      const response = await fetch(`/api/school-registration?id=${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete school');
      }

      setDeleteMessage('School deleted successfully');
      setTimeout(() => setDeleteMessage(''), 3000);
      fetchSchools(); // Refresh the list
    } catch (err: any) {
      setError(err.message);
      setTimeout(() => setError(''), 3000);
    }
  };

  const filteredSchools = schools.filter((school) => {
    const matchesState = stateFilter ? school.location === stateFilter : true;
    const matchesSearch = search
      ? school.name.toLowerCase().includes(search.toLowerCase()) ||
        (school.email && school.email.toLowerCase().includes(search.toLowerCase()))
      : true;
    return matchesState && matchesSearch;
  });

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.header}>
          <h1 className={styles.title}>Registered Schools</h1>
        </div>
        <div className={styles.loading}>Loading...</div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>Registered Schools</h1>
        <Link href="/school-registration" className={styles.addButton}>
          Add New School
        </Link>
      </div>
      {deleteMessage && <div className={styles.success}>{deleteMessage}</div>}
      {error && <div className={styles.error}>{error}</div>}
      <div className={styles.filters}>
        <input
          type="text"
          placeholder="Search by name or email..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className={styles.input}
        />
        <select
          value={stateFilter}
          onChange={e => setStateFilter(e.target.value)}
          className={styles.input}
        >
          <option value="">All States</option>
          {indianStates.map(state => (
            <option key={state} value={state}>{state}</option>
          ))}
        </select>
      </div>
      <div className={styles.tableContainer}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Logo</th>
              <th>ID</th>
              <th>Name</th>
              <th>Email</th>
              <th>Status</th>
              <th>Principal Name</th>
              <th>Address</th>
              <th>School Address</th>
              <th>Location</th>
              <th>Teachers Count</th>
              <th>Created At</th>
              <th>Updated At</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredSchools.length === 0 ? (
              <tr>
                <td colSpan={13} style={{ textAlign: 'center', padding: '1rem' }}>
                  No schools found.
                </td>
              </tr>
            ) : (
              filteredSchools.map((school) => (
                <tr key={school.id}>
                  <td>
                    {school.logo ? (
                      <img 
                        src={school.logo} 
                        alt="Logo" 
                        className={styles.schoolLogoSmall} 
                      />
                    ) : (
                      <span>-</span>
                    )}
                  </td>
                  <td>{school.id}</td>
                  <td>{school.name}</td>
                  <td>{school.email}</td>
                  <td>
                    <span className={`${styles.statusBadge} ${school.isActive ? styles.active : styles.inactive}`}>
                      {school.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td>{school.principal_name || '-'}</td>
                  <td>{school.address || '-'}</td>
                  <td>{school.school_address || '-'}</td>
                  <td>{school.location || '-'}</td>
                  <td>{school._count?.teachers ?? 0}</td>
                  <td>{new Date(school.createdAt).toLocaleString()}</td>
                  <td>{new Date(school.updatedAt).toLocaleString()}</td>
                  <td className={styles.actionColumn}>
                    <Link 
                      href={`/add-teacher?schoolId=${school.id}`} 
                      className={styles.actionIcon}
                      title="Add Teacher"
                    >
                      <FaEdit />
                    </Link>
                    <Link 
                      href={`/view-teachers?schoolId=${school.id}`} 
                      className={styles.actionIcon}
                      title="View Teachers"
                    >
                      👥
                    </Link>
                    <button 
                      onClick={() => handleDelete(school.id)}
                      className={styles.deleteIcon}
                      title="Delete School"
                      type="button"
                    >
                      <FaTrash />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
