'use client';

import { FACULTY, PROJECTS, TEAM_MEMBERS } from './cdd-constants';

// Set of preloaded image URLs to track load status
export const preloadedImageSet = new Set();

// Extract all critical and core static image URLs
export const CRITICAL_IMAGES = [
  '/Logo_dark.png',
  '/logo_white.png',
  '/sourav_sir.png',
  '/Dr.-Kalyan-Kumar-Jena.jpeg',
];

export const ALL_STATIC_IMAGES = [
  ...CRITICAL_IMAGES,
  ...PROJECTS.map((p) => p.image).filter(Boolean),
  ...FACULTY.map((f) => f.image).filter(Boolean),
  ...TEAM_MEMBERS.map((m) => m.image).filter(Boolean),
];

/**
 * Preload and decode a single image URL into memory/browser cache.
 * Returns a Promise that resolves when the image is decoded or loaded.
 */
export function preloadImage(url) {
  if (!url || typeof window === 'undefined') return Promise.resolve(null);
  if (preloadedImageSet.has(url)) return Promise.resolve(url);

  return new Promise((resolve) => {
    const img = new Image();
    img.src = url;
    
    // Use img.decode() for faster GPU/memory readiness if supported
    if ('decode' in img) {
      img.decode()
        .then(() => {
          preloadedImageSet.add(url);
          resolve(url);
        })
        .catch(() => {
          // Fallback to onload if decode fails (e.g. format issues)
          img.onload = () => {
            preloadedImageSet.add(url);
            resolve(url);
          };
          img.onerror = () => resolve(null);
        });
    } else {
      img.onload = () => {
        preloadedImageSet.add(url);
        resolve(url);
      };
      img.onerror = () => resolve(null);
    }
  });
}

/**
 * Force preload batches of images with concurrency management.
 */
export async function preloadAllImages(additionalUrls = []) {
  if (typeof window === 'undefined') return;

  const urlsToPreload = Array.from(
    new Set([...ALL_STATIC_IMAGES, ...additionalUrls].filter(Boolean))
  );

  // Split into immediate critical batch and background batch
  const critical = urlsToPreload.slice(0, 10);
  const remaining = urlsToPreload.slice(10);

  // Load critical immediately in parallel
  await Promise.allSettled(critical.map((url) => preloadImage(url)));

  // Load remaining in chunks to avoid overwhelming low-end devices
  const chunkSize = 6;
  for (let i = 0; i < remaining.length; i += chunkSize) {
    const chunk = remaining.slice(i, i + chunkSize);
    await Promise.allSettled(chunk.map((url) => preloadImage(url)));
  }
}
