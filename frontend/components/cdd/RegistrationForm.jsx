'use client';
import React, { useState, useMemo, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { QRCodeSVG } from 'qrcode.react';
import {
  User, Mail, Phone, Building2, GraduationCap, CheckCircle2,
  Upload, ArrowRight, ArrowLeft, Copy, Check, ShieldCheck,
  Lock, ExternalLink, Loader2, Sparkles, RefreshCw, Smartphone,
  Send, AtSign, Zap, QrCode, MessageSquare, Info, AlertCircle, Download,
  CreditCard, Landmark, Hash, Clock, FileCheck, Camera, ChevronRight
} from 'lucide-react';
import { toast } from 'sonner';
import { REGISTRATION_BRANCHES, REGISTRATION_YEARS, COLLEGE_NAME, BANK_DETAILS } from '@/lib/cdd-constants';
import { compressImage } from '@/lib/image-compressor';
import {
  generateUPIUri,
  DEFAULT_CLUB_UPI,
  DEFAULT_PAYEE_NAME,
  DEFAULT_TAP_TO_PAY_UPI,
  DEFAULT_TAP_TO_PAY_NAME,
  DEFAULT_WHATSAPP_GROUP,
} from '@/lib/upi';

export default function RegistrationForm({ onSuccess = null, isModal = false }) {
  // 1: Details (Phase 1), 2: Bank & Fees (Phase 2), 3: Proof / UTR (Phase 3), 4: Submitted & Pending Review
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [copiedAcc, setCopiedAcc] = useState(false);
  const [copiedIfsc, setCopiedIfsc] = useState(false);
  const [copiedUpi, setCopiedUpi] = useState(false);
  const [showQrCode, setShowQrCode] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    rollNo: '',
    year: '1st year',
    branch: 'Computer Science and Engineering',
    college: COLLEGE_NAME,
    email: '',
    phone: '',
    photo: '',
    utr: '',
    paymentScreenshot: '',
  });

  const [registeredData, setRegisteredData] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [screenshotPreview, setScreenshotPreview] = useState(null);
  const [isCompressingPhoto, setIsCompressingPhoto] = useState(false);
  const [isCompressingScreenshot, setIsCompressingScreenshot] = useState(false);
  const [sessionData, setSessionData] = useState(null);
  const [isCreatingSession, setIsCreatingSession] = useState(false);

  // Scroll helper
  const scrollToFormTop = () => {
    if (typeof window === 'undefined') return;
    try {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      const modalContainer = document.getElementById('cdd-modal-content-container');
      if (modalContainer) {
        modalContainer.scrollTo({ top: 0, behavior: 'smooth' });
      }
      const formTop = document.getElementById('cdd-registration-form-top');
      if (formTop) {
        formTop.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    } catch (e) {}
  };

  // Selected Year Fee
  const selectedYearObj = useMemo(() => {
    return REGISTRATION_YEARS.find((y) => y.id === formData.year) || REGISTRATION_YEARS[0];
  }, [formData.year]);

  const currentAmount = selectedYearObj.amount;

  // Active UPI URI for students who prefer UPI over direct bank transfer
  const activeUpiUri = useMemo(() => {
    if (sessionData?.upiUri) return sessionData.upiUri;
    const cleanNote = `CDD-${(formData.rollNo || formData.name || 'Member').trim().replace(/[^a-zA-Z0-9]/g, '').slice(0, 12)}`;
    return generateUPIUri({
      vpa: DEFAULT_TAP_TO_PAY_UPI,
      name: DEFAULT_TAP_TO_PAY_NAME,
      amount: currentAmount,
      note: cleanNote,
    });
  }, [sessionData, formData.rollNo, formData.name, currentAmount]);

  // Handle Input Changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Handle Photo Upload with Client-Side Compression
  const handlePhotoUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Please upload an image file (PNG, JPG, or WEBP).');
      return;
    }

    setIsCompressingPhoto(true);
    try {
      const compressed = await compressImage(file, 600, 600, 0.85);
      setPhotoPreview(compressed);
      setFormData((prev) => ({ ...prev, photo: compressed }));
      toast.success('Passport photo uploaded & compressed!');
    } catch (err) {
      toast.error('Could not process photo. Please choose another image.');
    } finally {
      setIsCompressingPhoto(false);
    }
  };

  // Handle Payment Screenshot Upload
  const handleScreenshotUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Please upload a screenshot image (PNG, JPG, or WEBP).');
      return;
    }

    setIsCompressingScreenshot(true);
    try {
      const compressed = await compressImage(file, 1200, 1200, 0.82);
      setScreenshotPreview(compressed);
      setFormData((prev) => ({ ...prev, paymentScreenshot: compressed }));
      toast.success('Payment receipt screenshot attached!');
    } catch (err) {
      toast.error('Could not process payment screenshot.');
    } finally {
      setIsCompressingScreenshot(false);
    }
  };

  // Copy Helpers
  const handleCopyAcc = () => {
    navigator.clipboard.writeText(BANK_DETAILS.accountNumber);
    setCopiedAcc(true);
    toast.success('Account Number 110209284559 copied to clipboard!');
    setTimeout(() => setCopiedAcc(false), 2500);
  };

  const handleCopyIfsc = () => {
    navigator.clipboard.writeText(BANK_DETAILS.ifscCode);
    setCopiedIfsc(true);
    toast.success('IFSC Code CNRB0017998 copied to clipboard!');
    setTimeout(() => setCopiedIfsc(false), 2500);
  };

  const handleCopyUpi = () => {
    navigator.clipboard.writeText(DEFAULT_CLUB_UPI);
    setCopiedUpi(true);
    toast.success('UPI ID copied to clipboard!');
    setTimeout(() => setCopiedUpi(false), 2500);
  };

  // Validation: Phase 1
  const validatePhase1 = () => {
    if (!formData.name.trim() || formData.name.trim().length < 2) {
      toast.error('Please enter your full legal name.');
      return false;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email.trim() || !emailRegex.test(formData.email.trim())) {
      toast.error('Please enter a valid email address.');
      return false;
    }
    if (!formData.rollNo.trim() || formData.rollNo.trim().length < 2) {
      toast.error('Please enter your Reg ID / Roll No.');
      return false;
    }
    const cleanPhone = formData.phone.replace(/[^0-9]/g, '');
    if (cleanPhone.length < 10) {
      toast.error('Please enter a valid 10-digit WhatsApp phone number.');
      return false;
    }
    if (!formData.branch) {
      toast.error('Please select your engineering branch.');
      return false;
    }
    if (!formData.photo) {
      toast.error('Please upload your Passport Size Professional Photo ID.');
      return false;
    }
    return true;
  };

  // Phase 1 -> Phase 2 (Proceed to Payment)
  const handleProceedToPayment = async (e) => {
    e.preventDefault();
    if (!validatePhase1()) return;

    setIsCreatingSession(true);
    try {
      const res = await fetch('/api/register/session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name.trim(),
          rollNo: formData.rollNo.trim(),
          registrationNumber: formData.rollNo.trim(),
          year: formData.year,
          branch: formData.branch,
          college: formData.college,
          email: formData.email.trim(),
          phone: formData.phone.trim(),
        }),
      });

      const data = await res.json();
      if (!data.success) {
        toast.error(data.error || 'Failed to initialize registration session.');
        return;
      }

      setSessionData(data);
      setStep(2);
      scrollToFormTop();
      toast.success('Phase 1 completed! Please review bank payment details.');
    } catch (err) {
      toast.error('Network connection error while preparing payment session.');
    } finally {
      setIsCreatingSession(false);
    }
  };

  // Phase 2 -> Phase 3 ("I Have Paid")
  const handleIHavePaid = () => {
    setStep(3);
    scrollToFormTop();
    toast.info('Please enter your Transaction UTR and upload your payment screenshot.');
  };

  // Phase 3 Submission (Final Submit)
  const handleSubmitVerification = async (e) => {
    e.preventDefault();

    const cleanUtr = formData.utr.replace(/[^a-zA-Z0-9]/g, '').trim();
    if (!cleanUtr || cleanUtr.length < 10 || cleanUtr.length > 20) {
      toast.error('Please enter a valid 12-digit UTR / Transaction ID from your receipt.');
      return;
    }

    if (!formData.paymentScreenshot) {
      toast.error('Please upload your payment screenshot proof before submitting.');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name.trim(),
          rollNo: formData.rollNo.trim(),
          registrationNumber: formData.rollNo.trim(),
          year: formData.year,
          branch: formData.branch,
          college: formData.college,
          email: formData.email.trim(),
          phone: formData.phone.trim(),
          photo: formData.photo,
          amount: sessionData?.amount || currentAmount,
          utr: cleanUtr,
          paymentScreenshot: formData.paymentScreenshot,
          payingUpi: 'CANARA_BANK_TRANSFER',
          sessionId: sessionData?.sessionId || null,
        }),
      });

      const data = await res.json();

      if (data.success) {
        setRegisteredData(data.registration);
        setStep(4);
        scrollToFormTop();
        toast.success('Registration submitted! Pending admin verification.');
        if (typeof window !== 'undefined') {
          try {
            window.dispatchEvent(new CustomEvent('cdd:registration-completed', { detail: data.registration }));
          } catch (e) {}
        }
        if (onSuccess) onSuccess(data.registration);
      } else {
        toast.error(data.error || 'Failed to submit registration. Please verify details.');
      }
    } catch (err) {
      toast.error('Network connection error. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div id="cdd-registration-form-top" className={`w-full ${isModal ? 'p-0 sm:p-1' : 'max-w-3xl mx-auto'}`}>
      
      {/* 3-Phase Stepper Progress Bar */}
      {step <= 3 && (
        <div className="mb-6 sm:mb-8">
          <div className={`flex items-center justify-between relative px-2 sm:px-6 ${isModal ? 'pr-12 sm:pr-14' : ''}`}>
            {/* Background Line */}
            <div className="absolute left-6 right-6 top-1/2 -translate-y-1/2 h-0.5 bg-gray-200 z-0" />
            
            {/* Active Progress Line */}
            <div
              className="absolute left-6 top-1/2 -translate-y-1/2 h-0.5 bg-gradient-to-r from-brand-600 to-indigo-600 transition-all duration-500 z-0"
              style={{
                width: step === 1 ? '0%' : step === 2 ? '50%' : '100%',
                maxWidth: 'calc(100% - 3rem)',
              }}
            />

            {[
              { num: 1, label: '1. Student Details', short: 'Details' },
              { num: 2, label: '2. Bank & Fee', short: 'Bank' },
              { num: 3, label: '3. Proof & Submit', short: 'Proof' },
            ].map((s) => {
              const isCompleted = step > s.num;
              const isCurrent = step === s.num;
              return (
                <div key={s.num} className="relative z-10 flex flex-col items-center">
                  <div
                    className={`w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center font-bold text-xs sm:text-sm transition-all duration-300 shadow-sm
                    ${
                      isCompleted
                        ? 'bg-emerald-600 text-white shadow-emerald-500/20'
                        : isCurrent
                        ? 'bg-brand-900 text-white ring-4 ring-brand-100 scale-105'
                        : 'bg-white text-gray-400 border border-gray-200'
                    }`}
                  >
                    {isCompleted ? <Check size={16} strokeWidth={3} /> : s.num}
                  </div>
                  <span
                    className={`text-[10px] sm:text-xs font-semibold mt-1.5 sm:mt-2 tracking-wider uppercase ${
                      isCurrent ? 'text-brand-900 font-bold' : isCompleted ? 'text-emerald-700 font-medium' : 'text-gray-400'
                    }`}
                  >
                    <span className="hidden sm:inline">{s.label}</span>
                    <span className="sm:hidden">{s.short}</span>
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Main Card Container */}
      <div className="bg-white/95 backdrop-blur-xl border border-gray-100/90 rounded-2xl sm:rounded-3xl shadow-ambient p-4 sm:p-6 md:p-8 relative overflow-hidden">
        {/* Glow ambient decorations */}
        <div className="absolute -top-24 -right-24 w-60 h-60 bg-brand-400/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-60 h-60 bg-emerald-400/10 rounded-full blur-3xl pointer-events-none" />

        <AnimatePresence mode="wait">
          {/* ========================================================================= */}
          {/* PHASE 1: STUDENT DETAILS FORM */}
          {/* ========================================================================= */}
          {step === 1 && (
            <motion.form
              key="phase-1"
              initial={{ opacity: 0, x: -16 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 16 }}
              transition={{ duration: 0.25 }}
              onSubmit={handleProceedToPayment}
              className="space-y-5 sm:space-y-6"
            >
              <div>
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-brand-50 text-brand-700 border border-brand-200/60">
                    <Sparkles size={11} className="text-brand-500" />
                    Notice Ref: PMEC/Startup/03/2026
                  </span>
                </div>
                <h3 className="text-xl sm:text-2xl md:text-3xl font-display font-bold text-brand-900 tracking-tight">
                  Student Registration (Phase 1)
                </h3>
                <p className="text-gray-500 text-xs sm:text-sm mt-0.5">
                  Enter your academic credentials and upload your passport photo.
                </p>
              </div>

              {/* Photo Upload & Full Name Row */}
              <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 sm:gap-6 p-4 rounded-2xl bg-slate-50/80 border border-slate-200/80">
                <div className="relative group shrink-0">
                  <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl overflow-hidden bg-white border-2 border-dashed border-gray-300 flex items-center justify-center relative shadow-sm">
                    {photoPreview ? (
                      <img src={photoPreview} alt="Passport preview" className="w-full h-full object-cover" />
                    ) : (
                      <div className="flex flex-col items-center justify-center text-gray-400 p-2 text-center">
                        {isCompressingPhoto ? (
                          <Loader2 size={24} className="animate-spin text-brand-500" />
                        ) : (
                          <>
                            <Camera size={26} className="mb-1 text-gray-400" />
                            <span className="text-[10px] font-medium leading-tight">Photo ID *</span>
                            <span className="text-[8px] text-gray-400">Passport Size</span>
                          </>
                        )}
                      </div>
                    )}
                  </div>
                  <label
                    htmlFor="student-photo-input"
                    className="absolute -bottom-2 -right-2 bg-brand-900 hover:bg-brand-800 text-white p-2 rounded-xl shadow-md cursor-pointer transition-all hover:scale-105 active:scale-95"
                    title="Upload Photo ID"
                  >
                    <Upload size={14} />
                    <input
                      id="student-photo-input"
                      type="file"
                      accept="image/*"
                      onChange={handlePhotoUpload}
                      className="sr-only"
                    />
                  </label>
                </div>

                <div className="w-full space-y-3">
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                      Full Legal Name <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative">
                      <User className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={17} />
                      <input
                        type="text"
                        name="name"
                        required
                        placeholder="e.g. Ayushman Patra"
                        value={formData.name}
                        onChange={handleChange}
                        className="w-full pl-10 pr-4 py-2.5 sm:py-3 rounded-xl border border-gray-200 bg-white text-brand-900 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 transition-all"
                      />
                    </div>
                  </div>
                  <p className="text-[11px] text-gray-500">
                    <span className="font-semibold text-brand-900">Photo ID:</span> Clear passport size professional headshot required for your official society pass.
                  </p>
                </div>
              </div>

              {/* Year Selection (Notice-Compliant: First-Year vs Second-Year) */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-2">
                  Select Year of Study <span className="text-rose-500">*</span>
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {REGISTRATION_YEARS.map((y) => {
                    const isSelected = formData.year === y.id;
                    return (
                      <label
                        key={y.id}
                        className={`relative flex flex-col p-4 rounded-2xl border-2 cursor-pointer transition-all duration-200 ${
                          isSelected
                            ? 'border-brand-500 bg-brand-50/50 shadow-sm shadow-brand-500/10 ring-2 ring-brand-200'
                            : 'border-gray-200 hover:border-gray-300 bg-white'
                        }`}
                      >
                        <input
                          type="radio"
                          name="year"
                          value={y.id}
                          checked={isSelected}
                          onChange={handleChange}
                          className="sr-only"
                        />
                        <div className="flex justify-between items-start mb-1">
                          <span className="font-display font-bold text-brand-900 text-base">{y.label}</span>
                          <span
                            className={`w-5 h-5 rounded-full border flex items-center justify-center ${
                              isSelected ? 'border-brand-500 bg-brand-500' : 'border-gray-300'
                            }`}
                          >
                            {isSelected && <span className="w-2 h-2 rounded-full bg-white" />}
                          </span>
                        </div>
                        <div className="mt-1 flex items-baseline justify-between">
                          <span className="text-xl sm:text-2xl font-black text-brand-900">₹{y.amount}</span>
                          <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-2.5 py-0.5 rounded-full">
                            One-Time Fee
                          </span>
                        </div>
                        <p className="text-xs text-gray-500 mt-1">
                          {y.duration} active society membership tenure
                        </p>
                      </label>
                    );
                  })}
                </div>
              </div>

              {/* Registration Number / Roll No & Branch */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 sm:gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
                    Reg ID / Roll No <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <Hash className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={17} />
                    <input
                      type="text"
                      name="rollNo"
                      required
                      placeholder="e.g. 2301109042 or 24LE012"
                      value={formData.rollNo}
                      onChange={handleChange}
                      className="w-full pl-10 pr-4 py-2.5 sm:py-3 rounded-xl border border-gray-200 bg-white text-brand-900 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 transition-all font-mono"
                    />
                  </div>
                  <p className="text-[10px] text-gray-400 mt-1">College Registration ID or Class Roll No.</p>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
                    Engineering Branch <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <GraduationCap className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={17} />
                    <select
                      name="branch"
                      value={formData.branch}
                      onChange={handleChange}
                      required
                      className="w-full pl-10 pr-10 py-2.5 sm:py-3 rounded-xl border border-gray-200 bg-white text-brand-900 text-sm appearance-none focus:outline-none focus:ring-2 focus:ring-brand-500 transition-all cursor-pointer"
                    >
                      {REGISTRATION_BRANCHES.map((b) => (
                        <option key={b} value={b}>
                          {b}
                        </option>
                      ))}
                    </select>
                    <div className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 text-xs">
                      ▼
                    </div>
                  </div>
                </div>
              </div>

              {/* Email and WhatsApp Phone */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 sm:gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
                    Email Address <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={17} />
                    <input
                      type="email"
                      name="email"
                      required
                      placeholder="you@pmec.ac.in or gmail"
                      value={formData.email}
                      onChange={handleChange}
                      className="w-full pl-10 pr-4 py-2.5 sm:py-3 rounded-xl border border-gray-200 bg-white text-brand-900 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 transition-all"
                    />
                  </div>
                  <p className="text-[10px] text-gray-400 mt-1">Approval email & WhatsApp link will arrive here.</p>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
                    Contact No (WhatsApp) <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={17} />
                    <input
                      type="tel"
                      name="phone"
                      required
                      maxLength={14}
                      placeholder="10-digit WhatsApp number"
                      value={formData.phone}
                      onChange={handleChange}
                      className="w-full pl-10 pr-4 py-2.5 sm:py-3 rounded-xl border border-gray-200 bg-white text-brand-900 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 transition-all font-mono"
                    />
                  </div>
                  <p className="text-[10px] text-gray-400 mt-1">For official cohort communications.</p>
                </div>
              </div>

              {/* Institution (Immutable) */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    College / Institution
                  </label>
                  <span className="inline-flex items-center gap-1 text-[10px] text-gray-400">
                    <Lock size={10} /> Verified Campus
                  </span>
                </div>
                <div className="relative">
                  <Building2 className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={17} />
                  <input
                    type="text"
                    value={COLLEGE_NAME}
                    readOnly
                    tabIndex={-1}
                    className="w-full pl-10 pr-10 py-2.5 sm:py-3 rounded-xl border border-gray-200 bg-gray-100/80 text-gray-700 text-xs sm:text-sm font-medium cursor-not-allowed select-none focus:outline-none"
                  />
                  <div className="absolute right-3.5 top-1/2 -translate-y-1/2">
                    <ShieldCheck size={17} className="text-emerald-500" />
                  </div>
                </div>
              </div>

              {/* Action Button Row */}
              <div className="pt-2 sm:pt-4 flex justify-end">
                <button
                  type="submit"
                  disabled={isCreatingSession}
                  className="btn-primary group w-full sm:w-auto inline-flex items-center justify-center gap-2 text-sm sm:text-base px-6 sm:px-8 py-3 sm:py-3.5 disabled:opacity-60 cursor-pointer shadow-lg shadow-brand-900/20"
                >
                  {isCreatingSession ? (
                    <>
                      <Loader2 size={17} className="animate-spin" />
                      Saving Profile & Preparing Payment...
                    </>
                  ) : (
                    <>
                      Proceed to Payment (Phase 2)
                      <ArrowRight size={17} className="group-hover:translate-x-1 transition-transform" />
                    </>
                  )}
                </button>
              </div>
            </motion.form>
          )}

          {/* ========================================================================= */}
          {/* PHASE 2: BANK & FEE DETAILS SCREEN */}
          {/* ========================================================================= */}
          {step === 2 && (
            <motion.div
              key="phase-2"
              initial={{ opacity: 0, x: 16 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -16 }}
              transition={{ duration: 0.25 }}
              className="space-y-5 sm:space-y-6"
            >
              <div>
                <button
                  type="button"
                  onClick={() => {
                    setStep(1);
                    scrollToFormTop();
                  }}
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-gray-500 hover:text-brand-900 mb-2 transition-colors cursor-pointer"
                >
                  <ArrowLeft size={13} /> Edit student details (Phase 1)
                </button>

                <div className="flex flex-wrap items-center justify-between gap-2">
                  <h3 className="text-xl sm:text-2xl md:text-3xl font-display font-bold text-brand-900 tracking-tight">
                    Official Bank & Fee Details (Phase 2)
                  </h3>
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-bold bg-amber-50 text-amber-800 border border-amber-200">
                    Deadline: 26 Oct 2026
                  </span>
                </div>
                <p className="text-gray-500 text-xs sm:text-sm mt-0.5">
                  Deposit the applicable one-time membership fee into the official CDD Canara Bank account.
                </p>
              </div>

              {/* Official Notice Summary Box */}
              <div className="p-4 rounded-2xl bg-gradient-to-r from-blue-900 via-indigo-950 to-slate-900 text-white shadow-ambient relative overflow-hidden">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 relative z-10">
                  <div>
                    <span className="text-[11px] uppercase tracking-wider text-blue-300 font-semibold">
                      Your Selected Tier: {selectedYearObj.label}
                    </span>
                    <div className="flex items-baseline gap-2 mt-0.5">
                      <span className="text-3xl sm:text-4xl font-display font-black text-white">₹{currentAmount}</span>
                      <span className="text-xs text-blue-200 font-medium">(One-Time Deposit)</span>
                    </div>
                    <p className="text-[11px] text-blue-200/80 mt-1">
                      Applicant: <strong className="text-white">{formData.name}</strong> • Reg ID / Roll No: <strong className="text-white font-mono">{formData.rollNo}</strong>
                    </p>
                  </div>

                  <div className="bg-white/10 backdrop-blur-md rounded-xl p-3 border border-white/15 text-xs space-y-1 w-full sm:w-auto">
                    <p className="text-[10px] text-blue-200 font-bold uppercase tracking-wider">Official Fee Structure</p>
                    <div className="flex justify-between gap-4 text-white">
                      <span>1. First-Year Students:</span>
                      <strong className="text-emerald-300">₹300/-</strong>
                    </div>
                    <div className="flex justify-between gap-4 text-white">
                      <span>2. Second-Year Students:</span>
                      <strong className="text-emerald-300">₹225/-</strong>
                    </div>
                  </div>
                </div>
              </div>

              {/* Official Bank Account Card (Canara Bank Sitalpalli) */}
              <div className="border-2 border-brand-500/30 rounded-2xl p-5 bg-gradient-to-b from-brand-50/40 via-white to-slate-50 relative shadow-sm">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-8 h-8 rounded-lg bg-brand-900 text-white flex items-center justify-center">
                    <Landmark size={18} />
                  </div>
                  <div>
                    <h4 className="text-sm sm:text-base font-bold text-brand-900">
                      Official Canara Bank Account Details
                    </h4>
                    <p className="text-[11px] text-gray-500">Parala Maharaja Engineering College, Sitalpalli Branch</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 mt-4">
                  {/* Account Name */}
                  <div className="p-3 bg-white rounded-xl border border-gray-200">
                    <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">Account Name</span>
                    <p className="text-xs sm:text-sm font-bold text-brand-900 font-mono mt-0.5 break-all">
                      {BANK_DETAILS.accountName}
                    </p>
                  </div>

                  {/* Bank & Branch */}
                  <div className="p-3 bg-white rounded-xl border border-gray-200">
                    <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">Bank & Branch</span>
                    <p className="text-xs sm:text-sm font-bold text-brand-900 mt-0.5">
                      {BANK_DETAILS.bankName} ({BANK_DETAILS.branch})
                    </p>
                  </div>

                  {/* Account Number with Copy */}
                  <div className="p-3.5 bg-brand-900 text-white rounded-xl flex items-center justify-between shadow-sm">
                    <div>
                      <span className="text-[10px] uppercase font-bold text-brand-200 tracking-wider">Account Number</span>
                      <p className="text-base sm:text-lg font-mono font-black tracking-wider text-white mt-0.5">
                        {BANK_DETAILS.accountNumber}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={handleCopyAcc}
                      className="px-3 py-1.5 bg-white/20 hover:bg-white/30 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer text-white shrink-0"
                      title="Copy Account Number"
                    >
                      {copiedAcc ? (
                        <>
                          <Check size={14} className="text-emerald-400" /> Copied!
                        </>
                      ) : (
                        <>
                          <Copy size={14} /> Copy
                        </>
                      )}
                    </button>
                  </div>

                  {/* IFSC Code with Copy */}
                  <div className="p-3.5 bg-slate-900 text-white rounded-xl flex items-center justify-between shadow-sm">
                    <div>
                      <span className="text-[10px] uppercase font-bold text-slate-300 tracking-wider">IFSC Code</span>
                      <p className="text-base sm:text-lg font-mono font-black tracking-wider text-amber-300 mt-0.5">
                        {BANK_DETAILS.ifscCode}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={handleCopyIfsc}
                      className="px-3 py-1.5 bg-white/20 hover:bg-white/30 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer text-white shrink-0"
                      title="Copy IFSC Code"
                    >
                      {copiedIfsc ? (
                        <>
                          <Check size={14} className="text-emerald-400" /> Copied!
                        </>
                      ) : (
                        <>
                          <Copy size={14} /> Copy
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {/* Optional QR Code & UPI Accordion */}
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5 text-xs text-gray-600 font-medium">
                      <Zap size={14} className="text-amber-500" />
                      Paying via UPI apps (PhonePe, GPay, Paytm)?
                    </div>
                    <button
                      type="button"
                      onClick={() => setShowQrCode((prev) => !prev)}
                      className="text-xs text-brand-700 hover:text-brand-900 font-bold underline cursor-pointer"
                    >
                      {showQrCode ? 'Hide UPI QR' : 'Show UPI QR Code'}
                    </button>
                  </div>

                  {showQrCode && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="mt-3 p-4 bg-white rounded-xl border border-gray-200 flex flex-col sm:flex-row items-center gap-4 text-center sm:text-left"
                    >
                      <div className="p-2 bg-white rounded-xl border-2 border-gray-200 shadow-sm shrink-0">
                        <QRCodeSVG value={activeUpiUri} size={130} level="M" />
                      </div>
                      <div className="space-y-1">
                        <p className="text-xs font-bold text-gray-700">Scan to Pay via any UPI App</p>
                        <p className="text-xs font-mono font-bold text-brand-900 break-all">{DEFAULT_CLUB_UPI}</p>
                        <button
                          type="button"
                          onClick={handleCopyUpi}
                          className="mt-2 text-xs font-bold text-brand-600 hover:text-brand-800 inline-flex items-center gap-1 cursor-pointer"
                        >
                          {copiedUpi ? <Check size={13} className="text-emerald-500" /> : <Copy size={13} />}
                          {copiedUpi ? 'UPI Copied' : 'Copy UPI ID'}
                        </button>
                      </div>
                    </motion.div>
                  )}
                </div>
              </div>

              {/* Big High-Visibility "I Have Paid" Button */}
              <div className="pt-2 sm:pt-4 flex flex-col sm:flex-row gap-3 justify-between items-center">
                <button
                  type="button"
                  onClick={() => {
                    setStep(1);
                    scrollToFormTop();
                  }}
                  className="w-full sm:w-auto px-5 py-3 rounded-xl border border-gray-300 text-gray-700 text-xs sm:text-sm font-semibold hover:bg-gray-100 transition-colors cursor-pointer"
                >
                  &larr; Back to Student Details
                </button>

                <button
                  type="button"
                  onClick={handleIHavePaid}
                  className="w-full sm:w-auto px-8 py-4 rounded-xl bg-gradient-to-r from-emerald-600 via-emerald-700 to-teal-800 hover:from-emerald-500 hover:to-teal-700 text-white font-bold text-base shadow-xl shadow-emerald-600/30 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer ring-4 ring-emerald-100"
                >
                  <CheckCircle2 size={20} />
                  I Have Paid &rarr; Enter UTR & Proof
                </button>
              </div>
            </motion.div>
          )}

          {/* ========================================================================= */}
          {/* PHASE 3: PAYMENT VERIFICATION & PROOF SUBMISSION */}
          {/* ========================================================================= */}
          {step === 3 && (
            <motion.form
              key="phase-3"
              initial={{ opacity: 0, x: 16 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -16 }}
              transition={{ duration: 0.25 }}
              onSubmit={handleSubmitVerification}
              className="space-y-5 sm:space-y-6"
            >
              <div>
                <button
                  type="button"
                  onClick={() => {
                    setStep(2);
                    scrollToFormTop();
                  }}
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-gray-500 hover:text-brand-900 mb-2 transition-colors cursor-pointer"
                >
                  <ArrowLeft size={13} /> Back to Bank Details (Phase 2)
                </button>

                <h3 className="text-xl sm:text-2xl md:text-3xl font-display font-bold text-brand-900 tracking-tight">
                  Verify & Submit Proof (Phase 3)
                </h3>
                <p className="text-gray-500 text-xs sm:text-sm mt-0.5">
                  Enter the 12-digit transaction ID / UTR and attach your bank or UPI transfer receipt.
                </p>
              </div>

              {/* Student Summary Strip */}
              <div className="flex items-center gap-3.5 p-3.5 rounded-2xl bg-brand-50/60 border border-brand-100">
                <div className="w-12 h-12 rounded-xl overflow-hidden bg-gray-200 border border-brand-200 shrink-0">
                  {photoPreview ? (
                    <img src={photoPreview} alt="Student avatar" className="w-full h-full object-cover" />
                  ) : (
                    <User className="w-full h-full p-2 text-gray-400" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-bold text-brand-900 truncate">{formData.name}</p>
                    <span className="text-[10px] font-mono font-bold bg-white text-brand-800 px-2 py-0.5 rounded-full border border-brand-200">
                      {formData.rollNo}
                    </span>
                  </div>
                  <p className="text-[11px] text-gray-500 truncate">
                    {selectedYearObj.label} • {formData.branch}
                  </p>
                </div>
                <div className="text-right shrink-0">
                  <span className="text-xs text-gray-400 font-medium block">Amount</span>
                  <span className="text-base font-black text-brand-900">₹{currentAmount}</span>
                </div>
              </div>

              {/* UTR / Transaction ID Input */}
              <div className="p-4 rounded-2xl bg-amber-50/50 border border-amber-200/80 space-y-1.5">
                <label className="block text-xs font-bold text-amber-950 uppercase tracking-wider">
                  UTR / Transaction ID / Ref Number <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <Hash className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={17} />
                  <input
                    type="text"
                    name="utr"
                    required
                    maxLength={22}
                    placeholder="e.g. 428711094821"
                    value={formData.utr}
                    onChange={handleChange}
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-amber-300 bg-white text-brand-900 text-sm font-mono font-bold focus:outline-none focus:ring-2 focus:ring-amber-500 transition-all uppercase"
                  />
                </div>
                <p className="text-[11px] text-amber-800/90 leading-tight">
                  Enter the 12-digit UTR from Canara Bank, NetBanking, GPay, PhonePe, or Paytm receipt.
                </p>
              </div>

              {/* Screenshot Upload Area */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
                  Upload Payment Screenshot <span className="text-rose-500">*</span>
                </label>
                <div className="relative border-2 border-dashed border-gray-300 hover:border-brand-500 rounded-2xl p-4 sm:p-6 text-center bg-gray-50/70 hover:bg-brand-50/20 transition-all cursor-pointer">
                  {screenshotPreview ? (
                    <div className="flex flex-col items-center">
                      <div className="max-h-52 max-w-full rounded-xl overflow-hidden shadow-sm border border-gray-200 mb-3">
                        <img
                          src={screenshotPreview}
                          alt="Payment Receipt Preview"
                          className="max-h-52 w-auto object-contain mx-auto"
                        />
                      </div>
                      <span className="text-xs font-semibold text-emerald-600 flex items-center gap-1">
                        <CheckCircle2 size={14} /> Receipt attached successfully!
                      </span>
                      <p className="text-[10px] text-gray-400 mt-0.5">Click below to change image if needed</p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <div className="w-12 h-12 rounded-full bg-brand-100 text-brand-600 flex items-center justify-center mx-auto">
                        {isCompressingScreenshot ? (
                          <Loader2 size={24} className="animate-spin text-brand-600" />
                        ) : (
                          <Upload size={22} />
                        )}
                      </div>
                      <div>
                        <p className="text-xs sm:text-sm font-bold text-gray-700">
                          Click to upload payment receipt screenshot
                        </p>
                        <p className="text-[11px] text-gray-400 mt-0.5">PNG, JPG, or WEBP up to 10MB</p>
                      </div>
                    </div>
                  )}

                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleScreenshotUpload}
                    className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                  />
                </div>
              </div>

              {/* Admin Verification Notice Box */}
              <div className="p-3.5 rounded-xl bg-slate-900 text-slate-200 text-xs flex items-start gap-3 border border-slate-800">
                <ShieldCheck size={18} className="text-brand-400 shrink-0 mt-0.5" />
                <p className="leading-relaxed">
                  <strong>Verification Notice:</strong> After you submit, the CDD admin team will inspect your payment receipt in the admin portal. Once approved, an official confirmation email containing the <strong>official WhatsApp group link</strong> will be automatically sent to <strong>{formData.email}</strong>.
                </p>
              </div>

              {/* Submit Button */}
              <div className="pt-2 sm:pt-4 flex flex-col sm:flex-row gap-3 justify-between items-center">
                <button
                  type="button"
                  onClick={() => {
                    setStep(2);
                    scrollToFormTop();
                  }}
                  className="w-full sm:w-auto px-5 py-3 rounded-xl border border-gray-300 text-gray-700 text-xs sm:text-sm font-semibold hover:bg-gray-100 transition-colors cursor-pointer"
                >
                  &larr; Back to Bank Details
                </button>

                <button
                  type="submit"
                  disabled={isSubmitting || isCompressingScreenshot}
                  className="btn-primary w-full sm:w-auto px-8 py-3.5 inline-flex items-center justify-center gap-2 text-sm sm:text-base font-bold disabled:opacity-60 cursor-pointer shadow-xl shadow-brand-900/20"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 size={18} className="animate-spin" />
                      Submitting for Admin Verification...
                    </>
                  ) : (
                    <>
                      Submit Registration for Verification
                      <ArrowRight size={18} />
                    </>
                  )}
                </button>
              </div>
            </motion.form>
          )}

          {/* ========================================================================= */}
          {/* PHASE 4: SUBMITTED & PENDING ADMIN VERIFICATION */}
          {/* ========================================================================= */}
          {step === 4 && (
            <motion.div
              key="phase-4"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3 }}
              className="text-center py-4 sm:py-6 space-y-6"
            >
              {/* Badge & Icon */}
              <div className="relative mx-auto w-20 h-20">
                <div className="w-20 h-20 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-inner">
                  <Clock size={40} className="text-amber-600 animate-pulse" />
                </div>
                <div className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full bg-emerald-500 text-white flex items-center justify-center shadow-md">
                  <Check size={18} strokeWidth={3} />
                </div>
              </div>

              <div>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-amber-50 text-amber-800 border border-amber-200">
                  <Clock size={12} /> Pending Admin Verification
                </span>
                <h3 className="text-2xl sm:text-3xl font-display font-extrabold text-brand-900 mt-2">
                  Registration Submitted!
                </h3>
                <p className="text-gray-500 text-xs sm:text-sm mt-1 max-w-md mx-auto">
                  Your application and payment proof have been successfully received and submitted to the admin team.
                </p>
              </div>

              {/* Reference ID Card */}
              <div className="bg-slate-900 text-white rounded-2xl p-5 max-w-md mx-auto shadow-xl text-left border border-slate-800">
                <div className="flex justify-between items-center pb-3 border-b border-slate-800">
                  <span className="text-[10px] uppercase font-bold tracking-widest text-slate-400">Application Pass ID</span>
                  <span className="text-xs font-bold text-amber-400 bg-amber-950/80 px-2 py-0.5 rounded border border-amber-500/30">
                    Under Review
                  </span>
                </div>
                <p className="text-xl sm:text-2xl font-mono font-black tracking-wider text-white mt-2">
                  {registeredData?.regId || sessionData?.sessionId || 'CDD26-PENDING'}
                </p>

                <div className="grid grid-cols-2 gap-2 text-xs text-slate-300 mt-4 pt-3 border-t border-slate-800">
                  <div>
                    <span className="text-[10px] text-slate-500 uppercase block">Student</span>
                    <strong className="text-white">{registeredData?.name || formData.name}</strong>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 uppercase block">Reg ID / Roll No</span>
                    <strong className="text-white font-mono">{registeredData?.rollNo || formData.rollNo}</strong>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 uppercase block">Tier</span>
                    <strong className="text-white">{selectedYearObj.label}</strong>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 uppercase block">UTR Number</span>
                    <strong className="text-emerald-400 font-mono">{registeredData?.utr || formData.utr}</strong>
                  </div>
                </div>
              </div>

              {/* What Happens Next Guidance Box */}
              <div className="p-4 rounded-2xl bg-brand-50 border border-brand-200 text-left max-w-md mx-auto space-y-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-brand-900 flex items-center gap-1.5">
                  <Info size={14} className="text-brand-600" /> What Happens Next?
                </h4>
                <ul className="text-xs text-gray-600 space-y-1.5 list-disc pl-4">
                  <li>The CDD admin will cross-check your 12-digit UTR against the Canara Bank statement.</li>
                  <li>Upon approval, an official confirmation email containing the <strong>official WhatsApp group link</strong> will be sent to <strong>{formData.email}</strong>.</li>
                  <li>You will receive full access to orientation schedules and club project activities.</li>
                </ul>
              </div>

              {/* Action Buttons */}
              <div className="pt-2 flex flex-col sm:flex-row justify-center gap-3">
                <button
                  type="button"
                  onClick={() => {
                    if (typeof window !== 'undefined') {
                      window.location.href = '/';
                    }
                  }}
                  className="px-6 py-3 rounded-xl bg-brand-900 hover:bg-brand-800 text-white text-sm font-bold shadow-md transition-all cursor-pointer"
                >
                  Return to Home
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
