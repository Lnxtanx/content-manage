import Link from 'next/link';

export default function Navigation() {
  const linkStyle = {
    color: 'var(--text-color)',
    textDecoration: 'none',
    transition: 'color 0.3s ease'
  };

  return (
    <header className="sticky-header">
      <div className="site-title">Syllabus Management System</div>
      <nav style={{ display: 'flex', gap: '1.5rem' }}>
        <Link href="/" style={linkStyle}>
          Upload Syllabus
        </Link>
        <Link href="/view-syllabuses" style={linkStyle}>
          View Syllabuses
        </Link>
        <Link href="/manage-classes" style={linkStyle}>
          Manage Classes
        </Link>
      </nav>
    </header>
  );
}
