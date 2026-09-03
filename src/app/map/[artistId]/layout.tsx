export default function MapLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <link rel="preconnect" href="https://tiles.openfreemap.org" crossOrigin="anonymous" />
      <link rel="dns-prefetch" href="https://tiles.openfreemap.org" />
      {children}
    </>
  );
}
