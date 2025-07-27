'use client';

import { useState, useEffect } from 'react';
import { FaLock, FaEye, FaEyeSlash } from 'react-icons/fa';
import styles from './WebsiteLock.module.css';

interface WebsiteLockProps {
  onUnlock: () => void;
}

const WebsiteLock: React.FC<WebsiteLockProps> = ({ onUnlock }) => {
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Get the stored password or use default
  const getStoredPassword = () => {
    if (typeof window !== 'undefined') {
      // Always fetch from localStorage directly to get the latest value
      const stored = localStorage.getItem('websiteLockPassword');
      return stored || 'Tanxsinxlnx@45';
    }
    return 'Tanxsinxlnx@45';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    const correctPassword = getStoredPassword();
    
    // Simulate a brief loading state for better UX
    await new Promise(resolve => setTimeout(resolve, 500));

    if (password === correctPassword) {
      // Store unlock status in localStorage and sessionStorage
      localStorage.setItem('websiteUnlocked', 'true');
      sessionStorage.setItem('websiteUnlocked', 'true');
      onUnlock();
    } else {
      setError('Invalid password. Please try again.');
      setPassword('');
    }
    
    setIsLoading(false);
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className={styles.lockContainer}>
      <div className={styles.lockCard}>
        <div className={styles.lockIcon}>
          <FaLock size={48} />
        </div>
        <h1 className={styles.title}>Website Access</h1>
        <p className={styles.subtitle}>Enter password to access the admin panel</p>
        
        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.inputGroup}>
            <input
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter website password"
              className={styles.passwordInput}
              required
              disabled={isLoading}
            />
            <button
              type="button"
              onClick={togglePasswordVisibility}
              className={styles.toggleButton}
              disabled={isLoading}
            >
              {showPassword ? <FaEyeSlash /> : <FaEye />}
            </button>
          </div>
          
          {error && <div className={styles.error}>{error}</div>}
          
          <button
            type="submit"
            className={styles.submitButton}
            disabled={isLoading || !password.trim()}
          >
            {isLoading ? 'Verifying...' : 'Unlock Website'}
          </button>
        </form>
        
        <div className={styles.footer}>
          <p>Sportal Foundation Admin System</p>
        </div>
      </div>
    </div>
  );
};

export default WebsiteLock;
