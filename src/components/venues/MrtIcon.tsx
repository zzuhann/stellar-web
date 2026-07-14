interface MrtIconProps {
  size?: number;
}

export default function MrtIcon({ size = 18 }: MrtIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      aria-hidden="true"
      style={{ display: 'block', flexShrink: 0 }}
    >
      <rect x="5" y="3" width="14" height="16" rx="4" />
      <path d="M8 7h8M6 13h12M8 19l-2 2m10-2 2 2" strokeLinecap="round" />
      <circle cx="9" cy="16" r="1" fill="currentColor" stroke="none" />
      <circle cx="15" cy="16" r="1" fill="currentColor" stroke="none" />
    </svg>
  );
}
