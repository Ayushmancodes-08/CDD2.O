'use client';
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Linkedin, Mail, Instagram, Github, ChevronRight, ChevronLeft, ShieldCheck, Star } from 'lucide-react';
import { TEAM_MEMBERS } from '@/lib/cdd-constants';

const SocialLink = ({ href, icon: Icon, label }) => {
  if (!href) return null;
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={label}
      className="w-8 h-8 rounded-full bg-brand-50 hover:bg-brand-600 text-brand-700 hover:text-white border border-brand-200/60 hover:border-brand-600 flex items-center justify-center transition-all duration-300 shadow-sm hover:scale-110"
    >
      <Icon size={14} />
    </a>
  );
};

// Generates a unique, harmonious gradient strip palette based on member role/category/name
const getAccentPalette = (member, isFounder) => {
  if (isFounder) {
    return {
      stripe: 'from-amber-400 via-amber-500 to-yellow-300',
      badge: 'bg-amber-100 text-amber-900 border-amber-300',
      glow: 'shadow-amber-500/10 group-hover:border-amber-400',
      lineGlow: '0 0 8px rgba(245, 158, 11, 0.6)'
    };
  }

  // Derive deterministic color theme index from name string
  let hash = 0;
  const str = member.name + (member.role || '');
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }

  const palettes = [
    {
      stripe: 'from-cyan-400 via-blue-500 to-indigo-600',
      badge: 'bg-cyan-50 text-cyan-700 border-cyan-200',
      glow: 'group-hover:border-cyan-400',
      lineGlow: '0 0 8px rgba(6, 182, 212, 0.6)'
    },
    {
      stripe: 'from-emerald-400 via-teal-500 to-cyan-500',
      badge: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      glow: 'group-hover:border-emerald-400',
      lineGlow: '0 0 8px rgba(16, 185, 129, 0.6)'
    },
    {
      stripe: 'from-indigo-400 via-purple-500 to-pink-500',
      badge: 'bg-purple-50 text-purple-700 border-purple-200',
      glow: 'group-hover:border-purple-400',
      lineGlow: '0 0 8px rgba(168, 85, 247, 0.6)'
    },
    {
      stripe: 'from-blue-500 via-indigo-600 to-violet-600',
      badge: 'bg-indigo-50 text-indigo-700 border-indigo-200',
      glow: 'group-hover:border-indigo-400',
      lineGlow: '0 0 8px rgba(99, 102, 241, 0.6)'
    },
    {
      stripe: 'from-rose-400 via-pink-500 to-amber-400',
      badge: 'bg-rose-50 text-rose-700 border-rose-200',
      glow: 'group-hover:border-rose-400',
      lineGlow: '0 0 8px rgba(244, 63, 94, 0.6)'
    },
    {
      stripe: 'from-sky-400 via-brand-500 to-blue-600',
      badge: 'bg-sky-50 text-sky-700 border-sky-200',
      glow: 'group-hover:border-sky-400',
      lineGlow: '0 0 8px rgba(56, 189, 248, 0.6)'
    }
  ];

  return palettes[Math.abs(hash) % palettes.length];
};

