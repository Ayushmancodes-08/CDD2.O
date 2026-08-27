'use client';
import React, { useState, useEffect } from 'react';
import { Github, Twitter, Linkedin, Instagram, Heart, ArrowRight, Loader2 } from 'lucide-react';
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
    if (!email.trim()) return;
    setIsSubmitting(true);
    try {
      await fetch(GOOGLE_SCRIPT_URL, {
        method: 'POST',
        mode: 'no-cors',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'newsletter-subscribe', email: email.trim() })
      });
      toast.success("Subscribed! You'll receive our updates.");
      setEmail('');
    } catch (error) {
      toast.error('Failed to subscribe. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const socials = [
    { icon: Github, url: CLUB_SOCIALS.github, label: 'GitHub - Idea and Innovation Cell' },
    { icon: Linkedin, url: CLUB_SOCIALS.linkedin, label: 'LinkedIn - Idea and Innovation Cell' },
    { icon: Twitter, url: CLUB_SOCIALS.x, label: 'X (Twitter) - Idea and Innovation Cell' },
    { icon: Instagram, url: CLUB_SOCIALS.instagram, label: 'Instagram - Idea and Innovation Cell' },
  ];

  return (
    <footer className="bg-brand-950 text-gray-400 relative z-10 font-sans overflow-hidden" aria-label="Site Footer">
      <div className="w-full h-px bg-gradient-to-r from-transparent via-brand-500/30 to-transparent"></div>
      <div className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-8 py-16 lg:py-20 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-12 lg:gap-8 mb-16">
          <div className="lg:col-span-4 space-y-5">
            <div className="flex items-center gap-3">
              <img src="/logo_white.png" alt="Idea and Innovation Cell (CDD×SIC) Logo" className="w-[43px] h-[43px] object-contain shrink-0"
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
                <li key={label}><a href={`#${id}`} className="hover:text-white transition-colors duration-200">{label}</a></li>
              ))}
            </ul>
          </div>

          <div className="lg:col-span-2">
            <h4 className="text-white font-display font-semibold mb-5 text-sm">Activities</h4>
            <ul className="space-y-3 text-sm">
              {[['Programs', 'programs'], ['Projects', 'projects'], ['Events', 'events']].map(([label, id]) => (
                <li key={label}><a href={`#${id}`} className="hover:text-white transition-colors duration-200">{label}</a></li>
              ))}
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
          <p>© {new Date().getFullYear()} Idea and Innovation Cell PMEC (IIC PMEC / CDD×SIC) — Parala Maharaja Engineering College, Berhampur. All rights reserved.</p>
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
          <div className="bg-brand-950 border border-white/10 p-6 md:p-8 rounded-2xl max-w-md w-full shadow-2xl relative animate-in fade-in zoom-in-95 duration-200">
            <button onClick={() => setIsAdminOpen(false)} aria-label="Close Admin Access Modal" className="absolute top-4 right-4 text-gray-400 hover:text-white">
              ✕
            </button>
            <h3 id="admin-dialog-title" className="text-xl font-display font-bold text-white mb-1">Admin Access</h3>
            <p className="text-sm text-gray-400 mb-6">Enter your credentials to access the admin panel.</p>
            
            <div className="space-y-4">
              <div className="space-y-1.5">
                <label htmlFor="admin-email-input" className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Email Address</label>
                <input id="admin-email-input" type="email" autoComplete="username" value={adminEmail} onChange={(e) => setAdminEmail(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-brand-400 transition-all placeholder:text-gray-500"
                  placeholder="admin@cddclub.com" />
              </div>
              <div className="space-y-1.5">
                <label htmlFor="admin-password-input" className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Password</label>
                <input id="admin-password-input" type="password" autoComplete="current-password" value={adminPassword} onChange={(e) => setAdminPassword(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-brand-400 transition-all placeholder:text-gray-500"
                  placeholder="••••••••" />
              </div>
              <button onClick={() => toast.info(`Attempting login with ${adminEmail}`)}
                className="w-full bg-brand-500 hover:bg-brand-600 text-white font-semibold py-3 rounded-xl transition-all shadow-md mt-2">
                Login as Admin
              </button>
            </div>
          </div>
        </div>
      )}
    </footer>
  );
}
