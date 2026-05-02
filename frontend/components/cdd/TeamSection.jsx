'use client';
import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Linkedin, Mail, Instagram, Github, X, ChevronRight, Star } from 'lucide-react';
import { TEAM_MEMBERS } from '@/lib/cdd-constants';

const SocialLink = ({ href, icon: Icon, label }) => {
  if (!href) return null;
  return (
    <a href={href} target="_blank" rel="noopener noreferrer" aria-label={label}
      className="text-gray-400 hover:text-brand-600 transition-colors duration-200">
      <Icon size={15} />
    </a>
  );
};

const MemberCard = ({ member, isFounder }) => (
  <motion.div layout initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }}
    className={`bg-white shadow-sm rounded-2xl p-6 border transition-all duration-300 group hover:-translate-y-1 hover:shadow-md flex flex-col items-center text-center h-full ${
      isFounder ? 'border-amber-200 bg-gradient-to-b from-amber-50/50 to-white relative' : 'border-gray-100 hover:border-brand-200'
    }`}>
    {isFounder && (<div className="absolute top-4 right-4"><Star size={16} className="text-amber-400 fill-amber-400" /></div>)}
    <div className={`w-20 h-20 mb-4 rounded-full overflow-hidden border-[3px] transition-colors flex-shrink-0 ${isFounder ? 'border-amber-200' : 'border-gray-100 group-hover:border-brand-200'}`}>
      <img src={member.image || `https://ui-avatars.com/api/?name=${encodeURIComponent(member.name)}&background=dce4f2&color=0f1d35`}
        alt={member.name} className={`w-full h-full object-cover transition-transform duration-500 group-hover:scale-105 ${member.imagePosition ? '' : 'object-center'}`}
        style={member.imagePosition ? { objectPosition: member.imagePosition } : {}}
        loading="lazy" decoding="async"
        onError={(e) => { e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(member.name)}&background=dce4f2&color=0f1d35`; }} />
    </div>
    <h3 className={`text-base font-display font-bold mb-0.5 ${isFounder ? 'text-amber-700' : 'text-brand-900'}`}>{member.name}</h3>
    <p className={`text-[11px] font-semibold uppercase tracking-wider mb-2 ${isFounder ? 'text-amber-500' : 'text-brand-500'}`}>{member.role}</p>
    {member.description && <p className="text-gray-600 text-xs mb-3 leading-relaxed line-clamp-2">{member.description}</p>}
    {member.batch && <p className="text-gray-400 text-[11px] font-medium mb-3">Batch of {member.batch}</p>}
    <div className="flex gap-3 mt-auto pt-2">
      <SocialLink href={member.linkedin} icon={Linkedin} label="LinkedIn" />
      <SocialLink href={member.email ? `mailto:${member.email}` : undefined} icon={Mail} label="Email" />
      <SocialLink href={member.instagram} icon={Instagram} label="Instagram" />
      <SocialLink href={member.github} icon={Github} label="GitHub" />
    </div>
  </motion.div>
);

export default function TeamSection() {
  const [filter, setFilter] = useState('Team');
  const [showAllAlumni, setShowAllAlumni] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  const teamMembers = TEAM_MEMBERS.filter(m => m.category === 'Team');
  const founder = TEAM_MEMBERS.find(m => m.category === 'Founder');
  const allAlumni = TEAM_MEMBERS.filter(m => m.category === 'Alumni');
  const previewAlumni = allAlumni.slice(0, 4);
  const hasMoreAlumni = allAlumni.length > 4;

  useEffect(() => {
    if (showAllAlumni) document.body.style.overflow = 'hidden';
    else document.body.style.overflow = 'unset';
    return () => { document.body.style.overflow = 'unset'; };
  }, [showAllAlumni]);

  return (
    <div className="w-full">
      <div className="flex justify-center mb-10">
        <div className="flex bg-gray-100 p-1 rounded-xl">
          {['Team', 'Alumni'].map((category) => (
            <button key={category} onClick={() => { setFilter(category); setShowAllAlumni(false); }}
              className={`px-5 py-2 rounded-lg text-sm font-semibold transition-all duration-200 ${
                filter === category ? 'bg-white text-brand-900 shadow-sm' : 'text-gray-500 hover:text-brand-900'
              }`}>
              {category === 'Team' ? 'Current Board' : 'Alumni Network'}
            </button>
          ))}
        </div>
      </div>

      {filter === 'Team' && (
        <motion.div layout className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          <AnimatePresence mode="popLayout">
            {teamMembers.slice(0, 4).map((member) => (<MemberCard key={member.name} member={member} />))}
          </AnimatePresence>
        </motion.div>
      )}
      {filter === 'Team' && teamMembers.length > 4 && (
        <motion.div layout className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mt-5">
          <AnimatePresence mode="popLayout">
            <div className="hidden lg:block" />
            {teamMembers.slice(4, 6).map((member) => (<MemberCard key={member.name} member={member} />))}
            <div className="hidden lg:block" />
          </AnimatePresence>
        </motion.div>
      )}

      {filter === 'Alumni' && (
        <div className="space-y-10">
          <motion.div layout className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            <AnimatePresence mode="popLayout">
              {previewAlumni.map((member) => (<MemberCard key={member.name} member={member} />))}
            </AnimatePresence>
          </motion.div>
          {hasMoreAlumni && (
            <div className="text-center">
              <button onClick={() => setShowAllAlumni(true)} className="btn-primary group">
                View All Alumni ({allAlumni.length}) <ChevronRight size={16} />
              </button>
            </div>
          )}
        </div>
      )}

      {mounted && createPortal(
        <AnimatePresence>
          {showAllAlumni && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 bg-brand-950/60 backdrop-blur-md z-[9999] flex items-center justify-center p-4 sm:p-6"
              onClick={() => setShowAllAlumni(false)}>
              <motion.div initial={{ scale: 0.95, y: 30 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 30 }}
                className="bg-white rounded-2xl max-w-4xl w-full max-h-[85vh] overflow-y-auto shadow-2xl flex flex-col"
                onClick={(e) => e.stopPropagation()}>
                <div className="sticky top-0 bg-white/95 backdrop-blur-md px-6 py-5 border-b border-gray-100 flex justify-between items-center z-10">
                  <div>
                    <h2 className="text-xl font-display font-bold text-brand-900">Alumni Network</h2>
                    <p className="text-xs text-gray-500 mt-0.5">{allAlumni.length} members across years</p>
                  </div>
                  <button onClick={() => setShowAllAlumni(false)} className="p-2 text-gray-400 hover:bg-brand-50 hover:text-brand-600 rounded-full transition-colors">
                    <X size={20} />
                  </button>
                </div>
                <div className="p-6 space-y-3">
                  {allAlumni.map((member) => (
                    <div key={member.name} className="flex items-center gap-4 p-4 rounded-xl border border-gray-100 hover:border-brand-200 hover:bg-brand-50/40 hover:shadow-sm transition-all duration-300">
                      <img src={member.image || `https://ui-avatars.com/api/?name=${encodeURIComponent(member.name)}&background=dce4f2&color=0f1d35`}
                        alt={member.name} className={`w-12 h-12 rounded-full object-cover border-2 border-white shadow-sm flex-shrink-0 ${member.imagePosition ? '' : 'object-center'}`}
                        style={member.imagePosition ? { objectPosition: member.imagePosition } : {}}
                        loading="lazy" decoding="async"
                        onError={(e) => { e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(member.name)}&background=dce4f2&color=0f1d35`; }} />
                      <div className="flex-grow min-w-0">
                        <h3 className="font-display font-bold text-brand-900 text-sm truncate">{member.name}</h3>
                        <p className="text-xs text-gray-500">{member.batch ? `Batch of ${member.batch}` : member.role}</p>
                      </div>
                      <div className="flex gap-3 flex-shrink-0">
                        <SocialLink href={member.linkedin} icon={Linkedin} label="LinkedIn" />
                        <SocialLink href={member.email ? `mailto:${member.email}` : undefined} icon={Mail} label="Email" />
                        <SocialLink href={member.instagram} icon={Instagram} label="Instagram" />
                        <SocialLink href={member.github} icon={Github} label="GitHub" />
                      </div>
                    </div>
                  ))}
                  {founder && (
                    <div className="mt-6 pt-6 border-t border-amber-100">
                      <div className="flex flex-col sm:flex-row items-center gap-4 p-5 bg-gradient-to-r from-amber-50 to-amber-50/50 rounded-xl border border-amber-200 text-center sm:text-left">
                        <div className="relative flex-shrink-0">
                          <img src={founder.image} alt={founder.name}
                            className="w-16 h-16 rounded-full object-cover object-center border-[3px] border-amber-200 shadow-sm"
                            loading="lazy" decoding="async" />
                          <Star size={14} className="absolute -top-1 -right-1 text-amber-400 fill-amber-400" />
                        </div>
                        <div className="flex-grow">
                          <h3 className="text-base font-display font-bold text-amber-700">{founder.name}</h3>
                          <p className="text-xs font-semibold text-amber-500">{founder.role}</p>
                          {founder.description && <p className="text-xs text-gray-600 mt-1 max-w-sm mx-auto sm:mx-0">{founder.description}</p>}
                        </div>
                        <div className="flex gap-3 mt-2 sm:mt-0">
                          <SocialLink href={founder.linkedin} icon={Linkedin} label="LinkedIn" />
                          <SocialLink href={founder.email ? `mailto:${founder.email}` : undefined} icon={Mail} label="Email" />
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>,
        document.body
      )}
    </div>
  );
}
