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
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const fetchSubjects = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/manage-subject");
      const data = await res.json();
      setSubjects(data);
    } catch (err: any) {
      setError("Failed to fetch subjects");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubjects();
  }, []);

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

  return (
    <div className={styles.container}>
      <h1>Manage Subjects</h1>
      <form onSubmit={handleAdd} className={styles.form}>
        <input
          type="text"
          placeholder="Subject Name"
          value={name}
          onChange={e => setName(e.target.value)}
          className={styles.input}
          required
        />
        <input
          type="text"
          placeholder="Subject Code (optional)"
          value={code}
          onChange={e => setCode(e.target.value)}
          className={styles.input}
        />
        <button type="submit" className={styles.button} disabled={loading}>
          {loading ? "Saving..." : "Add Subject"}
        </button>
      </form>
      {error && <div className={styles.error}>{error}</div>}
      {success && <div className={styles.success}>{success}</div>}
      <div className={styles.subjectList}>
        <h2>Existing Subjects</h2>
        {subjects.length === 0 && <div>No subjects found.</div>}
        <ul>
          {subjects.map(subject => (
            <li key={subject.id} className={styles.subjectItem}>
              <span>{subject.name} {subject.code && <span>({subject.code})</span>}</span>
              <button onClick={() => handleDelete(subject.id)} className={styles.deleteButton} disabled={loading}>
                Delete
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
