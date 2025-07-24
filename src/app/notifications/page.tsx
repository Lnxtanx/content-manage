"use client";
import { useEffect, useState } from "react";
import styles from "./styles.module.css";

interface Notification {
  id: number;
  type: string;
  title: string;
  message?: string;
  is_read?: boolean;
  created_at?: string;
}

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [type, setType] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/notifications");
      const data = await res.json();
      setNotifications(data);
    } catch (err: any) {
      setError("Failed to fetch notifications");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    if (!title.trim() || !type.trim()) {
      setError("Title and type are required");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/notifications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, message, type }),
      });
      if (!res.ok) throw new Error("Failed to add notification");
      setTitle("");
      setMessage("");
      setType("");
      setSuccess("Notification added successfully");
      fetchNotifications();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <h1 className={styles.title}>Notifications</h1>
      
      {error && <div className={styles.error}>{error}</div>}
      {success && <div className={styles.success}>{success}</div>}
      
      <div className={styles.addFormSection}>
        <h2>Create New Notification</h2>
        <form onSubmit={handleAdd} className={styles.form}>
          <div className={styles.formGroup}>
            <label htmlFor="title">Title</label>
            <input
              id="title"
              type="text"
              placeholder="Enter notification title"
              value={title}
              onChange={e => setTitle(e.target.value)}
              className={styles.formControl}
              required
            />
          </div>
          
          <div className={styles.formGroup}>
            <label htmlFor="type">Type</label>
            <select
              id="type"
              value={type}
              onChange={e => setType(e.target.value)}
              className={styles.formControl}
              required
            >
              <option value="">Select notification type</option>
              <option value="announcement">Announcement</option>
              <option value="alert">Alert</option>
              <option value="update">Update</option>
              <option value="reminder">Reminder</option>
              <option value="other">Other</option>
            </select>
          </div>
          
          <div className={styles.formGroup}>
            <label htmlFor="message">Message (optional)</label>
            <textarea
              id="message"
              placeholder="Enter notification details"
              value={message}
              onChange={e => setMessage(e.target.value)}
              className={styles.formControl}
              rows={4}
            />
          </div>
          
          <div className={styles.formActions}>
            <button type="submit" className={styles.btn} disabled={loading}>
              {loading ? "Saving..." : "Add Notification"}
            </button>
          </div>
        </form>
      </div>
      
      {loading ? (
        <div className={styles.loading}>Loading notifications...</div>
      ) : notifications.length > 0 ? (
        <div className={styles.notificationList}>
          <h2>All Notifications</h2>
          {notifications.map(n => (
            <div key={n.id} className={styles.notificationItem}>
              <div>
                <h3 style={{margin: '0 0 0.5rem 0'}}>{n.title}</h3>
                <span className={styles.notificationType}>{n.type}</span>
                <div style={{margin: '0.75rem 0', color: '#444'}}>{n.message}</div>
                <div style={{fontSize: '0.8rem', color: '#666'}}>
                  {n.created_at ? new Date(n.created_at).toLocaleString() : ""}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className={styles.noData}>No notifications available.</div>
      )}
    </>
  );
}
