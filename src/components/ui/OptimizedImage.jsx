import React, { useState } from 'react';

const OptimizedImage = ({ src, alt, className, blurHash = "L6PZfSi_.AyE_3t7t7R**0o#DgR4", priority = false }) => {
    const [isLoaded, setIsLoaded] = useState(false);

    // Ensure we are requesting WebP from Unsplash if possible
    const optimizedSrc = src.includes('unsplash.com')
        ? (src.includes('fm=') ? src : `${src}&fm=webp`)
        : src;

    return (
        <div className={`relative overflow-hidden ${className}`}>
            {/* Blur Placeholder */}
            <div
                className={`absolute inset-0 bg-slate-200 dark:bg-slate-800 transition-opacity duration-700 ${isLoaded ? 'opacity-0' : 'opacity-100'}`}
                style={{
                    backgroundImage: `url(data:image/svg+xml;charset=utf-8,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Cfilter id='b' color-interpolation-filters='sRGB'%3E%3CfeGaussianBlur stdDeviation='20'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' fill='%23a1a1aa'/%3E%3C/svg%3E)`,
                    filter: 'blur(20px)',
                    transform: 'scale(1.1)'
                }}
            />

            <img
                src={optimizedSrc}
                alt={alt}
                className={`w-full h-full object-cover transition-opacity duration-500 ${isLoaded ? 'opacity-100' : 'opacity-0'}`}
                onLoad={() => setIsLoaded(true)}
                loading={priority ? "eager" : "lazy"}
                decoding={priority ? "sync" : "async"}
                fetchPriority={priority ? "high" : "auto"}
            />
        </div>
    );
};

export default OptimizedImage;
