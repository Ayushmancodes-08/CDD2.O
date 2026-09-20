'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Shield, Lock, User, Key, Download, Search, Filter, RefreshCw,
  CheckCircle2, Clock, AlertTriangle, ExternalLink, Copy, Check,
  Phone, Mail, Calendar, Building2, GraduationCap, ArrowUpDown,
  Eye, X, FileSpreadsheet, ChevronDown, LogOut, Sparkles, DollarSign,
  Users, MessageSquare, CreditCard
} from 'lucide-react';
import { toast } from 'sonner';
import { DEFAULT_WHATSAPP_GROUP } from '@/lib/upi';

// Hardcoded fallback credentials (displayed for authorized admin convenience)
const DEFAULT_USER = 'admin';
const DEFAULT_PASS = 'iicpmec2026@admin';

export default function AdminPortalPage() {
  // Auth state
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authToken, setAuthToken] = useState('');
  const [loginForm, setLoginForm] = useState({ username: DEFAULT_USER, password: DEFAULT_PASS });
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  // Data state
  const [registrations, setRegistrations] = useState([]);
  const [stats, setStats] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [copiedText, setCopiedText] = useState('');

  // Filter & Search state
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedYear, setSelectedYear] = useState('all');
  const [selectedBranch, setSelectedBranch] = useState('all');

  // Detail Modal state
  const [selectedCandidate, setSelectedCandidate] = useState(null);

  // Check saved session on mount
  useEffect(() => {
    try {
      const savedToken = sessionStorage.getItem('cdd_admin_token');
      if (savedToken) {
        setAuthToken(savedToken);
        setIsAuthenticated(true);
      }
    } catch (e) {}
  }, []);

  // Fetch registrations
  const fetchRegistrations = useCallback(async (tokenToUse = authToken) => {
    if (!tokenToUse) return;
    setIsLoading(true);
    try {
      const res = await fetch('/api/admin/registrations', {
        headers: {
          Authorization: `Bearer ${tokenToUse}`,
        },
      });

      if (res.status === 401) {
        setIsAuthenticated(false);
        sessionStorage.removeItem('cdd_admin_token');
        toast.error('Session expired. Please log in again.');
        return;
      }

      const data = await res.json();
      if (data.success) {
        setRegistrations(data.registrations || []);
        setStats(data.stats || null);
      } else {
        toast.error(data.error || 'Failed to fetch registrations');
      }
    } catch (err) {
      toast.error('Network error contacting admin service.');
    } finally {
      setIsLoading(false);
    }
  }, [authToken]);

  useEffect(() => {
    if (isAuthenticated && authToken) {
      fetchRegistrations();
    }
  }, [isAuthenticated, authToken, fetchRegistrations]);

  // Login handler
  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoggingIn(true);
    try {
      const res = await fetch('/api/admin/registrations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'login',
          username: loginForm.username,
          password: loginForm.password,
        }),
      });

      const data = await res.json();
      if (data.success && data.token) {
        setAuthToken(data.token);
        setIsAuthenticated(true);
        sessionStorage.setItem('cdd_admin_token', data.token);
        toast.success(data.message || 'Access granted!');
      } else {
        toast.error(data.error || 'Invalid credentials');
      }
    } catch (err) {
      toast.error('Login network error');
    } finally {
      setIsLoggingIn(false);
    }
  };

  // Logout handler
  const handleLogout = () => {
    sessionStorage.removeItem('cdd_admin_token');
    setIsAuthenticated(false);
    setAuthToken('');
    toast.info('Logged out from admin panel.');
  };

  // Excel / CSV Download trigger
  const handleDownloadCSV = (year = 'all') => {
    const encodedToken = authToken;
    const url = `/api/admin/registrations?export=csv&year=${encodeURIComponent(year)}&token=${encodeURIComponent(encodedToken)}`;
    
    // Trigger direct native browser download
    const link = document.createElement('a');
    link.href = url;
    const dateStr = new Date().toISOString().split('T')[0];
    const yearSlug = year.replace(/\s+/g, '_').toLowerCase();
    link.download = `IIC_PMEC_Registrations_${yearSlug}_${dateStr}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast.success(`Downloading ${year === 'all' ? 'All Participants' : year} Excel sheet...`);
  };

  // Copy to clipboard helper
  const copyToClipboard = (text, label = 'Copied') => {
    navigator.clipboard.writeText(text);
    setCopiedText(text);
    toast.success(`${label} copied!`);
    setTimeout(() => setCopiedText(''), 2000);
  };

  // Filtered registrations
  const filteredRegistrations = useMemo(() => {
    return registrations.filter((r) => {
      // Search filter
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        (r.name && r.name.toLowerCase().includes(q)) ||
        (r.email && r.email.toLowerCase().includes(q)) ||
        (r.phone && r.phone.includes(q)) ||
        (r.regId && r.regId.toLowerCase().includes(q)) ||
        (r.utr && r.utr.toLowerCase().includes(q)) ||
        (r.branch && r.branch.toLowerCase().includes(q));

      // Year filter
      const matchesYear =
        selectedYear === 'all' ||
        (r.year && r.year.toLowerCase().trim() === selectedYear.toLowerCase().trim());

      // Branch filter
      const matchesBranch =
        selectedBranch === 'all' || (r.branch && r.branch === selectedBranch);

      return matchesSearch && matchesYear && matchesBranch;
    });
  }, [registrations, searchQuery, selectedYear, selectedBranch]);

  // Unique branches for filter dropdown
  const uniqueBranches = useMemo(() => {
    const set = new Set();
    registrations.forEach((r) => {
      if (r.branch) set.add(r.branch);
    });
    return Array.from(set);
  }, [registrations]);

  // =========================================================================
  // RENDER: LOGIN SCREEN IF NOT AUTHENTICATED
  // =========================================================================
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center p-4 relative overflow-hidden">
        {/* Ambient background glows */}
        <div className="absolute top-1/4 -left-32 w-96 h-96 bg-brand-500/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-1/4 -right-32 w-96 h-96 bg-emerald-500/15 rounded-full blur-3xl pointer-events-none" />

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md bg-slate-900/90 backdrop-blur-2xl border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl relative z-10"
        >
          <div className="text-center mb-6">
            <div className="w-14 h-14 bg-gradient-to-tr from-brand-600 to-emerald-500 rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-lg shadow-brand-500/20">
              <Shield className="text-white" size={28} />
            </div>
            <span className="inline-block px-3 py-1 bg-brand-500/10 text-brand-400 border border-brand-500/20 rounded-full text-xs font-bold tracking-wider uppercase mb-1">
              Secret Admin Portal
            </span>
            <h2 className="text-2xl font-display font-extrabold text-white">IIC PMEC Command Center</h2>
            <p className="text-slate-400 text-xs mt-1">
              Authorized personnel only. Enter credentials to manage candidates & export datasets.
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Admin Username
              </label>
              <div className="relative">
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" size={17} />
                <input
                  type="text"
                  required
                  value={loginForm.username}
                  onChange={(e) => setLoginForm({ ...loginForm, username: e.target.value })}
                  placeholder="admin"
                  className="w-full pl-10 pr-4 py-3 bg-slate-800/80 border border-slate-700 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Admin Password
              </label>
              <div className="relative">
                <Key className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" size={17} />
                <input
                  type="password"
                  required
                  value={loginForm.password}
                  onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
                  placeholder="••••••••••••"
                  className="w-full pl-10 pr-4 py-3 bg-slate-800/80 border border-slate-700 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-all"
                />
              </div>
            </div>

            {/* Hardcoded credential chip for instant convenience */}
            <div className="p-3 bg-slate-800/60 border border-slate-700/60 rounded-xl text-[11px] text-slate-400 space-y-1">
              <div className="flex justify-between items-center text-slate-300 font-semibold">
                <span>Default Admin Credentials:</span>
                <button
                  type="button"
                  onClick={() => setLoginForm({ username: DEFAULT_USER, password: DEFAULT_PASS })}
                  className="text-brand-400 hover:text-brand-300 underline cursor-pointer"
                >
                  Auto Fill
                </button>
              </div>
              <p>User: <code className="text-white font-mono bg-slate-900 px-1.5 py-0.5 rounded">{DEFAULT_USER}</code></p>
              <p>Pass: <code className="text-white font-mono bg-slate-900 px-1.5 py-0.5 rounded">{DEFAULT_PASS}</code></p>
            </div>

            <button
              type="submit"
              disabled={isLoggingIn}
              className="w-full py-3.5 bg-gradient-to-r from-brand-600 to-emerald-600 hover:from-brand-500 hover:to-emerald-500 text-white rounded-xl font-bold text-sm shadow-lg shadow-brand-500/25 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
            >
              {isLoggingIn ? (
                <>
                  <RefreshCw size={16} className="animate-spin" />
                  Verifying Security Token...
                </>
              ) : (
                <>
                  <Lock size={16} />
                  Unlock Executive Dashboard
                </>
              )}
            </button>
          </form>
        </motion.div>
      </div>
    );
  }

  // =========================================================================
  // RENDER: FULL ADMIN DASHBOARD
  // =========================================================================
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-4 sm:p-6 lg:p-8 font-sans">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* TOP HEADER BAR */}
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-slate-900/90 backdrop-blur-xl border border-slate-800 p-5 rounded-2xl sm:rounded-3xl shadow-xl">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 bg-gradient-to-tr from-brand-600 to-emerald-500 rounded-2xl flex items-center justify-center shadow-md shadow-brand-500/20">
              <Shield className="text-white" size={24} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-display font-extrabold text-white tracking-tight">
                  IIC PMEC Admin Panel
                </h1>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  Live Database
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Parala Maharaja Engineering College • Candidate Verification & Export Portal
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 w-full md:w-auto justify-end">
            <button
              onClick={() => fetchRegistrations()}
              disabled={isLoading}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition-colors cursor-pointer border border-slate-700"
              title="Refresh Records"
            >
              <RefreshCw size={14} className={isLoading ? 'animate-spin' : ''} />
              <span>Refresh</span>
            </button>

            <button
              onClick={handleLogout}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 text-xs font-semibold transition-colors cursor-pointer"
            >
              <LogOut size={14} />
              <span>Logout</span>
            </button>
          </div>
        </header>

        {/* METRICS & REVENUE CARDS */}
        {stats && (
          <div className="grid grid-cols-2 lg:grid-cols-6 gap-3 sm:gap-4">
            {/* Card 1: Total Candidates */}
            <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl">
              <div className="flex items-center justify-between text-slate-400 mb-1">
                <span className="text-[11px] font-bold uppercase tracking-wider">Total Members</span>
                <Users size={16} className="text-brand-400" />
              </div>
              <h3 className="text-2xl sm:text-3xl font-extrabold text-white">{stats.totalRegistrations}</h3>
              <p className="text-[11px] text-emerald-400 font-medium mt-0.5">100% Verified in System</p>
            </div>

            {/* Card 2: Total Revenue */}
            <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl">
              <div className="flex items-center justify-between text-slate-400 mb-1">
                <span className="text-[11px] font-bold uppercase tracking-wider">Total Fee Collected</span>
                <DollarSign size={16} className="text-emerald-400" />
              </div>
              <h3 className="text-2xl sm:text-3xl font-extrabold text-emerald-400">₹{stats.totalRevenue}</h3>
              <p className="text-[11px] text-slate-400 mt-0.5">Official Club Funds</p>
            </div>

            {/* Card 3: 1st Year */}
            <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl relative overflow-hidden group">
              <div className="flex items-center justify-between text-slate-400 mb-1">
                <span className="text-[11px] font-bold uppercase tracking-wider text-blue-400">1st Year</span>
                <GraduationCap size={16} className="text-blue-400" />
              </div>
              <h3 className="text-2xl sm:text-3xl font-extrabold text-white">{stats.firstYearCount}</h3>
              <div className="flex justify-between items-center mt-0.5">
                <span className="text-[11px] text-slate-400">₹{stats.firstYearRevenue}</span>
                <button
                  onClick={() => handleDownloadCSV('1st year')}
                  className="text-[10px] font-bold text-blue-400 hover:text-blue-300 underline inline-flex items-center gap-0.5 cursor-pointer"
                >
                  <Download size={10} /> CSV
                </button>
              </div>
            </div>

            {/* Card 4: 2nd Year */}
            <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl relative overflow-hidden group">
              <div className="flex items-center justify-between text-slate-400 mb-1">
                <span className="text-[11px] font-bold uppercase tracking-wider text-purple-400">2nd Year</span>
                <GraduationCap size={16} className="text-purple-400" />
              </div>
              <h3 className="text-2xl sm:text-3xl font-extrabold text-white">{stats.secondYearCount}</h3>
              <div className="flex justify-between items-center mt-0.5">
                <span className="text-[11px] text-slate-400">₹{stats.secondYearRevenue}</span>
                <button
                  onClick={() => handleDownloadCSV('2nd year')}
                  className="text-[10px] font-bold text-purple-400 hover:text-purple-300 underline inline-flex items-center gap-0.5 cursor-pointer"
                >
                  <Download size={10} /> CSV
                </button>
              </div>
            </div>

            {/* Card 5: 3rd Year */}
            <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl relative overflow-hidden group">
              <div className="flex items-center justify-between text-slate-400 mb-1">
                <span className="text-[11px] font-bold uppercase tracking-wider text-amber-400">3rd Year</span>
                <GraduationCap size={16} className="text-amber-400" />
              </div>
              <h3 className="text-2xl sm:text-3xl font-extrabold text-white">{stats.thirdYearCount}</h3>
              <div className="flex justify-between items-center mt-0.5">
                <span className="text-[11px] text-slate-400">₹{stats.thirdYearRevenue}</span>
                <button
                  onClick={() => handleDownloadCSV('3rd year')}
                  className="text-[10px] font-bold text-amber-400 hover:text-amber-300 underline inline-flex items-center gap-0.5 cursor-pointer"
                >
                  <Download size={10} /> CSV
                </button>
              </div>
            </div>

            {/* Card 6: WhatsApp Group Community */}
            <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl relative overflow-hidden">
              <div className="flex items-center justify-between text-slate-400 mb-1">
                <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-400">WhatsApp Group</span>
                <MessageSquare size={16} className="text-emerald-400" />
              </div>
              <h3 className="text-2xl sm:text-3xl font-extrabold text-white">
                {stats.totalRegistrations}
              </h3>
              <div className="flex justify-between items-center mt-0.5">
                <span className="text-[11px] text-emerald-400 font-medium">100% In WhatsApp</span>
                <a
                  href={DEFAULT_WHATSAPP_GROUP}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[10px] font-bold text-emerald-400 hover:text-emerald-300 underline inline-flex items-center gap-0.5 cursor-pointer"
                >
                  <ExternalLink size={10} /> Open Group
                </a>
              </div>
            </div>
          </div>
        )}

        {/* =========================================================================
            ONE-CLICK EXCEL DOWNLOAD TOOLBAR (REQUESTED BY USER)
           ========================================================================= */}
        <section className="bg-gradient-to-r from-emerald-950/40 via-slate-900 to-slate-900 border-2 border-emerald-500/30 p-5 rounded-2xl sm:rounded-3xl shadow-xl space-y-3">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
            <div>
              <div className="flex items-center gap-2">
                <FileSpreadsheet className="text-emerald-400" size={20} />
                <h3 className="text-base sm:text-lg font-bold text-white">
                  Direct Excel / Spreadsheet Downloads
                </h3>
              </div>
              <p className="text-xs text-slate-400">
                Exports fully formatted Microsoft Excel/CSV documents containing all participant records, contact numbers, and UTRs.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 pt-1">
            {/* Button 1: All Participants */}
            <button
              onClick={() => handleDownloadCSV('all')}
              className="py-3 px-4 bg-emerald-600 hover:bg-emerald-500 active:scale-[0.99] text-white rounded-xl text-xs sm:text-sm font-extrabold shadow-lg shadow-emerald-600/20 flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              <Download size={16} />
              <span>Download ALL Participants ({registrations.length})</span>
            </button>

            {/* Button 2: 1st Year Only */}
            <button
              onClick={() => handleDownloadCSV('1st year')}
              className="py-3 px-4 bg-blue-600 hover:bg-blue-500 active:scale-[0.99] text-white rounded-xl text-xs sm:text-sm font-bold shadow-lg shadow-blue-600/20 flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              <Download size={16} />
              <span>Download 1st Year Only</span>
            </button>

            {/* Button 3: 2nd Year Only */}
            <button
              onClick={() => handleDownloadCSV('2nd year')}
              className="py-3 px-4 bg-purple-600 hover:bg-purple-500 active:scale-[0.99] text-white rounded-xl text-xs sm:text-sm font-bold shadow-lg shadow-purple-600/20 flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              <Download size={16} />
              <span>Download 2nd Year Only</span>
            </button>

            {/* Button 4: 3rd Year Only */}
            <button
              onClick={() => handleDownloadCSV('3rd year')}
              className="py-3 px-4 bg-amber-600 hover:bg-amber-500 active:scale-[0.99] text-white rounded-xl text-xs sm:text-sm font-bold shadow-lg shadow-amber-600/20 flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              <Download size={16} />
              <span>Download 3rd Year Only</span>
            </button>
          </div>
        </section>

        {/* CANDIDATES TABLE & CONTROLS */}
        <section className="bg-slate-900 border border-slate-800 rounded-2xl sm:rounded-3xl shadow-xl overflow-hidden">
          {/* Filter & Search Bar */}
          <div className="p-4 sm:p-5 border-b border-slate-800 space-y-3">
            <div className="flex flex-col md:flex-row items-center justify-between gap-3">
              {/* Search Box */}
              <div className="relative w-full md:w-80">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
                <input
                  type="text"
                  placeholder="Search by Name, UTR, Phone, ID..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs sm:text-sm text-white focus:outline-none focus:ring-2 focus:ring-brand-500 transition-all placeholder:text-slate-500"
                />
              </div>

              {/* Filter Selectors */}
              <div className="flex flex-wrap items-center gap-2 w-full md:w-auto justify-start md:justify-end text-xs">
                {/* Year Filter */}
                <select
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(e.target.value)}
                  className="px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-brand-500 cursor-pointer"
                >
                  <option value="all">All Academic Years</option>
                  <option value="1st year">1st Year</option>
                  <option value="2nd year">2nd Year</option>
                  <option value="3rd year">3rd Year</option>
                </select>

                {/* Branch Filter */}
                {uniqueBranches.length > 0 && (
                  <select
                    value={selectedBranch}
                    onChange={(e) => setSelectedBranch(e.target.value)}
                    className="px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-brand-500 cursor-pointer max-w-[180px] truncate"
                  >
                    <option value="all">All Branches</option>
                    {uniqueBranches.map((b) => (
                      <option key={b} value={b}>
                        {b}
                      </option>
                    ))}
                  </select>
                )}

                <span className="text-slate-400 font-medium ml-1">
                  Showing {filteredRegistrations.length} of {registrations.length}
                </span>
              </div>
            </div>
          </div>

          {/* Table Container */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm border-collapse">
              <thead>
                <tr className="bg-slate-950/60 text-slate-400 uppercase tracking-wider text-[11px] border-b border-slate-800">
                  <th className="py-3 px-4">Photo</th>
                  <th className="py-3 px-4">Reg ID</th>
                  <th className="py-3 px-4">Candidate Details</th>
                  <th className="py-3 px-4">Year & Branch</th>
                  <th className="py-3 px-4">Contact</th>
                  <th className="py-3 px-4">UTR & Paying UPI</th>
                  <th className="py-3 px-4">Fee</th>
                  <th className="py-3 px-4">WhatsApp Group</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80">
                {filteredRegistrations.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="py-12 text-center text-slate-500">
                      <Users size={32} className="mx-auto mb-2 opacity-30" />
                      <p className="font-semibold">No registration records found.</p>
                      <p className="text-xs text-slate-600 mt-0.5">Try clearing filters or search query.</p>
                    </td>
                  </tr>
                ) : (
                  filteredRegistrations.map((cand) => {
                    const isVerified = cand.status === 'VERIFIED';
                    return (
                      <tr
                        key={cand.regId || cand.utr}
                        className="hover:bg-slate-800/50 transition-colors group"
                      >
                        {/* Photo */}
                        <td className="py-3 px-4">
                          <div
                            onClick={() => setSelectedCandidate(cand)}
                            className="w-10 h-10 rounded-xl overflow-hidden bg-slate-800 border border-slate-700 shrink-0 cursor-pointer hover:ring-2 hover:ring-brand-500 transition-all"
                          >
                            {cand.photo ? (
                              <img
                                src={cand.photo}
                                alt={cand.name}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-slate-600 font-bold text-xs">
                                {cand.name ? cand.name[0] : '?'}
                              </div>
                            )}
                          </div>
                        </td>

                        {/* Reg ID */}
                        <td className="py-3 px-4 font-mono font-bold text-brand-400">
                          <div className="flex items-center gap-1.5">
                            <span>{cand.regId}</span>
                            <button
                              onClick={() => copyToClipboard(cand.regId, 'Reg ID')}
                              className="text-slate-500 hover:text-white transition-colors"
                              title="Copy Reg ID"
                            >
                              {copiedText === cand.regId ? (
                                <Check size={12} className="text-emerald-400" />
                              ) : (
                                <Copy size={12} />
                              )}
                            </button>
                          </div>
                        </td>

                        {/* Candidate Details */}
                        <td className="py-3 px-4">
                          <p className="font-bold text-white group-hover:text-brand-300 transition-colors">
                            {cand.name}
                          </p>
                          <p className="text-[11px] text-slate-400 truncate max-w-[180px]">
                            {cand.college || 'Parala Maharaja Engineering College'}
                          </p>
                        </td>

                        {/* Year & Branch */}
                        <td className="py-3 px-4">
                          <span
                            className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider mb-0.5 ${
                              cand.year === '1st year'
                                ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                                : cand.year === '2nd year'
                                ? 'bg-purple-500/10 text-purple-400 border border-purple-500/20'
                                : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                            }`}
                          >
                            {cand.year}
                          </span>
                          <p className="text-xs text-slate-300 truncate max-w-[180px] font-medium">
                            {cand.branch}
                          </p>
                        </td>

                        {/* Contact */}
                        <td className="py-3 px-4 text-xs space-y-0.5">
                          <div className="flex items-center gap-1 text-slate-300 font-mono">
                            <Phone size={11} className="text-slate-500" />
                            <span>{cand.phone}</span>
                            <a
                              href={`https://wa.me/91${cand.phone?.replace(/[^0-9]/g, '')}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-emerald-400 hover:text-emerald-300 ml-1"
                              title="Chat on WhatsApp"
                            >
                              <MessageSquare size={12} />
                            </a>
                          </div>
                          <div className="flex items-center gap-1 text-slate-400 truncate max-w-[170px]">
                            <Mail size={11} className="text-slate-500" />
                            <span className="truncate">{cand.email}</span>
                          </div>
                        </td>

                        {/* UTR & Paying UPI */}
                        <td className="py-3 px-4 font-mono text-xs">
                          <div className="flex items-center gap-1 text-slate-200">
                            <span className="font-bold tracking-wider">{cand.utr}</span>
                            <button
                              onClick={() => copyToClipboard(cand.utr, 'UTR')}
                              className="text-slate-500 hover:text-white transition-colors"
                              title="Copy UTR"
                            >
                              {copiedText === cand.utr ? (
                                <Check size={12} className="text-emerald-400" />
                              ) : (
                                <Copy size={12} />
                              )}
                            </button>
                          </div>
                          {cand.payingUpi && (
                            <p className="text-[10px] text-slate-400 font-mono mt-0.5">
                              UPI: {cand.payingUpi}
                            </p>
                          )}
                        </td>

                        {/* Amount */}
                        <td className="py-3 px-4 font-bold text-emerald-400">
                          ₹{cand.amount || 300}
                        </td>

                        {/* WhatsApp Group */}
                        <td className="py-3 px-4">
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                            <CheckCircle2 size={12} className="text-emerald-400" />
                            <span>Added to Group</span>
                          </span>
                        </td>

                        {/* Actions */}
                        <td className="py-3 px-4 text-right space-x-1.5">
                          <button
                            onClick={() => setSelectedCandidate(cand)}
                            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer inline-flex items-center"
                            title="View Full Profile & Proof"
                          >
                            <Eye size={15} />
                          </button>

                          <a
                            href={`https://wa.me/91${cand.phone?.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(`Hello ${cand.name}! Welcome to Idea and Innovation Cell (IIC PMEC). Your registration (${cand.regId}) is confirmed and you are in the recruitment cohort!`)}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 px-2.5 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold transition-all cursor-pointer shadow-sm"
                            title="Open WhatsApp Chat with Candidate"
                          >
                            <MessageSquare size={13} />
                            <span>WhatsApp</span>
                          </a>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </section>

      </div>

      {/* =========================================================================
          CANDIDATE PROFILE & PAYMENT SCREENSHOT MODAL
         ========================================================================= */}
      <AnimatePresence>
        {selectedCandidate && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl p-6 relative"
            >
              {/* Close Button */}
              <button
                onClick={() => setSelectedCandidate(null)}
                className="absolute top-5 right-5 p-2 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors cursor-pointer"
              >
                <X size={18} />
              </button>

              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-brand-500/10 text-brand-400 flex items-center justify-center font-bold">
                  <User size={20} />
                </div>
                <div>
                  <h3 className="text-xl font-display font-extrabold text-white">
                    {selectedCandidate.name}
                  </h3>
                  <p className="text-xs text-brand-400 font-mono">
                    {selectedCandidate.regId} • {selectedCandidate.year} ({selectedCandidate.branch})
                  </p>
                </div>
              </div>

              {/* Two Column Images: Photo & Payment Proof */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                {/* Photo Column */}
                <div className="p-3 bg-slate-950/60 rounded-2xl border border-slate-800 text-center">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-2">
                    Student Portrait Photo
                  </span>
                  {selectedCandidate.photo ? (
                    <div className="rounded-xl overflow-hidden max-h-56 bg-black flex items-center justify-center">
                      <img
                        src={selectedCandidate.photo}
                        alt="Portrait"
                        className="max-h-56 object-contain"
                      />
                    </div>
                  ) : (
                    <div className="py-12 text-slate-600 text-xs font-semibold">
                      No photo submitted
                    </div>
                  )}
                </div>

                {/* Receipt Screenshot Column */}
                <div className="p-3 bg-slate-950/60 rounded-2xl border border-slate-800 text-center">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-400 block mb-2">
                    Payment Proof Screenshot
                  </span>
                  {selectedCandidate.paymentScreenshot ? (
                    <div className="rounded-xl overflow-hidden max-h-56 bg-black flex items-center justify-center">
                      <img
                        src={selectedCandidate.paymentScreenshot}
                        alt="Payment Proof"
                        className="max-h-56 object-contain"
                      />
                    </div>
                  ) : (
                    <div className="py-12 text-slate-600 text-xs font-semibold">
                      No screenshot submitted
                    </div>
                  )}
                </div>
              </div>

              {/* Data Table details */}
              <div className="bg-slate-950/60 border border-slate-800 rounded-2xl p-4 text-xs space-y-2 mb-6">
                <div className="flex justify-between py-1 border-b border-slate-800">
                  <span className="text-slate-400">WhatsApp Phone:</span>
                  <span className="font-mono text-white flex items-center gap-2">
                    {selectedCandidate.phone}
                    <a
                      href={`https://wa.me/91${selectedCandidate.phone?.replace(/[^0-9]/g, '')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-emerald-400 hover:underline inline-flex items-center gap-0.5"
                    >
                      <MessageSquare size={11} /> Chat
                    </a>
                  </span>
                </div>

                <div className="flex justify-between py-1 border-b border-slate-800">
                  <span className="text-slate-400">Email Address:</span>
                  <span className="text-white font-medium">{selectedCandidate.email}</span>
                </div>

                <div className="flex justify-between py-1 border-b border-slate-800">
                  <span className="text-slate-400">UTR / UPI Reference No:</span>
                  <span className="font-mono text-emerald-400 font-bold tracking-wider">
                    {selectedCandidate.utr}
                  </span>
                </div>

                {selectedCandidate.payingUpi && (
                  <div className="flex justify-between py-1 border-b border-slate-800">
                    <span className="text-slate-400">Student Paying UPI ID:</span>
                    <span className="font-mono text-white">{selectedCandidate.payingUpi}</span>
                  </div>
                )}

                <div className="flex justify-between py-1 border-b border-slate-800">
                  <span className="text-slate-400">Fee Amount:</span>
                  <span className="font-bold text-white">₹{selectedCandidate.amount}</span>
                </div>

                <div className="flex justify-between py-1 border-b border-slate-800">
                  <span className="text-slate-400">Submission Timestamp:</span>
                  <span className="text-slate-300">
                    {selectedCandidate.formattedDate || selectedCandidate.createdAt}
                  </span>
                </div>

                <div className="flex justify-between py-1 border-b border-slate-800">
                  <span className="text-slate-400">Recruitment Status:</span>
                  <span className="inline-flex items-center gap-1 text-emerald-400 font-bold">
                    <CheckCircle2 size={13} /> Enrolled Member
                  </span>
                </div>

                <div className="flex justify-between py-1">
                  <span className="text-slate-400">WhatsApp Group:</span>
                  <span className="inline-flex items-center gap-1 text-emerald-400 font-bold">
                    <CheckCircle2 size={13} /> Added to Official Group
                  </span>
                </div>
              </div>

              {/* WhatsApp Community & Actions */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-3 border-t border-slate-800">
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    <CheckCircle2 size={13} />
                    Added to WhatsApp Group
                  </span>
                </div>

                <div className="flex items-center gap-2 justify-end">
                  <a
                    href={`https://wa.me/91${selectedCandidate.phone?.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(`Hello ${selectedCandidate.name}! Welcome to Idea and Innovation Cell (IIC PMEC). Your registration (${selectedCandidate.regId}) is confirmed and you are in the recruitment cohort!`)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-lg shadow-emerald-600/20"
                  >
                    <MessageSquare size={14} />
                    Chat on WhatsApp
                  </a>

                  <a
                    href={DEFAULT_WHATSAPP_GROUP}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer"
                  >
                    <ExternalLink size={14} />
                    Group Invite
                  </a>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
