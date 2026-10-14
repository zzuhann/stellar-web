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
  const lastUrl = useRef<string | null>(null);

  useEffect(() => {
    if (lastUrl.current === null) lastUrl.current = window.location.href;
    if (lastPathname.current === pathname) return;
    lastPathname.current = pathname;

    // Wait a frame so Next has swapped <title> for the new route
    const frame = requestAnimationFrame(() => {
      const url = window.location.href;
      sendGAEvent('event', 'page_view', {
        page_location: url,
        page_title: document.title,
        // gtag otherwise keeps the hard-load document.referrer for every soft navigation
        page_referrer: lastUrl.current,
      });
      lastUrl.current = url;
    });
    return () => cancelAnimationFrame(frame);
  }, [pathname]);

  return null;
}
