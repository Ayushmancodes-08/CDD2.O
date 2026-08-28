'use client';

import React, { useState, useEffect, useRef } from 'react';
import { preloadedImageSet, preloadImage } from '@/lib/preload-images';

/**
 * High-performance, zero-flicker Image component.
 * - 1000px viewport lookahead: Fetches and decodes images in advance before the user scrolls to them
 * - Instant paint: Pre-cached/preloaded images render immediately without shimmer or opacity flash
 * - Graceful fallback: Handles image errors without broken icons
 */
export default function OptimizedImage({
  src,
  alt = '',
  className = '',
  containerClassName = '',
  fallbackSrc,
  priority = false,
  aspectRatio,
  objectPosition,
  referrerPolicy,
  ...props
}) {
  const containerRef = useRef(null);
  const [shouldLoad, setShouldLoad] = useState(priority || (src ? preloadedImageSet.has(src) : false));
  const [loaded, setLoaded] = useState(src ? preloadedImageSet.has(src) : false);
  const [hasError, setHasError] = useState(false);
  const imgRef = useRef(null);

  // 1. Advance Lookahead: trigger loading 1000px before scrolling into view
  useEffect(() => {
    if (shouldLoad || priority) return;
    if (!src) return;

    if (preloadedImageSet.has(src)) {
      setShouldLoad(true);
      setLoaded(true);
      return;
    }

    if (typeof window === 'undefined' || !('IntersectionObserver' in window)) {
      setShouldLoad(true);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          setShouldLoad(true);
          // Preload & decode in background immediately
          preloadImage(src).then(() => {
            setLoaded(true);
          });
          observer.disconnect();
        }
      },
      { rootMargin: '1000px 0px' } // 1000px lookahead buffer
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => observer.disconnect();
  }, [src, shouldLoad, priority]);

  // 2. Fast check if image is already cached in browser memory
  useEffect(() => {
    if (!src) return;
    if (preloadedImageSet.has(src)) {
      setLoaded(true);
      return;
    }
    if (imgRef.current && imgRef.current.complete && imgRef.current.naturalWidth > 0) {
      preloadedImageSet.add(src);
      setLoaded(true);
    }
  }, [src, shouldLoad]);

  const handleLoad = () => {
    if (src) preloadedImageSet.add(src);
    setLoaded(true);
  };

  const handleError = () => {
    if (fallbackSrc && !hasError) {
      setHasError(true);
    }
  };

  const activeSrc = hasError && fallbackSrc ? fallbackSrc : src;

  return (
    <div
      ref={containerRef}
      className={`relative overflow-hidden bg-slate-100 ${containerClassName}`}
      style={aspectRatio ? { aspectRatio } : undefined}
    >
      {/* Shimmer skeleton only while loading and not yet cached */}
      {!loaded && (
        <div className="absolute inset-0 animate-pulse bg-gradient-to-r from-slate-100 via-slate-200 to-slate-100 bg-[length:200%_100%]" />
      )}

      {shouldLoad && activeSrc && (
        <img
          ref={imgRef}
          src={activeSrc}
          alt={alt}
          loading={priority ? 'eager' : 'eager'}
          decoding="async"
          fetchPriority={priority ? 'high' : 'auto'}
          referrerPolicy={referrerPolicy}
          onLoad={handleLoad}
          onError={handleError}
          className={`transition-opacity duration-300 ${
            loaded ? 'opacity-100' : 'opacity-0'
          } ${className}`}
          style={objectPosition ? { objectPosition } : undefined}
          {...props}
        />
      )}
    </div>
  );
}

