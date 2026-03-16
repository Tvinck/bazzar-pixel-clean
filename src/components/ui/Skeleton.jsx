import React from 'react';

const Skeleton = ({ 
  width = 'w-full', 
  height = 'h-4', 
  rounded = 'rounded-input',
  className = '' 
}) => (
  <div className={`
    ${width} ${height} ${rounded}
    bg-gradient-to-r from-bg-elevated via-glass-hover to-bg-elevated
    bg-[length:200%_100%] animate-shimmer
    ${className}
  `} />
);

// Готовые пресеты
export const SkeletonCard = () => (
  <div className="p-4 rounded-card border border-glass-border space-y-3">
    <div className="flex items-center gap-3">
      <Skeleton width="w-10" height="h-10" rounded="rounded-full" />
      <div className="flex-1 space-y-2">
        <Skeleton width="w-1/2" height="h-3" />
        <Skeleton width="w-1/3" height="h-3" />
      </div>
    </div>
    <Skeleton height="h-3" />
    <Skeleton width="w-3/4" height="h-3" />
  </div>
);

export const SkeletonListRow = () => (
  <div className="flex items-center gap-3 px-4 py-3">
    <Skeleton width="w-9" height="h-9" rounded="rounded-[10px]" />
    <div className="flex-1 space-y-2">
      <Skeleton width="w-1/2" height="h-3" />
      <Skeleton width="w-1/3" height="h-3" />
    </div>
  </div>
);

export default Skeleton;
