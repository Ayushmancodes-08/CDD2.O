'use client';

import { FACULTY, PROJECTS, TEAM_MEMBERS } from './cdd-constants';

// In-memory set of pre-decoded / preloaded image URLs for instant zero-latency render
export const preloadedImageSet = new Set();

// 1. Critical above-the-fold & branding images
export const CRITICAL_IMAGES = [
  '/Logo_dark.png',
  '/logo_white.png',
  '/sourav_sir.png',
  '/Dr.-Kalyan-Kumar-Jena.jpeg',
];

// 2. High priority section images (Projects & Executive Board)
export const PRIORITY_SECTION_IMAGES = [
  ...PROJECTS.map((p) => p.image).filter(Boolean),
  ...TEAM_MEMBERS.filter((m) => m.category === 'Board').map((m) => m.image).filter(Boolean),
];

// 3. Secondary section images (Core, Founder, Alumni)
export const SECONDARY_SECTION_IMAGES = [
  ...TEAM_MEMBERS.filter((m) => m.category !== 'Board').map((m) => m.image).filter(Boolean),
];

export const ALL_STATIC_IMAGES = [
  ...CRITICAL_IMAGES,
  ...PRIORITY_SECTION_IMAGES,
  ...SECONDARY_SECTION_IMAGES,
];

/**
 * Preload and decode an image URL into browser GPU/memory cache.
 * Returns a Promise that resolves when the image is fully decoded.
 */
export function preloadImage(url) {
  if (!url || typeof window === 'undefined') return Promise.resolve(null);
  if (preloadedImageSet.has(url)) return Promise.resolve(url);

  return new Promise((resolve) => {
    const img = new Image();
    img.src = url;

    // Use modern img.decode() for instant GPU-ready paint without main thread freeze
    if ('decode' in img) {
      img.decode()
        .then(() => {
          preloadedImageSet.add(url);
          resolve(url);
        })
        .catch(() => {
          // Fallback to standard load
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
 * Preload batches of images with concurrency management and idle time scheduling.
 */
export async function preloadAllImages(additionalUrls = []) {
  if (typeof window === 'undefined') return;

  // Immediate Tier 1: Critical & Top Section Images
  const tier1 = Array.from(new Set([...CRITICAL_IMAGES, ...PRIORITY_SECTION_IMAGES].filter(Boolean)));
  await Promise.allSettled(tier1.map((url) => preloadImage(url)));

  // Tier 2: Secondary Section Images & Additional URLs in background
  const tier2 = Array.from(new Set([...SECONDARY_SECTION_IMAGES, ...additionalUrls].filter(Boolean)));
  
  const processTier2 = async () => {
    const chunkSize = 4;
    for (let i = 0; i < tier2.length; i += chunkSize) {
      const chunk = tier2.slice(i, i + chunkSize);
      await Promise.allSettled(chunk.map((url) => preloadImage(url)));
    }
  };

  if ('requestIdleCallback' in window) {
    window.requestIdleCallback(() => { processTier2(); }, { timeout: 2000 });
  } else {
    setTimeout(processTier2, 100);
  }
}

