'use client';
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Globe,
  Flame,
  GraduationCap,
  BookOpen,
  LayoutDashboard,
  Users,
  Mail,
  Share2,
  Check,
  QrCode,
  ExternalLink,
  ChevronRight,
  ShieldCheck,
  Palette,
  ArrowLeft,
  X,
  Copy,
  Download
} from 'lucide-react';
import { Github, Linkedin, Instagram } from 'lucide-react';
import { toast } from 'sonner';
import Link from 'next/link';

// Theme Presets - Emerald Matrix is the Default
const THEMES = {
  emerald: {
    id: 'emerald',
    name: 'Emerald Matrix',
    bg: 'bg-[#04120d]',
    meshBg: 'from-emerald-900/30 via-teal-950/20 to-slate-950',
    cardBg: 'bg-[#082018]/90 hover:bg-[#0d2d22] border-emerald-500/20 hover:border-emerald-400/60 text-white',
    cardGlow: 'hover:shadow-[0_0_25px_rgba(16,185,129,0.22)]',
    accentText: 'text-emerald-400',
    badge: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30',
    iconBg: 'bg-emerald-950/80 border-emerald-800/40 text-emerald-400',
    iconColor: 'text-emerald-400',
    textColor: 'text-white',
    subTextColor: 'text-emerald-100/60',
    pillBorder: 'border-emerald-800/40',
    socialBg: 'bg-[#082018] hover:bg-emerald-600 text-emerald-300 hover:text-white border-emerald-700/40',
    avatarRing: 'ring-emerald-500/40 shadow-[0_0_25px_rgba(16,185,129,0.25)]',
  },
  midnight: {
    id: 'midnight',
    name: 'Midnight Cyber',
    bg: 'bg-slate-950',
    meshBg: 'from-brand-950 via-slate-900 to-brand-900',
    cardBg: 'bg-slate-900/80 hover:bg-slate-850 border-slate-800/80 hover:border-brand-500/50 text-white',
    cardGlow: 'hover:shadow-[0_0_25px_rgba(59,130,246,0.15)]',
    accentText: 'text-brand-400',
    badge: 'bg-brand-500/10 text-brand-400 border-brand-500/20',
    iconBg: 'bg-slate-950 border-slate-800 text-brand-400',
    iconColor: 'text-brand-400',
    textColor: 'text-white',
    subTextColor: 'text-slate-400',
    pillBorder: 'border-slate-800',
    socialBg: 'bg-slate-900 hover:bg-brand-600 text-slate-300 hover:text-white border-slate-800',
    avatarRing: 'ring-brand-500/40 shadow-[0_0_25px_rgba(59,130,246,0.2)]',
  },
  sunset: {
    id: 'sunset',
    name: 'Sunset Gradient',
    bg: 'bg-gradient-to-b from-purple-950 via-rose-950 to-orange-950',
    meshBg: 'from-fuchsia-900/40 via-rose-900/30 to-amber-900/40',
    cardBg: 'bg-white/10 hover:bg-white/15 backdrop-blur-md border-white/15 hover:border-rose-400/50 text-white',
    cardGlow: 'hover:shadow-[0_0_25px_rgba(244,63,94,0.2)]',
    accentText: 'text-rose-400',
    badge: 'bg-rose-500/20 text-rose-300 border-rose-500/30',
    iconBg: 'bg-white/10 border-white/20 text-rose-400',
    iconColor: 'text-rose-400',
    textColor: 'text-white',
    subTextColor: 'text-rose-200/80',
    pillBorder: 'border-white/20',
    socialBg: 'bg-white/10 hover:bg-rose-500 text-white border-white/20',
    avatarRing: 'ring-rose-500/40 shadow-[0_0_25px_rgba(244,63,94,0.25)]',
  },
  aurora: {
    id: 'aurora',
    name: 'Aurora Velvet',
    bg: 'bg-gradient-to-b from-[#1a0b2e] via-[#110724] to-[#0a0414]',
    meshBg: 'from-purple-900/40 via-indigo-900/30 to-violet-950/50',
    cardBg: 'bg-purple-950/40 hover:bg-purple-900/40 backdrop-blur-md border-purple-800/40 hover:border-purple-400/60 text-white',
    cardGlow: 'hover:shadow-[0_0_25px_rgba(168,85,247,0.25)]',
    accentText: 'text-purple-300',
    badge: 'bg-purple-500/20 text-purple-200 border-purple-500/30',
    iconBg: 'bg-purple-950/80 border-purple-800/50 text-purple-400',
    iconColor: 'text-purple-400',
    textColor: 'text-white',
    subTextColor: 'text-purple-200/70',
    pillBorder: 'border-purple-800/50',
    socialBg: 'bg-purple-950/60 hover:bg-purple-600 text-purple-200 hover:text-white border-purple-800/50',
    avatarRing: 'ring-purple-500/40 shadow-[0_0_25px_rgba(168,85,247,0.25)]',
  },
  minimal: {
    id: 'minimal',
    name: 'Minimal Light',
    bg: 'bg-slate-50',
    meshBg: 'from-slate-100 via-white to-slate-100',
    cardBg: 'bg-white hover:bg-slate-50 border-slate-200 hover:border-emerald-600 text-slate-900 shadow-sm',
    cardGlow: 'hover:shadow-md',
    accentText: 'text-emerald-700',
    badge: 'bg-emerald-50 text-emerald-800 border-emerald-200',
    iconBg: 'bg-slate-100 border-slate-200 text-emerald-700',
    iconColor: 'text-emerald-700',
    textColor: 'text-slate-900',
    subTextColor: 'text-slate-500',
    pillBorder: 'border-slate-200',
    socialBg: 'bg-white hover:bg-emerald-600 text-slate-600 hover:text-white border-slate-200 shadow-sm',
    avatarRing: 'ring-slate-300 shadow-md',
  }
};

