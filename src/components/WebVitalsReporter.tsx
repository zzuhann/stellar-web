'use client';

import { useEffect } from 'react';
import { onLCP, onINP, onCLS } from 'web-vitals';
import { sendGAEvent } from '@next/third-parties/google';

export default function WebVitalsReporter() {
  useEffect(() => {
    onLCP(({ name, value, rating }) => {
      sendGAEvent('event', 'web_vitals', { metric_name: name, value: Math.round(value), rating });
    });
    onINP(({ name, value, rating }) => {
      sendGAEvent('event', 'web_vitals', { metric_name: name, value: Math.round(value), rating });
    });
    onCLS(({ name, value, rating }) => {
      sendGAEvent('event', 'web_vitals', {
        metric_name: name,
        value: Math.round(value * 1000),
        rating,
      });
    });
  }, []);

  return null;
}
