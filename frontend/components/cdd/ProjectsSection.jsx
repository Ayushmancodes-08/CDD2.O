'use client';
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ExternalLink } from 'lucide-react';
import { PROJECTS } from '@/lib/cdd-constants';

const colorMap = {
  purple: { accent: 'bg-purple-500', bg: 'bg-purple-50', border: 'border-purple-100', btn: 'bg-purple-600 hover:bg-purple-700', text: 'text-purple-600' },
  blue:   { accent: 'bg-brand-500',  bg: 'bg-brand-50',  border: 'border-brand-100',  btn: 'bg-brand-600 hover:bg-brand-700',   text: 'text-brand-600' },
  green:  { accent: 'bg-emerald-500', bg: 'bg-emerald-50', border: 'border-emerald-100', btn: 'bg-emerald-600 hover:bg-emerald-700', text: 'text-emerald-600' },
  orange: { accent: 'bg-orange-500', bg: 'bg-orange-50', border: 'border-orange-100', btn: 'bg-orange-600 hover:bg-orange-700', text: 'text-orange-600' },
};

const ProjectCard = ({ project }) => {
  const [activeVersion, setActiveVersion] = useState(0);
  const Icon = project.icon;
  const theme = colorMap[project.color] || colorMap.blue;
  const isDual = project.type === 'dual' && project.versions;
  const currentTech = isDual ? project.versions[activeVersion].tech : project.tech;
  const currentLink = isDual ? project.versions[activeVersion].link : project.link;
  const currentName = isDual ? project.versions[activeVersion].name : null;

  return (
    <motion.div layout initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
      className="bg-white rounded-2xl border border-gray-100 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 flex flex-col overflow-hidden group h-full">
      {project.image && (
        <div className="relative h-48 overflow-hidden">
          <img src={project.image} alt={project.name} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
            loading="lazy" decoding="async" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent"></div>
        </div>
      )}
      <div className={`h-1 w-full ${theme.accent}`}></div>
      <div className="p-6 md:p-7 flex flex-col h-full">
        <div className="flex items-start justify-between mb-4">
          <div className={`p-2.5 rounded-xl ${theme.bg} ${theme.border} border transition-colors`}>
            <Icon size={20} className={theme.text} />
          </div>
          {isDual && (
            <div className="flex bg-gray-50 p-0.5 rounded-lg">
              {project.versions.map((v, idx) => (
                <button key={v.name} onClick={() => setActiveVersion(idx)}
                  className={`px-3 py-1 text-[11px] font-semibold rounded-md transition-all ${activeVersion === idx ? 'bg-white text-brand-900 shadow-sm' : 'text-gray-500 hover:text-brand-900'}`}>
                  {v.name}
                </button>
              ))}
            </div>
          )}
        </div>
        <div className="mb-1">
          <span className={`text-[11px] font-semibold uppercase tracking-wider ${theme.text}`}>{project.category}</span>
          <h3 className="text-xl font-display font-bold text-brand-900 mt-1">{project.name}</h3>
        </div>
        <p className="text-gray-600 text-sm leading-relaxed mb-5 flex-grow">{project.description}</p>
        <div className="flex flex-wrap gap-1.5 mb-5">
          {currentTech?.map((tech) => (
            <span key={tech} className="px-2 py-0.5 bg-gray-50 text-gray-600 text-[10px] font-semibold uppercase tracking-wide border border-gray-200 rounded-md">
              {tech}
            </span>
          ))}
        </div>
        <div className="mt-auto pt-5 border-t border-gray-50">
          <a href={currentLink} target="_blank" rel="noopener noreferrer"
            className={`inline-flex items-center justify-center w-full gap-2 px-4 py-2.5 text-white text-sm font-semibold rounded-xl transition-all shadow-sm ${theme.btn}`}>
            {isDual ? `Visit ${currentName}` : 'View Live Project'}
            <ExternalLink size={14} />
          </a>
        </div>
      </div>
    </motion.div>
  );
};

export default function ProjectsSection() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
      {PROJECTS.map((project) => <ProjectCard key={project.id} project={project} />)}
    </div>
  );
}