const LINK_SECTIONS = [
  {
    category: 'Official Links',
    links: [
      {
        id: 'website',
        title: 'Official Web Portal',
        subtitle: 'Explore our clubs, teams, research & achievements',
        url: 'https://iicpmec.vercel.app',
        icon: Globe,
        badge: 'Official',
        badgeColor: 'bg-emerald-500 text-white',
      },
      {
        id: 'team',
        title: 'Meet Our Leadership & Team',
        subtitle: 'Secretary, coordinators, faculty advisory board & alumni',
        url: 'https://iicpmec.vercel.app/#team',
        icon: Users,
      },
      {
        id: 'contact',
        title: 'Contact & Collaboration Desk',
        subtitle: 'Sponsorships, project proposals & general inquiries',
        url: 'https://iicpmec.vercel.app/#contact',
        icon: Mail,
      },
    ],
  },
  {
    category: 'Social Channels',
    links: [
      {
        id: 'instagram',
        title: 'Instagram (@ideainnovationcell.pmec)',
        subtitle: 'Stories, workshop updates, event reels & photo archives',
        url: 'https://www.instagram.com/ideainnovationcell.pmec',
        icon: Instagram,
      },
      {
        id: 'linkedin',
        title: 'LinkedIn Organization Page',
        subtitle: 'Professional updates, tech articles & hiring network',
        url: 'https://www.linkedin.com/in/idea-and-innovation-cell-pmec-838392431',
        icon: Linkedin,
      },
      {
        id: 'github',
        title: 'GitHub Organization',
        subtitle: 'Open-source repositories, project source codes & issues',
        url: 'https://github.com/Idea-Innovation-Cell',
        icon: Github,
      },
    ],
  },
];

