"use client";

import { useEffect } from 'react';

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function Error({ error, reset }: ErrorProps) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error('Application error:', error);
  }, [error]);

  return (
    <div className="error-page">
      <div className="error-container">
        <h2>Something went wrong!</h2>
        <p>We apologize for the inconvenience. The system encountered an error.</p>
        <div className="error-actions">
          <button
            onClick={() => reset()}
            className="retry-button"
          >
            Try again
          </button>
          <button
            onClick={() => window.location.reload()}
            className="refresh-button"
          >
            Refresh page
          </button>
        </div>
      </div>
      <style jsx>{`
        .error-page {
          display: flex;
          align-items: center;
          justify-content: center;
          height: 100%;
          padding: 2rem;
        }
        .error-container {
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
          padding: 2rem;
          background: #fff1f1;
          border: 1px solid #ffcdd2;
          border-radius: 8px;
          box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
          max-width: 500px;
        }
        .error-actions {
          display: flex;
          gap: 1rem;
          margin-top: 1.5rem;
        }
        .retry-button, .refresh-button {
          padding: 10px 16px;
          border: none;
          border-radius: 4px;
          cursor: pointer;
          font-size: 16px;
          transition: background-color 0.2s;
        }
        .retry-button {
          background-color: #2196F3;
          color: white;
        }
        .retry-button:hover {
          background-color: #0b7dda;
        }
        .refresh-button {
          background-color: #4CAF50;
          color: white;
        }
        .refresh-button:hover {
          background-color: #45a049;
        }
      `}</style>
    </div>
  );
}
