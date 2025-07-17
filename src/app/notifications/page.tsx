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
    <div className={styles.container}>
      <h1>Notifications</h1>
      <form onSubmit={handleAdd} className={styles.form}>
        <input
          type="text"
          placeholder="Title"
          value={title}
          onChange={e => setTitle(e.target.value)}
          className={styles.input}
          required
        />
        <input
          type="text"
          placeholder="Type"
          value={type}
          onChange={e => setType(e.target.value)}
          className={styles.input}
          required
        />
        <textarea
          placeholder="Message (optional)"
          value={message}
          onChange={e => setMessage(e.target.value)}
          className={styles.input}
        />
        <button type="submit" className={styles.button} disabled={loading}>
          {loading ? "Saving..." : "Add Notification"}
        </button>
      </form>
      {error && <div className={styles.error}>{error}</div>}
      {success && <div className={styles.success}>{success}</div>}
      <div className={styles.notificationList}>
        <h2>All Notifications</h2>
        {notifications.length === 0 && <div>No notifications found.</div>}
        <ul>
          {notifications.map(n => (
            <li key={n.id} className={styles.notificationItem}>
              <div>
                <b>{n.title}</b> <span>({n.type})</span>
                <div>{n.message}</div>
                <small>{n.created_at ? new Date(n.created_at).toLocaleString() : ""}</small>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
