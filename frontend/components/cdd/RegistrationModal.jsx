'use client';
import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, AlertTriangle, ArrowRight } from 'lucide-react';
import RegistrationForm from './RegistrationForm';

export default function RegistrationModal({ isOpen, onClose, onSuccess }) {
  const [showExitConfirm, setShowExitConfirm] = useState(false);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
      setShowExitConfirm(false);
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  // Intercept close attempt to prevent accidental data loss
  const handleAttemptClose = () => {
    try {
      const draft = localStorage.getItem('cdd_reg_draft_2026');
      if (draft) {
        const parsed = JSON.parse(draft);
        if (parsed?.name || parsed?.rollNo || parsed?.email || parsed?.utr || (parsed?.step && parsed.step > 1)) {
          setShowExitConfirm(true);
          return;
        }
      }
    } catch (e) {}

    executeClose();
  };

  const executeClose = () => {
    setShowExitConfirm(false);
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
          {/* Static Backdrop: Tapping outside DOES NOT close the modal to avoid accidental dismissal */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-brand-950/85 backdrop-blur-md pointer-events-auto"
          />

          {/* Modal Card Wrapper */}
          <div className="relative w-full max-w-2xl z-10 my-auto">
            {/* Top Close Button (Protected against accidental tap) */}
            <button
              onClick={handleAttemptClose}
              type="button"
              className="absolute top-2.5 right-2.5 sm:top-3.5 sm:right-3.5 z-50 w-9 h-9 sm:w-10 sm:h-10 flex items-center justify-center rounded-full bg-white/95 hover:bg-white text-gray-700 hover:text-brand-900 shadow-xl border border-gray-200/80 transition-all hover:scale-105 active:scale-95 cursor-pointer focus:outline-none focus:ring-2 focus:ring-brand-500"
              aria-label="Close Registration Modal"
              title="Close modal"
            >
              <X size={19} strokeWidth={2.5} />
            </button>

            {/* Accidental Close Protection Confirmation Dialog */}
            <AnimatePresence>
              {showExitConfirm && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="absolute inset-0 z-[60] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm rounded-3xl"
                >
                  <div className="bg-white rounded-2xl p-6 max-w-sm w-full text-center shadow-2xl space-y-4 border border-gray-100">
                    <div className="w-12 h-12 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center mx-auto">
                      <AlertTriangle size={24} />
                    </div>
                    <div>
                      <h4 className="text-base font-display font-bold text-gray-900">
                        Leave Registration?
                      </h4>
                      <p className="text-xs text-gray-500 mt-1 leading-relaxed">
                        Your entered progress has been automatically saved in this browser. You can return anytime to finish.
                      </p>
                    </div>
                    <div className="flex flex-col sm:flex-row gap-2 pt-2">
                      <button
                        type="button"
                        onClick={() => setShowExitConfirm(false)}
                        className="w-full py-2.5 px-4 rounded-xl bg-brand-900 hover:bg-brand-800 text-white text-xs font-bold shadow-md transition-all cursor-pointer"
                      >
                        Keep Editing Form
                      </button>
                      <button
                        type="button"
                        onClick={executeClose}
                        className="w-full py-2.5 px-4 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold transition-all cursor-pointer"
                      >
                        Save Draft & Exit
                      </button>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Modal Card Content Container */}
            <motion.div
              id="cdd-modal-content-container"
              initial={{ opacity: 0, scale: 0.95, y: 16 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 16 }}
              transition={{ duration: 0.25, ease: 'easeOut' }}
              className="relative w-full bg-transparent max-h-[92dvh] sm:max-h-[90vh] overflow-y-auto rounded-3xl pb-[env(safe-area-inset-bottom,16px)]"
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
