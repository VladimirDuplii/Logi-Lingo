import React from 'react';
import { cn } from '@/lib/utils';

export function ProgressBar({ value=0, className='', height='h-2', trackClass='', fillClass='' }) {
  const pct = Math.min(100, Math.max(0, value));
  return (
    <div className={cn('relative w-full overflow-hidden rounded-full bg-brand-100', height, trackClass, className)}>
      <div
        className={cn('h-full bg-brand-500 transition-all duration-500 ease-out', fillClass)}
        style={{ width: pct + '%' }}
      />
    </div>
  );
}