const SplitDiagonalCard = ({ member, isFounder, isCompact }) => {
  const avatarFallback = `https://ui-avatars.com/api/?name=${encodeURIComponent(member.name)}&background=1c3459&color=ffffff&size=512`;
  const palette = getAccentPalette(member, isFounder);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.97 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.97 }}
      transition={{ duration: 0.4, ease: [0.25, 1, 0.5, 1] }}
      className={`relative w-full overflow-hidden rounded-2xl border shadow-md group transition-all duration-300 hover:-translate-y-1 hover:shadow-xl flex flex-col sm:flex-row bg-slate-900 ${
        isCompact ? 'h-auto sm:h-[260px]' : 'h-auto sm:h-[290px]'
      } ${
        isFounder
          ? 'border-amber-400/80 ring-2 ring-amber-400/20'
          : `border-gray-200/80 ${palette.glow}`
      }`}
    >
      {/* Left Photo Container with Slanted Cut */}
      <div className={`relative w-full ${isCompact ? 'sm:w-[42%]' : 'sm:w-[46%]'} h-56 sm:h-full overflow-hidden bg-gradient-to-br from-brand-950 to-slate-900 flex-shrink-0`}>
        <img
          src={member.image || avatarFallback}
          alt={member.name}
          className={`w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 ${
            member.imagePosition ? '' : 'object-top'
          }`}
          style={member.imagePosition ? { objectPosition: member.imagePosition } : { objectPosition: 'center 15%' }}
          loading="lazy"
          decoding="async"
          onError={(e) => {
            e.target.src = avatarFallback;
          }}
        />
        
        {/* Slanted overlay cut for desktop */}
        <div 
          className="hidden sm:block absolute top-0 bottom-0 right-[-1px] w-14 bg-white transform translate-x-1/2 pointer-events-none z-10"
          style={{ clipPath: 'polygon(100% 0, 100% 100%, 0 100%)' }}
        />

        {/* Dynamic Vibrant Diagonal Dividing Line Strip Accent */}
        <div 
          className={`hidden sm:block absolute top-0 bottom-0 right-0 w-[4px] bg-gradient-to-b ${palette.stripe} opacity-90 z-20 pointer-events-none group-hover:w-[5px] transition-all duration-300`}
          style={{
            transform: 'skewX(-12deg)',
            transformOrigin: 'top right',
            boxShadow: palette.lineGlow
          }}
        />

        {/* Founder / Role Badge overlay on photo */}
        {isFounder && (
          <div className="absolute top-3 left-3 bg-amber-500/90 backdrop-blur-md text-white text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full flex items-center gap-1 shadow-md z-20">
            <Star size={12} className="fill-white" /> Founder
          </div>
        )}
      </div>

      {/* Right Side Inner Details Box */}
      <div className="relative flex-1 bg-white p-4 sm:p-6 flex flex-col justify-between overflow-hidden">
        {/* Sub-container card for structured details */}
        <div className="bg-slate-50/80 border border-slate-100 rounded-xl p-3.5 sm:p-4 flex flex-col justify-between flex-1 shadow-inner">
          <div>
            <div className="flex items-center justify-between gap-2 mb-1.5 flex-wrap">
              <span className={`text-[10px] sm:text-[11px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-md ${palette.badge}`}>
                {member.role}
              </span>
              {member.batch && (
                <span className="text-[10px] font-semibold text-gray-500 bg-white border border-gray-200 px-2 py-0.5 rounded">
                  Batch '{member.batch}
                </span>
              )}
            </div>

            <h3 className={`font-display font-extrabold text-brand-950 tracking-tight group-hover:text-brand-600 transition-colors duration-200 ${
              isCompact ? 'text-lg sm:text-xl' : 'text-xl sm:text-2xl'
            }`}>
              {member.name}
            </h3>

            <p className={`text-gray-600 leading-relaxed font-normal mt-1.5 ${
              isCompact ? 'text-xs line-clamp-2' : 'text-xs sm:text-sm line-clamp-3'
            }`}>
              {member.description || 'Dedicated core team member driving innovation, technical development, and excellence across CDD initiatives.'}
            </p>
          </div>

          {/* Social Links Footer inside the details container */}
          <div className="mt-3 pt-2.5 border-t border-slate-200/60 flex items-center justify-between">
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
              Profile
            </span>
            <div className="flex items-center gap-1.5">
              <SocialLink href={member.linkedin} icon={Linkedin} label="LinkedIn" />
              <SocialLink href={member.email ? `mailto:${member.email}` : undefined} icon={Mail} label="Email" />
              <SocialLink href={member.instagram} icon={Instagram} label="Instagram" />
              <SocialLink href={member.github} icon={Github} label="GitHub" />
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

