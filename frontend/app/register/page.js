'use client';
import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowLeft, Sparkles, Shield, CheckCircle, HelpCircle } from 'lucide-react';
import RegistrationForm from '@/components/cdd/RegistrationForm';
import { AnimatedGridPattern } from '@/components/cdd/AnimatedGrid';

export default function RegisterPage() {
  return (
    <div className="min-h-screen bg-slate-50 relative overflow-hidden font-sans selection:bg-brand-500 selection:text-white pb-20">
      {/* Background Animated Grid */}
      <div className="absolute inset-0 pointer-events-none opacity-40">
        <AnimatedGridPattern />
      </div>

      {/* Ambient Gradient Orbs */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-brand-400/15 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-1/3 right-1/4 w-96 h-96 bg-emerald-400/10 rounded-full blur-[100px] pointer-events-none" />

      {/* Top Navigation Bar */}
      <header className="relative z-20 border-b border-gray-200/60 bg-white/80 backdrop-blur-xl">
        <div className="max-w-6xl mx-auto px-5 sm:px-6 lg:px-8 h-18 flex items-center justify-between py-4">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm font-semibold text-gray-600 hover:text-brand-900 transition-colors group"
          >
            <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
            Back to Home
          </Link>

          <Link href="/" className="flex items-center gap-2.5">
            <img
              src="/Logo_dark.png"
              alt="IIC PMEC Logo"
              className="w-8 h-8 object-contain"
            />
            <span className="font-display font-bold text-brand-900 text-sm hidden sm:inline">
              Idea and Innovation Cell (CDD×SIC)
            </span>
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 sm:pt-14">
        {/* Page Hero Header */}
        <div className="text-center max-w-2xl mx-auto mb-10">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-50 border border-brand-200 text-brand-700 text-xs font-semibold mb-3 shadow-sm"
          >
            <Sparkles size={13} className="text-brand-500" />
            Registration 2026 is Live
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-3xl sm:text-4xl lg:text-5xl font-display font-extrabold text-brand-900 tracking-tight"
          >
            Join Idea & Innovation Cell
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="mt-3 text-sm sm:text-base text-gray-500 leading-relaxed"
          >
            PMEC&apos;s premier innovation and engineering society. Master real-world tech, build industry-grade software & hardware, and shape campus technology.
          </motion.p>
        </div>

        {/* The Interactive Multi-Step Registration Form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <RegistrationForm />
        </motion.div>

        {/* Quick FAQs / Membership Value Guarantee */}
        <div className="mt-16 border-t border-gray-200/80 pt-10">
          <h4 className="text-xs font-bold uppercase tracking-widest text-gray-400 text-center mb-6">
            Membership Highlights & Assurance
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-center sm:text-left">
            <div className="p-4 bg-white/60 backdrop-blur-sm rounded-2xl border border-gray-100 shadow-sm">
              <div className="w-8 h-8 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center mb-2 mx-auto sm:mx-0">
                <CheckCircle size={18} />
              </div>
              <h5 className="text-sm font-bold text-brand-900">One-Time Tenure Fee</h5>
              <p className="text-xs text-gray-500 mt-1">
                Only ₹75 per academic year for your entire college tenure. No recurring monthly or semester fees.
              </p>
            </div>

            <div className="p-4 bg-white/60 backdrop-blur-sm rounded-2xl border border-gray-100 shadow-sm">
              <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-2 mx-auto sm:mx-0">
                <Shield size={18} />
              </div>
              <h5 className="text-sm font-bold text-brand-900">Zero Gateway Charges</h5>
              <p className="text-xs text-gray-500 mt-1">
                Direct 100% secure UPI settlement without intermediary payment gateway deductions or hidden fees.
              </p>
            </div>

            <div className="p-4 bg-white/60 backdrop-blur-sm rounded-2xl border border-gray-100 shadow-sm">
              <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center mb-2 mx-auto sm:mx-0">
                <HelpCircle size={18} />
              </div>
              <h5 className="text-sm font-bold text-brand-900">Support & Verification</h5>
              <p className="text-xs text-gray-500 mt-1">
                Automated matching with instant email receipt and direct entrance into the candidate cohort group.
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
