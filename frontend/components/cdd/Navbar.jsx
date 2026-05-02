'use client';
import React, { useState, useEffect } from 'react';
import { Menu, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('home');

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
      const sections = ['home', 'about-us', 'programs', 'projects', 'team', 'contact'];
      const navHeight = 80;
      requestAnimationFrame(() => {
        for (const section of sections) {
          const element = document.getElementById(section);
          if (element) {
            const rect = element.getBoundingClientRect();
            if (rect.top <= navHeight && rect.bottom > navHeight) {
              setActiveSection(section);
              break;
            }
          }
        }
      });
    };
    handleScroll();
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { name: 'Home', href: '#home' },
    { name: 'About', href: '#about-us' },
    { name: 'Programs', href: '#programs' },
    { name: 'Projects', href: '#projects' },
    { name: 'Team', href: '#team' },
  ];

  const handleNavClick = (e, href) => {
    e.preventDefault();
    setIsOpen(false);
    const targetId = href.replace('#', '');
    const element = document.getElementById(targetId);
    if (element) {
      setTimeout(() => { element.scrollIntoView({ behavior: 'smooth', block: 'start' }); }, 100);
    }
  };

  return (
    <>
      <nav className={`fixed top-0 left-0 w-full z-50 transition-all duration-300 ease-in-out flex items-center justify-center
        ${isScrolled ? 'glass-nav h-16 lg:h-[68px]' : 'bg-transparent h-18 lg:h-20'}`}>
        <div className="w-full max-w-7xl px-5 sm:px-6 lg:px-8 flex justify-between items-center h-full">
          <a href="#home" onClick={(e) => handleNavClick(e, '#home')}
            className="hover:opacity-80 transition-opacity cursor-pointer flex items-center gap-2 z-50 h-full py-2">
            <img src="/Logo_dark.png" alt="CDD Club" className="w-9 h-9 object-contain"
              decoding="async" />
            <span className="hidden sm:block font-display font-bold text-brand-900 text-lg tracking-tight">CDD Club</span>
          </a>

          <div className="hidden lg:flex items-center gap-6">
            {navLinks.map((link) => {
              const isActive = link.href.replace('#', '') === activeSection;
              return (
                <a key={link.name} href={link.href} onClick={(e) => handleNavClick(e, link.href)}
                  className={`relative py-2 text-sm font-medium transition-colors duration-200 group
                    ${isActive ? 'text-brand-900' : 'text-gray-500 hover:text-brand-900'}`}>
                  {link.name}
                  <span className={`absolute bottom-0 left-0 h-0.5 bg-brand-500 transition-all duration-300
                    ${isActive ? 'w-full' : 'w-0 group-hover:w-full'}`}></span>
                </a>
              );
            })}
            <a href="#contact" onClick={(e) => handleNavClick(e, '#contact')} className="ml-4 btn-primary">
              Contact Us
            </a>
          </div>

          <button className="lg:hidden p-2 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors z-50 focus:outline-none"
            onClick={() => setIsOpen(!isOpen)} aria-label="Toggle Menu">
            {isOpen ? <X size={24} strokeWidth={2} /> : <Menu size={24} strokeWidth={2} />}
          </button>
        </div>
      </nav>

      <AnimatePresence>
        {isOpen && (
          <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className="fixed top-16 left-0 w-full z-40 bg-white/90 backdrop-blur-2xl shadow-ambient rounded-b-2xl lg:hidden">
            <div className="flex flex-col p-3 space-y-1">
              {navLinks.map((link) => {
                const isActive = link.href.replace('#', '') === activeSection;
                return (
                  <a key={link.name} href={link.href} onClick={(e) => handleNavClick(e, link.href)}
                    className={`block px-4 py-3 rounded-lg text-sm font-medium transition-colors
                      ${isActive ? 'bg-brand-50 text-brand-900' : 'text-gray-600 hover:bg-gray-50 hover:text-brand-900'}`}>
                    {link.name}
                  </a>
                );
              })}
              <div className="pt-2 mt-1">
                <a href="#contact" onClick={(e) => handleNavClick(e, '#contact')}
                  className="block w-full text-center py-3 bg-brand-900 text-white rounded-lg font-semibold text-sm hover:bg-brand-800 transition-colors">
                  Contact Us
                </a>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
