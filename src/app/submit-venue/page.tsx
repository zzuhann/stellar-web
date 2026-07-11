import type { Metadata } from 'next';
import SubmitVenueClient from './SubmitVenueClient';

export const metadata: Metadata = {
  title: '場地投稿｜STELLAR',
  robots: { index: false, follow: false },
};

export default function SubmitVenuePage() {
  return <SubmitVenueClient />;
}
