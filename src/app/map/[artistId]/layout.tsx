export default function MapLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <link rel="preconnect" href="https://tile.openstreetmap.org" />
      <link rel="dns-prefetch" href="https://tile.openstreetmap.org" />
      {children}
    </>
  );
}
