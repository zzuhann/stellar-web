import Link from 'next/link';

export default function NotFound() {
  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'var(--colors-gray-50)',
        flexDirection: 'column',
        gap: '16px',
        padding: '20px',
      }}
    >
      <h1 style={{ fontSize: '48px', margin: 0, color: 'var(--colors-gray-700)' }}>404</h1>
      <p style={{ fontSize: '18px', margin: 0, color: 'var(--colors-gray-600)' }}>頁面不存在</p>
      <Link
        href="/"
        style={{
          padding: '12px 24px',
          background: 'var(--colors-stellar-blue-500)',
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
