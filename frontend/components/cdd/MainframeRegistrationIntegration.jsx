'use client';
/**
 * MainframeRegistrationIntegration.jsx
 * ============================================================================
 * SEPARATE ARCHIVED REGISTRATION MODULE FOR THE MAINFRAME (HOMEPAGE)
 * ============================================================================
 * This file isolates and preserves all components, buttons, banners, and state
 * hooks required to reconnect the Full Registration Modal to the website's
 * Mainframe (`frontend/app/page.js` and `frontend/components/cdd/Navbar.jsx`).
 *
 * HOW TO RECONNECT TO THE MAINFRAME:
 * 1. In `frontend/app/page.js`:
 *    - Import this module:
 *        import {
 *          RegistrationModalLazy,
 *          HeroRegistrationBadge,
 *          HeroRegistrationButton,
 *          useMainframeRegistration
 *        } from '@/components/cdd/MainframeRegistrationIntegration';
 *
 *    - Inside `function App()`:
 *        const { isRegisterOpen, openRegister, closeRegister, handleSuccess } = useMainframeRegistration();
 *
 *    - In the Hero section:
 *        Replace the Est. 2021 badge with: <HeroRegistrationBadge onOpen={openRegister} />
 *        Add/replace the CTA button with: <HeroRegistrationButton onOpen={openRegister} />
 *
 *    - Pass `onOpenRegister={openRegister}` to `<Navbar />`.
 *
 *    - At the bottom of `page.js`:
 *        <RegistrationModalLazy isOpen={isRegisterOpen} onClose={closeRegister} onSuccess={handleSuccess} />
 *
 * 2. In `frontend/components/cdd/Navbar.jsx`:
 *    - Uncomment the Desktop and Mobile "Register" buttons.
 * ============================================================================
 */

import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { motion } from 'framer-motion';
import { ChevronRight, Sparkles } from 'lucide-react';
import { MagneticButton } from '@/components/cdd/Animations';

// 1. Lazy-loaded RegistrationModal
export const RegistrationModalLazy = dynamic(
  () => import('@/components/cdd/RegistrationModal'),
  { ssr: false }
);

// 2. Custom hook managing modal state & member count updates
export function useMainframeRegistration(onRegistrationSuccessCallback) {
  const [isRegisterOpen, setIsRegisterOpen] = useState(false);

  const openRegister = () => setIsRegisterOpen(true);
  const closeRegister = () => setIsRegisterOpen(false);

  const handleSuccess = () => {
    if (typeof onRegistrationSuccessCallback === 'function') {
      onRegistrationSuccessCallback();
    }
  };

  return {
    isRegisterOpen,
    openRegister,
    closeRegister,
    handleSuccess,
  };
}

// 3. Hero Section Registration Badge
export function HeroRegistrationBadge({ onOpen }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      className="inline-flex flex-wrap items-center gap-2.5 px-4 py-2 bg-brand-50/90 border border-brand-200/80 rounded-full mb-8 shadow-sm"
    >
      <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
      <span className="text-brand-900 text-xs font-bold tracking-wide">
        Registration 2026 is LIVE!
      </span>
      <span className="text-gray-300 hidden sm:inline">|</span>
      <button
        onClick={onOpen}
        type="button"
        className="text-xs font-semibold text-brand-600 hover:text-brand-900 underline flex items-center gap-1 cursor-pointer"
      >
        Apply Online &rarr;
      </button>
    </motion.div>
  );
}

// 4. Hero Section Primary Registration Button
export function HeroRegistrationButton({ onOpen, className = '' }) {
  return (
    <MagneticButton strength={0.2}>
      <button
        onClick={onOpen}
        type="button"
        className={`btn-primary group w-full sm:w-auto justify-center text-center shadow-lg shadow-brand-500/20 bg-brand-900 hover:bg-brand-800 text-white flex items-center gap-2 ${className}`}
      >
        <Sparkles size={16} className="text-brand-300 animate-pulse" />
        Registration 2026
        <ChevronRight size={16} className="group-hover:translate-x-1 transition-transform" />
      </button>
    </MagneticButton>
  );
}

// 5. Standalone Self-Contained Registration Trigger + Modal Wrapper
export default function MainframeRegistrationModule({ isOpen, onClose, onSuccess }) {
  return (
    <RegistrationModalLazy
      isOpen={isOpen}
      onClose={onClose}
      onSuccess={onSuccess}
    />
  );
}
