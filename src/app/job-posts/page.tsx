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
    <>
      <h1 className={styles.title}>Job Posts</h1>
      
      {error && <div className={styles.error}>{error}</div>}
      
      {loading ? (
        <div className={styles.loading}>Loading job posts...</div>
      ) : jobs.length > 0 ? (
        <div className={styles.jobList}>
          {jobs.map(job => (
            <div key={job.id} className={styles.jobItem}>
              <div className={styles.jobHeader}>
                <h2 className={styles.jobPosition}>{job.position}</h2>
                <span className={styles.jobType}>{job.type}</span>
              </div>
              
              <div className={styles.jobDetails}>
                <div className={styles.jobDetail}>
                  <span className={styles.jobDetailLabel}>Qualification:</span>
                  <span className={styles.jobDetailValue}>{job.qualification}</span>
                </div>
                
                {job.experience && (
                  <div className={styles.jobDetail}>
                    <span className={styles.jobDetailLabel}>Experience:</span>
                    <span className={styles.jobDetailValue}>{job.experience}</span>
                  </div>
                )}
                
                {job.additional_message && (
                  <div className={styles.jobDetail}>
                    <span className={styles.jobDetailLabel}>Additional Information:</span>
                    <span className={styles.jobDetailValue}>{job.additional_message}</span>
                  </div>
                )}
                
                <div className={styles.jobPostedAt}>
                  <span className={styles.jobDetailLabel}>Posted:</span>
                  <span className={styles.jobDate}>
                    {job.created_at ? new Date(job.created_at).toLocaleString() : ""}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className={styles.noData}>No job posts available.</div>
      )}
    </>
  );
}
