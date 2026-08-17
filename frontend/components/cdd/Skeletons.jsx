'use client';
import React from 'react';

/**
 * Base shimmer pulse box
 */
export const Skeleton = ({ className = '', ...props }) => (
  <div
    className={`animate-pulse bg-slate-100 rounded-xl ${className}`}
    {...props}
  />
);

/**
 * Skeleton for Gallery Section (Masonry Grid)
 */
export const GallerySkeleton = () => (
  <div className="w-full space-y-8" aria-label="Loading gallery" aria-busy="true">
    <div className="columns-2 md:columns-3 lg:columns-4 gap-4 md:gap-5">
      {[180, 240, 160, 220, 200, 260, 190, 230].map((height, idx) => (
        <div key={idx} className="break-inside-avoid mb-5">
          <div className="bg-white p-1.5 rounded-2xl border border-gray-100 shadow-sm">
            <div
              className="bg-slate-100 animate-pulse rounded-xl w-full"
              style={{ height: `${height}px` }}
            />
          </div>
        </div>
      ))}
    </div>
    <div className="flex justify-center mt-8">
      <Skeleton className="h-12 w-48 rounded-xl" />
    </div>
  </div>
);

/**
 * Skeleton for Full Page Archive Gallery
 */
export const FullPageGallerySkeleton = () => (
  <div className="min-h-screen bg-white relative py-8 px-4 md:px-6 max-w-[1600px] mx-auto" aria-label="Loading archive gallery" aria-busy="true">
    {/* Header bar skeleton */}
    <div className="flex items-center justify-between mb-8 py-4 px-6 rounded-2xl border border-gray-100 shadow-sm bg-white">
      <div className="flex items-center gap-4">
        <Skeleton className="w-10 h-10 rounded-full" />
        <div className="space-y-2">
          <Skeleton className="h-5 w-36" />
          <Skeleton className="h-3 w-24" />
        </div>
      </div>
    </div>

    {/* Gallery Grid */}
    <div className="columns-2 md:columns-3 lg:columns-4 xl:columns-5 gap-4 md:gap-5 pb-20">
      {[220, 180, 260, 200, 240, 190, 230, 250, 210, 180].map((height, idx) => (
        <div key={idx} className="break-inside-avoid mb-5">
          <div className="bg-white p-1.5 rounded-2xl border border-gray-100 shadow-sm">
            <div
              className="bg-slate-100 animate-pulse rounded-xl w-full"
              style={{ height: `${height}px` }}
            />
          </div>
        </div>
      ))}
    </div>
  </div>
);

/**
 * Skeleton for Projects Section (2-Column Cards)
 */
export const ProjectsSkeleton = () => (
  <div className="grid grid-cols-1 md:grid-cols-2 gap-5 w-full" aria-label="Loading projects" aria-busy="true">
    {[1, 2, 3, 4].map((idx) => (
      <div
        key={idx}
        className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 md:p-7 flex flex-col h-[380px] space-y-4"
      >
        <div className="flex items-center justify-between mb-2">
          <Skeleton className="w-10 h-10 rounded-xl" />
          <Skeleton className="w-20 h-6 rounded-md" />
        </div>
        <div className="space-y-2">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-6 w-48" />
        </div>
        <div className="space-y-2 flex-grow">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-5/6" />
        </div>
        <div className="flex gap-2">
          <Skeleton className="h-6 w-16 rounded-md" />
          <Skeleton className="h-6 w-20 rounded-md" />
          <Skeleton className="h-6 w-16 rounded-md" />
        </div>
        <div className="pt-4 border-t border-gray-50">
          <Skeleton className="h-11 w-full rounded-xl" />
        </div>
      </div>
    ))}
  </div>
);

/**
 * Skeleton for Events Section (Countdown banner + Event cards)
 */
