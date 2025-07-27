'use client';

import { useState, useEffect } from 'react';
import { FaKey, FaSave, FaEye, FaEyeSlash, FaLock, FaCheck } from 'react-icons/fa';
import styles from './styles.module.css';

export default function AdminSettingsPage() {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Get the stored password
  const getStoredPassword = () => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('websiteLockPassword');
      return stored || 'Tanxsinxlnx@45'; // Default password
    }
    return 'Tanxsinxlnx@45';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setSuccess('');

    // Validate current password
    const storedPassword = getStoredPassword();
    if (currentPassword !== storedPassword) {
      setError('Current password is incorrect.');
      setIsLoading(false);
      return;
    }

    // Validate new password
    if (newPassword.length < 6) {
      setError('New password must be at least 6 characters long.');
      setIsLoading(false);
      return;
    }

    // Validate password confirmation
    if (newPassword !== confirmPassword) {
      setError('New passwords do not match.');
      setIsLoading(false);
      return;
    }

    // Simulate loading
    await new Promise(resolve => setTimeout(resolve, 1000));

    try {
      // Save new password to localStorage
      localStorage.setItem('websiteLockPassword', newPassword);
      
      // Clear the unlock status to force re-authentication with the new password
      localStorage.removeItem('websiteUnlocked');
      sessionStorage.removeItem('websiteUnlocked');
      
      setSuccess('Website lock password updated successfully!');
      
      // Clear form
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      
      // Hide success message after 3 seconds
      setTimeout(() => {
        setSuccess('');
      }, 3000);
      
    } catch (err) {
      setError('Failed to update password. Please try again.');
    }

    setIsLoading(false);
  };

  const resetToDefault = () => {
    if (confirm('Are you sure you want to reset the password to default? This action cannot be undone.')) {
      localStorage.setItem('websiteLockPassword', 'Tanxsinxlnx@45');
      
      // Clear the unlock status to force re-authentication with the default password
      localStorage.removeItem('websiteUnlocked');
      sessionStorage.removeItem('websiteUnlocked');
      
      setSuccess('Password reset to default successfully!');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      
      setTimeout(() => {
        setSuccess('');
      }, 3000);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.headerIcon}>
          <FaKey size={24} />
        </div>
        <div>
          <h1 className={styles.title}>Admin Settings</h1>
          <p className={styles.subtitle}>Manage website lock password</p>
        </div>
      </div>

      <div className={styles.card}>
        <div className={styles.cardHeader}>
          <FaLock className={styles.cardIcon} />
          <h2>Website Lock Password</h2>
        </div>
        
        <form onSubmit={handleSubmit} className={styles.form}>
          {/* Current Password */}
          <div className={styles.inputGroup}>
            <label htmlFor="currentPassword" className={styles.label}>
              Current Password
            </label>
            <div className={styles.inputWrapper}>
              <input
                id="currentPassword"
                type={showCurrentPassword ? 'text' : 'password'}
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="Enter current password"
                className={styles.input}
                required
                disabled={isLoading}
              />
              <button
                type="button"
                onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                className={styles.toggleButton}
                disabled={isLoading}
              >
                {showCurrentPassword ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>
          </div>

          {/* New Password */}
          <div className={styles.inputGroup}>
            <label htmlFor="newPassword" className={styles.label}>
              New Password
            </label>
            <div className={styles.inputWrapper}>
              <input
                id="newPassword"
                type={showNewPassword ? 'text' : 'password'}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Enter new password (min 6 characters)"
                className={styles.input}
                required
                disabled={isLoading}
                minLength={6}
              />
              <button
                type="button"
                onClick={() => setShowNewPassword(!showNewPassword)}
                className={styles.toggleButton}
                disabled={isLoading}
              >
                {showNewPassword ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>
          </div>

          {/* Confirm Password */}
          <div className={styles.inputGroup}>
            <label htmlFor="confirmPassword" className={styles.label}>
              Confirm New Password
            </label>
            <div className={styles.inputWrapper}>
              <input
                id="confirmPassword"
                type={showConfirmPassword ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm new password"
                className={styles.input}
                required
                disabled={isLoading}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className={styles.toggleButton}
                disabled={isLoading}
              >
                {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>
          </div>

          {/* Error/Success Messages */}
          {error && (
            <div className={styles.error}>
              {error}
            </div>
          )}
          
          {success && (
            <div className={styles.success}>
              <FaCheck className={styles.successIcon} />
              {success}
            </div>
          )}

          {/* Buttons */}
          <div className={styles.buttonGroup}>
            <button
              type="submit"
              className={styles.submitButton}
              disabled={isLoading || !currentPassword || !newPassword || !confirmPassword}
            >
              <FaSave className={styles.buttonIcon} />
              {isLoading ? 'Updating...' : 'Update Password'}
            </button>
            
            <button
              type="button"
              onClick={resetToDefault}
              className={styles.resetButton}
              disabled={isLoading}
            >
              Reset to Default
            </button>
          </div>
        </form>

        <div className={styles.infoSection}>
          <h3>Password Security Tips</h3>
          <ul>
            <li>Use a strong password with at least 6 characters</li>
            <li>Include numbers, letters, and special characters</li>
            <li>Don&apos;t share your password with unauthorized users</li>
            <li>Change your password regularly for better security</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
