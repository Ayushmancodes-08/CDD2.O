'use client';
import React, { useState, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, ArrowLeft, ChevronLeft, ChevronRight, X, ImageIcon } from 'lucide-react';
import { useGallery } from './useGallery';

export function FullPageGallery({ onBack }) {
  const [selectedIndex, setSelectedIndex] = useState(null);
  const { images, loading, error } = useGallery();
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  const allImages = images.map(img => img.url);

  const handleNext = useCallback((e) => {
    if (allImages.length === 0) return;
    e?.stopPropagation();
    setSelectedIndex((prev) => (prev !== null ? (prev + 1) % allImages.length : null));
  }, [allImages.length]);

  const handlePrev = useCallback((e) => {
    if (allImages.length === 0) return;
    e?.stopPropagation();
    setSelectedIndex((prev) => (prev !== null ? (prev - 1 + allImages.length) % allImages.length : null));
  }, [allImages.length]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        if (selectedIndex !== null) setSelectedIndex(null);
        else onBack();
      }
      if (selectedIndex !== null) {
        if (e.key === 'ArrowRight') handleNext();
        if (e.key === 'ArrowLeft') handlePrev();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedIndex, handleNext, handlePrev, onBack]);

  useEffect(() => { window.scrollTo(0, 0); }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-brand-900 text-lg font-display font-semibold animate-pulse">Loading Archive...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center p-4">
        <div className="text-red-500 text-lg font-display font-bold mb-4">Unable to Load Gallery</div>
        <div className="bg-red-50 text-red-600 p-4 rounded-xl max-w-md text-center border border-red-100">
          <p className="font-mono text-sm mb-2">{error}</p>
        </div>
        <button onClick={onBack} className="mt-6 btn-primary">Go Back</button>
      </div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="min-h-screen bg-white relative">
      <div className="relative z-10 max-w-[1600px] mx-auto px-4 md:px-6 py-8">
        <div className="flex items-center justify-between mb-8 sticky top-4 bg-white/90 backdrop-blur-md py-4 px-6 rounded-2xl border border-gray-100 shadow-sm z-20">
          <div className="flex items-center gap-4">
            <button onClick={onBack} className="p-2 hover:bg-gray-100 rounded-full transition-colors text-brand-900" aria-label="Back">
              <ArrowLeft size={20} />
            </button>
            <div>
              <h1 className="text-lg md:text-xl font-display font-bold text-brand-900">Archive Gallery</h1>
              <p className="text-xs text-gray-500 font-medium">{allImages.length} Moments Captured</p>
            </div>
          </div>
        </div>

        {allImages.length === 0 ? (
          <div className="py-24 flex flex-col items-center justify-center text-gray-400">
            <ImageIcon size={48} className="mb-4" />
            <p className="text-sm">No images found in the gallery folder.</p>
          </div>
        ) : (
          <div className="columns-2 md:columns-3 lg:columns-4 xl:columns-5 gap-4 md:gap-5 pb-20">
            {allImages.map((src, idx) => (
              <motion.div key={`archive-${idx}`} initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
                transition={{ delay: Math.min(idx * 0.02, 0.8) }}
                className="break-inside-avoid relative group rounded-2xl cursor-pointer transition-all duration-300 mb-5"
                onClick={() => setSelectedIndex(idx)}>
                <div className="bg-white p-1.5 shadow-sm hover:shadow-lg rounded-2xl border border-gray-100 hover:border-brand-200 transition-all">
                  <div className="relative overflow-hidden rounded-xl">
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors z-10" />
                    <img src={src} alt={`Gallery ${idx}`} className="w-full h-auto object-cover transition-transform duration-500 group-hover:scale-[1.03]" loading="lazy" referrerPolicy="no-referrer" />
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {mounted && (
        <AnimatePresence>
          {selectedIndex !== null && createPortal(
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 bg-white/95 backdrop-blur-xl flex items-center justify-center p-4"
              style={{ zIndex: 2147483647 }} onClick={() => setSelectedIndex(null)}>
              <button className="absolute top-6 right-6 text-gray-600 hover:text-brand-900 bg-gray-100 hover:bg-gray-200 p-3 rounded-full transition-all z-20"
                onClick={() => setSelectedIndex(null)}><X size={20} /></button>
              <button className="absolute left-4 md:left-8 top-1/2 -translate-y-1/2 p-3 text-gray-600 hover:text-brand-900 bg-gray-100 hover:bg-gray-200 rounded-full transition-all z-20"
                onClick={handlePrev}><ChevronLeft size={28} /></button>
              <button className="absolute right-4 md:right-8 top-1/2 -translate-y-1/2 p-3 text-gray-600 hover:text-brand-900 bg-gray-100 hover:bg-gray-200 rounded-full transition-all z-20"
                onClick={handleNext}><ChevronRight size={28} /></button>
              <motion.img key={selectedIndex} initial={{ scale: 0.97, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
                src={allImages[selectedIndex]} alt="Full size"
                className="max-w-full max-h-[85vh] shadow-2xl rounded-xl pointer-events-auto select-none"
                onClick={(e) => e.stopPropagation()} referrerPolicy="no-referrer" />
              <div className="absolute bottom-6 left-1/2 -translate-x-1/2 text-gray-600 font-mono text-xs bg-gray-100 px-4 py-1.5 rounded-full">
                {selectedIndex + 1} / {allImages.length}
              </div>
            </motion.div>,
            document.body
          )}
        </AnimatePresence>
      )}
    </motion.div>
  );
}

export function GallerySection({ onViewArchive }) {
  const { images, loading, error } = useGallery();
  const [selectedIndex, setSelectedIndex] = useState(null);
  const [shuffledImages, setShuffledImages] = useState([]);

  useEffect(() => {
    if (images.length > 0) {
      const allUrls = images.map(img => img.url);
      const shuffled = [...allUrls].sort(() => 0.5 - Math.random());
      setShuffledImages(shuffled.slice(0, 8));
    }
  }, [images]);

  const displayImages = shuffledImages.length > 0 ? shuffledImages : images.slice(0, 8).map(img => img.url);

  const handleNext = useCallback((e) => {
    if (displayImages.length === 0) return;
    e?.stopPropagation();
    setSelectedIndex((prev) => (prev !== null ? (prev + 1) % displayImages.length : null));
  }, [displayImages.length]);

  const handlePrev = useCallback((e) => {
    if (displayImages.length === 0) return;
    e?.stopPropagation();
    setSelectedIndex((prev) => (prev !== null ? (prev - 1 + displayImages.length) % displayImages.length : null));
  }, [displayImages.length]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') setSelectedIndex(null);
      if (selectedIndex !== null) {
        if (e.key === 'ArrowRight') handleNext();
        if (e.key === 'ArrowLeft') handlePrev();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedIndex, handleNext, handlePrev]);

  if (loading) {
    return (
      <div className="h-64 flex items-center justify-center">
        <div className="animate-spin rounded-full h-6 w-6 border-2 border-transparent border-t-brand-500"></div>
      </div>
    );
  }

  if (error && images.length === 0) {
    return (
      <div className="h-64 flex flex-col items-center justify-center text-center p-4">
        <ImageIcon size={36} className="text-gray-300 mb-3" />
        <p className="text-red-500 font-medium mb-2 text-sm">Gallery Unavailable</p>
        <p className="text-xs text-gray-500 max-w-md">{error}</p>
      </div>
    );
  }

  if (images.length === 0) {
    return (
      <div className="py-12 flex items-center justify-center text-gray-400 font-medium text-sm">
        No images found in the gallery folder.
      </div>
    );
  }

  return (
    <>
      <div className="columns-2 md:columns-3 lg:columns-4 gap-4 md:gap-5">
        {displayImages.map((src, idx) => (
          <motion.div key={idx} initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            transition={{ duration: 0.4, delay: idx * 0.04 }} className="break-inside-avoid relative group cursor-pointer mb-5">
            <div onClick={() => setSelectedIndex(idx)}
              className="bg-white p-1.5 shadow-sm group-hover:shadow-lg transition-all duration-300 transform group-hover:scale-[1.02] rounded-2xl border border-gray-100 group-hover:border-brand-200">
              <div className="relative overflow-hidden bg-gray-50 rounded-xl">
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors z-10 duration-300" />
                <img src={src} alt={`Gallery ${idx + 1}`} className="w-full h-auto object-cover" loading="lazy" referrerPolicy="no-referrer" />
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="mt-12 text-center">
        <button onClick={onViewArchive} className="btn-primary group">
          View Full Archive <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
        </button>
      </div>

      <AnimatePresence>
        {selectedIndex !== null && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-white/95 backdrop-blur-xl flex items-center justify-center p-4 z-[9999]"
            onClick={() => setSelectedIndex(null)}>
            <button className="absolute top-6 right-6 text-gray-600 hover:text-brand-900 bg-gray-100 hover:bg-gray-200 p-3 rounded-full transition-all z-20"
              onClick={() => setSelectedIndex(null)}><X size={20} /></button>
            <button className="absolute left-4 md:left-8 top-1/2 -translate-y-1/2 p-3 text-gray-600 hover:text-brand-900 bg-gray-100 hover:bg-gray-200 rounded-full transition-all z-20"
              onClick={(e) => { e.stopPropagation(); handlePrev(e); }}><ChevronLeft size={28} /></button>
            <button className="absolute right-4 md:right-8 top-1/2 -translate-y-1/2 p-3 text-gray-600 hover:text-brand-900 bg-gray-100 hover:bg-gray-200 rounded-full transition-all z-20"
              onClick={(e) => { e.stopPropagation(); handleNext(e); }}><ChevronRight size={28} /></button>
            <motion.img key={selectedIndex} src={displayImages[selectedIndex]} alt="Full size"
              initial={{ scale: 0.97, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
              className="max-w-full max-h-[85vh] shadow-2xl rounded-xl pointer-events-auto select-none"
              onClick={(e) => e.stopPropagation()} referrerPolicy="no-referrer" />
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 text-gray-600 font-mono text-xs bg-gray-100 px-4 py-1.5 rounded-full">
              {selectedIndex + 1} / {displayImages.length}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
