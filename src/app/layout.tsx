import type { Metadata } from 'next'
import './globals.css'
import Navigation from '@/components/Navigation'

export const metadata: Metadata = {
  title: 'Syllabus Management System',
  description: 'Upload and manage school syllabuses',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        <Navigation />
        <main className="main-content">
          {children}
        </main>
      </body>
    </html>
  )
}
