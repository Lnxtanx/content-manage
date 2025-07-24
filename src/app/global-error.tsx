"use client";

import { useEffect } from 'react';

interface GlobalErrorProps {
  error: Error;
  reset: () => void;
}

export default function GlobalError({ error, reset }: GlobalErrorProps) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error('Global application error:', error);
    
    // Set up auto-refresh if error persists
    const refreshTimer = setTimeout(() => {
      console.log('Auto-refreshing due to persistent global error');
      window.location.reload();
    }, 10000); // Auto-refresh after 10 seconds
    
    return () => clearTimeout(refreshTimer);
  }, [error]);

  return (
    <html lang="en">
      <body>
        <div className="global-error">
          <div className="error-content">
            <h1>Something went wrong!</h1>
            <p>We're sorry, but the application has encountered a critical error.</p>
            <div className="error-actions">
              <button onClick={reset} className="retry-button">
                Try Again
              </button>
              <button onClick={() => window.location.reload()} className="refresh-button">
                Refresh Page
              </button>
            </div>
            <p className="error-message">{error.message}</p>
            <p className="auto-refresh-notice">
              Page will automatically refresh in 10 seconds...
            </p>
          </div>
        </div>
        <style jsx>{`
          body {
            margin: 0;
            padding: 0;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen,
              Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
          }
          .global-error {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            height: 100vh;
            width: 100vw;
            background: #f8f9fa;
            text-align: center;
          }
          .error-content {
            background: white;
            padding: 2rem;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
            max-width: 550px;
          }
          h1 {
            color: #e53935;
            margin-top: 0;
          }
          .error-actions {
            display: flex;
            gap: 1rem;
            justify-content: center;
            margin: 1.5rem 0;
          }
          button {
            padding: 0.75rem 1.5rem;
            font-size: 1rem;
            border: none;
            border-radius: 4px;
            cursor: pointer;
          }
          .retry-button {
            background: #2196F3;
            color: white;
          }
          .refresh-button {
            background: #4CAF50;
            color: white;
          }
          .error-message {
            background: #f1f1f1;
            padding: 1rem;
            border-radius: 4px;
            font-family: monospace;
            margin-top: 1.5rem;
            word-break: break-word;
            text-align: left;
          }
          .auto-refresh-notice {
            font-size: 0.9rem;
            color: #666;
            margin-top: 1.5rem;
          }
        `}</style>
      </body>
    </html>
  );
}
