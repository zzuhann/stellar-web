import dynamic from 'next/dynamic';

const MapPage = dynamic(() => import('@/components/layout/MapPage'), {
  ssr: false,
  loading: () => (
    <div
      style={{
        height: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'var(--color-bg-primary)',
        color: 'var(--color-text-primary)',
      }}
    >
      載入地圖中...
    </div>
  ),
});

export default function MapPageRoute() {
  return <MapPage />;
}
