export default function MapNewLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <link rel="preconnect" href="https://basemaps.cartocdn.com" crossOrigin="anonymous" />
      <link rel="dns-prefetch" href="https://basemaps.cartocdn.com" />
      {children}
    </>
  );
}
