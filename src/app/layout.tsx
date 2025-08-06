import type { Metadata } from 'next';
import './globals.css';

import Navigation from '@/components/Navigation';
import RouteLoaderProvider from '@/components/RouteLoaderProvider';
import ErrorBoundary from '@/components/ErrorBoundary';
import ClientLayout from './ClientLayout';

// Metadata can only be used in a Server Component
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
        <link rel="icon" href="/favicon.png" type="image/png" />
        <link rel="shortcut icon" href="/favicon.png" type="image/png" />
        <link rel="apple-touch-icon" href="/favicon.png" />
        {/* Add performance optimization meta tags */}
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
        <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
        {/* Preconnect to critical domains */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        {/* DNS Prefetching */}
        <link rel="dns-prefetch" href="https://fonts.googleapis.com" />
      </head>
      <body>
        <ErrorBoundary>
          <RouteLoaderProvider>
            <ClientLayout>
              <Navigation />
              <main className="main-content">
                {children}
              </main>
            </ClientLayout>
          </RouteLoaderProvider>
        </ErrorBoundary>
      </body>
    </html>
  )
}
