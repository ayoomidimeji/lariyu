import { useState, useEffect, useRef } from 'react';
import { getOptimizedImageUrl } from '@/lib/utils';
import type { NetworkQuality } from '@/hooks/useNetworkStatus';

interface OptimizedImageProps {
    src: string;
    alt: string;
    width: number;
    height: number;
    quality: NetworkQuality;
    className?: string;
    priority?: boolean; // For above-the-fold images
}

// Tiny blur placeholder - 1x1 transparent pixel as base64
const BLUR_DATA_URL = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMSIgaGVpZ2h0PSIxIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9IiNmNWY1ZjUiLz48L3N2Zz4=';

export const OptimizedImage = ({
    src,
    alt,
    width,
    height,
    quality,
    className = '',
    priority = false,
}: OptimizedImageProps) => {
    const [isLoaded, setIsLoaded] = useState(false);
    const [isInView, setIsInView] = useState(priority); // Priority images are always "in view"
    const imgRef = useRef<HTMLImageElement>(null);

    // Adjust dimensions based on network quality
    const getDimensions = () => {
        switch (quality) {
            case 'high':
                return { w: Math.min(width * 1.5, 1200), h: Math.min(height * 1.5, 1200) };
            case 'medium':
                return { w: width, h: height };
            case 'low':
                return { w: Math.floor(width * 0.5), h: Math.floor(height * 0.5) };
            default:
                return { w: width, h: height };
        }
    };

    const { w, h } = getDimensions();
    const optimizedSrc = getOptimizedImageUrl(src, w, h);

    // Lazy loading with Intersection Observer
    useEffect(() => {
        if (priority) return; // Skip lazy loading for priority images

        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        setIsInView(true);
                        observer.disconnect();
                    }
                });
            },
            {
                rootMargin: '50px', // Start loading 50px before entering viewport
                threshold: 0.01,
            }
        );

        const currentRef = imgRef.current;
        if (currentRef) {
            observer.observe(currentRef);
        }

        return () => {
            if (currentRef) {
                observer.unobserve(currentRef);
            }
        };
    }, [priority]);

    // Preload image when in view
    useEffect(() => {
        if (!isInView) return;

        const img = new Image();
        img.src = optimizedSrc;
        img.onload = () => setIsLoaded(true);
        img.onerror = () => setIsLoaded(true); // Still mark as loaded to remove blur
    }, [isInView, optimizedSrc]);

    return (
        <div className="relative overflow-hidden" ref={imgRef}>
            {/* Blur placeholder */}
            {!isLoaded && (
                <img
                    src={BLUR_DATA_URL}
                    alt=""
                    className={`absolute inset-0 w-full h-full object-cover blur-xl scale-110 ${className}`}
                    aria-hidden="true"
                />
            )}

            {/* Main image */}
            {isInView && (
                <img
                    src={optimizedSrc}
                    alt={alt}
                    className={`w-full h-full object-cover transition-opacity duration-500 ${isLoaded ? 'opacity-100' : 'opacity-0'
                        } ${className}`}
                    loading={priority ? 'eager' : 'lazy'}
                    decoding="async"
                />
            )}
        </div>
    );
};
