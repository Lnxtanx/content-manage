import Link from 'next/link';

export default function Navigation() {
  return (
    <header className="sticky-header">
      <div className="site-title">Syllabus Management System</div>
      <nav style={{ display: 'flex', gap: '1.5rem' }}>
        <Link 
          href="/" 
          style={{
            color: 'var(--text-color)',
            textDecoration: 'none',
            transition: 'color 0.3s ease'
          }}
        >
          Upload Syllabus
        </Link>
        <Link 
          href="/view-syllabuses" 
          style={{
            color: 'var(--text-color)',
            textDecoration: 'none',
            transition: 'color 0.3s ease'
          }}
        >
          View Syllabuses
        </Link>
      </nav>
    </header>
  );
}
