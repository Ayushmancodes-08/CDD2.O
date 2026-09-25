'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Shield, Lock, User, Key, Download, Search, Filter, RefreshCw,
  CheckCircle2, Clock, AlertTriangle, ExternalLink, Copy, Check,
  Phone, Mail, Calendar, Building2, GraduationCap, ArrowUpDown,
  Eye, X, FileSpreadsheet, ChevronDown, LogOut, Sparkles, DollarSign,
  Users, MessageSquare, CreditCard, Folder, Cloud, Database,
  Activity, Trash2, CheckCircle, XCircle, Send, Globe, Server, CheckCheck
} from 'lucide-react';
import { toast } from 'sonner';
import { DEFAULT_WHATSAPP_GROUP } from '@/lib/upi';

// Credentials & Cloud Resource Links
const DEFAULT_USER = 'admin';
const DEFAULT_PASS = 'iicpmec2026@admin';
const RECRUITMENT_DRIVE_FOLDER = 'https://drive.google.com/drive/folders/1riY76K5ST-1KqKnRaaskxPQGB6EteHFa';

export default function AdminPortalPage() {
  // Navigation / Tabs state: 'candidates' | 'subscribers' | 'database' | 'merchant'
  const [activeTab, setActiveTab] = useState('candidates');

  // Auth state
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authToken, setAuthToken] = useState('');
  const [loginForm, setLoginForm] = useState({ username: DEFAULT_USER, password: DEFAULT_PASS });
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  // Data state
  const [registrations, setRegistrations] = useState([]);
  const [subscribers, setSubscribers] = useState([]);
  const [stats, setStats] = useState(null);
  const [cloudSync, setCloudSync] = useState(null);
  const [databaseInfo, setDatabaseInfo] = useState(null);
  const [merchantConfig, setMerchantConfig] = useState(null);
  const [recentHeartbeats, setRecentHeartbeats] = useState([]);

  const [isLoading, setIsLoading] = useState(false);
  const [isSyncingCloud, setIsSyncingCloud] = useState(false);
  const [isPingingHeartbeat, setIsPingingHeartbeat] = useState(false);
  const [copiedText, setCopiedText] = useState('');

  // Filter & Search state (Candidates)
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedYear, setSelectedYear] = useState('all');
  const [selectedBranch, setSelectedBranch] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');

  // Search state (Subscribers)
  const [subscriberSearch, setSubscriberSearch] = useState('');

  // Modals & Action states
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [deleteCandidateTarget, setDeleteCandidateTarget] = useState(null);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);

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

  // Fetch admin dashboard details
  const fetchDashboardData = useCallback(async (tokenToUse = authToken) => {
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
        setSubscribers(data.subscribers || []);
        setStats(data.stats || null);
        if (data.database) setDatabaseInfo(data.database);
        if (data.cloudSync) setCloudSync(data.cloudSync);
        if (data.merchantConfig) setMerchantConfig(data.merchantConfig);
      } else {
        toast.error(data.error || 'Failed to fetch dashboard data');
      }

      // Also fetch uptime heartbeats
      try {
        const uptimeRes = await fetch('/api/uptime');
        const uptimeData = await uptimeRes.json();
        if (uptimeData && uptimeData.recentHeartbeats) {
          setRecentHeartbeats(uptimeData.recentHeartbeats);
        }
      } catch (_) {}
    } catch (err) {
      toast.error('Network error contacting admin service.');
    } finally {
      setIsLoading(false);
    }
  }, [authToken]);

  useEffect(() => {
    if (isAuthenticated && authToken) {
      fetchDashboardData();
    }
  }, [isAuthenticated, authToken, fetchDashboardData]);

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

  // Excel / CSV Download trigger for Registrations
  const handleDownloadCSV = (year = 'all') => {
    const encodedToken = authToken;
    const url = `/api/admin/registrations?export=csv&year=${encodeURIComponent(year)}&token=${encodeURIComponent(encodedToken)}`;
    
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

  // Download Subscribers CSV
  const handleDownloadSubscribersCSV = () => {
    const url = `/api/newsletter?export=csv`;
    const link = document.createElement('a');
    link.href = url;
    const dateStr = new Date().toISOString().split('T')[0];
    link.download = `IIC_PMEC_Newsletter_Subscribers_${dateStr}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('Downloading Newsletter Subscribers CSV...');
  };

  // Sync All with Google Sheets & Drive
  const handleSyncCloud = async () => {
    if (!authToken) return;
    setIsSyncingCloud(true);
    toast.loading('Synchronizing participant files & UTRs with Google Drive & Sheets...', { id: 'cloud-sync' });
    try {
      const res = await fetch('/api/admin/registrations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify({ action: 'sync_google' }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success(data.message || 'All records successfully synced to Google Sheets & Drive!', { id: 'cloud-sync' });
        await fetchDashboardData();
      } else {
        toast.error(data.error || 'Failed to sync with Google Drive', { id: 'cloud-sync' });
      }
    } catch (err) {
      toast.error('Network error during Google sync', { id: 'cloud-sync' });
    } finally {
      setIsSyncingCloud(false);
    }
  };

  // Trigger Manual Heartbeat Ping
  const handleSendHeartbeat = async () => {
    if (!authToken) return;
    setIsPingingHeartbeat(true);
    try {
      const res = await fetch('/api/admin/registrations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify({ action: 'ping_heartbeat' }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success(data.message || 'Heartbeat recorded in Atlas!');
        await fetchDashboardData();
      } else {
        toast.error(data.error || 'Failed to ping heartbeat');
      }
    } catch (e) {
      toast.error('Failed to trigger heartbeat');
    } finally {
      setIsPingingHeartbeat(false);
    }
  };

  // Update Candidate Status (Verify / Reject / Pending)
  const handleUpdateStatus = async (regId, newStatus) => {
    if (!authToken || !regId) return;
    setIsUpdatingStatus(true);
    try {
      const res = await fetch('/api/admin/registrations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify({
          action: 'update_status',
          regId,
          status: newStatus,
        }),
      });

      const data = await res.json();
      if (data.success) {
        toast.success(`Status updated to ${newStatus}`);
        setRegistrations((prev) =>
          prev.map((r) => (r.regId === regId ? { ...r, status: newStatus } : r))
        );
        if (selectedCandidate && selectedCandidate.regId === regId) {
          setSelectedCandidate({ ...selectedCandidate, status: newStatus });
        }
        await fetchDashboardData();
      } else {
        toast.error(data.error || 'Failed to update status');
      }
    } catch (e) {
      toast.error('Network error updating status');
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  // Delete Candidate Record
  const handleDeleteCandidate = async (regId) => {
    if (!authToken || !regId) return;
    try {
      const res = await fetch(`/api/admin/registrations?regId=${encodeURIComponent(regId)}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      });

      const data = await res.json();
      if (data.success) {
        toast.success(data.message || 'Candidate removed');
        setRegistrations((prev) => prev.filter((r) => r.regId !== regId));
        if (selectedCandidate && selectedCandidate.regId === regId) {
          setSelectedCandidate(null);
        }
        setDeleteCandidateTarget(null);
        await fetchDashboardData();
      } else {
        toast.error(data.error || 'Failed to delete candidate');
      }
    } catch (e) {
      toast.error('Network error deleting candidate');
    }
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

      // Status filter
      const statusUpper = (r.status || 'PENDING_VERIFICATION').toUpperCase();
      const matchesStatus =
        selectedStatus === 'all' ||
        (selectedStatus === 'VERIFIED' && statusUpper === 'VERIFIED') ||
        (selectedStatus === 'PENDING' && (statusUpper === 'PENDING_VERIFICATION' || statusUpper === 'PENDING')) ||
        (selectedStatus === 'REJECTED' && statusUpper === 'REJECTED');

      return matchesSearch && matchesYear && matchesBranch && matchesStatus;
    });
  }, [registrations, searchQuery, selectedYear, selectedBranch, selectedStatus]);

  // Filtered subscribers
  const filteredSubscribers = useMemo(() => {
    const q = subscriberSearch.toLowerCase().trim();
    if (!q) return subscribers;
    return subscribers.filter(
      (s) =>
        (s.email && s.email.toLowerCase().includes(q)) ||
        (s.source && s.source.toLowerCase().includes(q))
    );
  }, [subscribers, subscriberSearch]);

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
              Authorized personnel only. Manage registrations, subscribers, Atlas cluster & UPI configurations.
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

            {/* Credential chip for quick convenience */}
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
                  IIC PMEC Command Center
                </h1>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  Atlas Online
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Parala Maharaja Engineering College • Candidate Verification, Subscribers & Atlas Health
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 w-full md:w-auto justify-end">
            <button
              onClick={() => fetchDashboardData()}
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
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
            {/* Card 1: Total Candidates */}
            <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl">
              <div className="flex items-center justify-between text-slate-400 mb-1">
                <span className="text-[11px] font-bold uppercase tracking-wider">Total Members</span>
                <Users size={16} className="text-brand-400" />
              </div>
              <h3 className="text-2xl sm:text-3xl font-extrabold text-white">{stats.totalRegistrations}</h3>
              <p className="text-[11px] text-emerald-400 font-medium mt-0.5">
                {stats.verifiedCount} Verified • {stats.pendingCount} Pending
              </p>
            </div>

            {/* Card 2: Total Revenue */}
            <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl">
              <div className="flex items-center justify-between text-slate-400 mb-1">
                <span className="text-[11px] font-bold uppercase tracking-wider">Total Revenue</span>
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

            {/* Card 6: Newsletter Subscribers */}
            <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl relative overflow-hidden">
              <div className="flex items-center justify-between text-slate-400 mb-1">
                <span className="text-[11px] font-bold uppercase tracking-wider text-cyan-400">Subscribers</span>
                <Mail size={16} className="text-cyan-400" />
              </div>
              <h3 className="text-2xl sm:text-3xl font-extrabold text-white">
                {stats.subscribersCount || subscribers.length}
              </h3>
              <div className="flex justify-between items-center mt-0.5">
                <span className="text-[11px] text-cyan-400 font-medium">Newsletter</span>
                <button
                  onClick={handleDownloadSubscribersCSV}
                  className="text-[10px] font-bold text-cyan-400 hover:text-cyan-300 underline inline-flex items-center gap-0.5 cursor-pointer"
                >
                  <Download size={10} /> CSV
                </button>
              </div>
            </div>
          </div>
        )}

        {/* =========================================================================
            NAVIGATION TABS SELECTOR
           ========================================================================= */}
        <div className="flex items-center gap-2 border-b border-slate-800 pb-2 overflow-x-auto">
          <button
            onClick={() => setActiveTab('candidates')}
            className={`px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'candidates'
                ? 'bg-brand-600 text-white shadow-lg shadow-brand-600/20'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <Users size={16} />
            <span>Member Registrations ({registrations.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('subscribers')}
            className={`px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'subscribers'
                ? 'bg-cyan-600 text-white shadow-lg shadow-cyan-600/20'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <Mail size={16} />
            <span>Newsletter Subscribers ({subscribers.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('database')}
            className={`px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'database'
                ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/20'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <Database size={16} />
            <span>MongoDB Atlas & Uptime</span>
          </button>

          <button
            onClick={() => setActiveTab('merchant')}
            className={`px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'merchant'
                ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/20'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <CreditCard size={16} />
            <span>Payment & Club Settings</span>
          </button>
        </div>

        {/* =========================================================================
            TAB 1: CANDIDATES & MEMBER REGISTRATIONS
           ========================================================================= */}
        {activeTab === 'candidates' && (
          <div className="space-y-6">
            {/* GOOGLE DRIVE & SPREADSHEET CLOUD SYNC TOOLBAR */}
            <section className="bg-gradient-to-r from-blue-950/40 via-slate-900 to-emerald-950/30 border-2 border-blue-500/30 p-5 rounded-2xl sm:rounded-3xl shadow-xl space-y-4">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <Cloud className="text-blue-400" size={22} />
                    <h3 className="text-base sm:text-lg font-bold text-white">
                      Google Drive & Excel Cloud Synchronization
                    </h3>
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                      Live Sync Engine
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Generates Google Drive recruitment folders for each applicant with photos, UTR receipts, and automated Google Sheets sync.
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
                  <a
                    href={RECRUITMENT_DRIVE_FOLDER}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="py-2.5 px-4 bg-blue-600/20 hover:bg-blue-600/30 text-blue-300 border border-blue-500/40 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-sm"
                  >
                    <Folder size={15} />
                    <span>Open Main Drive Folder</span>
                    <ExternalLink size={12} />
                  </a>

                  <button
                    onClick={handleSyncCloud}
                    disabled={isSyncingCloud}
                    className="py-2.5 px-4 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-lg shadow-emerald-600/20 disabled:opacity-60"
                  >
                    <RefreshCw size={14} className={isSyncingCloud ? 'animate-spin' : ''} />
                    <span>{isSyncingCloud ? 'Syncing...' : 'Sync All with Google Drive'}</span>
                  </button>
                </div>
              </div>

              {/* Direct Excel Downloads */}
              <div className="pt-2 border-t border-slate-800">
                <div className="flex items-center gap-1.5 text-xs text-slate-400 font-semibold mb-2.5">
                  <FileSpreadsheet size={15} className="text-emerald-400" />
                  <span>Direct Excel / CSV Exports:</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
                  <button
                    onClick={() => handleDownloadCSV('all')}
                    className="py-2.5 px-4 bg-emerald-600 hover:bg-emerald-500 active:scale-[0.99] text-white rounded-xl text-xs sm:text-sm font-extrabold shadow-lg shadow-emerald-600/20 flex items-center justify-center gap-2 transition-all cursor-pointer"
                  >
                    <Download size={15} />
                    <span>Download ALL ({registrations.length})</span>
                  </button>

                  <button
                    onClick={() => handleDownloadCSV('1st year')}
                    className="py-2.5 px-4 bg-blue-600 hover:bg-blue-500 active:scale-[0.99] text-white rounded-xl text-xs sm:text-sm font-bold shadow-lg shadow-blue-600/20 flex items-center justify-center gap-2 transition-all cursor-pointer"
                  >
                    <Download size={15} />
                    <span>Download 1st Year</span>
                  </button>

                  <button
                    onClick={() => handleDownloadCSV('2nd year')}
                    className="py-2.5 px-4 bg-purple-600 hover:bg-purple-500 active:scale-[0.99] text-white rounded-xl text-xs sm:text-sm font-bold shadow-lg shadow-purple-600/20 flex items-center justify-center gap-2 transition-all cursor-pointer"
                  >
                    <Download size={15} />
                    <span>Download 2nd Year</span>
                  </button>

                  <button
                    onClick={() => handleDownloadCSV('3rd year')}
                    className="py-2.5 px-4 bg-amber-600 hover:bg-amber-500 active:scale-[0.99] text-white rounded-xl text-xs sm:text-sm font-bold shadow-lg shadow-amber-600/20 flex items-center justify-center gap-2 transition-all cursor-pointer"
                  >
                    <Download size={15} />
                    <span>Download 3rd Year</span>
                  </button>
                </div>
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
                    {/* Status Filter */}
                    <select
                      value={selectedStatus}
                      onChange={(e) => setSelectedStatus(e.target.value)}
                      className="px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-brand-500 cursor-pointer"
                    >
                      <option value="all">All Statuses</option>
                      <option value="VERIFIED">Verified</option>
                      <option value="PENDING">Pending Verification</option>
                      <option value="REJECTED">Rejected</option>
                    </select>

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
              <div className="overflow-x-auto max-h-[620px] overflow-y-auto overscroll-contain relative border-t border-slate-800">
                <table className="w-full text-left text-xs sm:text-sm border-collapse">
                  <thead className="sticky top-0 z-20 bg-slate-950/95 backdrop-blur-md shadow-sm">
                    <tr className="text-slate-400 uppercase tracking-wider text-[11px] border-b border-slate-800">
                      <th className="py-3.5 px-4">Photo</th>
                      <th className="py-3.5 px-4">Reg ID</th>
                      <th className="py-3.5 px-4">Candidate Details</th>
                      <th className="py-3.5 px-4">Year & Branch</th>
                      <th className="py-3.5 px-4">Contact</th>
                      <th className="py-3.5 px-4">UTR & UPI</th>
                      <th className="py-3.5 px-4">Fee</th>
                      <th className="py-3.5 px-4">Status</th>
                      <th className="py-3.5 px-4">Drive Folder</th>
                      <th className="py-3.5 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/80">
                    {filteredRegistrations.length === 0 ? (
                      <tr>
                        <td colSpan={10} className="py-12 text-center text-slate-500">
                          <Users size={32} className="mx-auto mb-2 opacity-30" />
                          <p className="font-semibold">No registration records found.</p>
                          <p className="text-xs text-slate-600 mt-0.5">
                            {registrations.length === 0 ? 'Database is currently empty and fresh.' : 'Try adjusting your search filters.'}
                          </p>
                        </td>
                      </tr>
                    ) : (
                      filteredRegistrations.map((cand) => {
                        const statusUpper = (cand.status || 'PENDING_VERIFICATION').toUpperCase();
                        const isVerified = statusUpper === 'VERIFIED';
                        const isRejected = statusUpper === 'REJECTED';

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
                                  className="text-slate-500 hover:text-white transition-colors cursor-pointer"
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
                                  className="text-slate-500 hover:text-white transition-colors cursor-pointer"
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
                              ₹{cand.amount || (cand.year === '1st year' ? 300 : cand.year === '2nd year' ? 225 : 150)}
                            </td>

                            {/* Verification Status */}
                            <td className="py-3 px-4">
                              <span
                                className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold ${
                                  isVerified
                                    ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                                    : isRejected
                                    ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                                    : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                                }`}
                              >
                                {isVerified ? (
                                  <>
                                    <CheckCircle2 size={11} />
                                    <span>Verified</span>
                                  </>
                                ) : isRejected ? (
                                  <>
                                    <XCircle size={11} />
                                    <span>Rejected</span>
                                  </>
                                ) : (
                                  <>
                                    <Clock size={11} />
                                    <span>Pending</span>
                                  </>
                                )}
                              </span>
                            </td>

                            {/* Google Drive Personal Folder */}
                            <td className="py-3 px-4">
                              {cand.memberFolderUrl ? (
                                <a
                                  href={cand.memberFolderUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center gap-1.5 px-2 py-1 rounded-lg text-xs font-semibold bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 border border-blue-500/20 transition-all cursor-pointer"
                                  title="Open Drive Folder"
                                >
                                  <Folder size={12} />
                                  <span>Drive</span>
                                  <ExternalLink size={10} />
                                </a>
                              ) : (
                                <span className="inline-flex items-center gap-1 text-[11px] text-slate-500">
                                  <CheckCircle2 size={11} className="text-emerald-500" />
                                  <span>Synced</span>
                                </span>
                              )}
                            </td>

                            {/* Actions */}
                            <td className="py-3 px-4 text-right space-x-1.5">
                              <button
                                onClick={() => setSelectedCandidate(cand)}
                                className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer inline-flex items-center"
                                title="View Details & Proof"
                              >
                                <Eye size={14} />
                              </button>

                              {!isVerified && (
                                <button
                                  onClick={() => handleUpdateStatus(cand.regId, 'VERIFIED')}
                                  disabled={isUpdatingStatus}
                                  className="p-1.5 rounded-lg bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-400 border border-emerald-500/30 transition-colors cursor-pointer inline-flex items-center"
                                  title="Approve & Mark Verified"
                                >
                                  <Check size={14} />
                                </button>
                              )}

                              <button
                                onClick={() => setDeleteCandidateTarget(cand)}
                                className="p-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 transition-colors cursor-pointer inline-flex items-center"
                                title="Delete Registration"
                              >
                                <Trash2 size={14} />
                              </button>
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
        )}

        {/* =========================================================================
            TAB 2: NEWSLETTER SUBSCRIBERS
           ========================================================================= */}
        {activeTab === 'subscribers' && (
          <section className="bg-slate-900 border border-slate-800 rounded-2xl sm:rounded-3xl shadow-xl overflow-hidden space-y-4 p-5 sm:p-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-slate-800 pb-4">
              <div>
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <Mail className="text-cyan-400" size={20} />
                  <span>Newsletter Subscribers ({subscribers.length})</span>
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Live email list subscribed via website footer and registration channels.
                </p>
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                <div className="relative flex-1 sm:w-64">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={14} />
                  <input
                    type="text"
                    placeholder="Search subscribers..."
                    value={subscriberSearch}
                    onChange={(e) => setSubscriberSearch(e.target.value)}
                    className="w-full pl-8 pr-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  />
                </div>

                <button
                  onClick={handleDownloadSubscribersCSV}
                  className="py-2 px-3.5 bg-cyan-600 hover:bg-cyan-500 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-md shadow-cyan-600/20 shrink-0"
                >
                  <Download size={14} />
                  <span>Export CSV</span>
                </button>
              </div>
            </div>

            <div className="overflow-x-auto max-h-[500px] overflow-y-auto">
              <table className="w-full text-left text-xs sm:text-sm">
                <thead>
                  <tr className="text-slate-400 uppercase text-[11px] border-b border-slate-800 pb-2">
                    <th className="py-2.5 px-4">#</th>
                    <th className="py-2.5 px-4">Subscriber Email</th>
                    <th className="py-2.5 px-4">Source</th>
                    <th className="py-2.5 px-4">Subscribed At</th>
                    <th className="py-2.5 px-4">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {filteredSubscribers.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-8 text-center text-slate-500 text-xs">
                        No newsletter subscribers found.
                      </td>
                    </tr>
                  ) : (
                    filteredSubscribers.map((sub, idx) => (
                      <tr key={sub.email || idx} className="hover:bg-slate-800/40 transition-colors">
                        <td className="py-3 px-4 text-slate-500 font-mono">{idx + 1}</td>
                        <td className="py-3 px-4 font-medium text-white flex items-center gap-2">
                          <Mail size={14} className="text-slate-500" />
                          <span>{sub.email}</span>
                        </td>
                        <td className="py-3 px-4 text-slate-400 font-mono text-xs">
                          {sub.source || 'website_footer'}
                        </td>
                        <td className="py-3 px-4 text-slate-400 text-xs">
                          {sub.formattedDate || sub.subscribedAt || 'Recently'}
                        </td>
                        <td className="py-3 px-4">
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                            Active
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </section>
        )}

        {/* =========================================================================
            TAB 3: MONGODB ATLAS & UPTIME MONITOR
           ========================================================================= */}
        {activeTab === 'database' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Cluster Card */}
              <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Cluster Status</span>
                  <Database size={18} className="text-emerald-400" />
                </div>
                <div>
                  <h4 className="text-xl font-extrabold text-white flex items-center gap-2">
                    <span>MongoDB Atlas</span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                      Live
                    </span>
                  </h4>
                  <p className="text-xs text-slate-400 mt-1 font-mono">
                    DB: {databaseInfo?.databaseName || 'cdd_portal'}
                  </p>
                </div>
                <div className="text-xs text-slate-400 space-y-1 pt-2 border-t border-slate-800">
                  <p className="flex justify-between">
                    <span>Replica Set:</span>
                    <span className="font-mono text-slate-200">atlas-d12wxa-shard-0</span>
                  </p>
                  <p className="flex justify-between">
                    <span>Shard Nodes:</span>
                    <span className="text-slate-200 font-semibold">3 Dedicated Shards</span>
                  </p>
                  <p className="flex justify-between">
                    <span>ACID Transactions:</span>
                    <span className="text-emerald-400 font-semibold">Supported & Active</span>
                  </p>
                </div>
              </div>

              {/* Latency & Connectivity */}
              <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Ping & Latency</span>
                  <Activity size={18} className="text-brand-400" />
                </div>
                <div>
                  <h4 className="text-2xl font-extrabold text-brand-400">
                    {databaseInfo?.latencyMs ? `${databaseInfo.latencyMs} ms` : 'Active'}
                  </h4>
                  <p className="text-xs text-slate-400 mt-1">Direct Shard Seedlist (DNS SRV bypassed)</p>
                </div>
                <div className="pt-2 border-t border-slate-800">
                  <button
                    onClick={handleSendHeartbeat}
                    disabled={isPingingHeartbeat}
                    className="w-full py-2 bg-brand-600 hover:bg-brand-500 text-white rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-60"
                  >
                    <Send size={13} className={isPingingHeartbeat ? 'animate-pulse' : ''} />
                    <span>{isPingingHeartbeat ? 'Recording...' : 'Send Heartbeat Ping'}</span>
                  </button>
                </div>
              </div>

              {/* Active Collections */}
              <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Collections</span>
                  <Server size={18} className="text-purple-400" />
                </div>
                <div className="space-y-1.5 text-xs">
                  <div className="flex justify-between items-center p-2 bg-slate-950/60 rounded-lg">
                    <span className="font-mono text-slate-300">club_registrations</span>
                    <span className="font-bold text-white">{registrations.length} docs</span>
                  </div>
                  <div className="flex justify-between items-center p-2 bg-slate-950/60 rounded-lg">
                    <span className="font-mono text-slate-300">transaction_audit_logs</span>
                    <span className="font-bold text-emerald-400">ACID Audits</span>
                  </div>
                  <div className="flex justify-between items-center p-2 bg-slate-950/60 rounded-lg">
                    <span className="font-mono text-slate-300">uptime_heartbeats</span>
                    <span className="font-bold text-cyan-400">30d TTL</span>
                  </div>
                  <div className="flex justify-between items-center p-2 bg-slate-950/60 rounded-lg">
                    <span className="font-mono text-slate-300">newsletter_subscribers</span>
                    <span className="font-bold text-purple-400">{subscribers.length} docs</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Recent Heartbeats Table */}
            <section className="bg-slate-900 border border-slate-800 rounded-2xl sm:rounded-3xl p-5 shadow-xl space-y-3">
              <div className="flex justify-between items-center border-b border-slate-800 pb-3">
                <div>
                  <h4 className="text-base font-bold text-white flex items-center gap-2">
                    <Activity size={18} className="text-emerald-400" />
                    <span>Recent Heartbeat Logs (Atlas Uptime)</span>
                  </h4>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Cron and heartbeat pings keeping the database connection warm and monitored.
                  </p>
                </div>
                <button
                  onClick={() => fetchDashboardData()}
                  className="px-3 py-1.5 rounded-lg bg-slate-800 text-xs font-semibold hover:bg-slate-700 text-slate-300 cursor-pointer"
                >
                  Refresh Logs
                </button>
              </div>

              <div className="overflow-x-auto max-h-72 overflow-y-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="text-slate-400 uppercase text-[10px] border-b border-slate-800 pb-1">
                      <th className="py-2 px-3">Timestamp</th>
                      <th className="py-2 px-3">Source</th>
                      <th className="py-2 px-3">Status</th>
                      <th className="py-2 px-3">Latency</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800">
                    {recentHeartbeats.length === 0 ? (
                      <tr>
                        <td colSpan={4} className="py-6 text-center text-slate-500">
                          No recent heartbeats logged yet. Click "Send Heartbeat Ping" above to record one.
                        </td>
                      </tr>
                    ) : (
                      recentHeartbeats.map((hb, i) => (
                        <tr key={i} className="hover:bg-slate-800/40">
                          <td className="py-2.5 px-3 font-mono text-slate-300">
                            {hb.timestamp ? new Date(hb.timestamp).toLocaleString() : 'N/A'}
                          </td>
                          <td className="py-2.5 px-3 font-mono text-cyan-400">
                            {hb.source || 'cron'}
                          </td>
                          <td className="py-2.5 px-3">
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/10 text-emerald-400">
                              {hb.status || 'ALIVE'}
                            </span>
                          </td>
                          <td className="py-2.5 px-3 font-mono text-slate-400">
                            {hb.latencyMs ? `${hb.latencyMs} ms` : 'OK'}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </section>
          </div>
        )}

        {/* =========================================================================
            TAB 4: PAYMENT, UPI & CLUB SETTINGS
           ========================================================================= */}
        {activeTab === 'merchant' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Payment Gateway & UPI */}
            <section className="bg-slate-900 border border-slate-800 rounded-2xl sm:rounded-3xl p-6 shadow-xl space-y-4">
              <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
                <CreditCard className="text-emerald-400" size={20} />
                <h3 className="text-base sm:text-lg font-bold text-white">Official UPI Configuration</h3>
              </div>

              <div className="space-y-3 text-xs">
                <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800">
                  <span className="text-slate-400 block mb-1">BharatPe Official Merchant UPI:</span>
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-sm text-emerald-400 font-bold">
                      {merchantConfig?.upiId || 'BHARATPE2O0M0B8D0A10111@unitype'}
                    </span>
                    <button
                      onClick={() => copyToClipboard(merchantConfig?.upiId || 'BHARATPE2O0M0B8D0A10111@unitype', 'Merchant UPI')}
                      className="text-slate-400 hover:text-white"
                    >
                      <Copy size={14} />
                    </button>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-1">Payee: {merchantConfig?.payeeName || 'BharatPe Merchant'}</p>
                </div>

                <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800">
                  <span className="text-slate-400 block mb-1">Instant Tap-to-Pay UPI Handle:</span>
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-sm text-cyan-400 font-bold">
                      {merchantConfig?.tapToPayUpi || '8480496340-2@ybl'}
                    </span>
                    <button
                      onClick={() => copyToClipboard(merchantConfig?.tapToPayUpi || '8480496340-2@ybl', 'Tap-to-Pay UPI')}
                      className="text-slate-400 hover:text-white"
                    >
                      <Copy size={14} />
                    </button>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-1">Payee: {merchantConfig?.tapToPayName || 'Ayushman Patra'}</p>
                </div>

                <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800">
                  <span className="text-slate-400 block mb-1">Official WhatsApp Recruitment Cohort:</span>
                  <div className="flex items-center justify-between">
                    <a
                      href={merchantConfig?.whatsappGroup || DEFAULT_WHATSAPP_GROUP}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-mono text-xs text-brand-400 hover:underline truncate max-w-[280px]"
                    >
                      {merchantConfig?.whatsappGroup || DEFAULT_WHATSAPP_GROUP}
                    </a>
                    <a
                      href={merchantConfig?.whatsappGroup || DEFAULT_WHATSAPP_GROUP}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-1 rounded bg-emerald-600/20 text-emerald-400 text-xs"
                    >
                      <ExternalLink size={13} />
                    </a>
                  </div>
                </div>
              </div>
            </section>

            {/* Fee Tiers & Integration Status */}
            <section className="bg-slate-900 border border-slate-800 rounded-2xl sm:rounded-3xl p-6 shadow-xl space-y-4">
              <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
                <GraduationCap className="text-purple-400" size={20} />
                <h3 className="text-base sm:text-lg font-bold text-white">Membership Fee Tiers & Rules</h3>
              </div>

              <div className="space-y-2.5 text-xs">
                <div className="flex justify-between items-center p-3 bg-slate-950/60 border border-blue-500/20 rounded-xl">
                  <div>
                    <span className="font-bold text-white block">1st Year Students</span>
                    <span className="text-slate-400 text-[11px]">Valid for full 4-year tenure</span>
                  </div>
                  <span className="font-mono text-base font-extrabold text-blue-400">₹300</span>
                </div>

                <div className="flex justify-between items-center p-3 bg-slate-950/60 border border-purple-500/20 rounded-xl">
                  <div>
                    <span className="font-bold text-white block">2nd Year Students</span>
                    <span className="text-slate-400 text-[11px]">Valid for 3-year tenure</span>
                  </div>
                  <span className="font-mono text-base font-extrabold text-purple-400">₹225</span>
                </div>

                <div className="flex justify-between items-center p-3 bg-slate-950/60 border border-amber-500/20 rounded-xl">
                  <div>
                    <span className="font-bold text-white block">3rd Year Students</span>
                    <span className="text-slate-400 text-[11px]">Valid for 2-year tenure</span>
                  </div>
                  <span className="font-mono text-base font-extrabold text-amber-400">₹150</span>
                </div>
              </div>

              <div className="p-3 bg-slate-950/40 rounded-xl border border-slate-800 text-[11px] text-slate-400 space-y-1">
                <p className="font-bold text-slate-300">Third-Party Integrations Status:</p>
                <p className="flex justify-between">
                  <span>Google Apps Script Webhook:</span>
                  <span className="text-emerald-400 font-semibold">Active & Synced</span>
                </p>
                <p className="flex justify-between">
                  <span>Gmail SMTP Delivery:</span>
                  <span className="text-emerald-400 font-semibold">Configured</span>
                </p>
                <p className="flex justify-between">
                  <span>Admin Alert Email:</span>
                  <span className="text-slate-300 font-mono">{merchantConfig?.adminNotificationEmail || 'ideainnovationcell.pmec@gmail.com'}</span>
                </p>
              </div>
            </section>
          </div>
        )}

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
                  <span className="font-bold text-white">
                    ₹{selectedCandidate.amount || (selectedCandidate.year === '1st year' ? 300 : selectedCandidate.year === '2nd year' ? 225 : 150)}
                  </span>
                </div>

                <div className="flex justify-between py-1 border-b border-slate-800">
                  <span className="text-slate-400">Submission Timestamp:</span>
                  <span className="text-slate-300">
                    {selectedCandidate.formattedDate || selectedCandidate.createdAt || 'N/A'}
                  </span>
                </div>

                <div className="flex justify-between py-1 border-b border-slate-800">
                  <span className="text-slate-400">Current Status:</span>
                  <div className="flex items-center gap-2">
                    <select
                      value={(selectedCandidate.status || 'PENDING_VERIFICATION').toUpperCase()}
                      onChange={(e) => handleUpdateStatus(selectedCandidate.regId, e.target.value)}
                      disabled={isUpdatingStatus}
                      className="px-2.5 py-1 bg-slate-800 border border-slate-700 rounded-lg text-xs font-bold text-white focus:outline-none"
                    >
                      <option value="VERIFIED">Verified</option>
                      <option value="PENDING_VERIFICATION">Pending Verification</option>
                      <option value="REJECTED">Rejected</option>
                    </select>
                  </div>
                </div>

                <div className="flex justify-between py-1">
                  <span className="text-slate-400">WhatsApp Group:</span>
                  <span className="inline-flex items-center gap-1 text-emerald-400 font-bold">
                    <CheckCircle2 size={13} /> Added to Official Group
                  </span>
                </div>
              </div>

              {/* Google Drive Personal Folder Card */}
              <div className="p-4 bg-blue-950/30 border border-blue-500/30 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center shrink-0">
                    <Folder size={20} />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white flex items-center gap-1.5">
                      <span>Google Drive Member Folder</span>
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-300">
                        Cloud Synced
                      </span>
                    </h4>
                    <p className="text-[11px] text-slate-400">
                      Stores official student portrait photo & payment receipt screenshot proof in Google Drive.
                    </p>
                  </div>
                </div>
                {selectedCandidate.memberFolderUrl ? (
                  <a
                    href={selectedCandidate.memberFolderUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold transition-all inline-flex items-center gap-1.5 cursor-pointer shadow-md shadow-blue-600/20 shrink-0"
                  >
                    <Folder size={14} />
                    <span>Open in Drive</span>
                    <ExternalLink size={12} />
                  </a>
                ) : (
                  <span className="text-xs text-slate-500 italic">
                    Synced in IIC_PMEC_Recruitment_2026
                  </span>
                )}
              </div>

              {/* WhatsApp & Quick Action Buttons */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-3 border-t border-slate-800">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleUpdateStatus(selectedCandidate.regId, 'VERIFIED')}
                    disabled={isUpdatingStatus}
                    className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1 cursor-pointer"
                  >
                    <CheckCheck size={14} />
                    <span>Mark Verified</span>
                  </button>

                  <button
                    onClick={() => handleUpdateStatus(selectedCandidate.regId, 'REJECTED')}
                    disabled={isUpdatingStatus}
                    className="px-3 py-1.5 bg-rose-600/20 hover:bg-rose-600/30 text-rose-400 border border-rose-500/30 rounded-xl text-xs font-bold transition-all flex items-center gap-1 cursor-pointer"
                  >
                    <XCircle size={14} />
                    <span>Reject</span>
                  </button>
                </div>

                <div className="flex items-center gap-2 justify-end">
                  <a
                    href={`https://wa.me/91${selectedCandidate.phone?.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(`Hello ${selectedCandidate.name}! Welcome to Idea and Innovation Cell (IIC PMEC). Your registration (${selectedCandidate.regId}) is confirmed!`)}`}
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

      {/* =========================================================================
          CONFIRM DELETE CANDIDATE MODAL
         ========================================================================= */}
      <AnimatePresence>
        {deleteCandidateTarget && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-slate-900 border border-rose-500/40 rounded-3xl w-full max-w-md p-6 relative shadow-2xl space-y-4"
            >
              <div className="flex items-center gap-3 text-rose-400">
                <AlertTriangle size={24} />
                <h3 className="text-lg font-bold text-white">Delete Registration?</h3>
              </div>
              <p className="text-xs text-slate-300">
                Are you sure you want to permanently remove candidate{' '}
                <strong className="text-white font-mono">{deleteCandidateTarget.name}</strong> ({deleteCandidateTarget.regId})?
                This will purge their record from MongoDB Atlas and local archives.
              </p>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  onClick={() => setDeleteCandidateTarget(null)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleDeleteCandidate(deleteCandidateTarget.regId)}
                  className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-bold cursor-pointer"
                >
                  Delete Record
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
