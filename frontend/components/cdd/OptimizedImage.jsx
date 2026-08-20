'use client';

import React, { useState, useEffect, useRef } from 'react';
import { preloadedImageSet } from '@/lib/preload-images';

/**
 * High-performance, anti-flicker Image component.
 * Immediately renders pre-cached images without opacity lag,
 * and provides smooth placeholder transitions for network-loaded images.
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
  const [loaded, setLoaded] = useState(() => preloadedImageSet.has(src));
  const [hasError, setHasError] = useState(false);
  const imgRef = useRef(null);

  useEffect(() => {
    if (!src) return;
    if (preloadedImageSet.has(src)) {
      setLoaded(true);
      return;
    }
    // Check if the browser image element already completed loading
    if (imgRef.current && imgRef.current.complete && imgRef.current.naturalWidth > 0) {
      preloadedImageSet.add(src);
      setLoaded(true);
    }
  }, [src]);

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
      className={`relative overflow-hidden bg-slate-100 ${containerClassName}`}
      style={aspectRatio ? { aspectRatio } : undefined}
    >
      {/* Shimmer skeleton while loading */}
      {!loaded && (
        <div className="absolute inset-0 animate-pulse bg-gradient-to-r from-slate-100 via-slate-200 to-slate-100 bg-[length:200%_100%]" />
      )}

      {activeSrc && (
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
