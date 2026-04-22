'use client';
import React, { useRef, useState, useEffect } from 'react';
import { motion, useMotionValue, useSpring, useTransform, useInView } from 'framer-motion';

/* ---------- Magnetic Button (cursor-following) ---------- */
export function MagneticButton({ children, className = '', strength = 0.25, ...props }) {
  const ref = useRef(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const sx = useSpring(x, { stiffness: 150, damping: 15, mass: 0.1 });
  const sy = useSpring(y, { stiffness: 150, damping: 15, mass: 0.1 });

  const handleMove = (e) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const dx = e.clientX - (rect.left + rect.width / 2);
    const dy = e.clientY - (rect.top + rect.height / 2);
    x.set(dx * strength);
    y.set(dy * strength);
  };
  const handleLeave = () => { x.set(0); y.set(0); };

  return (
    <motion.div ref={ref} onMouseMove={handleMove} onMouseLeave={handleLeave}
      style={{ x: sx, y: sy }} className={`inline-block ${className}`}>
      {React.cloneElement(children, props)}
    </motion.div>
  );
}

/* ---------- Word-by-word text reveal ---------- */
export function TextReveal({ text, className = '', stagger = 0.05, delay = 0 }) {
  const words = text.split(' ');
  return (
    <span className={`inline-block ${className}`}>
      {words.map((word, i) => (
        <span key={i} className="inline-block overflow-hidden align-top">
          <motion.span
            initial={{ y: '110%' }}
            animate={{ y: 0 }}
            transition={{ duration: 0.75, delay: delay + i * stagger, ease: [0.33, 1, 0.68, 1] }}
            className="inline-block"
          >
            {word}{i < words.length - 1 ? '\u00A0' : ''}
          </motion.span>
        </span>
      ))}
    </span>
  );
}

/* ---------- Character stagger ---------- */
export function CharReveal({ text, className = '', delay = 0 }) {
  return (
    <span className={`inline-block ${className}`}>
      {text.split('').map((char, i) => (
        <motion.span key={i}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: delay + i * 0.03, ease: 'easeOut' }}
          className="inline-block"
        >
          {char === ' ' ? '\u00A0' : char}
        </motion.span>
      ))}
    </span>
  );
}

/* ---------- 3D Tilt wrapper for cards ---------- */
export function Tilt({ children, className = '', max = 8 }) {
  const ref = useRef(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const rx = useSpring(useTransform(y, [-0.5, 0.5], [max, -max]), { stiffness: 200, damping: 20 });
  const ry = useSpring(useTransform(x, [-0.5, 0.5], [-max, max]), { stiffness: 200, damping: 20 });

  const handleMove = (e) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    x.set((e.clientX - rect.left) / rect.width - 0.5);
    y.set((e.clientY - rect.top) / rect.height - 0.5);
  };
  const handleLeave = () => { x.set(0); y.set(0); };

  return (
    <motion.div ref={ref} onMouseMove={handleMove} onMouseLeave={handleLeave}
      style={{ rotateX: rx, rotateY: ry, transformStyle: 'preserve-3d' }}
      className={className}>
      {children}
    </motion.div>
  );
}

/* ---------- Reveal on scroll (clip-path mask) ---------- */
export function MaskReveal({ children, className = '', direction = 'left', delay = 0 }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-80px' });
  const fromClip = direction === 'left' ? 'inset(0 100% 0 0)' : direction === 'right' ? 'inset(0 0 0 100%)' : 'inset(100% 0 0 0)';
  return (
    <motion.div ref={ref}
      initial={{ clipPath: fromClip, opacity: 0 }}
      animate={inView ? { clipPath: 'inset(0 0 0 0)', opacity: 1 } : {}}
      transition={{ duration: 1.1, delay, ease: [0.77, 0, 0.175, 1] }}
      className={className}>
      {children}
    </motion.div>
  );
}

/* ---------- Staggered children container ---------- */
export function StaggerGroup({ children, className = '', delay = 0.1 }) {
  return (
    <motion.div className={className}
      initial="hidden" whileInView="show" viewport={{ once: true, margin: '-60px' }}
      variants={{ hidden: {}, show: { transition: { staggerChildren: delay } } }}>
      {children}
    </motion.div>
  );
}
export const staggerItem = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } }
};

/* ---------- Floating scroll indicator ---------- */
export function ScrollIndicator() {
  const [show, setShow] = useState(true);
  useEffect(() => {
    const onScroll = () => setShow(window.scrollY < 100);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: show ? 1 : 0 }}
      transition={{ duration: 0.4 }}
      className="hidden lg:flex absolute bottom-8 left-1/2 -translate-x-1/2 flex-col items-center gap-2 text-gray-400 pointer-events-none z-10"
    >
      <span className="text-[10px] font-semibold tracking-[0.3em] uppercase">Scroll</span>
      <div className="w-px h-10 bg-gradient-to-b from-gray-300 to-transparent relative overflow-hidden">
        <motion.div
          className="absolute top-0 left-0 w-full h-4 bg-brand-500"
          animate={{ y: [0, 40, 40] }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
        />
      </div>
    </motion.div>
  );
}