export default function LinktreePage() {
  // Default color preset is Emerald Matrix
  const [currentTheme, setCurrentTheme] = useState('emerald');
  const [showShareModal, setShowShareModal] = useState(false);
  const [showQrModal, setShowQrModal] = useState(false);
  const [copied, setCopied] = useState(false);

  const theme = THEMES[currentTheme] || THEMES.emerald;
  const currentUrl = 'https://iicpmec.vercel.app/links';

  const handleShare = async () => {
    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        await navigator.share({
          title: 'Idea and Innovation Cell PMEC (IIC PMEC / CDD×SIC) - Official Links',
          text: 'Explore official web portals, flagship hackathons, student AI projects, and social handles of IIC PMEC.',
          url: currentUrl,
        });
      } catch (err) {
        setShowShareModal(true);
      }
    } else {
      setShowShareModal(true);
    }
  };

  const copyToClipboard = (text = currentUrl) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    toast.success('Link copied to clipboard!');
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className={`min-h-screen ${theme.bg} transition-colors duration-500 !font-sans relative overflow-x-hidden pb-16`}>
      {/* Background Ambience / Glow Mesh */}
      <div className={`absolute inset-0 bg-gradient-radial ${theme.meshBg} opacity-70 pointer-events-none blur-3xl`} />
      
      {/* Background Dots Grid Overlay */}
      <div
        className="absolute inset-0 opacity-[0.03] pointer-events-none"
        style={{ backgroundImage: `radial-gradient(circle, #ffffff 1px, transparent 1px)`, backgroundSize: '24px 24px' }}
      />

      {/* Top Header Navigation */}
      <header className="max-w-xl mx-auto px-4 pt-6 pb-2 flex items-center justify-between relative z-20">
        <Link
          href="/"
          className={`flex items-center gap-1.5 text-xs !font-sans font-semibold px-3.5 py-1.5 rounded-full border transition-all ${
            theme.id === 'minimal'
              ? 'bg-white border-slate-200 text-slate-700 hover:bg-slate-100'
              : 'bg-white/5 border-white/10 text-slate-300 hover:bg-white/10 hover:text-white'
          }`}
        >
          <ArrowLeft size={13} /> Main Site
        </Link>

        {/* Action Controls (Share, QR, Theme Picker) */}
        <div className="flex items-center gap-2">
          {/* Theme Dropdown / Selector */}
          <div className="relative group">
            <button
              aria-label="Change Theme"
              className={`p-2 rounded-full border transition-all ${
                theme.id === 'minimal'
                  ? 'bg-white border-slate-200 text-slate-700 hover:bg-slate-100'
                  : 'bg-white/5 border-white/10 text-slate-300 hover:bg-white/10 hover:text-white'
              }`}
            >
              <Palette size={15} />
            </button>
            <div className="absolute right-0 mt-2 w-48 py-2 bg-slate-900/95 backdrop-blur-xl border border-slate-800 rounded-xl shadow-2xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
              <div className="px-3 py-1 text-[10px] !font-sans font-bold uppercase tracking-wider text-slate-400">
                Choose Theme
              </div>
              {Object.values(THEMES).map((t) => (
                <button
                  key={t.id}
                  onClick={() => setCurrentTheme(t.id)}
                  className={`w-full px-3 py-1.5 text-left text-xs !font-sans flex items-center justify-between transition-colors ${
                    currentTheme === t.id ? 'text-emerald-400 font-semibold bg-white/5' : 'text-slate-300 hover:bg-white/5'
                  }`}
                >
                  <span>{t.name}</span>
                  {currentTheme === t.id && <Check size={12} />}
                </button>
              ))}
            </div>
          </div>

          {/* QR Code Button */}
          <button
            onClick={() => setShowQrModal(true)}
            aria-label="Show QR Code"
            className={`p-2 rounded-full border transition-all ${
              theme.id === 'minimal'
                ? 'bg-white border-slate-200 text-slate-700 hover:bg-slate-100'
                : 'bg-white/5 border-white/10 text-slate-300 hover:bg-white/10 hover:text-white'
            }`}
          >
            <QrCode size={15} />
          </button>

          {/* Share Button */}
          <button
            onClick={handleShare}
            aria-label="Share Linktree"
            className={`p-2 rounded-full border transition-all ${
              theme.id === 'minimal'
                ? 'bg-white border-slate-200 text-slate-700 hover:bg-slate-100'
                : 'bg-white/5 border-white/10 text-slate-300 hover:bg-white/10 hover:text-white'
            }`}
          >
            <Share2 size={15} />
          </button>
        </div>
      </header>

      {/* Main Linktree Container */}
      <main className="max-w-md mx-auto px-4 pt-4 relative z-10">
        {/* Profile Card Header */}
        <div className="flex flex-col items-center text-center mb-8">
          {/* Official IIC Logo Avatar with White Background and Border Radius */}
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
            className="relative mb-4 group"
          >
            <div className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-2xl overflow-hidden shadow-2xl ring-2 ring-white/20 hover:ring-emerald-400/60 transition-all duration-300 bg-white p-1">
              <img
                src="/normaliic.jpeg"
                alt="Idea and Innovation Cell (IIC PMEC) Logo"
                className="w-full h-full object-contain rounded-xl"
              />
            </div>
            <div className="absolute -bottom-1 -right-1 bg-emerald-500 text-white p-1.5 rounded-full border-2 border-[#04120d] shadow-lg">
              <ShieldCheck size={14} className="fill-white text-emerald-500" />
            </div>
          </motion.div>

          {/* Club Name with Verified Tag */}
          <motion.div
            initial={{ y: 8, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="flex items-center gap-1.5 mb-1"
          >
            <span className={`text-xl sm:text-2xl !font-sans font-extrabold tracking-tight ${theme.textColor}`}>
              Idea & Innovation Cell
            </span>
          </motion.div>

          <motion.p
            initial={{ y: 8, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.15 }}
            className={`text-xs !font-sans font-bold tracking-wider uppercase mb-2 ${theme.accentText}`}
          >
            IIC PMEC (CDD×SIC) · Berhampur
          </motion.p>

          <motion.p
            initial={{ y: 8, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className={`text-xs !font-sans leading-relaxed max-w-xs ${theme.subTextColor}`}
          >
            PMEC&apos;s premier innovation & technical society. Bridging theory and industry through code, AI, design, and hackathons.
          </motion.p>

          {/* Social Quick-Bar */}
          <motion.div
            initial={{ y: 8, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.25 }}
            className="flex items-center gap-3 mt-4"
          >
            <a
              href="https://www.instagram.com/ideainnovationcell.pmec"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Instagram"
              className={`p-2.5 rounded-xl border transition-all duration-300 hover:scale-110 active:scale-95 ${theme.socialBg}`}
            >
              <Instagram size={17} />
            </a>
            <a
              href="https://www.linkedin.com/in/idea-and-innovation-cell-pmec-838392431"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="LinkedIn"
              className={`p-2.5 rounded-xl border transition-all duration-300 hover:scale-110 active:scale-95 ${theme.socialBg}`}
            >
              <Linkedin size={17} />
            </a>
            <a
              href="https://github.com/Idea-Innovation-Cell"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="GitHub"
              className={`p-2.5 rounded-xl border transition-all duration-300 hover:scale-110 active:scale-95 ${theme.socialBg}`}
            >
              <Github size={17} />
            </a>
            <a
              href="mailto:ideainnovationcell.pmec@gmail.com"
              aria-label="Email"
              className={`p-2.5 rounded-xl border transition-all duration-300 hover:scale-110 active:scale-95 ${theme.socialBg}`}
            >
              <Mail size={17} />
            </a>
          </motion.div>
        </div>

        {/* Links List Sections */}
        <div className="space-y-6">
          {LINK_SECTIONS.map((sec, secIdx) => (
            <motion.div
              key={sec.category}
              initial={{ y: 16, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3 + secIdx * 0.1 }}
              className="space-y-2.5"
            >
              <div className="flex items-center gap-2 px-1">
                <span className={`text-[11px] !font-sans font-bold uppercase tracking-widest ${theme.subTextColor}`}>
                  {sec.category}
                </span>
                <span className={`h-px flex-1 ${theme.id === 'minimal' ? 'bg-slate-200' : 'bg-white/10'}`} />
              </div>

              <div className="space-y-2.5">
                {sec.links.map((link) => {
                  const Icon = link.icon;
                  return (
                    <a
                      key={link.id}
                      href={link.url}
                      target={link.url.startsWith('http') ? '_blank' : '_self'}
                      rel="noopener noreferrer"
                      className={`group relative w-full p-4 rounded-2xl border transition-all duration-300 flex items-center justify-between gap-3.5 ${
                        theme.cardBg
                      } ${theme.cardGlow} hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.99]`}
                    >
                      {/* Left Icon */}
                      <div className={`p-2.5 rounded-xl border ${theme.iconBg} shrink-0 group-hover:scale-110 transition-transform duration-300`}>
                        <Icon size={18} />
                      </div>

                      {/* Middle Text Details */}
                      <div className="flex-1 min-w-0 text-left">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="!font-sans font-bold text-sm sm:text-base tracking-tight truncate text-white">
                            {link.title}
                          </span>
                          {link.badge && (
                            <span className={`text-[10px] !font-sans font-bold px-2 py-0.5 rounded-full ${link.badgeColor || theme.badge}`}>
                              {link.badge}
                            </span>
                          )}
                        </div>
                        {link.subtitle && (
                          <p className={`text-[11px] !font-sans font-normal mt-0.5 leading-snug line-clamp-1 ${theme.subTextColor}`}>
                            {link.subtitle}
                          </p>
                        )}
                      </div>

                      {/* Right Action Chevron */}
                      <div className="shrink-0 text-slate-400 group-hover:text-white group-hover:translate-x-0.5 transition-all">
                        <ChevronRight size={16} />
                      </div>
                    </a>
                  );
                })}
              </div>
            </motion.div>
          ))}
        </div>

        {/* Footer info */}
        <div className="mt-12 text-center text-[11px] !font-sans text-slate-500 space-y-2">
          <p>© {new Date().getFullYear()} Idea & Innovation Cell PMEC (IIC PMEC / CDD×SIC)</p>
          <p>Parala Maharaja Engineering College, Berhampur</p>
          <div className="pt-2">
            <Link
              href="/"
              className={`inline-flex items-center gap-1 !font-sans font-semibold hover:underline ${theme.accentText}`}
            >
              iicpmec.vercel.app <ExternalLink size={11} />
            </Link>
          </div>
        </div>
      </main>

      {/* QR Code Modal */}
      <AnimatePresence>
        {showQrModal && (
          <div className="fixed inset-0 bg-black/75 backdrop-blur-md z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-[#082018] border border-emerald-800/50 p-6 rounded-3xl max-w-xs w-full text-center relative shadow-2xl text-white"
            >
              <button
                onClick={() => setShowQrModal(false)}
                className="absolute top-4 right-4 p-1.5 rounded-full bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white"
              >
                <X size={16} />
              </button>

              <h3 className="text-base !font-sans font-bold mb-1 text-white">Scan for Club Links</h3>
              <p className="text-xs !font-sans text-emerald-100/60 mb-5">Share or project this QR code at campus events & workshops.</p>

              {/* Dynamic QR Code */}
              <div className="bg-white p-4 rounded-2xl inline-block mb-5 shadow-inner">
                <img
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(currentUrl)}&color=04120d&bgcolor=ffffff`}
                  alt="IIC PMEC Links QR Code"
                  className="w-44 h-44 object-contain"
                />
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => copyToClipboard()}
                  className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs !font-sans font-semibold flex items-center justify-center gap-1.5 transition-all shadow-md"
                >
                  <Copy size={13} /> Copy Link
                </button>
                <a
                  href={`https://api.qrserver.com/v1/create-qr-code/?size=500x500&data=${encodeURIComponent(currentUrl)}&color=04120d&bgcolor=ffffff&format=png`}
                  download="iicpmec-links-qr.png"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2.5 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-semibold flex items-center justify-center transition-all"
                  title="Download High-Res QR"
                >
                  <Download size={15} />
                </a>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Share Modal */}
      <AnimatePresence>
        {showShareModal && (
          <div className="fixed inset-0 bg-black/75 backdrop-blur-md z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-[#082018] border border-emerald-800/50 p-6 rounded-3xl max-w-sm w-full text-center relative shadow-2xl text-white"
            >
              <button
                onClick={() => setShowShareModal(false)}
                className="absolute top-4 right-4 p-1.5 rounded-full bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white"
              >
                <X size={16} />
              </button>

              <h3 className="text-base !font-sans font-bold mb-1 text-white">Share Club Hub</h3>
              <p className="text-xs !font-sans text-emerald-100/60 mb-4">Copy this direct link to paste into your Instagram bio, WhatsApp status, or club messages.</p>

              {/* Share Preview Card with Solid White Logo */}
              <div className="flex items-center gap-3 bg-[#04120d] border border-emerald-900/70 p-3 rounded-2xl mb-4 text-left shadow-inner">
                <div className="w-12 h-12 rounded-xl bg-white p-1 shrink-0 overflow-hidden shadow-md flex items-center justify-center">
                  <img
                    src="/normaliic.jpeg"
                    alt="IIC PMEC"
                    className="w-full h-full object-contain rounded-lg"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-xs !font-sans font-bold text-white truncate">Idea & Innovation Cell (IIC PMEC)</h4>
                  <p className="text-[11px] !font-sans text-emerald-400 font-medium">iicpmec.vercel.app/links</p>
                </div>
              </div>

              <div className="flex items-center gap-2 bg-[#04120d] border border-emerald-900/60 rounded-xl p-2 mb-4">
                <input
                  type="text"
                  readOnly
                  value={currentUrl}
                  className="bg-transparent text-xs !font-sans text-emerald-100/80 flex-1 px-2 focus:outline-none"
                />
                <button
                  onClick={() => copyToClipboard()}
                  className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs !font-sans font-semibold rounded-lg flex items-center gap-1 transition-all"
                >
                  {copied ? <Check size={13} /> : <Copy size={13} />}
                  {copied ? 'Copied' : 'Copy'}
                </button>
              </div>

              <button
                onClick={() => setShowShareModal(false)}
                className="w-full py-2.5 bg-white/10 hover:bg-white/15 text-white rounded-xl text-xs !font-sans font-semibold transition-all"
              >
                Done
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
