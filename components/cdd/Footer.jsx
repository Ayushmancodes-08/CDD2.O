'use client';
import React, { useState } from 'react';
import { Github, Twitter, Linkedin, Instagram, Heart, ArrowRight, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { CLUB_SOCIALS, GOOGLE_SCRIPT_URL } from '@/lib/cdd-constants';

export default function Footer() {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

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
    { icon: Github, url: CLUB_SOCIALS.github, label: 'GitHub' },
    { icon: Linkedin, url: CLUB_SOCIALS.linkedin, label: 'LinkedIn' },
    { icon: Twitter, url: CLUB_SOCIALS.x, label: 'X (Twitter)' },
    { icon: Instagram, url: CLUB_SOCIALS.instagram, label: 'Instagram' },
  ];

  return (
    <footer className="bg-brand-950 text-gray-400 relative z-10 font-sans overflow-hidden">
      <div className="w-full h-px bg-gradient-to-r from-transparent via-brand-500/30 to-transparent"></div>
      <div className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-8 py-16 lg:py-20 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-12 lg:gap-8 mb-16">
          <div className="lg:col-span-4 space-y-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-400 to-brand-600 flex items-center justify-center shadow-md">
                <span className="text-white font-display font-bold text-sm tracking-tight">CDD</span>
              </div>
              <span className="text-xl font-display font-bold text-white tracking-tight">CDD Club</span>
            </div>
            <p className="text-sm leading-relaxed text-gray-400 max-w-xs">
              PMEC&apos;s premier technical society. Bridging academic theory and industry through code, design, and innovation.
            </p>
            <div className="flex gap-2">
              {socials.map((social) => (
                <a key={social.label} href={social.url} target="_blank" rel="noopener noreferrer" aria-label={social.label}
                  className="p-2.5 bg-white/5 rounded-lg hover:bg-white/10 hover:text-white transition-all duration-200 group">
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
                <input type="email" placeholder="your@email.com" value={email} onChange={(e) => setEmail(e.target.value)} required
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-brand-400 transition-all placeholder:text-gray-500" />
                <button type="submit" disabled={isSubmitting}
                  className="absolute right-1.5 top-1.5 p-2 bg-white/10 text-white rounded-lg hover:bg-brand-500 transition-colors disabled:opacity-50">
                  {isSubmitting ? <Loader2 size={14} className="animate-spin" /> : <ArrowRight size={14} />}
                </button>
              </div>
            </form>
          </div>
        </div>

        <div className="pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-gray-400">
          <p>© {new Date().getFullYear()} CDD Club PMEC. All rights reserved.</p>
          <div className="flex items-center gap-1">
            <span>Built with</span>
            <Heart size={10} className="text-red-400 fill-red-400" />
            <span>from Berhampur</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
