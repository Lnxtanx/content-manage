"use client";
import { useEffect, useState } from "react";
import styles from "./styles.module.css";

interface Subject {
  id: number;
  name: string;
  code?: string;
}

export default function ManageSubject() {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [editingSubject, setEditingSubject] = useState<Subject | null>(null);
  const [editName, setEditName] = useState("");
  const [editCode, setEditCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [filteredSubjects, setFilteredSubjects] = useState<Subject[]>([]);
  const [searchTerm, setSearchTerm] = useState("");

  const fetchSubjects = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/manage-subject");
      const data = await res.json();
      setSubjects(data);
      setFilteredSubjects(data);
    } catch (err: any) {
      setError("Failed to fetch subjects");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubjects();
  }, []);
  
  // Filter subjects when search term changes
  useEffect(() => {
    if (searchTerm) {
      const filtered = subjects.filter(subject => 
        subject.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
        (subject.code && subject.code.toLowerCase().includes(searchTerm.toLowerCase()))
      );
      setFilteredSubjects(filtered);
    } else {
      setFilteredSubjects(subjects);
    }
  }, [searchTerm, subjects]);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    if (!name.trim()) {
      setError("Subject name is required");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/manage-subject", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, code }),
      });
      if (!res.ok) throw new Error("Failed to add subject");
      setName("");
      setCode("");
      setSuccess("Subject added successfully");
      fetchSubjects();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this subject?")) return;
    setLoading(true);
    setError("");
    setSuccess("");
    try {
      const res = await fetch(`/api/manage-subject?id=${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete subject");
      setSuccess("Subject deleted successfully");
      fetchSubjects();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (subject: Subject) => {
    setEditingSubject(subject);
    setEditName(subject.name);
    setEditCode(subject.code || "");
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingSubject) return;
    
    setError("");
    setSuccess("");
    if (!editName.trim()) {
      setError("Subject name is required");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/manage-subject", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          id: editingSubject.id, 
          name: editName, 
          code: editCode 
        }),
      });
      if (!res.ok) throw new Error("Failed to update subject");
      setEditingSubject(null);
      setEditName("");
      setEditCode("");
      setSuccess("Subject updated successfully");
      fetchSubjects();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const cancelEdit = () => {
    setEditingSubject(null);
    setEditName("");
    setEditCode("");
  };

  return (
    <>
      <h1 className={styles.title}>Manage Subjects</h1>

      <div className={styles.filterSection}>
        <div className={styles.filterItem}>
          <label htmlFor="search">Search Subjects</label>
          <input
            type="text"
            id="search"
            placeholder="Search by name or code..."
            className={styles.formControl}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <div className={styles.filterItem} style={{ display: 'flex', alignItems: 'flex-end' }}>
          <button 
            className={styles.clearButton} 
            onClick={() => setSearchTerm('')}
            style={{ marginTop: '1.5rem' }}
          >
            Clear Search
          </button>
        </div>
      </div>

      <div className={styles.addFormSection}>
        <h2>Add New Subject</h2>
        <form onSubmit={handleAdd} className={styles.form}>
          <div className={styles.formGroup}>
            <label htmlFor="subjectName">Subject Name</label>
            <input
              id="subjectName"
              type="text"
              placeholder="Enter subject name"
              value={name}
              onChange={e => setName(e.target.value)}
              className={styles.formControl}
              required
            />
          </div>
          <div className={styles.formGroup}>
            <label htmlFor="subjectCode">Subject Code (optional)</label>
            <input
              id="subjectCode"
              type="text"
              placeholder="Enter subject code"
              value={code}
              onChange={e => setCode(e.target.value)}
              className={styles.formControl}
            />
          </div>
          <div className={styles.formActions}>
            <button type="submit" className={styles.btn} disabled={loading}>
              {loading ? "Saving..." : "Add Subject"}
            </button>
          </div>
        </form>
      </div>

      {editingSubject && (
        <div className={styles.editFormSection}>
          <h2>Edit Subject</h2>
          <form onSubmit={handleEditSubmit} className={styles.form}>
            <div className={styles.formGroup}>
              <label htmlFor="editSubjectName">Subject Name</label>
              <input
                id="editSubjectName"
                type="text"
                placeholder="Enter subject name"
                value={editName}
                onChange={e => setEditName(e.target.value)}
                className={styles.formControl}
                required
              />
            </div>
            <div className={styles.formGroup}>
              <label htmlFor="editSubjectCode">Subject Code (optional)</label>
              <input
                id="editSubjectCode"
                type="text"
                placeholder="Enter subject code"
                value={editCode}
                onChange={e => setEditCode(e.target.value)}
                className={styles.formControl}
              />
            </div>
            <div className={styles.formActions}>
              <button type="submit" className={styles.btn} disabled={loading}>
                {loading ? "Updating..." : "Update Subject"}
              </button>
              <button
                type="button"
                className={`${styles.btn} ${styles.cancelBtn}`}
                onClick={cancelEdit}
                disabled={loading}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {error && <div className={styles.error}>{error}</div>}
      {success && <div className={styles.success}>{success}</div>}
      
      {loading ? (
        <div className={styles.loading}>Loading subjects...</div>
      ) : filteredSubjects.length > 0 ? (
        <div className={styles.tableContainer}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th style={{width: '35%'}}>Subject Name</th>
                <th style={{width: '25%'}}>Subject Code</th>
                <th style={{width: '40%'}}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredSubjects.map((subject) => (
                <tr key={subject.id}>
                  <td className={styles.nameCell}>{subject.name}</td>
                  <td>{subject.code || 'N/A'}</td>
                  <td>
                    <div className={styles.actionButtons}>
                      <button
                        className={`${styles.btn} ${styles.editBtn}`}
                        onClick={() => handleEdit(subject)}
                        disabled={loading}
                      >
                        Edit
                      </button>
                      <button
                        className={`${styles.btn} ${styles.deleteBtn}`}
                        onClick={() => handleDelete(subject.id)}
                        disabled={loading}
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
          {searchTerm 
            ? 'No subjects found matching your search.' 
            : 'No subjects available.'}
        </div>
      )}
    </>
  );
}
