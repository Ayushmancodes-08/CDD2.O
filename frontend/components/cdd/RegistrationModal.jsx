'use client';
import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import RegistrationForm from './RegistrationForm';

export default function RegistrationModal({ isOpen, onClose, onSuccess }) {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-2 sm:p-4 md:p-6 overflow-y-auto overscroll-contain">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            className="fixed inset-0 bg-brand-950/75 backdrop-blur-md"
          />

          {/* Modal Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 16 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
            className="relative w-full max-w-2xl bg-transparent z-10 my-auto max-h-[94vh] sm:max-h-[90vh] overflow-y-auto rounded-3xl"
            style={{ WebkitOverflowScrolling: 'touch' }}
          >
            {/* Close Button */}
            <button
              onClick={onClose}
              className="absolute top-3 right-3 sm:top-4 sm:right-4 z-30 w-9 h-9 flex items-center justify-center rounded-full bg-white/90 hover:bg-white text-gray-700 shadow-md transition-all hover:scale-105 active:scale-95 cursor-pointer"
              aria-label="Close Registration Modal"
            >
              <X size={18} strokeWidth={2.5} />
            </button>

            <RegistrationForm isModal={true} onSuccess={onSuccess} />
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
