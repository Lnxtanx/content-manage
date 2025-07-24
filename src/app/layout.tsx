import type { Metadata } from 'next';
import './globals.css';

import Navigation from '@/components/Navigation';
import RouteLoaderProvider from '@/components/RouteLoaderProvider';
import ErrorBoundary from '@/components/ErrorBoundary';

export const metadata: Metadata = {
  title: 'Sportal Foundation Management System',
  description: 'Upload and manage school syllabuses',
  icons: {
    icon: [
      {
        url: '/favicon.png',
        type: 'image/x-icon',
        sizes: 'any',
      },
    ],
    shortcut: [
      {
        url: '/favicon.png',
        type: 'image/x-icon',
      },
    ],
    apple: [
      {
        url: '/favicon.png',
        type: 'image/x-icon',
      },
    ],
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/favicon.png" sizes="any" />
        <link rel="shortcut icon" href="/favicon.png" type="image/x-icon" />
        <link rel="apple-touch-icon" href="/favicon.png" />
        {/* Force favicon refresh with timestamp */}
        <meta name="favicon-version" content={new Date().getTime().toString()} />
        {/* Add performance optimization meta tags */}
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
        <meta http-equiv="X-UA-Compatible" content="IE=edge" />
        {/* Preconnect to critical domains */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        {/* DNS Prefetching */}
        <link rel="dns-prefetch" href="https://fonts.googleapis.com" />
        {/* Add auto-refresh in case of complete failure */}
        <script dangerouslySetInnerHTML={{
          __html: `
            // Auto-refresh on fatal errors
            window.addEventListener('error', function(e) {
              // Don't auto-refresh for non-fatal errors
              if (e && e.error && (e.error.toString().includes('ChunkLoadError') || 
                  e.error.toString().includes('NetworkError') || 
                  e.error.toString().includes('Failed to fetch'))) {
                console.error('Fatal error detected, refreshing in 3 seconds...');
                setTimeout(function() { window.location.reload(); }, 3000);
              }
            });
            // Memory management
            if (window.requestIdleCallback) {
              window.requestIdleCallback(function() {
                // Cleanup during idle time
                if (window.performance && window.performance.memory) {
                  console.log('Memory usage:', Math.round(window.performance.memory.usedJSHeapSize / (1024 * 1024)), 'MB');
                }
              });
            }
          `
        }} />
      </head>
      <body>
        <ErrorBoundary>
          <RouteLoaderProvider>
            <Navigation />
            <main className="main-content">
              {children}
            </main>
          </RouteLoaderProvider>
        </ErrorBoundary>
      </body>
    </html>
  )
}
