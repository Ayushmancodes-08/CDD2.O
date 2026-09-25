'use client';
import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import RegistrationForm from './RegistrationForm';

export default function RegistrationModal({ isOpen, onClose, onSuccess }) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  const handleClose = () => {
    // Clean up payment hash if active
    if (typeof window !== 'undefined' && window.location.hash === '#payment') {
      try {
        window.history.replaceState(null, '', window.location.pathname + window.location.search);
      } catch (e) {}
    }
    if (onClose) onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-2 sm:p-4 md:p-6 overflow-y-auto overscroll-contain">
          {/* Backdrop - NO onClick handler so clicking outside will NOT close the modal */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-brand-950/80 backdrop-blur-md pointer-events-auto"
          />

          {/* Modal Card Wrapper */}
          <div className="relative w-full max-w-2xl z-10 my-auto">
            {/* Explicit Cross Close Button - The ONLY way to close modal */}
            <button
              onClick={handleClose}
              type="button"
              className="absolute top-2.5 right-2.5 sm:top-3.5 sm:right-3.5 z-50 w-9 h-9 sm:w-10 sm:h-10 flex items-center justify-center rounded-full bg-white/95 hover:bg-white text-gray-700 hover:text-brand-900 shadow-xl border border-gray-200/80 transition-all hover:scale-105 active:scale-95 cursor-pointer focus:outline-none focus:ring-2 focus:ring-brand-500"
              aria-label="Close Registration Modal"
              title="Close modal"
            >
              <X size={19} strokeWidth={2.5} />
            </button>

            {/* Modal Card Content */}
            <motion.div
              id="cdd-modal-content-container"
              initial={{ opacity: 0, scale: 0.95, y: 16 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 16 }}
              transition={{ duration: 0.25, ease: 'easeOut' }}
              className="relative w-full bg-transparent max-h-[94vh] sm:max-h-[90vh] overflow-y-auto rounded-3xl"
              style={{ WebkitOverflowScrolling: 'touch' }}
            >
              <RegistrationForm isModal={true} onSuccess={onSuccess} />
            </motion.div>
          </div>
        </div>
      )}
    </AnimatePresence>
  );
}
