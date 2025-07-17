"use client";
import { useEffect, useState } from "react";
import styles from "./styles.module.css";

interface JobPost {
  id: number;
  type: string;
  position: string;
  qualification: string;
  experience?: string;
  additional_message?: string;
  created_at?: string;
  school_id?: number;
}

export default function JobPostsPage() {
  const [jobs, setJobs] = useState<JobPost[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const fetchJobs = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/job-posts");
      const data = await res.json();
      setJobs(data);
    } catch (err: any) {
      setError("Failed to fetch job posts");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, []);

  return (
    <div className={styles.container}>
      <h1>Job Posts</h1>
      {error && <div className={styles.error}>{error}</div>}
      <div className={styles.jobList}>
        {jobs.length === 0 && <div>No job posts found.</div>}
        <ul>
          {jobs.map(job => (
            <li key={job.id} className={styles.jobItem}>
              <div><b>Type:</b> {job.type}</div>
              <div><b>Position:</b> {job.position}</div>
              <div><b>Qualification:</b> {job.qualification}</div>
              {job.experience && <div><b>Experience:</b> {job.experience}</div>}
              {job.additional_message && <div><b>Message:</b> {job.additional_message}</div>}
              {job.created_at && <div><b>Posted:</b> {new Date(job.created_at).toLocaleString()}</div>}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
