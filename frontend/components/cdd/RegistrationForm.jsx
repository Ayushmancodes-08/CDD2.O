'use client';
import React, { useState, useMemo, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { QRCodeSVG } from 'qrcode.react';
import {
  User, Mail, Phone, Building2, GraduationCap, CheckCircle2,
  Upload, ArrowRight, ArrowLeft, Copy, Check, ShieldCheck,
  Lock, ExternalLink, Loader2, Sparkles, RefreshCw, Smartphone,
  Send, AtSign, Zap, QrCode, MessageSquare, Info, AlertCircle
} from 'lucide-react';
import { toast } from 'sonner';
import { REGISTRATION_BRANCHES, REGISTRATION_YEARS, COLLEGE_NAME } from '@/lib/cdd-constants';
import { compressImage } from '@/lib/image-compressor';
import { generateUPIUri, getAppUpiLinks, validateUPI, DEFAULT_CLUB_UPI, DEFAULT_PAYEE_NAME, DEFAULT_WHATSAPP_GROUP, OFFICIAL_QR_IMAGE } from '@/lib/upi';

const POPULAR_UPI_HANDLES = [
  '@oksbi',
  '@okhdfcbank',
  '@okaxis',
  '@okicici',
  '@ybl',
  '@paytm',
  '@airtel',
  '@apl',
  '@ibl'
];

export default function RegistrationForm({ onSuccess = null, isModal = false }) {
  const [step, setStep] = useState(1); // 1: Details, 2: Payment, 3: Pass/Success
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [copiedUpi, setCopiedUpi] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedRegId, setCopiedRegId] = useState(false);
  const [isMobileDevice, setIsMobileDevice] = useState(false);

  // Payment method tab in Step 2: 'qr' (Scan QR) | 'apps' (1-Tap UPI Apps) | 'request' (Direct UPI ID)
  const [paymentMode, setPaymentMode] = useState('qr');
  const [qrViewType, setQrViewType] = useState('dynamic'); // 'dynamic' | 'official'
  const [studentUpiId, setStudentUpiId] = useState('');
  const [isRequestingUpi, setIsRequestingUpi] = useState(false);
  const [upiCollectResponse, setUpiCollectResponse] = useState(null);
  const [upiPromptTriggered, setUpiPromptTriggered] = useState(false);
  const [isUpiVerified, setIsUpiVerified] = useState(false);
  const [verifiedUpiInfo, setVerifiedUpiInfo] = useState(null);
  const [isUtrHighlighted, setIsUtrHighlighted] = useState(false);
  const utrSectionRef = useRef(null);
  const utrInputRef = useRef(null);

  // Detect device environment
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const isMob = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
      setIsMobileDevice(isMob);
      if (isMob) {
        setPaymentMode('apps');
      } else {
        setPaymentMode('qr');
      }
    }
  }, []);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
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

  // Calculate current fee based on selected year
  const selectedYearObj = useMemo(() => {
    return REGISTRATION_YEARS.find(y => y.id === formData.year) || REGISTRATION_YEARS[0];
  }, [formData.year]);

  const currentAmount = selectedYearObj.amount;

  // Generate UPI URI for Club recipient
  const upiUri = useMemo(() => {
    return generateUPIUri({
      vpa: DEFAULT_CLUB_UPI,
      name: DEFAULT_PAYEE_NAME,
      amount: currentAmount,
      note: `CDD-Reg-${(formData.name || 'Member').trim().replace(/[^a-zA-Z0-9]/g, '').slice(0, 15)}`,
    });
  }, [formData.name, currentAmount]);

  // App-specific deep links
  const appLinks = useMemo(() => {
    return getAppUpiLinks({
      vpa: DEFAULT_CLUB_UPI,
      name: DEFAULT_PAYEE_NAME,
      amount: currentAmount,
      note: `CDD-Reg-${(formData.name || 'Member').trim().replace(/[^a-zA-Z0-9]/g, '').slice(0, 15)}`,
    });
  }, [formData.name, currentAmount]);

  // Direct WhatsApp payment link (ideal when on laptop/desktop)
  const waPaymentLink = useMemo(() => {
    const cleanPhone = formData.phone.replace(/[^0-9]/g, '');
    const targetPhone = cleanPhone.length === 10 ? `91${cleanPhone}` : cleanPhone;
    const msg = `Hi ${formData.name || 'Student'}! Here is your official IIC PMEC Membership registration payment link for ₹${currentAmount}:\n\n${upiUri}\n\nTap the link above on your phone to open Google Pay / PhonePe / Paytm directly!`;
    return `https://wa.me/${targetPhone || '91'}?text=${encodeURIComponent(msg)}`;
  }, [formData.name, formData.phone, currentAmount, upiUri]);

  // Handle Text/Select Changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Real-time live client-side validation of typed UPI ID
  const liveUpiStatus = useMemo(() => {
    if (!studentUpiId.trim()) return null;
    return validateUPI(studentUpiId);
  }, [studentUpiId]);

  // Handle Quick UPI Handle Selection
  const handleAppendHandle = (handle) => {
    if (!studentUpiId) {
      const base = formData.phone ? formData.phone.replace(/[^0-9]/g, '').slice(-10) : 'member';
      setStudentUpiId(`${base}${handle}`);
      return;
    }
    const parts = studentUpiId.split('@');
    setStudentUpiId(`${parts[0]}${handle}`);
  };

  // Handle Triggering Direct UPI Verification & Payment Pipeline
  const handleTriggerUpiRequest = async () => {
    const cleanVpa = studentUpiId.trim().toLowerCase();
    const clientCheck = validateUPI(cleanVpa);
    if (!clientCheck.isValid) {
      toast.error(clientCheck.reason || 'Please enter a valid UPI ID (e.g. 9876543210@paytm or yourname@oksbi)');
      return;
    }

    setIsRequestingUpi(true);
    try {
      const res = await fetch('/api/upi-collect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          vpa: cleanVpa,
          amount: currentAmount,
          name: formData.name,
          phone: formData.phone,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setUpiCollectResponse(data);
        setUpiPromptTriggered(true);
        setIsUpiVerified(true);
        setVerifiedUpiInfo(data);

        if (data.customerName) {
          toast.success(`Verified: ${data.customerName} (${data.bankName})!`);
        } else {
          toast.success(`UPI ID Verified on ${data.bankName}! Complete payment to register.`);
        }

        if (isMobileDevice) {
          // Open UPI app directly on phone
          window.location.href = data.intentUrl || appLinks.generic;
        }
      } else {
        setIsUpiVerified(false);
        setVerifiedUpiInfo(null);
        toast.error(data.error || 'Failed to verify UPI ID. Please check the address.');
      }
    } catch (err) {
      toast.error('Network error contacting verification service.');
    } finally {
      setIsRequestingUpi(false);
    }
  };

  // Move user smoothly to Registration finalization (UTR & Proof upload)
  const handleMoveToRegister = () => {
    toast.success('UPI verified! Please enter your 12-digit UTR from your payment receipt to complete registration.');
    if (utrSectionRef.current) {
      utrSectionRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
      setIsUtrHighlighted(true);
      setTimeout(() => {
        utrInputRef.current?.focus();
      }, 500);
      setTimeout(() => {
        setIsUtrHighlighted(false);
      }, 3500);
    }
  };

  // Copy Payment Link
  const handleCopyPaymentLink = () => {
    navigator.clipboard.writeText(upiUri);
    setCopiedLink(true);
    toast.success('UPI Payment link copied!');
    setTimeout(() => setCopiedLink(false), 2500);
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
      setFormData(prev => ({ ...prev, photo: compressed }));
      toast.success('Photo uploaded and optimized!');
    } catch (err) {
      toast.error('Could not process photo. Please select another image.');
    } finally {
      setIsCompressingPhoto(false);
    }
  };

  // Handle Payment Screenshot Upload
  const handleScreenshotUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Please upload a screenshot image.');
      return;
    }

    setIsCompressingScreenshot(true);
    try {
      const compressed = await compressImage(file, 1200, 1200, 0.82);
      setScreenshotPreview(compressed);
      setFormData(prev => ({ ...prev, paymentScreenshot: compressed }));
      toast.success('Payment proof uploaded!');
    } catch (err) {
      toast.error('Could not process screenshot.');
    } finally {
      setIsCompressingScreenshot(false);
    }
  };

  // Copy UPI VPA to clipboard
  const handleCopyUPI = () => {
    navigator.clipboard.writeText(DEFAULT_CLUB_UPI);
    setCopiedUpi(true);
    toast.success('UPI ID copied to clipboard!');
    setTimeout(() => setCopiedUpi(false), 2500);
  };

  // Step 1 Validation
  const validateStep1 = () => {
    if (!formData.name.trim() || formData.name.trim().length < 2) {
      toast.error('Please enter your full name.');
      return false;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email.trim() || !emailRegex.test(formData.email.trim())) {
      toast.error('Please enter a valid email address.');
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
    return true;
  };

  const handleNextToPayment = (e) => {
    e.preventDefault();
    if (validateStep1()) {
      setStep(2);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // Final Submit
  const handleSubmit = async (e) => {
    e.preventDefault();

    const cleanUtr = formData.utr.replace(/[^a-zA-Z0-9]/g, '').trim();
    if (!cleanUtr || cleanUtr.length < 10 || cleanUtr.length > 20) {
      toast.error('Please enter a valid 12-digit UPI Reference Number / UTR.');
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
          year: formData.year,
          branch: formData.branch,
          college: formData.college,
          email: formData.email.trim(),
          phone: formData.phone.trim(),
          photo: formData.photo,
          amount: currentAmount,
          utr: cleanUtr,
          paymentScreenshot: formData.paymentScreenshot,
          payingUpi: studentUpiId.trim() || null,
        }),
      });

      const data = await res.json();

      if (data.success) {
        setRegisteredData(data.registration);
        setStep(3);
        toast.success('Registration completed successfully! Welcome to IIC PMEC.');
        if (onSuccess) onSuccess(data.registration);
      } else {
        toast.error(data.error || 'Failed to submit registration. Please check your details.');
      }
    } catch (err) {
      toast.error('Network connection error. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={`w-full ${isModal ? 'p-0 sm:p-1' : 'max-w-3xl mx-auto'}`}>
      {/* Stepper Progress Bar */}
      <div className="mb-6 sm:mb-8">
        <div className="flex items-center justify-between relative px-2">
          <div className="absolute left-0 top-1/2 -translate-y-1/2 h-0.5 bg-gray-200 w-full z-0" />
          <div
            className="absolute left-0 top-1/2 -translate-y-1/2 h-0.5 bg-brand-500 transition-all duration-500 z-0"
            style={{ width: step === 1 ? '0%' : step === 2 ? '50%' : '100%' }}
          />

          {[
            { num: 1, label: 'Student Info', short: 'Info' },
            { num: 2, label: 'UPI Payment', short: 'Payment' },
            { num: 3, label: 'Official Pass', short: 'Pass' },
          ].map((s) => {
            const isCompleted = step > s.num;
            const isCurrent = step === s.num;
            return (
              <div key={s.num} className="relative z-10 flex flex-col items-center">
                <div
                  className={`w-8 h-8 sm:w-9 sm:h-9 rounded-full flex items-center justify-center font-bold text-xs transition-all duration-300 shadow-sm
                  ${
                    isCompleted
                      ? 'bg-brand-500 text-white shadow-brand-500/20'
                      : isCurrent
                      ? 'bg-brand-900 text-white ring-4 ring-brand-100'
                      : 'bg-white text-gray-400 border border-gray-200'
                  }`}
                >
                  {isCompleted ? <Check size={15} strokeWidth={2.5} /> : s.num}
                </div>
                <span
                  className={`text-[10px] sm:text-[11px] font-semibold mt-1.5 sm:mt-2 tracking-wider uppercase ${
                    isCurrent ? 'text-brand-900' : 'text-gray-400'
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

      {/* Form Container with Responsive Mobile & Tablet Glassmorphism */}
      <div className="bg-white/95 backdrop-blur-xl border border-gray-100/90 rounded-2xl sm:rounded-3xl shadow-ambient p-4 sm:p-6 md:p-8 lg:p-10 relative overflow-hidden">
        
        {/* Glow ambient decoration */}
        <div className="absolute -top-24 -right-24 w-56 h-56 bg-brand-400/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-56 h-56 bg-emerald-400/10 rounded-full blur-3xl pointer-events-none" />

        <AnimatePresence mode="wait">
          {/* ================= STEP 1: STUDENT DETAILS ================= */}
          {step === 1 && (
            <motion.form
              key="step-1"
              initial={{ opacity: 0, x: -16 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 16 }}
              transition={{ duration: 0.25 }}
              onSubmit={handleNextToPayment}
              className="space-y-5 sm:space-y-6"
            >
              <div>
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-brand-50 text-brand-700 border border-brand-200/60">
                    <Sparkles size={11} className="text-brand-500" />
                    Recruitment 2026-27
                  </span>
                </div>
                <h3 className="text-xl sm:text-2xl md:text-3xl font-display font-bold text-brand-900 tracking-tight">
                  Student Registration
                </h3>
                <p className="text-gray-500 text-xs sm:text-sm mt-0.5">
                  Fill in your academic profile to join PMEC&apos;s premier innovation cell.
                </p>
              </div>

              {/* Photo Upload & Name row */}
              <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 sm:gap-6 p-3.5 sm:p-4 rounded-2xl bg-gray-50/80 border border-gray-100">
                <div className="relative group shrink-0">
                  <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl overflow-hidden bg-gray-200/70 border-2 border-dashed border-gray-300 flex items-center justify-center relative">
                    {photoPreview ? (
                      <img src={photoPreview} alt="Student avatar" className="w-full h-full object-cover" />
                    ) : (
                      <div className="flex flex-col items-center justify-center text-gray-400 p-2 text-center">
                        {isCompressingPhoto ? (
                          <Loader2 size={22} className="animate-spin text-brand-500" />
                        ) : (
                          <>
                            <User size={24} className="mb-1 text-gray-400" />
                            <span className="text-[10px] font-medium">Add Photo</span>
                          </>
                        )}
                      </div>
                    )}
                  </div>
                  <label
                    htmlFor="student-photo-input"
                    className="absolute -bottom-2 -right-2 bg-brand-900 hover:bg-brand-800 text-white p-2 rounded-xl shadow-md cursor-pointer transition-all hover:scale-105 active:scale-95"
                    title="Upload Photo"
                  >
                    <Upload size={13} />
                    <input
                      id="student-photo-input"
                      type="file"
                      accept="image/*"
                      onChange={handlePhotoUpload}
                      className="sr-only"
                    />
                  </label>
                </div>

                <div className="w-full space-y-1">
                  <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider">
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
                      className="w-full pl-10 pr-4 py-2.5 sm:py-3 rounded-xl border border-gray-200 bg-white text-brand-900 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-all"
                    />
                  </div>
                  <p className="text-[10px] sm:text-[11px] text-gray-400">Clear headshot for your official member pass.</p>
                </div>
              </div>

              {/* Year Selection (Radio Cards with dynamic fees) */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-2">
                  Select Year of Study <span className="text-rose-500">*</span>
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 sm:gap-3">
                  {REGISTRATION_YEARS.map((y) => {
                    const isSelected = formData.year === y.id;
                    return (
                      <label
                        key={y.id}
                        className={`relative flex flex-col p-3.5 sm:p-4 rounded-2xl border-2 cursor-pointer transition-all duration-200 ${
                          isSelected
                            ? 'border-brand-500 bg-brand-50/50 shadow-sm shadow-brand-500/10'
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
                        <div className="flex justify-between items-start mb-1.5">
                          <span className="font-display font-bold text-brand-900 text-sm sm:text-base">{y.label}</span>
                          <span
                            className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                              isSelected ? 'border-brand-500 bg-brand-500' : 'border-gray-300'
                            }`}
                          >
                            {isSelected && <span className="w-1.5 h-1.5 rounded-full bg-white" />}
                          </span>
                        </div>
                        <div className="mt-auto">
                          <p className="text-base sm:text-lg font-bold text-brand-900">
                            ₹{y.amount}
                            <span className="text-[11px] text-gray-500 font-normal ml-1">({y.duration})</span>
                          </p>
                          <p className="text-[10px] sm:text-[11px] text-emerald-600 font-semibold">{y.perYear}</p>
                        </div>
                      </label>
                    );
                  })}
                </div>
              </div>

              {/* Branch Selection Dropdown */}
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
                    className="w-full pl-10 pr-10 py-2.5 sm:py-3 rounded-xl border border-gray-200 bg-white text-brand-900 text-sm appearance-none focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-all cursor-pointer"
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

              {/* College (Locked / Immutable) */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    College / Institution
                  </label>
                  <span className="inline-flex items-center gap-1 text-[10px] text-gray-400">
                    <Lock size={10} /> Immutable
                  </span>
                </div>
                <div className="relative">
                  <Building2 className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={17} />
                  <input
                    type="text"
                    value={formData.college}
                    readOnly
                    tabIndex={-1}
                    aria-readonly="true"
                    className="w-full pl-10 pr-10 py-2.5 sm:py-3 rounded-xl border border-gray-200 bg-gray-100/80 text-gray-700 text-xs sm:text-sm font-medium cursor-not-allowed select-none focus:outline-none"
                  />
                  <div className="absolute right-3.5 top-1/2 -translate-y-1/2">
                    <ShieldCheck size={17} className="text-emerald-500" />
                  </div>
                </div>
              </div>

              {/* Email and Phone */}
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
                      className="w-full pl-10 pr-4 py-2.5 sm:py-3 rounded-xl border border-gray-200 bg-white text-brand-900 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
                    WhatsApp Phone Number <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={17} />
                    <input
                      type="tel"
                      name="phone"
                      required
                      maxLength={14}
                      placeholder="10-digit number"
                      value={formData.phone}
                      onChange={handleChange}
                      className="w-full pl-10 pr-4 py-2.5 sm:py-3 rounded-xl border border-gray-200 bg-white text-brand-900 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-all"
                    />
                  </div>
                </div>
              </div>

              {/* Button Row */}
              <div className="pt-2 sm:pt-4 flex justify-end">
                <button
                  type="submit"
                  className="btn-primary group w-full sm:w-auto inline-flex items-center justify-center gap-2 text-sm sm:text-base px-6 sm:px-8 py-3 sm:py-3.5"
                >
                  Proceed to Payment (₹{currentAmount})
                  <ArrowRight size={17} className="group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
            </motion.form>
          )}

          {/* ================= STEP 2: UPI PAYMENT & DIRECT REQUEST ================= */}
          {step === 2 && (
            <motion.form
              key="step-2"
              initial={{ opacity: 0, x: 16 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -16 }}
              transition={{ duration: 0.25 }}
              onSubmit={handleSubmit}
              className="space-y-5 sm:space-y-6"
            >
              <div>
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-gray-500 hover:text-brand-900 mb-2 transition-colors"
                >
                  <ArrowLeft size={13} /> Back to details
                </button>
                <h3 className="text-xl sm:text-2xl md:text-3xl font-display font-bold text-brand-900 tracking-tight">
                  Dynamic UPI Payment
                </h3>
                <p className="text-gray-500 text-xs sm:text-sm mt-0.5">
                  Send payment prompt to your UPI ID or scan the dynamic QR code with any UPI app.
                </p>
              </div>

              {/* Payment Summary Box */}
              <div className="bg-gradient-to-br from-brand-900 to-slate-900 text-white rounded-2xl p-4 sm:p-5 shadow-ambient relative overflow-hidden">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 relative z-10">
                  <div>
                    <span className="text-[11px] uppercase tracking-wider text-brand-300 font-semibold">
                      Membership Tier ({selectedYearObj.label})
                    </span>
                    <h4 className="text-2xl sm:text-3xl font-display font-extrabold text-white mt-0.5">
                      ₹{currentAmount}
                    </h4>
                    <p className="text-[11px] text-brand-200/80 mt-0.5">
                      {selectedYearObj.duration} active membership at ₹75 per academic year
                    </p>
                  </div>

                  <div className="flex items-center gap-2 bg-white/10 backdrop-blur-md px-3 py-1.5 sm:py-2 rounded-xl border border-white/15 w-full sm:w-auto justify-between sm:justify-start">
                    <div className="text-left">
                      <p className="text-[9px] uppercase text-brand-200 font-medium">Official Payee: {DEFAULT_PAYEE_NAME}</p>
                      <p className="text-xs font-mono font-bold text-white break-all">{DEFAULT_CLUB_UPI}</p>
                    </div>
                    <button
                      type="button"
                      onClick={handleCopyUPI}
                      className="p-1.5 hover:bg-white/20 rounded-lg transition-colors text-white shrink-0"
                      title="Copy UPI ID"
                    >
                      {copiedUpi ? <Check size={15} className="text-emerald-400" /> : <Copy size={15} />}
                    </button>
                  </div>
                </div>
              </div>

              {/* PAYMENT METHOD SELECTOR TABS */}
              <div className="grid grid-cols-3 gap-1.5 sm:gap-2 p-1 bg-gray-100/90 rounded-xl">
                <button
                  type="button"
                  onClick={() => setPaymentMode('qr')}
                  className={`flex items-center justify-center gap-1.5 py-2.5 px-2 rounded-lg text-xs font-bold transition-all ${
                    paymentMode === 'qr'
                      ? 'bg-white text-brand-900 shadow-sm'
                      : 'text-gray-500 hover:text-brand-900'
                  }`}
                >
                  <QrCode size={14} className={paymentMode === 'qr' ? 'text-brand-500' : ''} />
                  <span>Scan QR</span>
                </button>
                <button
                  type="button"
                  onClick={() => setPaymentMode('apps')}
                  className={`flex items-center justify-center gap-1.5 py-2.5 px-2 rounded-lg text-xs font-bold transition-all ${
                    paymentMode === 'apps'
                      ? 'bg-white text-brand-900 shadow-sm'
                      : 'text-gray-500 hover:text-brand-900'
                  }`}
                >
                  <Smartphone size={14} className={paymentMode === 'apps' ? 'text-brand-500' : ''} />
                  <span>1-Tap Apps</span>
                </button>
                <button
                  type="button"
                  onClick={() => setPaymentMode('request')}
                  className={`flex items-center justify-center gap-1.5 py-2.5 px-2 rounded-lg text-xs font-bold transition-all ${
                    paymentMode === 'request'
                      ? 'bg-white text-brand-900 shadow-sm'
                      : 'text-gray-500 hover:text-brand-900'
                  }`}
                >
                  <Zap size={14} className={paymentMode === 'request' ? 'text-brand-500' : ''} />
                  <span>UPI ID</span>
                </button>
              </div>

              {/* TAB 1: DYNAMIC & OFFICIAL QR CODE */}
              {paymentMode === 'qr' && (
                <div className="flex flex-col items-center text-center p-4 sm:p-6 bg-gray-50/90 rounded-2xl border border-gray-100 space-y-4">
                  {/* QR Mode Switcher */}
                  <div className="inline-flex p-1 bg-gray-200/70 rounded-xl text-xs font-semibold">
                    <button
                      type="button"
                      onClick={() => setQrViewType('dynamic')}
                      className={`px-3 py-1.5 rounded-lg transition-all ${
                        qrViewType === 'dynamic'
                          ? 'bg-white text-brand-900 shadow-xs'
                          : 'text-gray-600 hover:text-brand-900'
                      }`}
                    >
                      Pre-filled QR (₹{currentAmount})
                    </button>
                    <button
                      type="button"
                      onClick={() => setQrViewType('official')}
                      className={`px-3 py-1.5 rounded-lg transition-all ${
                        qrViewType === 'official'
                          ? 'bg-white text-brand-900 shadow-xs'
                          : 'text-gray-600 hover:text-brand-900'
                      }`}
                    >
                      Official Airtel QR
                    </button>
                  </div>

                  {/* QR Presentation */}
                  {qrViewType === 'dynamic' ? (
                    <div className="p-3.5 bg-white rounded-2xl border border-gray-100 shadow-sm">
                      <QRCodeSVG
                        value={upiUri}
                        size={190}
                        level="M"
                        includeMargin={true}
                      />
                    </div>
                  ) : (
                    <div className="p-2 bg-white rounded-2xl border border-gray-100 shadow-sm max-w-[240px] overflow-hidden">
                      <img
                        src={OFFICIAL_QR_IMAGE}
                        alt="Official Airtel UPI QR Code - Ayushman Patra"
                        className="w-full h-auto object-contain rounded-xl"
                      />
                    </div>
                  )}

                  {/* Payee Details Badge Box */}
                  <div className="w-full max-w-sm p-3 bg-white rounded-xl border border-gray-200/80 shadow-2xs space-y-1.5">
                    <div className="flex items-center justify-between">
                      <div className="text-left">
                        <p className="text-[10px] uppercase font-bold text-gray-400">Official Recipient</p>
                        <p className="text-xs font-bold text-brand-900">{DEFAULT_PAYEE_NAME}</p>
                      </div>
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-rose-50 text-rose-600 border border-rose-200">
                        Airtel UPI
                      </span>
                    </div>

                    <div className="flex items-center justify-between pt-1 border-t border-gray-100">
                      <div className="text-left">
                        <p className="text-[10px] uppercase font-bold text-gray-400">UPI ID (VPA)</p>
                        <p className="text-xs font-mono font-bold text-brand-950">{DEFAULT_CLUB_UPI}</p>
                      </div>
                      <button
                        type="button"
                        onClick={handleCopyUPI}
                        className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-semibold bg-brand-50 hover:bg-brand-100 text-brand-800 transition-colors cursor-pointer"
                      >
                        {copiedUpi ? <Check size={13} className="text-emerald-600" /> : <Copy size={13} />}
                        <span>{copiedUpi ? 'Copied' : 'Copy'}</span>
                      </button>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center justify-center gap-2">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-semibold border border-emerald-200">
                      <CheckCircle2 size={13} /> Amount: ₹{currentAmount}
                    </span>
                    <span className="text-xs text-gray-500">
                      Accepted on GPay, PhonePe, Paytm, BHIM & all banks
                    </span>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-col sm:flex-row gap-2 pt-1 w-full max-w-sm">
                    <a
                      href={waPaymentLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-colors shadow-xs"
                    >
                      <MessageSquare size={14} />
                      Send Link to WhatsApp
                    </a>
                    <button
                      type="button"
                      onClick={handleCopyPaymentLink}
                      className="inline-flex items-center justify-center gap-1.5 px-3 py-2 bg-white hover:bg-gray-100 border border-gray-200 text-gray-700 rounded-xl text-xs font-semibold transition-colors shadow-2xs"
                    >
                      {copiedLink ? <Check size={14} className="text-emerald-600" /> : <Copy size={14} />}
                      Copy Link
                    </button>
                  </div>
                </div>
              )}

              {/* TAB 2: 1-TAP MOBILE UPI APPS */}
              {paymentMode === 'apps' && (
                <div className="space-y-3.5 p-4 sm:p-5 rounded-2xl bg-brand-50/50 border border-brand-100">
                  <div>
                    <h4 className="text-xs font-bold text-brand-950 uppercase tracking-wider mb-1">
                      Direct App Payment (Mobile Optimized)
                    </h4>
                    <p className="text-[11px] text-gray-500">
                      Tap any app below to open it instantly with ₹{currentAmount} and recipient pre-filled:
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    <a
                      href={appLinks.gpay}
                      className="flex items-center justify-between p-3.5 rounded-xl bg-white border border-gray-200 hover:border-blue-400 hover:shadow-sm transition-all group"
                    >
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-xs">
                          G
                        </div>
                        <div className="text-left">
                          <p className="text-xs font-bold text-gray-900 group-hover:text-blue-600">Google Pay</p>
                          <p className="text-[10px] text-gray-400">Pay ₹{currentAmount} via GPay</p>
                        </div>
                      </div>
                      <ExternalLink size={14} className="text-gray-400 group-hover:text-blue-600" />
                    </a>

                    <a
                      href={appLinks.phonepe}
                      className="flex items-center justify-between p-3.5 rounded-xl bg-white border border-gray-200 hover:border-purple-400 hover:shadow-sm transition-all group"
                    >
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center font-bold text-xs">
                          P
                        </div>
                        <div className="text-left">
                          <p className="text-xs font-bold text-gray-900 group-hover:text-purple-600">PhonePe</p>
                          <p className="text-[10px] text-gray-400">Pay ₹{currentAmount} via PhonePe</p>
                        </div>
                      </div>
                      <ExternalLink size={14} className="text-gray-400 group-hover:text-purple-600" />
                    </a>

                    <a
                      href={appLinks.paytm}
                      className="flex items-center justify-between p-3.5 rounded-xl bg-white border border-gray-200 hover:border-cyan-400 hover:shadow-sm transition-all group"
                    >
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-lg bg-cyan-50 text-cyan-600 flex items-center justify-center font-bold text-xs">
                          PT
                        </div>
                        <div className="text-left">
                          <p className="text-xs font-bold text-gray-900 group-hover:text-cyan-600">Paytm UPI</p>
                          <p className="text-[10px] text-gray-400">Pay ₹{currentAmount} via Paytm</p>
                        </div>
                      </div>
                      <ExternalLink size={14} className="text-gray-400 group-hover:text-cyan-600" />
                    </a>

                    <a
                      href={appLinks.generic}
                      className="flex items-center justify-between p-3.5 rounded-xl bg-white border border-gray-200 hover:border-emerald-400 hover:shadow-sm transition-all group"
                    >
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold text-xs">
                          UPI
                        </div>
                        <div className="text-left">
                          <p className="text-xs font-bold text-gray-900 group-hover:text-emerald-600">BHIM / Any UPI App</p>
                          <p className="text-[10px] text-gray-400">Open system app selector</p>
                        </div>
                      </div>
                      <ExternalLink size={14} className="text-gray-400 group-hover:text-emerald-600" />
                    </a>
                  </div>

                  <p className="text-[11px] text-gray-400 text-center">
                    Note: App buttons open natively on mobile phones. On laptop/desktop, please use the <strong>Scan QR</strong> tab.
                  </p>
                </div>
              )}

              {/* TAB 3: DIRECT UPI ID COLLECT / REQUEST & VERIFICATION */}
              {paymentMode === 'request' && (
                <div className="space-y-4 p-4 sm:p-5 rounded-2xl bg-brand-50/50 border border-brand-100">
                  <div>
                    <label className="block text-xs font-semibold text-brand-950 uppercase tracking-wider mb-1">
                      Enter Your UPI ID (VPA)
                    </label>
                    <p className="text-[11px] text-gray-500 mb-2.5">
                      Enter your UPI address to detect bank and pay ₹{currentAmount}:
                    </p>
                    <div className="relative">
                      <AtSign className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={17} />
                      <input
                        type="text"
                        placeholder="e.g. 9876543210@paytm or yourname@oksbi"
                        value={studentUpiId}
                        onChange={(e) => {
                          setStudentUpiId(e.target.value);
                          if (isUpiVerified) setIsUpiVerified(false);
                        }}
                        className="w-full pl-10 pr-4 py-2.5 sm:py-3 rounded-xl border border-brand-200 bg-white text-brand-900 text-xs sm:text-sm font-mono focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-all"
                      />
                    </div>

                    {/* Live Detection Indicator */}
                    <div className="mt-2 min-h-[22px] flex items-center">
                      {liveUpiStatus ? (
                        liveUpiStatus.isValid ? (
                          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                            <CheckCircle2 size={12} className="text-emerald-600" />
                            <span>Detected: {liveUpiStatus.bankName}</span>
                          </div>
                        ) : (
                          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-[11px] font-medium bg-amber-50 text-amber-800 border border-amber-200">
                            <Info size={12} className="text-amber-600" />
                            <span>{liveUpiStatus.reason}</span>
                          </div>
                        )
                      ) : (
                        <p className="text-[10px] sm:text-[11px] text-gray-400">
                          Format: mobile@bank or username@bank (e.g. 8480496340@airtel)
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Quick Handle Chips */}
                  <div>
                    <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider block mb-1.5">
                      Quick Bank Handle Shortcuts:
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {POPULAR_UPI_HANDLES.map((h) => (
                        <button
                          key={h}
                          type="button"
                          onClick={() => handleAppendHandle(h)}
                          className="px-2.5 py-1 bg-white hover:bg-brand-100/70 border border-brand-200/80 rounded-lg text-[11px] font-mono font-medium text-brand-800 transition-colors shadow-2xs cursor-pointer"
                        >
                          {h}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Verify or Payment Actions */}
                  {!isUpiVerified ? (
                    <button
                      type="button"
                      onClick={handleTriggerUpiRequest}
                      disabled={isRequestingUpi}
                      className="w-full py-3 bg-brand-900 hover:bg-brand-800 active:scale-[0.99] text-white rounded-xl text-xs sm:text-sm font-bold shadow-md shadow-brand-900/10 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
                    >
                      {isRequestingUpi ? (
                        <>
                          <Loader2 size={15} className="animate-spin" />
                          Checking & Verifying UPI ID...
                        </>
                      ) : (
                        <>
                          <ShieldCheck size={16} className="text-emerald-400" />
                          Check UPI & Initiate Payment (₹{currentAmount})
                        </>
                      )}
                    </button>
                  ) : (
                    /* VERIFIED CARD WITH MOVE TO REGISTER BUTTON */
                    <div className="p-4 sm:p-5 bg-gradient-to-br from-emerald-50 to-teal-50/50 border-2 border-emerald-300/80 rounded-2xl space-y-4 shadow-sm">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-xs">
                            <Check size={18} strokeWidth={3} />
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-bold text-emerald-950 font-mono break-all">
                                {verifiedUpiInfo?.vpa || studentUpiId}
                              </span>
                              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-200/60 text-emerald-800">
                                Verified
                              </span>
                            </div>
                            <p className="text-[11px] text-emerald-700 font-medium mt-0.5">
                              {verifiedUpiInfo?.customerName
                                ? `${verifiedUpiInfo.customerName} • `
                                : ''}
                              {verifiedUpiInfo?.bankName || 'Verified Bank Account'}
                            </p>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => setIsUpiVerified(false)}
                          className="text-xs font-medium text-emerald-800 hover:underline cursor-pointer"
                        >
                          Change
                        </button>
                      </div>

                      {/* Payee destination reminder */}
                      <div className="p-2.5 bg-white/90 rounded-xl border border-emerald-100 flex items-center justify-between text-xs">
                        <span className="text-gray-500">Official Club Payee:</span>
                        <span className="font-bold text-brand-950">{DEFAULT_PAYEE_NAME} ({DEFAULT_CLUB_UPI})</span>
                      </div>

                      {/* Payment Trigger Options */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {isMobileDevice ? (
                          <a
                            href={verifiedUpiInfo?.intentUrl || appLinks.generic}
                            className="w-full py-2.5 px-3 bg-brand-900 hover:bg-brand-800 text-white rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 shadow-xs"
                          >
                            <Smartphone size={14} />
                            Open in UPI App to Pay ₹{currentAmount}
                          </a>
                        ) : (
                          <a
                            href={waPaymentLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="w-full py-2.5 px-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 shadow-xs"
                          >
                            <MessageSquare size={14} />
                            Send Link to WhatsApp
                          </a>
                        )}

                        <button
                          type="button"
                          onClick={handleCopyPaymentLink}
                          className="w-full py-2.5 px-3 bg-white hover:bg-gray-50 border border-emerald-200 text-emerald-900 rounded-xl text-xs font-semibold transition-all flex items-center justify-center gap-1.5"
                        >
                          {copiedLink ? <Check size={14} className="text-emerald-600" /> : <Copy size={14} />}
                          Copy Payment Link
                        </button>
                      </div>

                      {/* Instant QR Code Box for Desktop Users */}
                      {!isMobileDevice && (
                        <div className="p-3 bg-white rounded-xl border border-emerald-100 flex flex-col items-center text-center space-y-2">
                          <p className="text-[11px] font-semibold text-gray-600">
                            Scan with Google Pay, PhonePe, or Paytm on your phone:
                          </p>
                          <div className="p-2 bg-white rounded-lg border border-gray-100 shadow-2xs">
                            <QRCodeSVG value={upiUri} size={130} level="M" includeMargin={true} />
                          </div>
                          <span className="text-[10px] text-gray-400">Pre-filled with ₹{currentAmount}</span>
                        </div>
                      )}

                      {/* PRIMARY CALL TO ACTION: MOVE TO REGISTER */}
                      <button
                        type="button"
                        onClick={handleMoveToRegister}
                        className="w-full py-3.5 px-4 bg-emerald-600 hover:bg-emerald-700 active:scale-[0.99] text-white rounded-xl text-xs sm:text-sm font-extrabold shadow-lg shadow-emerald-600/25 flex items-center justify-center gap-2 transition-all cursor-pointer"
                      >
                        <span>I Have Completed Payment ➔ Move to Register</span>
                        <ArrowRight size={16} />
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* UTR Input & Screenshot Upload */}
              <div
                ref={utrSectionRef}
                className={`space-y-4 pt-1 transition-all duration-500 rounded-2xl ${
                  isUtrHighlighted ? 'p-3 sm:p-4 ring-4 ring-emerald-500 bg-emerald-50/50 shadow-lg' : ''
                }`}
              >
                {isUtrHighlighted && (
                  <div className="p-2.5 bg-emerald-100 border border-emerald-200 rounded-xl text-xs font-bold text-emerald-900 flex items-center gap-2">
                    <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
                    <span>UPI Verified! Please enter your 12-digit UTR number and attach payment screenshot below:</span>
                  </div>
                )}

                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      12-Digit UPI Reference No / UTR <span className="text-rose-500">*</span>
                    </label>
                    <span className="text-[10px] sm:text-[11px] text-brand-600 font-medium">Found in payment receipt</span>
                  </div>
                  <input
                    ref={utrInputRef}
                    type="text"
                    name="utr"
                    required
                    maxLength={18}
                    placeholder="e.g. 426491029481"
                    value={formData.utr}
                    onChange={(e) => setFormData(prev => ({ ...prev, utr: e.target.value }))}
                    className="w-full px-4 py-2.5 sm:py-3 rounded-xl border border-gray-200 bg-white font-mono text-brand-900 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-all tracking-wider"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                    Upload Payment Screenshot <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative border-2 border-dashed border-gray-300 hover:border-brand-400 rounded-2xl p-3 sm:p-4 transition-colors bg-white flex flex-col items-center justify-center text-center">
                    {screenshotPreview ? (
                      <div className="flex flex-col items-center gap-2">
                        <img
                          src={screenshotPreview}
                          alt="Payment screenshot preview"
                          className="max-h-44 rounded-xl object-contain border border-gray-200 shadow-sm"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            setScreenshotPreview(null);
                            setFormData(prev => ({ ...prev, paymentScreenshot: '' }));
                          }}
                          className="text-xs text-rose-500 hover:underline flex items-center gap-1 mt-1"
                        >
                          <RefreshCw size={12} /> Replace Screenshot
                        </button>
                      </div>
                    ) : (
                      <label htmlFor="screenshot-input" className="cursor-pointer flex flex-col items-center p-3 sm:p-4">
                        {isCompressingScreenshot ? (
                          <Loader2 size={28} className="animate-spin text-brand-500 mb-1.5" />
                        ) : (
                          <>
                            <Upload size={28} className="text-brand-500 mb-1.5" />
                            <p className="text-xs sm:text-sm font-semibold text-brand-900">Upload payment screenshot</p>
                            <p className="text-[10px] sm:text-xs text-gray-400 mt-0.5">PNG, JPG, or WEBP (Showing UTR & Amount)</p>
                          </>
                        )}
                        <input
                          id="screenshot-input"
                          type="file"
                          accept="image/*"
                          onChange={handleScreenshotUpload}
                          className="sr-only"
                        />
                      </label>
                    )}
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <div className="pt-2 sm:pt-4 flex flex-col sm:flex-row items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  disabled={isSubmitting}
                  className="w-full sm:w-auto px-5 py-2.5 sm:py-3 rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-50 text-xs sm:text-sm font-semibold transition-colors order-2 sm:order-1"
                >
                  Back
                </button>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="btn-primary group w-full sm:w-auto inline-flex items-center justify-center gap-2 text-sm sm:text-base px-6 sm:px-8 py-3 sm:py-3.5 disabled:opacity-50 order-1 sm:order-2"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 size={17} className="animate-spin" />
                      Securing & Submitting...
                    </>
                  ) : (
                    <>
                      Submit Application & Get Pass
                      <CheckCircle2 size={17} />
                    </>
                  )}
                </button>
              </div>
            </motion.form>
          )}

          {/* ================= STEP 3: OFFICIAL PASS & WHATSAPP ================= */}
          {step === 3 && registeredData && (
            <motion.div
              key="step-3"
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.35 }}
              className="space-y-5 sm:space-y-6 text-center"
            >
              {/* Celebration badge */}
              <div className="w-14 h-14 sm:w-16 sm:h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-inner">
                <CheckCircle2 size={32} strokeWidth={2.5} />
              </div>

              <div>
                <span className="inline-flex items-center gap-1 text-[11px] font-bold uppercase tracking-widest text-emerald-600 bg-emerald-50 px-3 py-0.5 rounded-full border border-emerald-200">
                  Registration Confirmed
                </span>
                <h3 className="text-2xl sm:text-3xl font-display font-extrabold text-brand-900 mt-1.5">
                  Welcome to IIC PMEC!
                </h3>
                <p className="text-xs sm:text-sm text-gray-500 max-w-md mx-auto mt-1">
                  Your application for <strong>Idea & Innovation Cell</strong> has been recorded. An official receipt has also been dispatched to your email inbox.
                </p>
              </div>

              {/* Digital Pass Card */}
              <div className="max-w-md mx-auto bg-gradient-to-br from-brand-900 to-slate-900 text-white p-4 sm:p-6 rounded-2xl sm:rounded-3xl shadow-xl border border-white/10 text-left relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-brand-400/10 rounded-full blur-2xl" />
                
                <div className="flex justify-between items-start border-b border-white/10 pb-3 sm:pb-4 mb-3 sm:mb-4">
                  <div>
                    <p className="text-[9px] sm:text-[10px] font-semibold tracking-widest uppercase text-brand-300">
                      Application Pass
                    </p>
                    <h5 className="text-lg sm:text-xl font-display font-extrabold text-white">
                      {registeredData.name}
                    </h5>
                    <p className="text-xs text-brand-200">{registeredData.branch}</p>
                  </div>
                  {formData.photo && (
                    <img
                      src={formData.photo}
                      alt="Student"
                      className="w-11 h-11 sm:w-12 sm:h-12 rounded-xl object-cover border border-white/20 shrink-0"
                    />
                  )}
                </div>

                <div className="grid grid-cols-2 gap-2.5 sm:gap-3 text-xs mb-3 sm:mb-4">
                  <div>
                    <p className="text-gray-400 text-[9px] uppercase">Academic Year</p>
                    <p className="font-semibold text-white text-xs">{registeredData.year}</p>
                  </div>
                  <div>
                    <p className="text-gray-400 text-[9px] uppercase">Fee Status</p>
                    <p className="font-semibold text-emerald-400 text-xs">₹{registeredData.amount} (Settled)</p>
                  </div>
                  <div className="col-span-2">
                    <p className="text-gray-400 text-[9px] uppercase">UPI Ref (UTR)</p>
                    <p className="font-mono text-white text-[11px] tracking-wider break-all">{registeredData.utr}</p>
                  </div>
                </div>

                {/* Application Pass ID Banner */}
                <div className="bg-white/10 rounded-xl p-2.5 sm:p-3 flex justify-between items-center border border-white/15">
                  <div>
                    <p className="text-[8px] sm:text-[9px] uppercase tracking-wider text-brand-200 font-semibold">Pass Number</p>
                    <p className="font-mono font-extrabold text-sm sm:text-base tracking-widest text-white break-all">
                      {registeredData.regId}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      navigator.clipboard.writeText(registeredData.regId);
                      setCopiedRegId(true);
                      toast.success('Registration ID copied!');
                      setTimeout(() => setCopiedRegId(false), 2500);
                    }}
                    className="p-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors shrink-0"
                    title="Copy Pass ID"
                  >
                    {copiedRegId ? <Check size={15} className="text-emerald-400" /> : <Copy size={15} />}
                  </button>
                </div>
              </div>

              {/* CRITICAL CALL TO ACTION: WHATSAPP GROUP */}
              <div className="max-w-md mx-auto p-4 sm:p-5 rounded-2xl bg-emerald-50 border border-emerald-200 text-center space-y-2.5 sm:space-y-3">
                <h4 className="font-bold text-emerald-950 text-sm sm:text-base">
                  ⚡ Mandatory Final Step
                </h4>
                <p className="text-xs text-emerald-800 leading-relaxed">
                  Join the official Candidates WhatsApp Announcement Group to receive the recruitment timeline, orientation schedule, and interview calls.
                </p>
                <a
                  href={DEFAULT_WHATSAPP_GROUP}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 sm:py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-xs sm:text-sm shadow-md shadow-emerald-600/20 transition-all hover:scale-[1.01] active:scale-[0.99] animate-pulse"
                >
                  <ExternalLink size={16} />
                  Join Candidates WhatsApp Group
                </a>
              </div>

              <div className="pt-1">
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="text-xs font-semibold text-gray-500 hover:text-brand-900 transition-colors underline"
                >
                  Print / Save Pass Receipt
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
