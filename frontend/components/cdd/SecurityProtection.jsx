'use client';

import { useEffect } from 'react';

/**
 * Security & Anti-Theft Protection Guard
 * - Restricts Right Click (Context Menu)
 * - Blocks DevTools shortcuts (F12, Ctrl+Shift+I/J/C, Ctrl+U, Ctrl+S)
 * - Prevents image & asset dragging
 * - Emits security deterrence warnings
 */
export default function SecurityProtection() {
  useEffect(() => {
    if (typeof window === 'undefined') return;

    // 1. Disable Right Click / Context Menu (except in input / textarea fields)
    const handleContextMenu = (e) => {
      const tagName = e.target.tagName?.toUpperCase();
      if (tagName !== 'INPUT' && tagName !== 'TEXTAREA') {
        e.preventDefault();
        return false;
      }
    };

    // 2. Disable Keyboard Inspection Shortcuts
    const handleKeyDown = (e) => {
      const isCtrlOrMeta = e.ctrlKey || e.metaKey;
      const key = e.key?.toUpperCase();
      const code = e.keyCode || e.which;

      // F12 (DevTools)
      if (key === 'F12' || code === 123) {
        e.preventDefault();
        e.stopPropagation();
        return false;
      }

      // Ctrl+Shift+I (Inspect), Ctrl+Shift+J (Console), Ctrl+Shift+C (Inspect Element)
      if (isCtrlOrMeta && e.shiftKey && (key === 'I' || key === 'J' || key === 'C')) {
        e.preventDefault();
        e.stopPropagation();
        return false;
      }

      // Ctrl+U (View Source)
      if (isCtrlOrMeta && key === 'U') {
        e.preventDefault();
        e.stopPropagation();
        return false;
      }

      // Ctrl+S (Save Webpage / Download Assets)
      if (isCtrlOrMeta && key === 'S') {
        e.preventDefault();
        e.stopPropagation();
        return false;
      }

      // Ctrl+P (Print / Save as PDF)
      if (isCtrlOrMeta && key === 'P') {
        e.preventDefault();
        e.stopPropagation();
        return false;
      }
    };

    // 3. Prevent Image & Asset Dragging
    const handleDragStart = (e) => {
      if (e.target.tagName?.toUpperCase() === 'IMG' || e.target.tagName?.toUpperCase() === 'A') {
        e.preventDefault();
        return false;
      }
    };

    // 4. Console Security Deterrence Warning
    try {
      const bannerStyle = 'color: #ef4444; font-size: 24px; font-weight: bold; text-shadow: 1px 1px black;';
      const textStyle = 'color: #3b82f6; font-size: 14px;';
      console.clear();
      console.log('%c⚠️ SECURITY WARNING', bannerStyle);
      console.log('%cThis web application is protected against unauthorized copying, reverse engineering, and data scraping.', textStyle);
      console.log('%cAll content and assets are property of Idea and Innovation Cell (IIC PMEC).', textStyle);
    } catch {
      // Ignore console errors
    }

    // Attach global event listeners
    document.addEventListener('contextmenu', handleContextMenu, { capture: true });
    document.addEventListener('keydown', handleKeyDown, { capture: true });
    document.addEventListener('dragstart', handleDragStart, { capture: true });

    return () => {
      document.removeEventListener('contextmenu', handleContextMenu, { capture: true });
      document.removeEventListener('keydown', handleKeyDown, { capture: true });
      document.removeEventListener('dragstart', handleDragStart, { capture: true });
    };
  }, []);

  return null;
}
