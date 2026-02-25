'use client';

import Clarity from '@microsoft/clarity';
import { useEffect } from 'react';

/**
 * Microsoft Clarity analytics – initializes with NEXT_PUBLIC_CLARITY_PROJECT_ID.
 * Set to run in all environments so you can verify on localhost; change to
 * `if (projectId && process.env.NODE_ENV === 'production')` to exclude dev.
 */
export default function ClarityInit() {
  useEffect(() => {
    const projectId = process.env.NEXT_PUBLIC_CLARITY_PROJECT_ID;
    if (projectId) {
      Clarity.init(projectId);
    }
  }, []);

  return null;
}
