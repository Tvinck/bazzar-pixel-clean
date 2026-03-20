import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '../../utils/cn';

/**
 * Base Skeleton component with premium shimmer effect using Framer Motion
 */
const Skeleton = ({ 
  width = 'w-full', 
  height = 'h-4', 
  rounded = 'rounded-input',
  className = '' 
}) => (
  <div className={cn(
    'relative overflow-hidden bg-bg-elevated',
    width, height, rounded,
    className
  )}>
    <motion.div
      initial={{ x: '-100%' }}
      animate={{ x: '100%' }}
      transition={{
        repeat: Infinity,
        duration: 1.5,
        ease: "linear",
      }}
      className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent"
    />
  </div>
);

/**
 * Common Card Skeleton for grids
 */
export const SkeletonCard = ({ className = '' }) => (
  <div className={cn("p-4 rounded-card border border-glass-border space-y-3", className)}>
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

/**
 * List Item / Row Skeleton
 */
export const SkeletonListRow = ({ className = '' }) => (
  <div className={cn("flex items-center gap-3 px-4 py-3", className)}>
    <Skeleton width="w-9" height="h-9" rounded="rounded-[10px]" />
    <div className="flex-1 space-y-2">
      <Skeleton width="w-1/2" height="h-3" />
      <Skeleton width="w-1/4" height="h-3" />
    </div>
    <Skeleton width="w-5" height="h-5" rounded="rounded-full" />
  </div>
);

/**
 * Image Card Skeleton (for Gallery/History/Home)
 */
export const SkeletonImageCard = ({ className = '' }) => (
  <div className={cn("rounded-card overflow-hidden space-y-2", className)}>
    <Skeleton height="h-48" rounded="rounded-none" />
    <div className="p-3 space-y-2">
      <Skeleton width="w-3/4" height="h-3" />
      <Skeleton width="w-1/2" height="h-3" />
    </div>
  </div>
);

// Alias to prevent ReferenceErrors from old code
export const ImageCardSkeleton = SkeletonImageCard;

/**
 * Profile Header Skeleton
 */
export const SkeletonProfile = () => (
  <div className="space-y-4 p-4">
    <div className="flex flex-col items-center gap-3 py-6">
      <Skeleton width="w-20" height="h-20" rounded="rounded-full" />
      <Skeleton width="w-32" height="h-4" />
      <Skeleton width="w-20" height="h-3" />
    </div>
    <div className="grid grid-cols-3 gap-3">
      {[1,2,3].map(i => (
        <div key={i} className="p-3 rounded-card border border-glass-border space-y-2">
          <Skeleton height="h-6" width="w-1/2" className="mx-auto" />
          <Skeleton height="h-3" />
        </div>
      ))}
    </div>
    {[1,2,3,4].map(i => (
      <SkeletonListRow key={i} />
    ))}
  </div>
);

/**
 * Full History Grid Skeleton
 */
export const SkeletonHistory = () => (
  <div className="grid grid-cols-2 gap-3 p-4">
    {Array.from({ length: 6 }).map((_, i) => (
      <SkeletonImageCard key={i} />
    ))}
  </div>
);

/**
 * Chat Message History Skeleton
 */
export const SkeletonChat = () => (
  <div className="space-y-4 p-4">
    <div className="flex items-end gap-2">
      <Skeleton width="w-8" height="h-8" rounded="rounded-full" />
      <div className="space-y-1 max-w-[70%] flex-1">
        <Skeleton height="h-10" rounded="rounded-2xl rounded-bl-none" />
        <Skeleton width="w-16" height="h-2" />
      </div>
    </div>
    <div className="flex justify-end">
      <div className="space-y-1 max-w-[70%] flex-1">
        <Skeleton height="h-16" rounded="rounded-2xl rounded-br-none" />
        <Skeleton width="w-16" height="h-2" className="ml-auto" />
      </div>
    </div>
    <div className="flex items-end gap-2">
      <Skeleton width="w-8" height="h-8" rounded="rounded-full" />
      <Skeleton width="w-2/3" height="h-12" rounded="rounded-2xl rounded-bl-none" />
    </div>
  </div>
);

/**
 * Generation Result Placeholder
 */
export const SkeletonGenerationResult = () => (
  <div className="space-y-3 p-4">
    <Skeleton height="h-64" rounded="rounded-card" />
    <div className="flex gap-2">
      <Skeleton height="h-10" className="flex-1" rounded="rounded-button" />
      <Skeleton width="w-24" height="h-10" rounded="rounded-button" />
    </div>
  </div>
);

/**
 * Tool Card Skeleton (e.g. for Home or Marketplace)
 */
export const SkeletonToolCard = () => (
  <div className="p-4 rounded-card border border-glass-border space-y-3">
    <div className="flex items-center gap-3">
      <Skeleton width="w-12" height="h-12" rounded="rounded-card" />
      <div className="flex-1 space-y-2">
        <Skeleton width="w-2/3" height="h-4" />
        <Skeleton width="w-1/3" height="h-3" />
      </div>
    </div>
    <Skeleton height="h-20" rounded="rounded-card" />
  </div>
);

/**
 * Star Greeting Card Skeleton
 */
export const SkeletonStarCard = () => (
  <div className="flex flex-col items-center gap-2 flex-shrink-0 w-[80px]">
    <Skeleton width="w-16" height="h-16" rounded="rounded-full" />
    <Skeleton width="w-12" height="h-3" />
  </div>
);

// Alias for old code compatibility
export const ToolCardSkeleton = SkeletonToolCard;
export const CardSkeleton = SkeletonCard;
export const ProfileSkeleton = SkeletonProfile;

export default Skeleton;
