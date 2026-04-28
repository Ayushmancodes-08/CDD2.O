'use client';
import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, Plus, X, CalendarDays, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { EVENTS, BRANCHES, GOOGLE_SCRIPT_URL } from '@/lib/cdd-constants';

const CountdownTimer = () => {
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    const demoDate = new Date();
    demoDate.setMonth(demoDate.getMonth() + 10);
    demoDate.setHours(10, 0, 0);
    const timer = setInterval(() => {
      const difference = demoDate.getTime() - new Date().getTime();
      if (difference > 0) {
        setTimeLeft({
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((difference / 1000 / 60) % 60),
          seconds: Math.floor((difference / 1000) % 60)
        });
      } else clearInterval(timer);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="w-full bg-gradient-to-br from-brand-900 via-brand-800 to-brand-700 rounded-2xl p-6 md:p-8 mb-10 flex flex-col md:flex-row items-center justify-between text-white shadow-xl relative overflow-hidden">
      <div className="absolute -top-10 -right-10 w-60 h-60 bg-brand-400/10 rounded-full blur-3xl"></div>
      <div className="absolute -bottom-10 -left-10 w-60 h-60 bg-accent-400/10 rounded-full blur-3xl"></div>
      <div className="relative z-10 mb-6 md:mb-0 text-center md:text-left">
        <div className="flex items-center justify-center md:justify-start gap-2 mb-2 text-brand-200 font-semibold uppercase tracking-widest text-[10px]">
          <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse"></span>
          Registration Closing Soon
        </div>
        <h3 className="text-2xl md:text-3xl font-display font-bold text-white">CodeKriti 2026</h3>
        <p className="text-white/60 text-xs md:text-sm mt-1">Don&apos;t miss the biggest hackathon of the year.</p>
      </div>
      <div className="flex gap-3 relative z-10">
        {Object.entries(timeLeft).map(([unit, value]) => (
          <div key={unit} className="flex flex-col items-center">
            <div className="w-14 h-14 md:w-16 md:h-16 bg-white/10 backdrop-blur-sm rounded-xl border border-white/20 flex items-center justify-center text-lg md:text-2xl font-display font-bold text-white">
              {String(value).padStart(2, '0')}
            </div>
            <span className="text-[9px] uppercase tracking-wider mt-2 text-white/60 font-medium">{unit}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

const RegistrationModal = ({ isOpen, onClose, eventName }) => {
  const [formData, setFormData] = useState({ name: '', year: '', branch: '', regNo: '', phone: '', email: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });
  const setYear = (year) => setFormData({ ...formData, year });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await fetch(GOOGLE_SCRIPT_URL, {
        method: 'POST', mode: 'no-cors',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'registration', eventName, ...formData, timestamp: new Date().toISOString() })
      });
      toast.success('Registration successful! You are now on the list.');
      onClose();
    } catch (error) {
      toast.error('Registration failed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen || !mounted) return null;

  return createPortal(
    <div className="fixed inset-0 flex items-center justify-center p-4 sm:p-6" style={{ zIndex: 2147483647 }}>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="absolute inset-0 bg-brand-950/40 backdrop-blur-sm" onClick={onClose} />
      <motion.div initial={{ scale: 0.97, opacity: 0, y: 16 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.97, opacity: 0, y: 16 }}
        className="relative bg-white rounded-2xl w-full max-w-lg shadow-2xl z-10 overflow-hidden flex flex-col max-h-[90vh]">
        <div className="p-6 pb-4 border-b border-gray-100 flex justify-between items-center bg-white sticky top-0 z-20">
          <div>
            <h3 className="text-lg font-display font-bold text-brand-900">Registration</h3>
            <p className="text-xs text-gray-500 font-medium mt-0.5">Reserve your spot</p>
          </div>
          <button onClick={onClose} className="p-2 -mr-2 text-gray-400 hover:text-brand-900 hover:bg-gray-100 rounded-full transition-all">
            <X size={18} />
          </button>
        </div>
        <div className="p-6 overflow-y-auto">
          <div className="bg-brand-50 p-4 rounded-xl border border-brand-100 mb-6">
            <p className="text-[10px] font-semibold text-brand-600 uppercase tracking-wider mb-1">Event</p>
            <p className="text-brand-900 font-display font-semibold text-sm">{eventName}</p>
          </div>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Full Name</label>
              <input required type="text" name="name" value={formData.name} onChange={handleChange}
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:border-brand-500 focus:ring-2 focus:ring-brand-500/10 outline-none transition-all text-sm" placeholder="John Doe" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Year of Study</label>
              <div className="grid grid-cols-4 gap-2">
                {['1st', '2nd', '3rd', '4th'].map((y) => (
                  <button key={y} type="button" onClick={() => setYear(y)}
                    className={`py-2 text-xs font-semibold rounded-lg border transition-all ${formData.year === y ? 'bg-brand-500 text-white border-brand-500' : 'bg-white text-gray-600 border-gray-200 hover:border-brand-500 hover:text-brand-500'}`}>
                    {y}
                  </button>
                ))}
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Branch</label>
                <select required name="branch" value={formData.branch} onChange={handleChange}
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:border-brand-500 outline-none text-sm">
                  <option value="">Select Branch</option>
                  {BRANCHES.map((b) => <option key={b.short} value={b.full}>{b.full}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Reg No</label>
                <input required type="text" name="regNo" value={formData.regNo} onChange={handleChange}
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:border-brand-500 outline-none text-sm" placeholder="Registration No" />
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Phone</label>
                <input required type="tel" name="phone" value={formData.phone} onChange={handleChange}
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:border-brand-500 outline-none text-sm" placeholder="+91..." />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Email</label>
                <input required type="email" name="email" value={formData.email} onChange={handleChange}
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:border-brand-500 outline-none text-sm" placeholder="student@pmec.ac.in" />
              </div>
            </div>
            <div className="pt-3">
              <button type="submit" disabled={isSubmitting} className="w-full btn-primary justify-center">
                {isSubmitting ? (<><Loader2 className="animate-spin" size={16} />Confirming...</>) : 'Complete Registration'}
              </button>
            </div>
          </form>
        </div>
      </motion.div>
    </div>,
    document.body
  );
};

export default function EventsSection() {
  const [selectedEvent, setSelectedEvent] = useState(null);

  const handleAddToCalendar = (title, dateStr, desc) => {
    const date = new Date(dateStr);
    const start = date.toISOString().replace(/-|:|\.\d\d\d/g, '');
    const end = new Date(date.getTime() + 60 * 60 * 1000).toISOString().replace(/-|:|\.\d\d\d/g, '');
    const url = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(title)}&dates=${start}/${end}&details=${encodeURIComponent(desc)}`;
    window.open(url, '_blank');
  };

  const EventCard = ({ event }) => {
    const isParticipateType = event.category === 'Competition' || event.category === 'Workshop';
    const catStyles = {
      Competition: 'bg-brand-50 text-brand-700 border-brand-200',
      Workshop: 'bg-purple-50 text-purple-700 border-purple-200',
      Seminar: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      Program: 'bg-orange-50 text-orange-700 border-orange-200',
    };
    return (
      <div className="bg-white p-5 md:p-6 rounded-2xl border border-gray-100 hover:border-brand-200 hover:shadow-lg transition-all duration-300 w-full relative flex flex-col h-full group text-left">
        <div className="flex justify-between items-start mb-4">
          <div className="flex items-center gap-2 text-brand-600 font-semibold text-xs">
            <CalendarDays size={14} />
            <span>{event.date}</span>
          </div>
          <span className={`px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider border rounded-lg ${catStyles[event.category] || catStyles.Seminar}`}>
            {event.category}
          </span>
        </div>
        <h3 className="text-lg md:text-xl font-display font-bold text-brand-900 mb-2 group-hover:text-brand-700 transition-colors">{event.title}</h3>
        <p className="text-gray-600 text-xs md:text-sm leading-relaxed mb-5">{event.description}</p>
        <div className="mt-auto pt-4 border-t border-gray-50 flex items-center justify-between">
          {isParticipateType ? (
            <button onClick={() => setSelectedEvent(event.title)} className="text-brand-600 font-semibold text-xs hover:text-brand-900 flex items-center gap-1.5 group/btn">
              Register Now <ArrowRight size={14} className="group-hover/btn:translate-x-0.5 transition-transform" />
            </button>
          ) : (
            <button onClick={() => handleAddToCalendar(event.title, event.date, event.description)}
              className="text-gray-500 font-medium text-xs hover:text-brand-600 flex items-center gap-1.5">
              <Plus size={14} /> Add to Calendar
            </button>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="relative">
      <AnimatePresence>
        {selectedEvent && <RegistrationModal isOpen={!!selectedEvent} onClose={() => setSelectedEvent(null)} eventName={selectedEvent} />}
      </AnimatePresence>

      <CountdownTimer />

      <div className="relative pt-16 pb-12 flex justify-center items-center min-h-[300px]">
        <motion.div 
          initial={{ opacity: 0, y: 20 }} 
          whileInView={{ opacity: 1, y: 0 }} 
          viewport={{ once: true }} 
          transition={{ duration: 0.8, ease: "easeOut" }} 
          className="text-center relative z-10"
        >
          <div className="absolute -inset-4 bg-brand-50/50 blur-xl rounded-full -z-10"></div>
          <p 
            className="text-brand-700 text-5xl md:text-6xl lg:text-7xl font-bold tracking-wide drop-shadow-sm" 
            style={{ fontFamily: '"Caveat", cursive', lineHeight: '1.4' }}
          >
            More events coming soon... <br className="md:hidden" /> Please wait!
          </p>
        </motion.div>
      </div>
    </div>
  );
}
