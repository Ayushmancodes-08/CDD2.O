'use client';
import React, { useState, useEffect, Suspense, lazy, useCallback, useRef } from 'react';
import { motion, useScroll, useTransform, animate, useInView } from 'framer-motion';
import {
  Mail, MapPin, ChevronRight, Loader2, Target, Compass, ArrowRight, MousePointer2,
} from 'lucide-react';
import { toast } from 'sonner';
import Navbar from '@/components/cdd/Navbar';
import Footer from '@/components/cdd/Footer';
import { AnimatedGridPattern } from '@/components/cdd/AnimatedGrid';
import { MagneticButton, TextReveal, CharReveal, Tilt, MaskReveal, StaggerGroup, staggerItem, ScrollIndicator } from '@/components/cdd/Animations';
import { PROGRAMS, FACULTY, GOOGLE_SCRIPT_URL } from '@/lib/cdd-constants';
import { useGallery } from '@/components/cdd/useGallery';

const ProjectsSection = lazy(() => import('@/components/cdd/ProjectsSection'));
const EventsSection = lazy(() => import('@/components/cdd/EventsSection'));
const TeamSection = lazy(() => import('@/components/cdd/TeamSection'));
const GallerySection = lazy(() => import('@/components/cdd/GallerySection').then(m => ({ default: m.GallerySection })));
const FullPageGallery = lazy(() => import('@/components/cdd/GallerySection').then(m => ({ default: m.FullPageGallery })));

const LoadingFallback = () => (
  <div className="flex items-center justify-center w-full h-40">
    <Loader2 className="w-6 h-6 animate-spin text-brand-500" />
  </div>
);

const SectionWrapper = ({ id, className = '', children, title, subtitle, altBg = false, eyebrow }) => (
  <section id={id} className={`py-16 md:py-20 lg:py-24 relative ${altBg ? 'bg-gray-50/60' : 'bg-white'} ${className}`}>
    <div className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-8 relative z-10 w-full">
      <motion.div initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
        transition={{ duration: 0.5 }} className="mb-12 md:mb-16">
        <div className="flex items-center gap-3 mb-4">
          <motion.span initial={{ width: 0 }} whileInView={{ width: 32 }} viewport={{ once: true }}
            transition={{ duration: 0.8, ease: 'easeOut', delay: 0.1 }} className="h-px bg-brand-500" />
          <span className="text-brand-500 text-xs font-semibold tracking-[0.2em] uppercase">{eyebrow || id.replace('-', ' ')}</span>
        </div>
        <h2 className="text-3xl md:text-4xl lg:text-5xl font-display font-bold text-brand-900 tracking-tight">{title}</h2>
        {subtitle && <p className="mt-3 text-base md:text-lg text-gray-500 font-normal max-w-2xl leading-relaxed">{subtitle}</p>}
      </motion.div>
      {children}
    </div>
  </section>
);

const AnimatedCounter = ({ from, to, label }) => {
  const containerRef = useRef(null);
  const textRef = useRef(null);
  const isInView = useInView(containerRef, { once: true, margin: '0px' });
  useEffect(() => {
    if (isInView && textRef.current) {
      const controls = animate(from, to, {
        duration: 1.2, ease: 'easeOut',
        onUpdate(value) { if (textRef.current) textRef.current.textContent = Math.floor(value).toString(); }
      });
      return () => controls.stop();
    }
  }, [from, to, isInView]);
  return (
    <div ref={containerRef} className="flex flex-col">
      <h4 className="text-4xl md:text-5xl font-display font-bold text-brand-900 mb-1 flex items-baseline">
        <span ref={textRef}>{from}</span><span className="text-brand-400">+</span>
      </h4>
      <p className="text-xs font-semibold text-gray-400 uppercase tracking-[0.15em]">{label}</p>
    </div>
  );
};