const MemberCarousel = ({ members, itemsPerPageDesktop = 1, isFounder = false }) => {
  const [startIndex, setStartIndex] = useState(0);
  const [itemsPerPage, setItemsPerPage] = useState(itemsPerPageDesktop);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 1024) {
        setItemsPerPage(1);
      } else {
        setItemsPerPage(itemsPerPageDesktop);
      }
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [itemsPerPageDesktop]);

  const maxIndex = Math.max(0, members.length - itemsPerPage);
  const canGoPrev = startIndex > 0;
  const canGoNext = startIndex < maxIndex;

  useEffect(() => {
    if (isPaused || members.length <= itemsPerPage) return;
    const timer = setInterval(() => {
      setStartIndex((prev) => {
        if (prev >= maxIndex) return 0;
        return Math.min(prev + itemsPerPage, maxIndex);
      });
    }, 5000);
    return () => clearInterval(timer);
  }, [isPaused, maxIndex, itemsPerPage, members.length]);

  const nextSlide = () => {
    if (!canGoNext) {
      setStartIndex(0);
      return;
    }
    setStartIndex((prev) => Math.min(prev + itemsPerPage, maxIndex));
  };

  const prevSlide = () => {
    if (!canGoPrev) {
      setStartIndex(maxIndex);
      return;
    }
    setStartIndex((prev) => Math.max(prev - itemsPerPage, 0));
  };

  const visibleMembers = members.slice(startIndex, startIndex + itemsPerPage);

  return (
    <div
      className={`relative w-full mx-auto px-2 sm:px-12 ${
        itemsPerPageDesktop === 1 ? 'max-w-4xl' : 'max-w-6xl'
      }`}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {members.length > itemsPerPage && (
        <>
          <button
            onClick={prevSlide}
            aria-label="Previous Members"
            className="absolute -left-2 sm:left-0 top-1/2 -translate-y-1/2 z-20 p-2.5 sm:p-3 rounded-full bg-white shadow-md border border-gray-200 text-brand-900 hover:bg-brand-600 hover:text-white hover:border-brand-600 hover:scale-110 transition-all duration-300"
          >
            <ChevronLeft size={20} />
          </button>
          <button
            onClick={nextSlide}
            aria-label="Next Members"
            className="absolute -right-2 sm:right-0 top-1/2 -translate-y-1/2 z-20 p-2.5 sm:p-3 rounded-full bg-white shadow-md border border-gray-200 text-brand-900 hover:bg-brand-600 hover:text-white hover:border-brand-600 hover:scale-110 transition-all duration-300"
          >
            <ChevronRight size={20} />
          </button>
        </>
      )}

      <div className="overflow-hidden py-3">
        <motion.div
          key={startIndex}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.45, ease: [0.25, 1, 0.5, 1] }}
          className={`grid gap-6 ${
            itemsPerPage === 1 ? 'grid-cols-1' : 'grid-cols-1 lg:grid-cols-2'
          }`}
        >
          {visibleMembers.map((member, index) => (
            <SplitDiagonalCard
              key={`${member.name}-${startIndex}-${index}`}
              member={member}
              isFounder={isFounder}
              isCompact={itemsPerPageDesktop === 2}
            />
          ))}
        </motion.div>
      </div>

      {members.length > itemsPerPage && (
        <div className="flex justify-center gap-2 mt-6">
          {Array.from({ length: Math.ceil(members.length / itemsPerPage) }).map((_, idx) => {
            const isActive =
              Math.min(
                Math.floor(startIndex / itemsPerPage),
                Math.ceil(members.length / itemsPerPage) - 1
              ) === idx;
            return (
              <button
                key={idx}
                onClick={() => setStartIndex(Math.min(idx * itemsPerPage, maxIndex))}
                className={`h-2.5 rounded-full transition-all duration-300 ${
                  isActive ? 'w-8 bg-brand-600' : 'w-2.5 bg-gray-200 hover:bg-gray-400'
                }`}
                aria-label={`Go to slide ${idx + 1}`}
              />
            );
          })}
        </div>
      )}
    </div>
  );
};

