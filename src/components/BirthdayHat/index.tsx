'use client';

import { useSyncExternalStore } from 'react';
import Image from 'next/image';
import { shouldShowBirthdayHat } from '@/utils/birthdayHelpers';

interface BirthdayHatProps {
  birthday: string;
  className: string;
}

const noopSubscribe = () => () => {};

export default function BirthdayHat({ birthday, className }: BirthdayHatProps) {
  const show = useSyncExternalStore(
    noopSubscribe,
    () => shouldShowBirthdayHat(birthday),
    () => false
  );

  if (!show) return null;

  return <Image className={className} src="/party-hat.png" alt="今日壽星" width={24} height={24} />;
}
