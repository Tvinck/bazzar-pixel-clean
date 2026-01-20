import React from 'react';
import { motion } from 'framer-motion';

// Base Skeleton Component
export const Skeleton = ({ className = '', variant = 'rectangular', animation = true }) => {
    const baseClasses = 'bg-gradient-to-r from-slate-200 via-slate-100 to-slate-200 dark:from-slate-800 dark:via-slate-700 dark:to-slate-800';
    const variantClasses = {
        rectangular: 'rounded-xl',
        circular: 'rounded-full',
        text: 'rounded-lg h-4'
    };

    return (
        <motion.div
            className={`${baseClasses} ${variantClasses[variant]} ${className}`}
            animate={animation ? {
                backgroundPosition: ['0% 50%', '100% 50%', '0% 50%']
            } : {}}
            transition={{
                duration: 1.5,
                repeat: Infinity,
                ease: 'linear'
            }}
            style={{
                backgroundSize: '200% 100%'
            }}
        />
    );
};

// Card Skeleton
export const CardSkeleton = () => (
    <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 space-y-3">
        <Skeleton className="w-full h-40" />
        <Skeleton variant="text" className="w-3/4" />
        <Skeleton variant="text" className="w-1/2" />
    </div>
);

// Image Card Skeleton
export const ImageCardSkeleton = () => (
    <div className="space-y-2">
        <Skeleton className="w-full aspect-[3/4]" />
        <Skeleton variant="text" className="w-2/3" />
        <Skeleton variant="text" className="w-1/3" />
    </div>
);

// Profile Skeleton
export const ProfileSkeleton = () => (
    <div className="flex items-center gap-3 p-4">
        <Skeleton variant="circular" className="w-12 h-12" />
        <div className="flex-1 space-y-2">
            <Skeleton variant="text" className="w-32" />
            <Skeleton variant="text" className="w-24" />
        </div>
    </div>
);

// List Skeleton
export const ListSkeleton = ({ count = 3 }) => (
    <div className="space-y-3">
        {Array.from({ length: count }).map((_, i) => (
            <div key={i} className="flex items-center gap-3 p-4 bg-white dark:bg-slate-900 rounded-2xl">
                <Skeleton variant="circular" className="w-10 h-10" />
                <div className="flex-1 space-y-2">
                    <Skeleton variant="text" className="w-3/4" />
                    <Skeleton variant="text" className="w-1/2" />
                </div>
            </div>
        ))}
    </div>
);

// Gallery Grid Skeleton
export const GalleryGridSkeleton = ({ count = 6 }) => (
    <div className="grid grid-cols-2 gap-3">
        {Array.from({ length: count }).map((_, i) => (
            <ImageCardSkeleton key={i} />
        ))}
    </div>
);

// History Skeleton (Added)
export const HistorySkeleton = () => (
    <div className="pt-4 px-4 space-y-6">
        <div className="space-y-2">
            <Skeleton variant="text" className="w-32 h-8" />
            <Skeleton variant="text" className="w-24" />
        </div>
        <GalleryGridSkeleton count={8} />
    </div>
);

// Tool Card Skeleton
export const ToolCardSkeleton = () => (
    <div className="bg-white dark:bg-slate-900 rounded-2xl p-4">
        <div className="flex items-center gap-3 mb-3">
            <Skeleton variant="circular" className="w-12 h-12" />
            <div className="flex-1 space-y-2">
                <Skeleton variant="text" className="w-32" />
                <Skeleton variant="text" className="w-24" />
            </div>
        </div>
        <Skeleton className="w-full h-24" />
    </div>
);

// Full Page Skeleton
export const PageSkeleton = () => (
    <div className="p-4 space-y-4">
        <div className="space-y-2">
            <Skeleton variant="text" className="w-48 h-8" />
            <Skeleton variant="text" className="w-64" />
        </div>
        <GalleryGridSkeleton />
    </div>
);