export default function TeamSection() {
  const boardMembers = TEAM_MEMBERS.filter((m) => m.category === 'Board');
  const coreMembers = TEAM_MEMBERS.filter((m) => m.category === 'Core' || m.category === 'Team');
  const founderMember = TEAM_MEMBERS.filter((m) => m.category === 'Founder');
  const alumniMembers = TEAM_MEMBERS.filter((m) => m.category === 'Alumni');

  // Combine Alumni with Founder at the end
  const alumniAndFounder = [...alumniMembers, ...founderMember];

  return (
    <div className="w-full space-y-12">
      {/* Current Board Section (1 Card at a time) */}
      <section className="space-y-6 p-6 sm:p-10 rounded-3xl border border-gray-200/80 bg-gradient-to-b from-white to-gray-50/50 shadow-sm">
        <div className="flex flex-col items-center text-center max-w-xl mx-auto">
          <span className="px-3.5 py-1 rounded-full bg-brand-50 border border-brand-200 text-brand-700 text-xs font-bold uppercase tracking-wider mb-2 flex items-center gap-1.5">
            <ShieldCheck size={14} className="text-brand-600" /> Executive Leadership
          </span>
          <h2 className="text-2xl sm:text-3xl font-display font-black text-brand-950">Current Board</h2>
          <p className="text-gray-600 text-xs sm:text-sm mt-1">Guiding CDD's vision, operations, and strategic technical execution.</p>
        </div>

        {boardMembers.length > 0 ? (
          <MemberCarousel members={boardMembers} itemsPerPageDesktop={1} />
        ) : (
          <div className="flex items-center justify-center p-8 bg-brand-950 text-white rounded-2xl border border-brand-850 shadow-md max-w-2xl mx-auto text-center">
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-brand-300 block mb-1">Notice</span>
              <h3 className="font-display font-bold text-lg text-white">Board Appointments Coming Soon</h3>
              <p className="text-gray-300 text-xs mt-1">Executive Board details for the upcoming session will be updated shortly.</p>
            </div>
          </div>
        )}
      </section>

      {/* Core Committee Section (1 Card at a time) */}
      <section className="space-y-6 p-6 sm:p-10 rounded-3xl border border-gray-200/80 bg-gradient-to-b from-white to-gray-50/50 shadow-sm">
        <div className="flex flex-col items-center text-center max-w-xl mx-auto">
          <span className="px-3.5 py-1 rounded-full bg-brand-50 border border-brand-200 text-brand-700 text-xs font-bold uppercase tracking-wider mb-2">
            The Engines of CDD
          </span>
          <h2 className="text-2xl sm:text-3xl font-display font-black text-brand-950">Core Committee</h2>
          <p className="text-gray-600 text-xs sm:text-sm mt-1">Driving execution, events, technology, and operations across the club.</p>
        </div>

        <MemberCarousel members={coreMembers} itemsPerPageDesktop={1} />
      </section>

      {/* Alumni Network Section (2 Cards at a time, including Founder at end) */}
      <section className="space-y-6 p-6 sm:p-10 rounded-3xl border border-gray-200/80 bg-gradient-to-b from-white to-gray-50/50 shadow-sm">
        <div className="flex flex-col items-center text-center max-w-xl mx-auto">
          <span className="px-3.5 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-700 text-xs font-bold uppercase tracking-wider mb-2">
            Our Legacy
          </span>
          <h2 className="text-2xl sm:text-3xl font-display font-black text-brand-950">Alumni Network</h2>
          <p className="text-gray-600 text-xs sm:text-sm mt-1">Celebrating proud graduates and founders carrying forward technical excellence worldwide.</p>
        </div>

        <MemberCarousel members={alumniAndFounder} itemsPerPageDesktop={2} />
      </section>
    </div>
  );
}

