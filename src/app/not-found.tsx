import Link from 'next/link';

export default function NotFound() {
  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#f8fafc',
        flexDirection: 'column',
        gap: '16px',
        padding: '20px',
      }}
    >
      <h1 style={{ fontSize: '48px', margin: 0, color: '#1f2937' }}>404</h1>
      <p style={{ fontSize: '18px', margin: 0, color: '#6b7280' }}>頁面不存在</p>
      <Link
        href="/"
        style={{
          padding: '12px 24px',
          background: '#4f46e5',
          color: 'white',
          textDecoration: 'none',
          borderRadius: '8px',
          fontSize: '14px',
          fontWeight: '600',
        }}
      >
        回到首頁
      </Link>
    </div>
  );
}
