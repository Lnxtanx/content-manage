"use client";

import React, { Component, ErrorInfo } from 'react';

interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null
    };
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    // Update state so the next render will show the fallback UI
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    // Log the error to an error reporting service
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    
    this.setState({
      error,
      errorInfo
    });

    // Check if it's a webpack module loading error and auto-refresh
    if (error.message && (
      error.message.includes("Cannot read properties of undefined (reading 'call')") ||
      error.message.includes('ChunkLoadError') ||
      error.message.includes('Loading chunk') ||
      error.message.includes('Failed to fetch dynamically imported module')
    )) {
      console.warn('Webpack module loading error detected, refreshing page...');
      setTimeout(() => {
        window.location.reload();
      }, 2000);
    }
  }

  handleRefresh = (): void => {
    // Clear the error state and reload the page
    this.setState({ hasError: false, error: null, errorInfo: null });
    window.location.reload();
  }

  render(): React.ReactNode {
    if (this.state.hasError) {
      // Check if it's a webpack module loading error
      const isWebpackError = this.state.error?.message && (
        this.state.error.message.includes("Cannot read properties of undefined (reading 'call')") ||
        this.state.error.message.includes('ChunkLoadError') ||
        this.state.error.message.includes('Loading chunk')
      );

      if (isWebpackError) {
        return (
          <div className="error-container webpack-error">
            <h2>Loading Error</h2>
            <p>The application is updating. Please wait while we refresh the page...</p>
            <div className="loading-spinner"></div>
            <style jsx>{`
              .error-container {
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                padding: 2rem;
                margin: 2rem auto;
                max-width: 600px;
                background: #fff8e1;
                border: 1px solid #ffcc02;
                border-radius: 8px;
                box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
              }
              .loading-spinner {
                width: 40px;
                height: 40px;
                border: 4px solid #f3f3f3;
                border-top: 4px solid #ffcc02;
                border-radius: 50%;
                animation: spin 1s linear infinite;
                margin-top: 16px;
              }
              @keyframes spin {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
              }
            `}</style>
          </div>
        );
      }

      // Regular error display
      return this.props.fallback || (
        <div className="error-container">
          <h2>Something went wrong</h2>
          <details style={{ whiteSpace: 'pre-wrap', marginTop: '1rem', padding: '1rem', background: '#f5f5f5', borderRadius: '4px' }}>
            <summary style={{ cursor: 'pointer', marginBottom: '1rem' }}>Error Details</summary>
            <p><strong>Error:</strong> {this.state.error?.message || 'An unexpected error occurred'}</p>
            {this.state.errorInfo && (
              <p><strong>Component Stack:</strong> {this.state.errorInfo.componentStack}</p>
            )}
          </details>
          <button 
            onClick={this.handleRefresh}
            className="refresh-button"
          >
            Refresh Page
          </button>
          <style jsx>{`
            .error-container {
              display: flex;
              flex-direction: column;
              align-items: center;
              justify-content: center;
              padding: 2rem;
              margin: 2rem auto;
              max-width: 600px;
              background: #fff1f1;
              border: 1px solid #ffcdd2;
              border-radius: 8px;
              box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
            }
            .refresh-button {
              background-color: #4CAF50;
              color: white;
              padding: 10px 16px;
              border: none;
              border-radius: 4px;
              cursor: pointer;
              font-size: 16px;
              margin-top: 16px;
              transition: background-color 0.2s;
            }
            .refresh-button:hover {
              background-color: #45a049;
            }
          `}</style>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
