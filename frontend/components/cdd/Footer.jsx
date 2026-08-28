'use client';
import React, { useState, useEffect } from 'react';
import { Github, Linkedin, Instagram, Heart, ArrowRight, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { CLUB_SOCIALS, GOOGLE_SCRIPT_URL } from '@/lib/cdd-constants';

export default function Footer() {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [adminEmail, setAdminEmail] = useState('');
  const [adminPassword, setAdminPassword] = useState('');

  useEffect(() => {
    if (!isAdminOpen) return;
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') setIsAdminOpen(false);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isAdminOpen]);

  const handleNewsletterSubmit = async (e) => {
    e.preventDefault();
    if (!email.trim() || !email.includes('@')) {
      toast.error('Please enter a valid email address.');
      return;
    }
    setIsSubmitting(true);
    try {
      const res = await fetch('/api/newsletter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim() }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success(data.message || 'Subscribed successfully! Welcome aboard.');
        setEmail('');
      } else {
        toast.error(data.error || 'Failed to subscribe. Please try again.');
      }
    } catch (error) {
      toast.error('Connection error. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const socials = [
    { icon: Github, url: CLUB_SOCIALS.github, label: 'GitHub - Idea and Innovation Cell' },
    { icon: Linkedin, url: CLUB_SOCIALS.linkedin, label: 'LinkedIn - Idea and Innovation Cell' },
    { icon: Instagram, url: CLUB_SOCIALS.instagram, label: 'Instagram - Idea and Innovation Cell' },
  ];

  return (
    <footer className="bg-brand-950 text-gray-400 relative z-10 font-sans overflow-hidden" aria-label="Site Footer">
      <div className="w-full h-px bg-gradient-to-r from-transparent via-brand-500/30 to-transparent"></div>
      <div className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-8 py-16 lg:py-20 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-12 lg:gap-8 mb-16">
          <div className="lg:col-span-4 space-y-5">
            <div className="flex items-center gap-3">
              <img src="/logo_white.png" alt="Idea and Innovation Cell (IICPMEC / CDD×SIC) Logo" className="w-[43px] h-[43px] object-contain shrink-0"
                loading="lazy" decoding="async" width={43} height={43} />
              <span className="text-xl font-display font-bold text-white tracking-tight">Idea and Innovation Cell (CDD×SIC)</span>
            </div>
            <p className="text-sm leading-relaxed text-gray-400 max-w-xs">
              PMEC&apos;s premier technical society. Bridging academic theory and industry through code, design, and innovation.
            </p>
            <div className="flex gap-2">
              {socials.map((social) => (
                <a key={social.label} href={social.url} target="_blank" rel="noopener noreferrer" aria-label={social.label}
                  onClick={(e) => e.currentTarget.blur()}
                  className="p-2.5 bg-white/5 rounded-lg hover:bg-white/10 active:bg-white/20 hover:text-white text-gray-400 transition-all duration-200 group focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-400 active:scale-95">
                  <social.icon size={16} className="group-hover:scale-110 transition-transform" />
                </a>
              ))}
            </div>
          </div>

          <div className="lg:col-span-2 lg:ml-auto">
            <h4 className="text-white font-display font-semibold mb-5 text-sm">Club</h4>
            <ul className="space-y-3 text-sm">
              {[['Home', 'home'], ['About', 'about-us'], ['Team', 'team'], ['Gallery', 'gallery']].map(([label, id]) => (
                <li key={label}><a href={`/#${id}`} className="hover:text-white transition-colors duration-200">{label}</a></li>
              ))}
            </ul>
          </div>

          <div className="lg:col-span-2">
            <h4 className="text-white font-display font-semibold mb-5 text-sm">Activities</h4>
            <ul className="space-y-3 text-sm">
              {[['Programs', 'programs'], ['Projects', 'projects'], ['Events', 'events']].map(([label, id]) => (
                <li key={label}><a href={`/#${id}`} className="hover:text-white transition-colors duration-200">{label}</a></li>
              ))}
              <li><a href="/links" className="text-brand-400 hover:text-brand-300 font-medium transition-colors duration-200 flex items-center gap-1">Linktree Hub <span className="text-[10px] bg-brand-500/20 px-1.5 py-0.2 rounded text-brand-300">NEW</span></a></li>
            </ul>
          </div>

          <div className="lg:col-span-4">
            <h4 className="text-white font-display font-semibold mb-5 text-sm">Stay in the Loop</h4>
            <p className="text-sm text-gray-400 mb-4">Join our newsletter for hackathon alerts and tech workshops.</p>
            <form className="flex flex-col gap-3" onSubmit={handleNewsletterSubmit}>
              <div className="relative group">
                <label htmlFor="newsletter-email" className="sr-only">Email address for newsletter</label>
                <input id="newsletter-email" type="email" placeholder="your@email.com" value={email} onChange={(e) => setEmail(e.target.value)} required
                  autoComplete="email"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-brand-400 transition-all placeholder:text-gray-500" />
                <button type="submit" disabled={isSubmitting} aria-label="Subscribe to newsletter"
                  className="absolute right-1.5 top-1.5 p-2 bg-white/10 text-white rounded-lg hover:bg-brand-500 transition-colors disabled:opacity-50">
                  {isSubmitting ? <Loader2 size={14} className="animate-spin" /> : <ArrowRight size={14} />}
                </button>
              </div>
            </form>
          </div>
        </div>

        <div className="pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-gray-400">
          <p suppressHydrationWarning>© {new Date().getFullYear()} Idea and Innovation Cell PMEC (IIC PMEC / IICPMEC / CDD×SIC) — Parala Maharaja Engineering College, Berhampur. All rights reserved.</p>
          <div className="flex items-center gap-1">
            <span>Crafted with passion at</span>
            <Heart size={10} className="text-red-400 fill-red-400 cursor-pointer hover:scale-125 transition-transform" onClick={() => setIsAdminOpen(true)} aria-label="Admin Access Portal" />
            <span>PMEC Berhampur</span>
          </div>
        </div>
      </div>

      {isAdminOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4"
          role="dialog" aria-modal="true" aria-labelledby="admin-dialog-title">
          <div className="bg-brand-950 border border-white/10 p-6 md:p-8 rounded-2xl max-w-lg w-full shadow-2xl relative animate-in fade-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto">
            <button onClick={() => setIsAdminOpen(false)} aria-label="Close Admin Access Modal" className="absolute top-4 right-4 text-gray-400 hover:text-white p-1">
              ✕
            </button>
            <h3 id="admin-dialog-title" className="text-xl font-display font-bold text-white mb-1">Newsletter & Admin Console</h3>
            <p className="text-xs text-gray-400 mb-6">Manage subscribers and broadcast newsletters to all subscribers at once.</p>
            
            {/* Quick Export to Excel */}
            <div className="bg-white/5 border border-white/10 rounded-xl p-4 mb-6">
              <h4 className="text-sm font-semibold text-white mb-1.5 flex items-center gap-2">
                📊 Export Subscribers to Excel
              </h4>
              <p className="text-xs text-gray-400 mb-3">
                Download the complete subscriber list with timestamp & status in Excel/CSV format.
              </p>
              <a
                href="/api/newsletter?export=csv"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 bg-brand-500 hover:bg-brand-600 text-white text-xs font-semibold px-4 py-2.5 rounded-lg transition-all shadow-sm"
              >
                📥 Download Excel/CSV Spreadsheet
              </a>
            </div>

            {/* Broadcast to All Subscribers */}
            <form onSubmit={async (e) => {
              e.preventDefault();
              const form = e.currentTarget;
              const subject = form.subject.value;
              const message = form.message.value;
              if (!subject || !message) {
                toast.error('Subject and message are required.');
                return;
              }
              const toastId = toast.loading('Sending broadcast to all subscribers...');
              try {
                const res = await fetch('/api/newsletter/broadcast', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ subject, message }),
                });
                const data = await res.json();
                if (data.success) {
                  toast.success(data.message || 'Newsletter sent to all subscribers!', { id: toastId });
                  form.reset();
                } else {
                  toast.error(data.error || 'Failed to send broadcast.', { id: toastId });
                }
              } catch {
                toast.error('Failed to connect to server.', { id: toastId });
              }
            }} className="space-y-4">
              <h4 className="text-sm font-semibold text-white mb-1 flex items-center gap-2">
                📢 Broadcast Email to All Subscribers
              </h4>
              
              <div className="space-y-1">
                <label htmlFor="broadcast-subject" className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Email Subject</label>
                <input id="broadcast-subject" name="subject" type="text" required
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-brand-400 transition-all placeholder:text-gray-500"
                  placeholder="e.g., CodeKriti 2027 Registration Open!" />
              </div>

              <div className="space-y-1">
                <label htmlFor="broadcast-message" className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Newsletter Message (HTML or Plaintext)</label>
                <textarea id="broadcast-message" name="message" rows={4} required
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-brand-400 transition-all placeholder:text-gray-500"
                  placeholder="Type your announcement, workshop details, or hackathon links here..." />
              </div>

              <button type="submit"
                className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-semibold py-2.5 rounded-xl transition-all shadow-md text-xs">
                🚀 Send to All Subscribers at Once
              </button>
            </form>
          </div>
        </div>
      )}
    </footer>
  );
}