function App() {
  const [currentView, setCurrentView] = useState('home');
  const { getImageByName } = useGallery();
  const [contactForm, setContactForm] = useState({ firstName: '', lastName: '', email: '', message: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { scrollY, scrollYProgress } = useScroll();
  const heroTextY = useTransform(scrollY, [0, 500], [0, 80]);
  const heroOpacity = useTransform(scrollY, [0, 400], [1, 0]);
  const orb1Y = useTransform(scrollY, [0, 1000], [0, 150]);
  const orb2Y = useTransform(scrollY, [0, 1000], [0, -150]);

  const handleContactChange = useCallback((e) => {
    setContactForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  }, []);

  const handleContactSubmit = useCallback(async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await fetch(GOOGLE_SCRIPT_URL, {
        method: 'POST', mode: 'no-cors',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'contact', ...contactForm, timestamp: new Date().toISOString() })
      });
      toast.success("Message sent successfully! We'll be in touch.");
      setContactForm({ firstName: '', lastName: '', email: '', message: '' });
    } catch (error) {
      toast.error('Failed to send message. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  }, [contactForm]);

  if (currentView === 'archive') {
    return (
      <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-brand-500" /></div>}>
        <FullPageGallery onBack={() => setCurrentView('home')} />
      </Suspense>
    );
  }

  return (
    <div className="min-h-screen bg-white font-sans selection:bg-brand-500 selection:text-white">
      <motion.div className="fixed top-0 left-0 right-0 h-[2px] bg-brand-500 z-[100] origin-left" style={{ scaleX: scrollYProgress }} />
      <Navbar />

      {/* HERO */}
      <section id="home" className="relative min-h-[90vh] lg:min-h-screen flex items-center overflow-hidden pt-28 md:pt-32 lg:pt-0">
        <AnimatedGridPattern numSquares={30} maxOpacity={0.1} duration={3} repeatDelay={1}
          className="[mask-image:radial-gradient(500px_circle_at_center,white,transparent)] inset-x-0 inset-y-[-30%] h-[200%] skew-y-12 fill-brand-500/30 stroke-brand-500/30" />
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none"
          style={{ backgroundImage: `radial-gradient(circle, #2D4A7A 1px, transparent 1px)`, backgroundSize: '24px 24px' }} />
        <motion.div style={{ y: orb1Y }} className="absolute top-[20%] left-[10%] w-[80vw] h-[80vw] md:w-[40vw] md:h-[40vw] bg-accent-400/10 rounded-full blur-[80px] md:blur-[100px] pointer-events-none animate-pulse-slow" />
        <motion.div style={{ y: orb2Y, animationDelay: '2s' }} className="absolute bottom-[20%] right-[10%] w-[90vw] h-[90vw] md:w-[50vw] md:h-[50vw] bg-brand-400/10 rounded-full blur-[100px] md:blur-[120px] pointer-events-none animate-float" />

        <div className="relative z-10 px-5 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
          <motion.div style={{ y: heroTextY, opacity: heroOpacity }} className="max-w-4xl">
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
              className="inline-flex items-center gap-2 px-4 py-2 bg-brand-50 border border-brand-100 rounded-full mb-8 glow-ring">
              <span className="w-1.5 h-1.5 bg-brand-500 rounded-full animate-pulse"></span>
              <span className="text-brand-700 text-xs font-semibold tracking-wide">Est. 2021 · PMEC Campus</span>
            </motion.div>

            <h1 className="text-[2.5rem] leading-[1.1] sm:text-5xl md:text-6xl lg:text-7xl font-display font-bold text-brand-900 mb-6 md:mb-8 tracking-tight">
              <TextReveal text="Where" className="text-brand-900" delay={0.1} />{' '}
              <TextReveal text="Code" className="text-brand-900" delay={0.2} />{' '}
              <TextReveal text="Meets" className="text-brand-900" delay={0.3} />
              <br className="hidden sm:block" />
              <span className="animated-gradient-text">
                <CharReveal text="Innovation." delay={0.5} />
              </span>
            </h1>

            <motion.p
              initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.9, ease: 'easeOut' }}
              className="text-base md:text-lg text-gray-500 mb-10 max-w-xl leading-relaxed">
              The <strong className="text-brand-900 font-semibold">Coding Design Development Club</strong> is PMEC&apos;s premier technical society. Bridging theory and industry through code, design, and real-world projects.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 1.1, ease: 'easeOut' }}
              className="flex flex-col sm:flex-row gap-4">
              <MagneticButton strength={0.2}>
                <a href="#about-us" className="btn-primary group w-full sm:w-auto justify-center text-center">
                  Discover Our Mission <ChevronRight size={16} className="group-hover:translate-x-1 transition-transform" />
                </a>
              </MagneticButton>
              <MagneticButton strength={0.15}>
                <a href="#contact" className="btn-secondary w-full sm:w-auto justify-center text-center">Get in Touch</a>
              </MagneticButton>
            </motion.div>

            {/* Marquee trust bar */}
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 1.4 }}
              className="mt-14 pt-8 border-t border-gray-100 overflow-hidden marquee-pause">
              <p className="text-[10px] font-semibold tracking-[0.3em] uppercase text-gray-400 mb-4">Our ecosystem</p>
              <div className="relative w-full overflow-hidden">
                <div className="flex gap-10 animate-marquee whitespace-nowrap will-change-transform">
                  {[
                    '200+ Active Members', '11+ Projects Shipped', 'CodeKriti', 'LearnOverse',
                    'Campus Connect', 'Quizmaster AI', 'Skillplot', 'Open Source', '24/7 Community',
                    '200+ Active Members', '11+ Projects Shipped', 'CodeKriti', 'LearnOverse',
                    'Campus Connect', 'Quizmaster AI', 'Skillplot', 'Open Source', '24/7 Community',
                  ].map((item, i) => (
                    <span key={i} className="inline-flex items-center gap-3 text-xs font-semibold tracking-wider text-gray-500 uppercase">
                      {item}
                      <span className="w-1 h-1 rounded-full bg-brand-300"></span>
                    </span>
                  ))}
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>
        
        <ScrollIndicator />
      </section>

      {/* ABOUT */}
      <SectionWrapper id="about-us" eyebrow="About" title="Who We Are" subtitle="Bridging theory and practice through hands-on technology." altBg={true}>
        <div className="grid md:grid-cols-2 gap-12 lg:gap-16 items-center">
          <motion.div initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="space-y-8">
            <div className="flex gap-4 items-start group">
              <div className="shrink-0 mt-0.5 p-3 bg-white rounded-xl shadow-ambient group-hover:shadow-md transition-shadow">
                <Target className="w-5 h-5 text-brand-500" />
              </div>
              <div>
                <h3 className="text-lg font-display font-bold text-brand-900 mb-2">Our Mission</h3>
                <p className="text-gray-600 text-sm leading-relaxed">
                  To make learning technology fun again. We transform education into a curiosity-driven experience where students explore &quot;how&quot; and &quot;why&quot; things work, fostering an inclusive environment for growth.
                </p>
              </div>
            </div>
            <div className="flex gap-4 items-start group">
              <div className="shrink-0 mt-0.5 p-3 bg-white rounded-xl shadow-ambient group-hover:shadow-md transition-shadow">
                <Compass className="w-5 h-5 text-brand-500" />
              </div>
              <div>
                <h3 className="text-lg font-display font-bold text-brand-900 mb-2">Our Vision</h3>
                <p className="text-gray-600 text-sm leading-relaxed">
                  To be the leading technical community where innovation turns ideas into real-world solutions, inspiring generations to embrace technology not just as a subject, but as a lifelong passion.
                </p>
              </div>
            </div>
            <div className="flex gap-12 mt-8 pt-8 border-t border-gray-200">
              <AnimatedCounter from={0} to={200} label="Active Members" />
              <AnimatedCounter from={0} to={11} label="Projects" />
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, x: 16 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} className="relative">
            <div className="absolute -inset-4 bg-gradient-to-br from-brand-200 to-accent-200 rounded-3xl blur-3xl opacity-30 animate-blob"></div>
            <MaskReveal direction="left" className="relative overflow-hidden rounded-2xl shadow-xl group aspect-video bg-brand-900">
              <video
                src="https://image2url.com/videos/1765880714875-ae3dd126-0dd6-4ead-95f9-eb4f8f705e5d.mp4"
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-[1.02]"
                autoPlay muted loop playsInline
                poster="https://images.unsplash.com/photo-1517048676732-d65bc937f952?q=80&w=1200&auto=format&fit=crop"
              />
            </MaskReveal>
          </motion.div>
        </div>
      </SectionWrapper>

      {/* PROGRAMS */}
      <SectionWrapper id="programs" eyebrow="Programs" title="Technical Tracks" subtitle="Curriculum designed for industry readiness.">
        <StaggerGroup className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5" delay={0.08}>
          {PROGRAMS.map((program, idx) => {
            const Icon = program.icon;
            return (
              <motion.div key={idx} variants={staggerItem} className="perspective-1000">
                <Tilt max={6} className="h-full">
                  <div className="bg-white p-7 rounded-2xl shadow-ambient hover:shadow-xl transition-all duration-500 group relative overflow-hidden h-full"
                    style={{ transform: 'translateZ(0)' }}>
                    <div className="absolute -inset-4 bg-gradient-to-r from-brand-50 to-accent-50 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none blur-xl z-0"></div>
                    <div className="relative z-10" style={{ transform: 'translateZ(40px)' }}>
                      <div className="flex items-start justify-between mb-5">
                        <div className="p-3 bg-brand-50 rounded-xl group-hover:bg-brand-500 transition-all duration-500 group-hover:scale-110">
                          <Icon className="w-5 h-5 text-brand-600 group-hover:text-white transition-colors" strokeWidth={1.5} />
                        </div>
                      </div>
                      <h3 className="text-lg font-display font-bold text-brand-900 mb-2">{program.title}</h3>
                      <p className="text-gray-600 text-sm leading-relaxed">{program.description}</p>
                    </div>
                  </div>
                </Tilt>
              </motion.div>
            );
          })}
        </StaggerGroup>
      </SectionWrapper>

      {/* FACULTY */}
      <SectionWrapper id="faculty" eyebrow="Faculty" title="Advisory Board" subtitle="Expert guidance bridging theory and real-world application." altBg={true}>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {FACULTY.map((member, idx) => {
            const dynamicImage = getImageByName(member.name);
            return (
              <motion.div key={idx} initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                className="flex items-center gap-4 bg-white p-5 rounded-2xl shadow-ambient hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 group">
                <img src={dynamicImage || member.image || `https://ui-avatars.com/api/?name=${encodeURIComponent(member.name)}&background=EEF2FF&color=2D4A7A`}
                  alt={member.name} className="w-16 h-16 object-cover rounded-full border-2 border-brand-50 shadow-sm" />
                <div>
                  <h3 className="font-display font-bold text-brand-900 text-base">{member.name}</h3>
                  <p className="text-brand-500 text-xs font-semibold uppercase tracking-wider mb-0.5">{member.role}</p>
                  <p className="text-gray-400 text-xs font-medium">{member.specialty}</p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </SectionWrapper>

      {/* GALLERY */}
      <SectionWrapper id="gallery" eyebrow="Gallery" title="Community Archive" subtitle="Documenting our progress." className="!pb-10 md:!pb-12 lg:!pb-16">
        <Suspense fallback={<LoadingFallback />}>
          <GallerySection onViewArchive={() => setCurrentView('archive')} />
        </Suspense>
      </SectionWrapper>

      {/* PROJECTS */}
      <SectionWrapper id="projects" eyebrow="Projects" title="Featured Projects" subtitle="Innovative solutions built and deployed by our members." altBg={true}>
        <Suspense fallback={<LoadingFallback />}>
          <ProjectsSection />
        </Suspense>
      </SectionWrapper>

      {/* EVENTS */}
      <SectionWrapper id="events" eyebrow="Events" title="Schedule" subtitle="Upcoming hackathons, seminars, and workshops.">
        <Suspense fallback={<LoadingFallback />}>
          <EventsSection />
        </Suspense>
      </SectionWrapper>

      {/* TEAM */}
      <SectionWrapper id="team" eyebrow="Team" title="Leadership" subtitle="The core team driving our vision." altBg={true}>
        <Suspense fallback={<LoadingFallback />}>
          <TeamSection />
        </Suspense>
      </SectionWrapper>

      {/* CONTACT */}
      <section id="contact" className="py-16 md:py-24 lg:py-32 bg-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none"
          style={{ backgroundImage: `radial-gradient(circle, #2D4A7A 1px, transparent 1px)`, backgroundSize: '24px 24px' }} />
        <div className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-8 relative z-10">
          <motion.div initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="mb-12 md:mb-16">
            <div className="flex items-center gap-3 mb-4">
              <span className="h-px w-8 bg-brand-500"></span>
              <span className="text-brand-500 text-xs font-semibold tracking-[0.2em] uppercase">Contact</span>
            </div>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-display font-bold text-brand-900 tracking-tight">Get in Touch</h2>
            <p className="mt-3 text-base md:text-lg text-gray-500 max-w-2xl">Have a project in mind or want to partner with us? Reach out to our team.</p>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-12 lg:gap-20">
            <div className="space-y-8">
              <div className="flex items-start gap-4">
                <div className="shrink-0 p-3 bg-brand-50 rounded-xl"><MapPin className="text-brand-500" size={20} /></div>
                <div>
                  <h4 className="font-display font-bold text-brand-900 text-base mb-1">Headquarters</h4>
                  <p className="text-gray-600 text-sm leading-relaxed">Room 113, Academic Main Building<br />PMEC Campus, Sitalapalli, Berhampur 761003</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="shrink-0 p-3 bg-brand-50 rounded-xl"><Mail className="text-brand-500" size={20} /></div>
                <div>
                  <h4 className="font-display font-bold text-brand-900 text-base mb-1">Inquiries</h4>
                  <p className="text-gray-600 text-sm">patraayushman21@gmail.com</p>
                </div>
              </div>
              {/* Google Map */}
              <div className="rounded-2xl overflow-hidden shadow-ambient group relative">
                <div className="absolute top-4 left-4 z-10 bg-white/60 backdrop-blur-2xl px-3 py-2 rounded-lg shadow-ambient flex items-center gap-2">
                  <MapPin size={14} className="text-brand-500" />
                  <span className="text-xs font-semibold text-brand-900">PMEC Campus</span>
                </div>
                <iframe
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d1883.2726820195844!2d84.87146117586577!3d19.35767414384523!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3a3d5b96a8b4e52b%3A0x0!2sParala%20Maharaja%20Engineering%20College!5e0!3m2!1sen!2sin!4v1700000000000"
                  width="100%"
                  height="260"
                  style={{ border: 0 }}
                  allowFullScreen=""
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  title="PMEC Campus, Berhampur"
                  className="grayscale-[20%] group-hover:grayscale-0 transition-all duration-500"
                />
                <a
                  href="https://www.google.com/maps/search/?api=1&query=Parala+Maharaja+Engineering+College+Berhampur"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="absolute bottom-4 right-4 z-10 bg-brand-900 hover:bg-brand-800 text-white text-xs font-semibold px-4 py-2 rounded-lg shadow-md transition-all flex items-center gap-1.5 hover:-translate-y-0.5"
                >
                  Get Directions <ArrowRight size={12} />
                </a>
              </div>
            </div>

            <form className="space-y-4 bg-gray-50/60 p-6 md:p-8 rounded-2xl shadow-ambient" onSubmit={handleContactSubmit}>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">First Name</label>
                  <input type="text" name="firstName" value={contactForm.firstName} onChange={handleContactChange} required
                    className="w-full bg-white rounded-xl px-4 py-3 text-sm text-brand-900 placeholder:text-gray-300 focus:outline-none focus:ring-2 focus:ring-brand-500/20 shadow-ambient transition-all" placeholder="Jane" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Last Name</label>
                  <input type="text" name="lastName" value={contactForm.lastName} onChange={handleContactChange} required
                    className="w-full bg-white rounded-xl px-4 py-3 text-sm text-brand-900 placeholder:text-gray-300 focus:outline-none focus:ring-2 focus:ring-brand-500/20 shadow-ambient transition-all" placeholder="Doe" />
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Email Address</label>
                <input type="email" name="email" value={contactForm.email} onChange={handleContactChange} required
                  className="w-full bg-white rounded-xl px-4 py-3 text-sm text-brand-900 placeholder:text-gray-300 focus:outline-none focus:ring-2 focus:ring-brand-500/20 shadow-ambient transition-all" placeholder="jane@example.com" />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Message</label>
                <textarea rows={4} name="message" value={contactForm.message} onChange={handleContactChange} required
                  className="w-full bg-white rounded-xl px-4 py-3 text-sm text-brand-900 placeholder:text-gray-300 focus:outline-none focus:ring-2 focus:ring-brand-500/20 shadow-ambient transition-all resize-none" placeholder="How can we help?" />
              </div>
              <button type="submit" disabled={isSubmitting} className="w-full btn-primary group justify-center">
                {isSubmitting ? (<><Loader2 className="animate-spin" size={16} />Sending...</>) : (<>Send Message <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" /></>)}
              </button>
            </form>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}

export default App;
