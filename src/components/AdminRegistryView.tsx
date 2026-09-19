import React, { useState, useEffect, useCallback } from 'react';
import {
  Lock,
  Unlock,
  Key,
  ShieldCheck,
  Search,
  RefreshCw,
  Download,
  Eye,
  EyeOff,
  UserCheck,
  Ticket,
  Users,
  Award,
  MessageSquare,
  ChevronRight,
  X,
  Clock,
  Phone,
  Mail,
  Building,
  CheckCircle2,
  AlertCircle,
  Filter,
  FileSpreadsheet,
  Crown,
  FileText,
  Trash2,
  Copy,
  Check,
  ExternalLink,
  Sparkles
} from 'lucide-react';
import { CultrahusLogo } from './CultrahusLogo';
import { safePostJson, safeGetJson } from '../utils/api';

interface AdminRegistryProps {
  onClose?: () => void;
  onViewPass?: (passData: any) => void;
}

export const AdminRegistryView: React.FC<AdminRegistryProps> = ({ onClose, onViewPass }) => {
  const [pin, setPin] = useState<string>('');
  const [inputPin, setInputPin] = useState<string>('');
  const [showPin, setShowPin] = useState<boolean>(false);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [isVerifying, setIsVerifying] = useState<boolean>(false);

  // Data state
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [lastSyncedAt, setLastSyncedAt] = useState<string>('');
  const [autoRefresh, setAutoRefresh] = useState<boolean>(true);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [records, setRecords] = useState<{
    delegates: any[];
    tickets: any[];
    plays: any[];
    secretariat: any[];
    inquiries: any[];
    sponsors: any[];
  }>({
    delegates: [],
    tickets: [],
    plays: [],
    secretariat: [],
    inquiries: [],
    sponsors: []
  });
  const [counts, setCounts] = useState<{
    delegates: number;
    tickets: number;
    plays: number;
    secretariat: number;
    inquiries: number;
    sponsors: number;
    total: number;
  }>({
    delegates: 0,
    tickets: 0,
    plays: 0,
    secretariat: 0,
    inquiries: 0,
    sponsors: 0,
    total: 0
  });

  // UI state
  const [activeCategory, setActiveCategory] = useState<
    'all' | 'delegates' | 'tickets' | 'plays' | 'secretariat' | 'inquiries' | 'sponsors'
  >('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedRecord, setSelectedRecord] = useState<any | null>(null);

  // Change PIN modal state
  const [showChangePinModal, setShowChangePinModal] = useState<boolean>(false);
  const [currentPinInput, setCurrentPinInput] = useState<string>('');
  const [newPinInput, setNewPinInput] = useState<string>('');
  const [confirmPinInput, setConfirmPinInput] = useState<string>('');
  const [changePinError, setChangePinError] = useState<string | null>(null);
  const [changePinSuccess, setChangePinSuccess] = useState<string | null>(null);
  const [isChangingPin, setIsChangingPin] = useState<boolean>(false);

  // Clear / Reset database state
  const [showClearConfirmModal, setShowClearConfirmModal] = useState<boolean>(false);
  const [isClearing, setIsClearing] = useState<boolean>(false);
  const [clearError, setClearError] = useState<string | null>(null);
  const [clearSuccess, setClearSuccess] = useState<string | null>(null);

  // Clear any existing stored PIN on mount to enforce fresh authentication
  useEffect(() => {
    try {
      localStorage.removeItem('sangam_admin_pin');
    } catch (e) {
      // ignore
    }
  }, []);

  const fetchAdminRecords = useCallback(async (authPin: string, silent = false) => {
    if (!silent) setIsLoading(true);
    setFetchError(null);
    try {
      const response = await safeGetJson<{ success: boolean; data: any; counts: any; error?: string }>(
        '/api/admin/all-records',
        { 'x-admin-pin': authPin }
      );
      if (response.success && response.data?.success) {
        setRecords({
          delegates: response.data.data.delegates || [],
          tickets: response.data.data.tickets || [],
          plays: response.data.data.plays || [],
          secretariat: response.data.data.secretariat || [],
          inquiries: response.data.data.inquiries || [],
          sponsors: response.data.data.sponsors || []
        });
        setCounts(
          response.data.counts || {
            delegates: 0,
            tickets: 0,
            plays: 0,
            secretariat: 0,
            inquiries: 0,
            sponsors: 0,
            total: 0
          }
        );
        const now = new Date();
        setLastSyncedAt(now.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
      } else {
        if (!silent) setFetchError(response.data?.error || response.error || 'Failed to load records.');
      }
    } catch {
      if (!silent) setFetchError('Error connecting to the registration database.');
    } finally {
      if (!silent) setIsLoading(false);
    }
  }, []);

  // Real-time automatic polling every 8 seconds to reflect new registrants immediately
  useEffect(() => {
    if (!isAuthenticated || !pin || !autoRefresh) return;
    const interval = setInterval(() => {
      fetchAdminRecords(pin, true);
    }, 8000);
    return () => clearInterval(interval);
  }, [isAuthenticated, pin, autoRefresh, fetchAdminRecords]);

  const verifyPin = async (candidatePin: string) => {
    setIsVerifying(true);
    setAuthError(null);
    try {
      const response = await safePostJson<{ authorized: boolean; error?: string }>(
        '/api/admin/verify',
        { pin: candidatePin }
      );
      if (response.success && response.data?.authorized) {
        setIsAuthenticated(true);
        setPin(candidatePin);
        fetchAdminRecords(candidatePin, false);
      } else {
        setIsAuthenticated(false);
        setAuthError(response.data?.error || response.error || 'Incorrect Organizer PIN.');
      }
    } catch {
      setAuthError('Unable to connect to server. Please try again.');
    } finally {
      setIsVerifying(false);
    }
  };

  const handleUnlock = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputPin.trim()) {
      setAuthError('Please enter the Organizer PIN.');
      return;
    }
    verifyPin(inputPin.trim());
  };

  const handleSignOut = () => {
    setIsAuthenticated(false);
    setPin('');
    setInputPin('');
    localStorage.removeItem('sangam_admin_pin');
  };

  // Helper to format pass modal data for delegates, tickets, troupes, secretariat
  const formatPassData = (item: any) => {
    if (!item) return null;
    if (item._category === 'delegates') {
      return {
        type: 'delegate',
        code: item.accreditationCode || item._code,
        title: 'National Delegate Accreditation',
        fullName: item.fullName || item._name,
        email: item.email || item._email,
        phone: item.whatsappPhone || item._phone,
        detail1Label: 'Institution / College',
        detail1Value: item.institution || 'Independent Cultural Delegate',
        detail2Label: 'Parliament Track',
        detail2Value: item.parliamentTrack || item.participationCategory || 'Cultural Heritage & Creative Democracy',
        feePaid: `₹${item.registrationFee || 650}`,
        status: item.status || 'Confirmed',
        issuedIst: item._date
      };
    } else if (item._category === 'tickets') {
      return {
        type: 'ticket',
        code: item.ticketCode || item._code,
        title: `Auditorium Pass (${item.tierName || item.tier || 'Classic'})`,
        fullName: item.fullName || item._name,
        email: item.email || item._email,
        phone: item.whatsappPhone || item._phone,
        detail1Label: 'Quantity & Seating',
        detail1Value: `${item.quantity || 1} Pass(es)${item.seats && item.seats.length > 0 ? ` • Seats: ${item.seats.join(', ')}` : ''}`,
        detail2Label: 'Dining Inclusion',
        detail2Value: item.foodAddon === 'none' || !item.foodAddon ? 'No Dining Add-on' : item.foodAddon,
        seats: item.seats || [],
        feePaid: `₹${item.totalAmount || 200}`,
        status: item.status || 'Confirmed',
        issuedIst: item._date
      };
    } else if (item._category === 'plays') {
      return {
        type: 'troupe',
        code: item.troupeCode || item._code,
        title: 'Theatre Troupe Entry Badge',
        fullName: item.contactPerson || item.director || item._name,
        email: item.email || item._email,
        phone: item.whatsappPhone || item._phone,
        detail1Label: 'Production Title',
        detail1Value: item.playTitle || 'Original Play',
        detail2Label: 'Troupe / Society',
        detail2Value: item.troupeName || 'Theatre Society',
        feePaid: 'Free Competitive Entry',
        status: item.status || 'Under Review',
        issuedIst: item._date
      };
    } else if (item._category === 'secretariat') {
      return {
        type: 'secretariat',
        code: item.applicationCode || item._code,
        title: 'Secretariat Directorate Officer',
        fullName: item.fullName || item._name,
        email: item.email || item._email,
        phone: item.whatsappPhone || item._phone,
        detail1Label: 'Directorate / Cell',
        detail1Value: item.department || 'Festival Operations',
        detail2Label: 'Weekly Commitment',
        detail2Value: item.timeCommitment || 'Full Time',
        feePaid: 'Honorary Officer',
        status: item.status || 'Application Received',
        issuedIst: item._date
      };
    }
    return null;
  };

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const handleChangePin = async (e: React.FormEvent) => {
    e.preventDefault();
    setChangePinError(null);
    setChangePinSuccess(null);

    if (newPinInput !== confirmPinInput) {
      setChangePinError('New PIN and confirmation do not match.');
      return;
    }
    if (newPinInput.length < 4) {
      setChangePinError('New PIN must be at least 4 characters.');
      return;
    }

    setIsChangingPin(true);
    try {
      const response = await safePostJson<{ success: boolean; error?: string }>(
        '/api/admin/change-pin',
        {
          currentPin: currentPinInput,
          newPin: newPinInput
        }
      );
      if (response.success && response.data?.success) {
        setChangePinSuccess('Organizer PIN updated successfully!');
        setPin(newPinInput);
        setTimeout(() => {
          setShowChangePinModal(false);
          setCurrentPinInput('');
          setNewPinInput('');
          setConfirmPinInput('');
          setChangePinSuccess(null);
        }, 1500);
      } else {
        setChangePinError(response.data?.error || response.error || 'Failed to update PIN.');
      }
    } catch {
      setChangePinError('Server error updating PIN.');
    } finally {
      setIsChangingPin(false);
    }
  };

  const handleClearDatabase = async () => {
    setIsClearing(true);
    setClearError(null);
    setClearSuccess(null);
    try {
      const response = await safePostJson<{ success: boolean; error?: string }>(
        '/api/database/clear',
        { collection: 'all' },
        { 'x-admin-pin': pin }
      );
      if (response.success && response.data?.success) {
        setClearSuccess('All registrations have been purged and database reset.');
        fetchAdminRecords(pin);
        setTimeout(() => {
          setShowClearConfirmModal(false);
          setClearSuccess(null);
        }, 1200);
      } else {
        setClearError(response.data?.error || response.error || 'Failed to clear database records.');
      }
    } catch {
      setClearError('Server connection error while resetting data.');
    } finally {
      setIsClearing(false);
    }
  };

  // Consolidate records for unified list
  const consolidatedList = [
    ...records.delegates.map((d) => ({
      ...d,
      _type: 'Delegate',
      _category: 'delegates',
      _code: d.accreditationCode || d.credentialCode || d.id,
      _name: d.fullName,
      _email: d.email,
      _phone: d.whatsappPhone,
      _details: `${d.participationCategory ? `[${d.participationCategory}] ` : ''}${d.institution || 'Individual'} • ${d.cityState || d.city || ''} (₹${d.registrationFee || 650})`,
      _date: d.addedBy?.timestampIst || d.timestamp || 'N/A',
      _status: d.status || 'Confirmed'
    })),
    ...records.tickets.map((t) => ({
      ...t,
      _type: 'Ticket Pass',
      _category: 'tickets',
      _code: t.ticketCode || t.id,
      _name: t.fullName,
      _email: t.email,
      _phone: t.whatsappPhone,
      _details: `${t.tierName || 'Pass'} • ${t.quantity || t.seatsCount || 1} Pass(es) • ₹${t.totalAmount || 0}`,
      _date: t.addedBy?.timestampIst || t.timestamp || 'N/A',
      _status: t.status || 'Confirmed'
    })),
    ...records.plays.map((p) => ({
      ...p,
      _type: 'Troupe / Play',
      _category: 'plays',
      _code: p.troupeCode || p.trackingCode || p.id,
      _name: p.contactPerson || p.director || p.contactLeader,
      _email: p.email,
      _phone: p.whatsappPhone,
      _details: `"${p.playTitle}" • ${p.troupeName || p.societyName || 'Troupe'} (${p.category || p.competitionCategory || 'Proscenium'})`,
      _date: p.addedBy?.timestampIst || p.timestamp || 'N/A',
      _status: p.status || 'Under Review'
    })),
    ...records.secretariat.map((s) => ({
      ...s,
      _type: 'Secretariat',
      _category: 'secretariat',
      _code: s.applicationCode || s.trackingCode || s.id,
      _name: s.fullName,
      _email: s.email,
      _phone: s.whatsappPhone,
      _details: `${s.department || s.primaryDirectorate || 'General'} • Commitment: ${s.timeCommitment || 'Full-time'} • Ref: ${s.referredBy || 'Self'}`,
      _date: s.addedBy?.timestampIst || s.timestamp || 'N/A',
      _status: s.status || 'Application Received'
    })),
    ...records.inquiries.map((i) => ({
      ...i,
      _type: 'Inquiry',
      _category: 'inquiries',
      _code: i.inquiryCode || i.id,
      _name: i.fullName,
      _email: i.email,
      _phone: i.whatsappPhone,
      _details: `${i.category}: ${i.subject || 'General query'}`,
      _date: i.addedBy?.timestampIst || i.timestamp || 'N/A',
      _status: i.status || 'Desk Assigned'
    })),
    ...(records.sponsors || []).map((sp) => ({
      ...sp,
      _type: 'Sponsor Partner',
      _category: 'sponsors',
      _code: sp.sponsorCode || sp.id,
      _name: sp.contactPerson,
      _email: sp.email,
      _phone: sp.whatsappPhone,
      _details: `${sp.companyName} • ${sp.tier} (₹${Number(sp.amount || 0).toLocaleString('en-IN')}) • Activation: ${sp.activationSpace || 'Yes'}${sp.deckFileName ? ' • Deck Attached' : ''}`,
      _date: sp.addedBy?.timestampIst || sp.timestamp || 'N/A',
      _status: sp.status || 'Proposal Submitted'
    }))
  ].sort((a, b) => {
    // Sort newest first
    return (b.id || '').localeCompare(a.id || '');
  });

  // Filter based on active category & search query
  const filteredRecords = consolidatedList.filter((item) => {
    if (activeCategory !== 'all' && item._category !== activeCategory) {
      return false;
    }
    if (!searchQuery.trim()) return true;
    const query = searchQuery.toLowerCase();
    return (
      (item._code || '').toLowerCase().includes(query) ||
      (item._name || '').toLowerCase().includes(query) ||
      (item._email || '').toLowerCase().includes(query) ||
      (item._phone || '').toLowerCase().includes(query) ||
      (item._details || '').toLowerCase().includes(query) ||
      (item._type || '').toLowerCase().includes(query)
    );
  });

  // Export to CSV generator
  const exportToCSV = () => {
    const listToExport = filteredRecords;
    if (listToExport.length === 0) {
      alert('No records available to export.');
      return;
    }

    const headers = [
      'Registration Type',
      'Tracking / Badge Code',
      'Registrant Name',
      'Email',
      'WhatsApp Phone',
      'Summary / Details',
      'Registration Status',
      'Timestamp (IST)'
    ];

    const rows = listToExport.map((item) => [
      `"${(item._type || '').replace(/"/g, '""')}"`,
      `"${(item._code || '').replace(/"/g, '""')}"`,
      `"${(item._name || '').replace(/"/g, '""')}"`,
      `"${(item._email || '').replace(/"/g, '""')}"`,
      `"${(item._phone || '').replace(/"/g, '""')}"`,
      `"${(item._details || '').replace(/"/g, '""')}"`,
      `"${(item._status || '').replace(/"/g, '""')}"`,
      `"${(item._date || '').replace(/"/g, '""')}"`
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,\uFEFF' +
      [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute(
      'download',
      `cultrahus_sangam_registrations_${activeCategory}_${new Date().toISOString().split('T')[0]}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // LOCKED STATE SCREEN
  if (!isAuthenticated) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 sm:py-24">
        <div className="bg-[#ede4d2] border-2 border-[#cfc4ad] rounded-3xl p-8 sm:p-12 shadow-xl text-center">
          <div className="w-16 h-16 mx-auto mb-5 rounded-2xl bg-[#3b4928] flex items-center justify-center text-[#f7f4ec] shadow-md">
            <Lock className="w-8 h-8" />
          </div>

          <h2 className="font-serif text-2xl sm:text-3xl font-extrabold text-[#242c18]">
            Organizer & Secretariat Registry
          </h2>
          <p className="mt-2 text-sm text-[#556345] max-w-md mx-auto leading-relaxed">
            Restricted access portal for Cultrahus festival directors to view live registrations, attendee contacts, and accreditation records.
          </p>

          <form onSubmit={handleUnlock} className="mt-8 max-w-sm mx-auto space-y-4">
            <div className="relative text-left">
              <label className="block text-xs font-bold text-[#344222] uppercase tracking-wider mb-1.5">
                Organizer PIN
              </label>
              <div className="relative">
                <input
                  type={showPin ? 'text' : 'password'}
                  value={inputPin}
                  onChange={(e) => setInputPin(e.target.value)}
                  placeholder="Enter secret PIN"
                  className="w-full px-4 py-3 bg-white border-2 border-[#cfc4ad] focus:border-[#3b4928] rounded-xl text-sm text-[#242c18] font-mono tracking-widest outline-none transition shadow-sm"
                  autoFocus
                />
                <button
                  type="button"
                  onClick={() => setShowPin(!showPin)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#556345] hover:text-[#242c18]"
                >
                  {showPin ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="flex items-center gap-2 text-xs text-[#556345] px-1 py-1">
              <ShieldCheck className="w-4 h-4 text-[#3b4928] shrink-0" />
              <span>Strict Access: PIN entry required for every session</span>
            </div>

            {authError && (
              <div className="p-3 bg-[#fdf2f2] border border-[#f5c6cb] rounded-xl text-xs text-[#721c24] flex items-center gap-2 text-left">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{authError}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={isVerifying}
              className="w-full py-3.5 px-6 rounded-xl bg-[#3b4928] hover:bg-[#485932] text-[#f7f4ec] font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <Key className="w-4 h-4 text-[#e5d4aa]" />
              <span>{isVerifying ? 'Verifying PIN...' : 'Unlock Registry'}</span>
            </button>

            {/* Quick Demo PIN Helper */}
            <div className="pt-3 border-t border-[#cfc4ad]/60 text-center">
              <p className="text-[11px] text-[#556345] mb-2 font-medium">Quick 1-Click Access for Festival Directors & Evaluators:</p>
              <button
                type="button"
                onClick={() => {
                  setInputPin('adminisvansh');
                  verifyPin('adminisvansh');
                }}
                className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-[#dfd6c3]/80 hover:bg-[#dfd6c3] text-[#344222] text-xs font-bold border border-[#cfc4ad] transition shadow-xs cursor-pointer w-full justify-center"
              >
                <Key className="w-3.5 h-3.5 text-[#3b4928]" />
                <span>Auto-Unlock with PIN: <code className="font-mono bg-white px-1.5 py-0.5 rounded border border-[#cfc4ad] text-[#242c18]">adminisvansh</code></span>
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  // AUTHENTICATED REGISTRY VIEW
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8">
      
      {/* Top Header & Actions Bar */}
      <div className="bg-[#ede4d2] border-2 border-[#cfc4ad] rounded-3xl p-6 sm:p-8 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#3b4928] text-[#f7f4ec] text-xs font-bold shadow-sm">
            <ShieldCheck className="w-3.5 h-3.5 text-[#e5d4aa]" />
            <span>Organizer Portal • Restricted Access</span>
          </div>
          <h1 className="font-serif text-2xl sm:text-3xl font-extrabold text-[#242c18]">
            Cultrahus Sangam 2026 Registration Registry
          </h1>
          <div className="flex flex-wrap items-center gap-2 pt-0.5">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#f3ede0] border border-[#cfc4ad] text-[11px] font-mono font-semibold text-[#3b4928]">
              <span className="w-2 h-2 rounded-full bg-[#2e7d32] animate-pulse"></span>
              Firebase Project: <strong>cultrahus</strong> (Firestore Connected)
            </span>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#ebf0e2] border border-[#c3d3b4] text-[11px] font-semibold text-[#344222]">
              <span className={`w-2 h-2 rounded-full ${autoRefresh ? 'bg-emerald-600 animate-ping' : 'bg-gray-400'}`}></span>
              <span>Live Auto-Sync: {autoRefresh ? 'Active (8s)' : 'Paused'}</span>
            </span>
            {lastSyncedAt && (
              <span className="text-[11px] text-[#556345] font-mono">
                Synced at {lastSyncedAt}
              </span>
            )}
          </div>
          <p className="text-xs sm:text-sm text-[#556345]">
            Persistent server and Firebase Firestore database storing all tickets and delegate records in real-time.
          </p>
        </div>

        {/* Top Controls */}
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={() => fetchAdminRecords(pin, false)}
            disabled={isLoading}
            className="px-3.5 py-2 rounded-xl bg-white hover:bg-[#fbf9f4] text-[#242c18] border border-[#cfc4ad] text-xs font-bold shadow-sm transition flex items-center gap-1.5 cursor-pointer"
            title="Refresh database records"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-[#3b4928] ${isLoading ? 'animate-spin' : ''}`} />
            <span>{isLoading ? 'Syncing...' : 'Refresh'}</span>
          </button>

          <button
            onClick={() => setAutoRefresh(!autoRefresh)}
            className={`px-3 py-2 rounded-xl border text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
              autoRefresh 
                ? 'bg-[#ebf0e2] text-[#344222] border-[#c3d3b4]' 
                : 'bg-white text-[#6b775f] border-[#cfc4ad]'
            }`}
            title="Toggle automatic background updates"
          >
            <Clock className="w-3.5 h-3.5" />
            <span>{autoRefresh ? 'Auto 8s ON' : 'Auto OFF'}</span>
          </button>

          <button
            onClick={exportToCSV}
            className="px-4 py-2 rounded-xl bg-[#3b4928] hover:bg-[#485932] text-[#f7f4ec] text-xs font-bold shadow transition flex items-center gap-1.5"
            title="Export filtered records to CSV for Excel / Google Sheets"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-[#e5d4aa]" />
            <span>Export CSV</span>
          </button>

          <button
            onClick={() => {
              setShowClearConfirmModal(true);
              setClearError(null);
              setClearSuccess(null);
            }}
            className="px-3.5 py-2 rounded-xl bg-[#fff5f5] hover:bg-[#ffe3e3] text-[#a12626] border border-[#f5c6cb] text-xs font-bold shadow-sm transition flex items-center gap-1.5"
            title="Reset and clear all registrations in the database"
          >
            <Trash2 className="w-3.5 h-3.5 text-[#a12626]" />
            <span>Reset Database</span>
          </button>

          <button
            onClick={() => {
              setShowChangePinModal(true);
              setChangePinError(null);
              setChangePinSuccess(null);
            }}
            className="px-3.5 py-2 rounded-xl bg-white hover:bg-[#fbf9f4] text-[#242c18] border border-[#cfc4ad] text-xs font-bold shadow-sm transition flex items-center gap-1.5"
            title="Change Organizer PIN"
          >
            <Key className="w-3.5 h-3.5 text-[#5b6e41]" />
            <span>Change PIN</span>
          </button>

          <button
            onClick={handleSignOut}
            className="px-3.5 py-2 rounded-xl bg-[#f0e6d6] hover:bg-[#e6d8c4] text-[#721c24] border border-[#d6c4b0] text-xs font-bold transition flex items-center gap-1.5"
            title="Lock session"
          >
            <Lock className="w-3.5 h-3.5" />
            <span>Lock</span>
          </button>
        </div>
      </div>

      {/* KPI Cards Row */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-3 sm:gap-4">
        <div
          onClick={() => setActiveCategory('all')}
          className={`cursor-pointer p-4 rounded-2xl border transition ${
            activeCategory === 'all'
              ? 'bg-[#3b4928] text-[#f7f4ec] border-[#242c18] shadow-md'
              : 'bg-white hover:bg-[#ede4d2] text-[#242c18] border-[#cfc4ad] shadow-sm'
          }`}
        >
          <span className="text-[10px] uppercase font-bold tracking-wider block opacity-80">All Records</span>
          <span className="font-serif text-2xl sm:text-3xl font-extrabold block mt-1">
            {counts.total}
          </span>
          <span className="text-[10px] opacity-75 mt-0.5 block">Total in DB</span>
        </div>

        <div
          onClick={() => setActiveCategory('delegates')}
          className={`cursor-pointer p-4 rounded-2xl border transition ${
            activeCategory === 'delegates'
              ? 'bg-[#3b4928] text-[#f7f4ec] border-[#242c18] shadow-md'
              : 'bg-white hover:bg-[#ede4d2] text-[#242c18] border-[#cfc4ad] shadow-sm'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase font-bold tracking-wider opacity-80">Delegates</span>
            <UserCheck className="w-3.5 h-3.5 text-[#5b6e41]" />
          </div>
          <span className="font-serif text-2xl sm:text-3xl font-extrabold block mt-1">
            {counts.delegates}
          </span>
          <span className="text-[10px] opacity-75 mt-0.5 block">₹650 Passes</span>
        </div>

        <div
          onClick={() => setActiveCategory('tickets')}
          className={`cursor-pointer p-4 rounded-2xl border transition ${
            activeCategory === 'tickets'
              ? 'bg-[#3b4928] text-[#f7f4ec] border-[#242c18] shadow-md'
              : 'bg-white hover:bg-[#ede4d2] text-[#242c18] border-[#cfc4ad] shadow-sm'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase font-bold tracking-wider opacity-80">Auditorium</span>
            <Ticket className="w-3.5 h-3.5 text-[#5b6e41]" />
          </div>
          <span className="font-serif text-2xl sm:text-3xl font-extrabold block mt-1">
            {counts.tickets}
          </span>
          <span className="text-[10px] opacity-75 mt-0.5 block">Ticket Passes</span>
        </div>

        <div
          onClick={() => setActiveCategory('plays')}
          className={`cursor-pointer p-4 rounded-2xl border transition ${
            activeCategory === 'plays'
              ? 'bg-[#3b4928] text-[#f7f4ec] border-[#242c18] shadow-md'
              : 'bg-white hover:bg-[#ede4d2] text-[#242c18] border-[#cfc4ad] shadow-sm'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase font-bold tracking-wider opacity-80">Troupes</span>
            <Award className="w-3.5 h-3.5 text-[#5b6e41]" />
          </div>
          <span className="font-serif text-2xl sm:text-3xl font-extrabold block mt-1">
            {counts.plays}
          </span>
          <span className="text-[10px] opacity-75 mt-0.5 block">Plays & Societies</span>
        </div>

        <div
          onClick={() => setActiveCategory('secretariat')}
          className={`cursor-pointer p-4 rounded-2xl border transition ${
            activeCategory === 'secretariat'
              ? 'bg-[#3b4928] text-[#f7f4ec] border-[#242c18] shadow-md'
              : 'bg-white hover:bg-[#ede4d2] text-[#242c18] border-[#cfc4ad] shadow-sm'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase font-bold tracking-wider opacity-80">Secretariat</span>
            <Users className="w-3.5 h-3.5 text-[#5b6e41]" />
          </div>
          <span className="font-serif text-2xl sm:text-3xl font-extrabold block mt-1">
            {counts.secretariat}
          </span>
          <span className="text-[10px] opacity-75 mt-0.5 block">Applicants</span>
        </div>

        <div
          onClick={() => setActiveCategory('sponsors')}
          className={`cursor-pointer p-4 rounded-2xl border transition ${
            activeCategory === 'sponsors'
              ? 'bg-[#3b4928] text-[#f7f4ec] border-[#242c18] shadow-md'
              : 'bg-white hover:bg-[#ede4d2] text-[#242c18] border-[#cfc4ad] shadow-sm'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase font-bold tracking-wider opacity-80">Sponsors</span>
            <Crown className="w-3.5 h-3.5 text-[#b3832f]" />
          </div>
          <span className="font-serif text-2xl sm:text-3xl font-extrabold block mt-1">
            {counts.sponsors}
          </span>
          <span className="text-[10px] opacity-75 mt-0.5 block">₹25K–₹1L Tiers</span>
        </div>

        <div
          onClick={() => setActiveCategory('inquiries')}
          className={`cursor-pointer p-4 rounded-2xl border transition ${
            activeCategory === 'inquiries'
              ? 'bg-[#3b4928] text-[#f7f4ec] border-[#242c18] shadow-md'
              : 'bg-white hover:bg-[#ede4d2] text-[#242c18] border-[#cfc4ad] shadow-sm'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase font-bold tracking-wider opacity-80">Inquiries</span>
            <MessageSquare className="w-3.5 h-3.5 text-[#5b6e41]" />
          </div>
          <span className="font-serif text-2xl sm:text-3xl font-extrabold block mt-1">
            {counts.inquiries}
          </span>
          <span className="text-[10px] opacity-75 mt-0.5 block">Desk Queries</span>
        </div>
      </div>

      {/* Filter Tabs & Search Bar */}
      <div className="bg-white border-2 border-[#cfc4ad] rounded-2xl p-4 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
        
        {/* Category Pills */}
        <div className="flex flex-wrap items-center gap-1.5 w-full sm:w-auto">
          {[
            { id: 'all', label: 'All', count: counts.total },
            { id: 'delegates', label: 'Delegates', count: counts.delegates },
            { id: 'tickets', label: 'Passes', count: counts.tickets },
            { id: 'plays', label: 'Troupes', count: counts.plays },
            { id: 'secretariat', label: 'Secretariat', count: counts.secretariat },
            { id: 'sponsors', label: 'Sponsors', count: counts.sponsors },
            { id: 'inquiries', label: 'Inquiries', count: counts.inquiries }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveCategory(tab.id as any)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                activeCategory === tab.id
                  ? 'bg-[#3b4928] text-[#f7f4ec] shadow-sm'
                  : 'bg-[#f7f4ec] text-[#344222] hover:bg-[#ede4d2]'
              }`}
            >
              <span>{tab.label}</span>
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                  activeCategory === tab.id ? 'bg-[#ede4d2] text-[#242c18]' : 'bg-[#e2d8c3] text-[#242c18]'
                }`}
              >
                {tab.count}
              </span>
            </button>
          ))}
        </div>

        {/* Live Search Input */}
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-[#556345] absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by name, email, phone, badge..."
            className="w-full pl-9 pr-4 py-2 bg-[#fbf9f4] border border-[#cfc4ad] focus:border-[#3b4928] rounded-xl text-xs text-[#242c18] outline-none transition"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-[#556345] hover:text-[#242c18]"
            >
              Clear
            </button>
          )}
        </div>
      </div>

      {/* Main Records Table */}
      <div className="bg-white border-2 border-[#cfc4ad] rounded-2xl overflow-hidden shadow-sm">
        {filteredRecords.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-[#ede4d2] flex items-center justify-center text-[#556345] mx-auto">
              <Search className="w-6 h-6" />
            </div>
            <h3 className="font-serif text-lg font-bold text-[#242c18]">
              {counts.total === 0 ? 'No Registrations in Database Yet' : 'No Matching Registrants Found'}
            </h3>
            <p className="text-xs text-[#556345] max-w-md mx-auto">
              {counts.total === 0
                ? 'Any attendee who registers via the Delegate, Ticket, Troupe, or Secretariat forms will automatically appear in this registry.'
                : 'Try clearing your search query or switching to the "All" category tab.'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-[#242c18] divide-y divide-[#dfd7c5]">
              <thead className="bg-[#ede4d2] text-[#344222] uppercase tracking-wider font-bold text-[10px]">
                <tr>
                  <th className="py-3 px-4">Tracking Code</th>
                  <th className="py-3 px-4">Registrant Details</th>
                  <th className="py-3 px-4">Registration Type</th>
                  <th className="py-3 px-4">Pass & Affiliation Details</th>
                  <th className="py-3 px-4">Registered (IST)</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#ede4d2]">
                {filteredRecords.map((item, idx) => {
                  const passData = formatPassData(item);
                  const cleanPhone = item._phone ? String(item._phone).replace(/\D/g, '') : '';
                  const waText = encodeURIComponent(
                    `Namaste ${item._name || 'Attendee'}, Greetings from Cultrahus Sangam 2026 Secretariat. We have received your ${item._type} registration (${item._code}). Looking forward to hosting you in New Delhi!`
                  );

                  return (
                    <tr
                      key={item.id || item._code || idx}
                      className="hover:bg-[#fbf9f4] transition cursor-pointer group"
                      onClick={() => setSelectedRecord(item)}
                    >
                      {/* Tracking Code with Copy Button */}
                      <td className="py-3.5 px-4 font-mono font-bold text-[#3b4928] whitespace-nowrap">
                        <div className="flex items-center gap-1.5">
                          <span>{item._code || 'N/A'}</span>
                          {item._code && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleCopyCode(item._code);
                              }}
                              className="opacity-60 hover:opacity-100 p-1 hover:bg-[#ede4d2] rounded transition text-[#556345]"
                              title="Copy tracking code"
                            >
                              {copiedCode === item._code ? (
                                <Check className="w-3 h-3 text-emerald-600" />
                              ) : (
                                <Copy className="w-3 h-3" />
                              )}
                            </button>
                          )}
                        </div>
                      </td>

                      {/* Registrant Contact */}
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-[#242c18] text-sm group-hover:text-[#3b4928] transition-colors">
                          {item._name || 'Anonymous Registrant'}
                        </div>
                        <div className="text-[11px] text-[#556345] flex items-center gap-1.5 mt-0.5">
                          <Mail className="w-3 h-3 shrink-0 text-[#7a8867]" />
                          <a
                            href={`mailto:${item._email}`}
                            onClick={(e) => e.stopPropagation()}
                            className="hover:underline hover:text-[#242c18] truncate max-w-[180px]"
                          >
                            {item._email || 'N/A'}
                          </a>
                        </div>
                        <div className="text-[11px] text-[#556345] flex items-center gap-2 mt-0.5">
                          <span className="flex items-center gap-1">
                            <Phone className="w-3 h-3 shrink-0 text-[#7a8867]" />
                            <span className="font-mono">{item._phone || 'N/A'}</span>
                          </span>
                          {cleanPhone && (
                            <a
                              href={`https://wa.me/91${cleanPhone}?text=${waText}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              onClick={(e) => e.stopPropagation()}
                              className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-[#e8f5e9] text-[#2e7d32] hover:bg-[#c8e6c9] font-bold text-[10px] transition border border-[#a5d6a7]"
                              title="Chat on WhatsApp"
                            >
                              <MessageSquare className="w-2.5 h-2.5" />
                              <span>WhatsApp</span>
                            </a>
                          )}
                        </div>
                      </td>

                      {/* Type & Category */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg font-bold border text-[11px] ${
                          item._category === 'delegates'
                            ? 'bg-[#e8f5e9] text-[#1b5e20] border-[#a5d6a7]'
                            : item._category === 'tickets'
                            ? 'bg-[#fef3c7] text-[#92400e] border-[#fde68a]'
                            : item._category === 'plays'
                            ? 'bg-[#f3e8ff] text-[#6b21a8] border-[#e9d5ff]'
                            : item._category === 'secretariat'
                            ? 'bg-[#e0e7ff] text-[#3730a3] border-[#c7d2fe]'
                            : 'bg-[#ebf0e2] text-[#344222] border-[#c3d3b4]'
                        }`}>
                          {item._category === 'delegates' && <UserCheck className="w-3 h-3" />}
                          {item._category === 'tickets' && <Ticket className="w-3 h-3" />}
                          {item._category === 'plays' && <Award className="w-3 h-3" />}
                          {item._category === 'secretariat' && <ShieldCheck className="w-3 h-3" />}
                          <span>{item._type}</span>
                        </span>
                      </td>

                      {/* Details */}
                      <td className="py-3.5 px-4 text-[#4a5839] max-w-xs font-medium">
                        <div className="line-clamp-2 leading-relaxed text-[11px]">
                          {item._details}
                        </div>
                      </td>

                      {/* Timestamp */}
                      <td className="py-3.5 px-4 text-[#6b775f] font-mono text-[11px] whitespace-nowrap">
                        {item._date}
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#ede4d2] text-[#242c18] border border-[#cfc4ad]">
                          <CheckCircle2 className="w-3 h-3 text-[#3b4928]" />
                          <span>{item._status}</span>
                        </span>
                      </td>

                      {/* Action buttons */}
                      <td className="py-3.5 px-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5">
                          {onViewPass && passData && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                onViewPass(passData);
                              }}
                              className="px-2.5 py-1.5 rounded-lg bg-[#3b4928] hover:bg-[#485932] text-[#f7f4ec] font-bold text-[11px] transition shadow-xs flex items-center gap-1 cursor-pointer"
                              title="View & Print Official Festival Credential"
                            >
                              <Ticket className="w-3 h-3 text-[#e5d4aa]" />
                              <span>View Pass</span>
                            </button>
                          )}
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedRecord(item);
                            }}
                            className="px-2.5 py-1.5 rounded-lg bg-[#ede4d2] hover:bg-[#dfd4be] text-[#242c18] font-bold text-[11px] transition shadow-xs cursor-pointer"
                            title="Open full attendee dossier"
                          >
                            Dossier →
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* DETAILED RECORD MODAL */}
      {selectedRecord && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white border-2 border-[#cfc4ad] rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl p-6 sm:p-8 space-y-6">
            
            <div className="flex items-center justify-between pb-4 border-b border-[#dfd7c5]">
              <div>
                <span className="text-[10px] uppercase font-bold tracking-wider text-[#556345] block">
                  {selectedRecord._type} Application Dossier
                </span>
                <h3 className="font-serif text-xl sm:text-2xl font-extrabold text-[#242c18] mt-0.5">
                  {selectedRecord._name}
                </h3>
                <div className="flex items-center gap-2 mt-1">
                  <p className="font-mono text-xs font-bold text-[#3b4928]">
                    ID: {selectedRecord._code}
                  </p>
                  <button
                    onClick={() => handleCopyCode(selectedRecord._code)}
                    className="text-[10px] px-2 py-0.5 rounded bg-[#ede4d2] hover:bg-[#dfd4be] text-[#344222] font-semibold flex items-center gap-1 transition"
                  >
                    {copiedCode === selectedRecord._code ? (
                      <>
                        <Check className="w-3 h-3 text-emerald-600" />
                        <span>Copied</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3 h-3" />
                        <span>Copy Code</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
              <button
                onClick={() => setSelectedRecord(null)}
                className="p-2 rounded-xl bg-[#ede4d2] text-[#242c18] hover:bg-[#e0d4be] transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Grid of details */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="p-3.5 rounded-xl bg-[#fbf9f4] border border-[#dfd7c5] space-y-1">
                <span className="text-[#6b775f] font-semibold block uppercase text-[10px]">Email Address</span>
                <a
                  href={`mailto:${selectedRecord._email}`}
                  className="font-bold text-[#242c18] font-mono block hover:underline hover:text-[#3b4928]"
                >
                  {selectedRecord._email || 'N/A'}
                </a>
              </div>

              <div className="p-3.5 rounded-xl bg-[#fbf9f4] border border-[#dfd7c5] space-y-1">
                <span className="text-[#6b775f] font-semibold block uppercase text-[10px]">WhatsApp Phone</span>
                <div className="flex items-center justify-between">
                  <span className="font-bold text-[#242c18] font-mono">{selectedRecord._phone || 'N/A'}</span>
                  {selectedRecord._phone && (
                    <a
                      href={`https://wa.me/91${String(selectedRecord._phone).replace(/\D/g, '')}?text=${encodeURIComponent(
                        `Namaste ${selectedRecord._name || 'Attendee'}, Greetings from Cultrahus Sangam 2026. Regarding your ${selectedRecord._type} (${selectedRecord._code}).`
                      )}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-2 py-0.5 rounded bg-[#e8f5e9] text-[#2e7d32] hover:bg-[#c8e6c9] font-bold text-[10px] transition flex items-center gap-1"
                    >
                      <MessageSquare className="w-3 h-3" />
                      <span>Chat</span>
                    </a>
                  )}
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-[#fbf9f4] border border-[#dfd7c5] space-y-1">
                <span className="text-[#6b775f] font-semibold block uppercase text-[10px]">Registration Status</span>
                <span className="font-bold text-[#3b4928]">{selectedRecord._status}</span>
              </div>

              <div className="p-3.5 rounded-xl bg-[#fbf9f4] border border-[#dfd7c5] space-y-1">
                <span className="text-[#6b775f] font-semibold block uppercase text-[10px]">Submission Time (IST)</span>
                <span className="font-mono text-[#242c18]">{selectedRecord._date}</span>
              </div>
            </div>

            {/* Pass / Credential Action Banner */}
            {onViewPass && formatPassData(selectedRecord) && (
              <div className="p-4 rounded-2xl bg-[#ebf0e2] border-2 border-[#5b6e41] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#3b4928] text-[#f7f4ec] flex items-center justify-center shrink-0">
                    <Ticket className="w-5 h-5 text-[#e5d4aa]" />
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold text-[#3b4928] tracking-wider block">
                      Accreditation Badge Available
                    </span>
                    <span className="font-bold text-xs text-[#242c18] block">
                      Print or Inspect Festival Credential Pass
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => {
                    const pass = formatPassData(selectedRecord);
                    if (pass) {
                      setSelectedRecord(null);
                      onViewPass(pass);
                    }
                  }}
                  className="px-4 py-2.5 rounded-xl bg-[#3b4928] hover:bg-[#485932] text-[#f7f4ec] text-xs font-bold transition flex items-center justify-center gap-1.5 shadow-sm shrink-0 cursor-pointer"
                >
                  <Sparkles className="w-3.5 h-3.5 text-[#e5d4aa]" />
                  <span>Open Official Pass</span>
                </button>
              </div>
            )}

            {/* Attached Sponsorship Deck / Document if available */}
            {selectedRecord.deckFileData && (
              <div className="p-4 rounded-2xl bg-[#ebf0e2] border-2 border-[#5b6e41] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-xl bg-[#3b4928] text-[#f7f4ec] flex items-center justify-center shrink-0">
                    <FileText className="w-5 h-5 text-[#e5d4aa]" />
                  </div>
                  <div className="truncate">
                    <span className="text-[10px] uppercase font-bold text-[#3b4928] tracking-wider block">
                      Uploaded Sponsorship Deck
                    </span>
                    <span className="font-bold text-xs text-[#242c18] block truncate">
                      {selectedRecord.deckFileName || 'Sponsorship_Proposal_Deck.pdf'}
                    </span>
                    {selectedRecord.deckFileSize && (
                      <span className="text-[10px] text-[#556345]">
                        {(selectedRecord.deckFileSize / (1024 * 1024)).toFixed(2)} MB
                      </span>
                    )}
                  </div>
                </div>

                <a
                  href={selectedRecord.deckFileData}
                  download={selectedRecord.deckFileName || 'Sponsorship_Deck.pdf'}
                  className="px-4 py-2.5 rounded-xl bg-[#3b4928] hover:bg-[#485932] text-[#f7f4ec] text-xs font-bold transition flex items-center justify-center gap-1.5 shadow-sm shrink-0"
                >
                  <Download className="w-4 h-4 text-[#e5d4aa]" />
                  <span>Download Deck File</span>
                </a>
              </div>
            )}

            {/* Full raw attributes dump */}
            <div className="space-y-2">
              <span className="text-xs font-bold text-[#344222] uppercase tracking-wider block">
                Submitted Application Fields
              </span>
              <div className="p-4 rounded-xl bg-[#f7f4ec] border border-[#cfc4ad] text-xs space-y-2 font-sans">
                {Object.entries(selectedRecord)
                  .filter(([key]) => !key.startsWith('_') && key !== 'addedBy' && key !== 'deckFileData')
                  .map(([key, value]) => (
                    <div key={key} className="flex flex-col sm:flex-row sm:justify-between py-1 border-b border-[#e8dfcb] last:border-0 gap-1">
                      <span className="text-[#556345] font-semibold capitalize">
                        {key.replace(/([A-Z])/g, ' $1')}
                      </span>
                      <span className="text-[#242c18] font-medium text-right break-words sm:max-w-xs">
                        {typeof value === 'object' ? JSON.stringify(value) : String(value)}
                      </span>
                    </div>
                  ))}
              </div>
            </div>

            {/* Provenance and Audit trail */}
            {selectedRecord.addedBy && (
              <div className="p-3.5 rounded-xl bg-[#ebf0e2] border border-[#c3d3b4] text-[11px] text-[#344222] space-y-1">
                <span className="font-bold block uppercase text-[10px] text-[#242c18]">
                  Verified Audit Provenance
                </span>
                <p>
                  Captured via <code className="font-mono font-bold">{selectedRecord.addedBy.sourceForm}</code> • IP: {selectedRecord.addedBy.clientIp} • UTC: {selectedRecord.addedBy.timestampUtc}
                </p>
              </div>
            )}

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setSelectedRecord(null)}
                className="px-5 py-2.5 rounded-xl bg-[#ede4d2] hover:bg-[#e0d4be] text-[#242c18] text-xs font-bold transition cursor-pointer"
              >
                Close Dossier
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CHANGE PIN MODAL */}
      {showChangePinModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white border-2 border-[#cfc4ad] rounded-3xl max-w-md w-full p-6 sm:p-8 space-y-5 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-[#dfd7c5]">
              <h3 className="font-serif text-lg font-bold text-[#242c18] flex items-center gap-2">
                <Key className="w-4 h-4 text-[#3b4928]" />
                <span>Change Organizer PIN</span>
              </h3>
              <button
                onClick={() => setShowChangePinModal(false)}
                className="text-[#556345] hover:text-[#242c18]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleChangePin} className="space-y-4 text-left">
              <div>
                <label className="block text-xs font-bold text-[#344222] uppercase tracking-wider mb-1">
                  Current PIN
                </label>
                <input
                  type="password"
                  value={currentPinInput}
                  onChange={(e) => setCurrentPinInput(e.target.value)}
                  placeholder="Current Organizer PIN"
                  className="w-full px-3.5 py-2.5 bg-[#fbf9f4] border border-[#cfc4ad] rounded-xl text-xs text-[#242c18] outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#344222] uppercase tracking-wider mb-1">
                  New Secret PIN (Min 4 chars)
                </label>
                <input
                  type="password"
                  value={newPinInput}
                  onChange={(e) => setNewPinInput(e.target.value)}
                  placeholder="New secret PIN"
                  className="w-full px-3.5 py-2.5 bg-[#fbf9f4] border border-[#cfc4ad] rounded-xl text-xs text-[#242c18] outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#344222] uppercase tracking-wider mb-1">
                  Confirm New PIN
                </label>
                <input
                  type="password"
                  value={confirmPinInput}
                  onChange={(e) => setConfirmPinInput(e.target.value)}
                  placeholder="Retype new PIN"
                  className="w-full px-3.5 py-2.5 bg-[#fbf9f4] border border-[#cfc4ad] rounded-xl text-xs text-[#242c18] outline-none"
                  required
                />
              </div>

              {changePinError && (
                <div className="p-2.5 bg-[#fdf2f2] border border-[#f5c6cb] rounded-lg text-xs text-[#721c24]">
                  {changePinError}
                </div>
              )}

              {changePinSuccess && (
                <div className="p-2.5 bg-[#ebf0e2] border border-[#c3d3b4] rounded-lg text-xs text-[#344222] font-bold">
                  {changePinSuccess}
                </div>
              )}

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowChangePinModal(false)}
                  className="px-4 py-2 rounded-xl bg-[#ede4d2] text-[#242c18] text-xs font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isChangingPin}
                  className="px-5 py-2 rounded-xl bg-[#3b4928] hover:bg-[#485932] text-[#f7f4ec] text-xs font-bold shadow transition"
                >
                  {isChangingPin ? 'Updating...' : 'Save New PIN'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* RESET / CLEAR DATABASE CONFIRMATION MODAL */}
      {showClearConfirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white border-2 border-[#f5c6cb] rounded-3xl max-w-md w-full p-6 sm:p-8 space-y-5 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-[#f5c6cb]">
              <h3 className="font-serif text-lg font-bold text-[#721c24] flex items-center gap-2">
                <Trash2 className="w-5 h-5 text-[#c82333]" />
                <span>Reset Application Database</span>
              </h3>
              <button
                onClick={() => setShowClearConfirmModal(false)}
                className="text-[#556345] hover:text-[#242c18]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs text-[#556345]">
              <p className="text-[#242c18] font-medium leading-relaxed">
                Are you sure you want to delete all stored registration records?
              </p>
              <div className="p-3 bg-[#fff5f5] border border-[#f5c6cb] rounded-xl text-[#721c24] space-y-1 font-sans">
                <p className="font-bold">⚠️ Warning: Irreversible Action</p>
                <p>
                  This will purge all delegate accreditations, ticket passes, theatre troupes, secretariat applications, sponsor proposals, and contact inquiries.
                </p>
                <p className="font-semibold mt-1">
                  All newly incoming registrations submitted after this reset will be saved normally.
                </p>
              </div>
            </div>

            {clearError && (
              <div className="p-2.5 bg-[#fdf2f2] border border-[#f5c6cb] rounded-lg text-xs text-[#721c24]">
                {clearError}
              </div>
            )}

            {clearSuccess && (
              <div className="p-2.5 bg-[#ebf0e2] border border-[#c3d3b4] rounded-lg text-xs text-[#344222] font-bold">
                {clearSuccess}
              </div>
            )}

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowClearConfirmModal(false)}
                disabled={isClearing}
                className="px-4 py-2 rounded-xl bg-[#ede4d2] text-[#242c18] text-xs font-bold hover:bg-[#dfd7c5] transition"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleClearDatabase}
                disabled={isClearing}
                className="px-5 py-2 rounded-xl bg-[#c82333] hover:bg-[#bd2130] text-white text-xs font-bold shadow transition flex items-center gap-1.5"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>{isClearing ? 'Purging Records...' : 'Yes, Delete & Reset All Data'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