export const EventsSkeleton = () => (
  <div className="w-full space-y-10" aria-label="Loading events" aria-busy="true">
    {/* Countdown Banner Skeleton */}
    <div className="w-full bg-slate-900/90 rounded-2xl p-6 md:p-8 flex flex-col md:flex-row items-center justify-between text-white shadow-xl animate-pulse">
      <div className="space-y-3 mb-6 md:mb-0 w-full md:w-auto">
        <Skeleton className="h-4 w-32 bg-slate-800" />
        <Skeleton className="h-8 w-56 bg-slate-800" />
        <Skeleton className="h-4 w-72 bg-slate-800" />
      </div>
      <div className="flex gap-3">
        {[1, 2, 3, 4].map((unit) => (
          <div key={unit} className="flex flex-col items-center gap-2">
            <div className="w-14 h-14 md:w-16 md:h-16 bg-slate-800 rounded-xl" />
            <Skeleton className="h-2.5 w-8 bg-slate-800" />
          </div>
        ))}
      </div>
    </div>

    {/* Coming Soon Area Skeleton */}
    <div className="pt-16 pb-12 flex justify-center items-center min-h-[240px]">
      <div className="flex flex-col items-center gap-4">
        <Skeleton className="h-12 w-80 md:w-96 rounded-2xl" />
        <Skeleton className="h-6 w-48 rounded-xl" />
      </div>
    </div>
  </div>
);

/**
 * Skeleton for Team Leadership Section
 */
export const TeamSkeleton = () => (
  <div className="w-full space-y-12" aria-label="Loading team members" aria-busy="true">
    {[1, 2].map((sectionIdx) => (
      <div key={sectionIdx} className="p-6 sm:p-10 rounded-3xl border border-gray-200/80 bg-white space-y-6">
        <div className="flex flex-col items-center text-center max-w-xl mx-auto space-y-3">
          <Skeleton className="h-6 w-36 rounded-full" />
          <Skeleton className="h-8 w-48 rounded-lg" />
          <Skeleton className="h-4 w-80 max-w-full" />
        </div>

        {/* Carousel card placeholder */}
        <div className="max-w-4xl mx-auto py-3">
          <div className="relative w-full overflow-hidden rounded-2xl border border-gray-200 shadow-md flex flex-col sm:flex-row h-[290px] bg-slate-900">
            <div className="w-full sm:w-[46%] h-full bg-slate-800 animate-pulse" />
            <div className="flex-1 bg-white p-6 flex flex-col justify-between">
              <div className="bg-slate-50 border border-slate-100 rounded-xl p-4 flex flex-col justify-between flex-1 space-y-3">
                <div className="space-y-2">
                  <Skeleton className="h-5 w-24 rounded-md" />
                  <Skeleton className="h-7 w-48 rounded-md" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-3/4" />
                </div>
                <div className="pt-2 border-t border-slate-200 flex justify-between items-center">
                  <Skeleton className="h-3 w-16" />
                  <div className="flex gap-2">
                    <Skeleton className="w-7 h-7 rounded-full" />
                    <Skeleton className="w-7 h-7 rounded-full" />
                    <Skeleton className="w-7 h-7 rounded-full" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    ))}
  </div>
);

/**
 * Full Page Loading Root Skeleton
 */
export const PageRootSkeleton = () => (
  <div className="min-h-screen bg-white" aria-label="Loading page content" aria-busy="true">
    {/* Top Navbar Placeholder */}
    <div className="h-20 max-w-7xl mx-auto px-5 sm:px-6 lg:px-8 flex justify-between items-center border-b border-gray-50">
      <div className="flex items-center gap-3">
        <Skeleton className="w-9 h-9 rounded-full" />
        <Skeleton className="h-5 w-48" />
      </div>
      <div className="hidden lg:flex items-center gap-6">
        <Skeleton className="h-4 w-16" />
        <Skeleton className="h-4 w-16" />
        <Skeleton className="h-4 w-16" />
        <Skeleton className="h-4 w-16" />
        <Skeleton className="h-10 w-28 rounded-xl" />
      </div>
    </div>

    {/* Hero Section Placeholder */}
    <div className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-8 pt-20 pb-16 space-y-8">
      <Skeleton className="h-8 w-44 rounded-full" />
      <div className="space-y-4 max-w-3xl">
        <Skeleton className="h-14 sm:h-20 w-full" />
        <Skeleton className="h-14 sm:h-20 w-4/5" />
      </div>
      <Skeleton className="h-6 w-96 max-w-full" />
      <div className="flex gap-4 pt-4">
        <Skeleton className="h-12 w-44 rounded-xl" />
        <Skeleton className="h-12 w-36 rounded-xl" />
      </div>
    </div>
  </div>
);
