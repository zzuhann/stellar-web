'use client';

import { useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';
import { sendGAEvent } from '@next/third-parties/google';

/**
 * Sends GA page_view on client-side route changes only.
 * gtag already sends one on hard load; GA's "page changes based on browser history events"
 * must stay OFF, otherwise query-string updates (filters, pagination, tabs) count as views.
 * Keyed on pathname so ?query changes are ignored.
 */
export default function SoftNavigationPageView() {
  const pathname = usePathname();
  // Previous pathname instead of an "is first run" flag: survives StrictMode's double effect
  const lastPathname = useRef(pathname);

  useEffect(() => {
    if (lastPathname.current === pathname) return;
    lastPathname.current = pathname;
    sendGAEvent('event', 'page_view', { page_location: window.location.href });
  }, [pathname]);

  return null;
}
