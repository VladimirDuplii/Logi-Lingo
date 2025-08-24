import React from 'react';
import { cn } from '@/lib/utils';

// Base Skeleton block
export const Skeleton = ({ className='', as:Tag='div', rounded='rounded-md', animate=true, ...rest }) => {
  return (
    <Tag
      aria-hidden="true"
      className={cn('bg-surface-alt/80 relative overflow-hidden', rounded, animate && 'animate-pulse', className)}
      {...rest}
    />
  );
};

Skeleton.Circle = function Circle({ size=40, className='' }) {
  return <Skeleton className={cn('rounded-full', className)} style={{ width:size, height:size }} />;
};

Skeleton.Text = function Text({ lines=3, lineClass='h-3', gap='gap-2', className='' }) {
  return (
    <div className={cn('flex flex-col', gap, className)} aria-hidden="true">
      {Array.from({length:lines}).map((_,i)=> (
        <Skeleton key={i} className={cn(lineClass, i===lines-1 && 'w-4/5')} />
      ))}
    </div>
  );
};

// Composite skeleton for CourseCard
export const CourseCardSkeleton = ({ className='' }) => (
  <div className={cn('ui-card-clean p-5 flex flex-col gap-4', className)} aria-hidden="true">
    <div className="flex items-center gap-4">
      <Skeleton.Circle size={56} />
      <div className="flex-1 min-w-0">
        <Skeleton className="h-4 w-2/3 mb-2" />
        <Skeleton.Text lines={2} lineClass="h-3" />
        <div className="flex gap-2 mt-3">
          <Skeleton className="h-5 w-20 rounded-full" />
          <Skeleton className="h-5 w-16 rounded-full" />
        </div>
      </div>
    </div>
    <div className="flex gap-3 pt-1">
      <Skeleton className="h-9 w-32 rounded-full" />
      <Skeleton className="h-9 w-36 rounded-full" />
    </div>
  </div>
);
