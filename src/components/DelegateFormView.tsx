import React, { useState } from 'react';
import {
  UserCheck,
  CheckCircle2,
  AlertCircle,
  Copy,
  Printer,
  Sparkles,
  MapPin,
  Calendar,
  ShieldCheck,
  Search,
  ArrowRight,
  Phone,
  Tag,
  KeyRound,
  RefreshCw,
  FileCheck
} from 'lucide-react';
import { DisciplineCategory, DelegateRecord } from '../types';
import { PassQrCode, PassBarcode } from './PassQrCode';
import { CultrahusLogo } from './CultrahusLogo';
import { safePostJson, safeGetJson } from '../utils/api';
import { saveDelegateToFirestore } from '../lib/firebase';

interface DelegateFormViewProps {
  onPassGenerated: (passData: any) => void;
}

const DISCIPLINES: { id: DisciplineCategory; title: string; subtitle: string; icon: string }[] = [
  {
    id: 'Solo Dance',
    title: 'Solo Dance',
    subtitle: 'Classical, contemporary, hip-hop & expressive solo routine',
    icon: '💃'
  },
  {
    id: 'Group Dance',
    title: 'Group Dance',
    subtitle: 'Synchronized folk ensembles, western, or crew choreography',
    icon: '👯'
  },
  {
    id: 'Solo Music',
    title: 'Solo Music',
    subtitle: 'Vocal recitals, classical sangeet & acoustic instrumental solos',
    icon: '🎤'
  },
  {
    id: 'Group Music',
    title: 'Group Music',
    subtitle: 'Bands, choirs, acoustic squads, Sufi & fusion ensembles',
    icon: '🎸'
  },
  {
    id: 'Act',
    title: 'Act',
    subtitle: 'Solo theatrical monologue, mimicry, standup or monodrama',
    icon: '🎭'
  },
  {
    id: 'Group Act',
    title: 'Group Act',
    subtitle: 'Stage play, street theatre (Nukkad Natak), skit & ensemble dramatic act',
    icon: '🎪'
  }
];

const PARLIAMENT_TRACKS = [
  'Youth & Performing Arts National Policy',
  'Theatre as Democratic Dialogue & Free Speech',
  'Preserving Regional Folk Traditions in Modern Times',
  'Public Funding, Copyrights & Artist Welfare'
];

export const DelegateFormView: React.FC<DelegateFormViewProps> = ({ onPassGenerated }) => {
  // Mode selection: 'register' for new registration form, 'lookup' for Code Option lookup
  const [activeMode, setActiveMode] = useState<'register' | 'lookup'>('register');

  // Form State
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    whatsappPhone: '',
    institution: '',
    cityState: '',
    participationCategory: 'Solo Dance' as DisciplineCategory,
    parliamentTrack: PARLIAMENT_TRACKS[0],
    priorExperience: '',
    accessCode: ''
  });

  // Code Lookup State
  const [lookupCodeInput, setLookupCodeInput] = useState('');
  const [lookupLoading, setLookupLoading] = useState(false);
  const [lookupError, setLookupError] = useState<string | null>(null);

  // Submission & Confirmation State
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [confirmedRecord, setConfirmedRecord] = useState<DelegateRecord | null>(null);
  const [copied, setCopied] = useState(false);

  // Compute fee based on accessCode in real time
  const normalizedCode = formData.accessCode.trim().toUpperCase();
  const isFullWaiverCode = ['SECRETARIAT', 'VIP2026', 'CULTRAHUS', 'FREEPASS', 'GUEST', 'COLLEGE100', 'SPECIAL'].includes(normalizedCode);
  const isHalfConcessionCode = ['SANGAM50', 'STUDENT50', 'HALF50'].includes(normalizedCode);
  const currentFee = isFullWaiverCode ? 0 : isHalfConcessionCode ? 325 : 650;

  // Phone input handler: strictly numbers only, capped at 10 digits
  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = e.target.value;
    const digitsOnly = rawValue.replace(/\D/g, '').slice(0, 10);
    setFormData((prev) => ({ ...prev, whatsappPhone: digitsOnly }));
    if (errorMsg && errorMsg.toLowerCase().includes('mobile')) {
      setErrorMsg(null);
    }
  };

  // City input handler: strictly alphabets and spaces, absolutely no numbers
  const handleCityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = e.target.value;
    const lettersOnly = rawValue.replace(/[^a-zA-Z\s,.-]/g, '');
    setFormData((prev) => ({ ...prev, cityState: lettersOnly }));
    if (errorMsg && errorMsg.toLowerCase().includes('city')) {
      setErrorMsg(null);
    }
  };

  // Submit new registration
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    // Validation checks
    if (!formData.fullName.trim()) {
      setErrorMsg('Please enter your full legal name.');
      return;
    }

    if (!formData.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
      setErrorMsg('Please enter a valid email address.');
      return;
    }

    // Strictly 10 digits, no alphabets/symbols
    if (!/^\d{10}$/.test(formData.whatsappPhone)) {
      setErrorMsg('Mobile number must be exactly 10 digits (no alphabets or symbols allowed).');
      return;
    }

    // Strictly letters only for city, no numbers
    if (!formData.cityState.trim()) {
      setErrorMsg('Please enter your city.');
      return;
    }

    if (/\d/.test(formData.cityState)) {
      setErrorMsg('City must not contain any numbers. Only alphabets are permitted.');
      return;
    }

    if (!/^[a-zA-Z\s,.-]+$/.test(formData.cityState.trim())) {
      setErrorMsg('City must contain only alphabets (no numbers or special characters).');
      return;
    }

    setSubmitting(true);

    try {
      const response = await safePostJson<{ success: boolean; record: DelegateRecord; error?: string }>(
        '/api/register-delegate',
        {
          fullName: formData.fullName.trim(),
          email: formData.email.trim(),
          whatsappPhone: formData.whatsappPhone,
          institution: formData.institution.trim() || 'Independent Artist',
          cityState: formData.cityState.trim(),
          participationCategory: formData.participationCategory,
          parliamentTrack: formData.parliamentTrack,
          priorExperience: formData.priorExperience.trim(),
          accessCode: formData.accessCode.trim()
        }
      );

      if (!response.success || !response.data?.record) {
        setErrorMsg(response.error || 'Failed to submit accreditation registration. Please try again.');
        return;
      }

      const newRecord = response.data.record;
      setConfirmedRecord(newRecord);

      // Persist to Firebase Firestore with safety try/catch so failure never causes a blank screen
      try {
        saveDelegateToFirestore(newRecord);
      } catch (fbErr) {
        console.warn('[Firebase] Firestore background sync notice:', fbErr);
      }

      // Safe scroll to top
      try {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } catch {
        // Safe fallback in iframes
      }
    } catch (err: any) {
      console.error('[Registration Exception]:', err);
      setErrorMsg('An unexpected error occurred during submission. Please verify your connection and retry.');
    } finally {
      setSubmitting(false);
    }
  };

  // Lookup existing pass by tracking code (Code Option)
  const handleLookupByCode = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const queryCode = lookupCodeInput.trim().toUpperCase();
    if (!queryCode) {
      setLookupError('Please enter an accreditation tracking code (e.g. SNGM-DEL-XXXXX).');
      return;
    }

    setLookupLoading(true);
    setLookupError(null);

    try {
      const response = await safeGetJson<{ success: boolean; record?: DelegateRecord; error?: string }>(
        `/api/accreditation/${encodeURIComponent(queryCode)}`
      );

      if (response.success && response.data?.record) {
        setConfirmedRecord(response.data.record);
        try {
          window.scrollTo({ top: 0, behavior: 'smooth' });
        } catch {
          // ignore iframe scroll
        }
      } else {
        setLookupError(
          response.error ||
            `No record found for code "${queryCode}". Please check your code or register a new accreditation.`
        );
      }
    } catch (err: any) {
      console.error('[Code Lookup Error]:', err);
      setLookupError('Network error while looking up accreditation code. Please try again.');
    } finally {
      setLookupLoading(false);
    }
  };

  const handleCopyCode = () => {
    const codeToCopy = confirmedRecord?.accreditationCode;
    if (codeToCopy && navigator.clipboard) {
      try {
        navigator.clipboard.writeText(codeToCopy);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch {
        // ignore
      }
    }
  };

  const openModal = () => {
    if (!confirmedRecord) return;
    const safeCode = confirmedRecord.accreditationCode || 'SNGM-DEL-2026';
    const safeFee =
      confirmedRecord.registrationFee === 0
        ? '₹0 (Waived with Code)'
        : `₹${confirmedRecord.registrationFee || 650} (${confirmedRecord.status || 'Accredited'})`;

    onPassGenerated({
      type: 'delegate',
      code: safeCode,
      title: `Accredited Cultural Delegate: ${confirmedRecord.participationCategory || 'Performing Arts'}`,
      fullName: confirmedRecord.fullName || 'Accredited Delegate',
      email: confirmedRecord.email || '',
      phone: confirmedRecord.whatsappPhone || '',
      detail1Label: 'Category',
      detail1Value: confirmedRecord.participationCategory || 'Cultural Delegate',
      detail2Label: 'Institution',
      detail2Value: confirmedRecord.institution || 'Independent Artist',
      feePaid: safeFee,
      status: confirmedRecord.status || 'Confirmed & Validated',
      issuedIst: confirmedRecord.addedBy?.timestampIst || new Date().toLocaleString('en-IN')
    });
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      
      {/* Header Banner */}
      <div className="text-center max-w-3xl mx-auto mb-8 flex flex-col items-center">
        <CultrahusLogo size="md" className="mb-3" />
        <span className="text-xs uppercase tracking-widest text-[#5b6e41] font-extrabold block mb-2">
          Official Credentialing Portal
        </span>
        <h1 className="font-serif text-3xl sm:text-5xl font-extrabold text-[#242c18] leading-tight">
          Delegate Accreditation 2026
        </h1>
        <p className="mt-3 text-[#556345] text-sm sm:text-base leading-relaxed">
          Accredited delegates receive privileged all-day entry across festival stages, access to the Youth Cultural Parliament, official festival kit, and authenticated digital pass.
        </p>

        {/* Mode Selector Tabs: Register vs Code Option */}
        <div className="mt-6 inline-flex p-1.5 rounded-2xl bg-[#ece4d0] border border-[#cfc4ad] shadow-inner gap-1">
          <button
            type="button"
            onClick={() => {
              setActiveMode('register');
              setLookupError(null);
            }}
            className={`px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center gap-2 cursor-pointer ${
              activeMode === 'register'
                ? 'bg-[#364325] text-[#d7c494] shadow-md'
                : 'text-[#445330] hover:text-[#1e2715] hover:bg-[#dfd5bf]'
            }`}
          >
            <UserCheck className="w-4 h-4" />
            <span>Register Accreditation</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveMode('lookup');
              setErrorMsg(null);
            }}
            className={`px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center gap-2 cursor-pointer ${
              activeMode === 'lookup'
                ? 'bg-[#364325] text-[#d7c494] shadow-md'
                : 'text-[#445330] hover:text-[#1e2715] hover:bg-[#dfd5bf]'
            }`}
          >
            <KeyRound className="w-4 h-4" />
            <span>Lookup Pass by Code (Code Option)</span>
          </button>
        </div>
      </div>

      {/* VIEW 1: Confirmed Pass Preview (Displayed after successful registration or lookup) */}
      {confirmedRecord ? (
        <div className="space-y-8 animate-in fade-in-50 duration-300">
          
          {/* Success Notification */}
          <div className="p-5 rounded-2xl bg-[#ebf0e2] border border-[#b8cbb0] text-[#242c18] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-sm">
            <div className="flex items-start gap-3">
              <CheckCircle2 className="w-6 h-6 text-[#475731] shrink-0 mt-0.5" />
              <div>
                <h3 className="font-serif font-bold text-lg text-[#242c18]">
                  Accreditation Confirmed & Logged!
                </h3>
                <p className="text-xs text-[#556345] mt-1">
                  Your official credential code has been recorded in the central Cultrahus festival registry. Venue: TBA. Save or print your pass below for entry on 18 October 2026.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={openModal}
                className="px-4 py-2.5 bg-[#364325] hover:bg-[#475731] text-[#d7c494] rounded-xl text-xs font-bold transition-colors shadow flex items-center gap-1.5 border border-[#5b6e41]/50 cursor-pointer"
              >
                <Printer className="w-4 h-4" />
                <span>Print Official Badge</span>
              </button>
            </div>
          </div>

          {/* Visual Pass Preview Card */}
          <div className="bg-[#faf7f0] border-2 border-[#cfc5b0] rounded-3xl p-6 sm:p-8 shadow-xl relative overflow-hidden">
            
            {/* Top Accent Strip */}
            <div className="bg-[#242c18] text-[#d7c494] -mx-6 -mt-6 sm:-mx-8 sm:-mt-8 px-6 py-4 mb-6 flex flex-wrap items-center justify-between gap-3 border-b border-[#475731]">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-[#d7c494]" />
                <span className="font-serif font-bold text-sm sm:text-base text-white tracking-wide">
                  CULTRAHUS SANGAM 2026 • OFFICIAL ACCREDITATION
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono bg-[#364325] text-[#d7c494] px-3 py-1 rounded-lg font-bold border border-[#5b6e41]/60 tracking-wider">
                  {confirmedRecord.accreditationCode || 'SNGM-DEL-2026'}
                </span>
                <button
                  type="button"
                  onClick={handleCopyCode}
                  className="p-1.5 hover:bg-white/10 rounded-lg text-[#cbd6be] hover:text-white transition-colors cursor-pointer"
                  title="Copy Accreditation Code"
                >
                  <Copy className="w-4 h-4" />
                </button>
                {copied && <span className="text-[10px] text-[#d7c494] font-bold">Copied!</span>}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
              <div className="md:col-span-2 space-y-4">
                <div>
                  <span className="text-[10px] uppercase font-bold text-[#6b775f] tracking-wider block">
                    Accredited Delegate
                  </span>
                  <h2 className="font-serif text-2xl font-extrabold text-[#242c18]">
                    {confirmedRecord.fullName || 'Accredited Delegate'}
                  </h2>
                  <p className="text-xs text-[#556345] font-mono mt-0.5">
                    {confirmedRecord.email || ''} • {confirmedRecord.whatsappPhone || ''}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4 pt-2 border-t border-[#dfd7c5]">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-[#6b775f] block">
                      Discipline Category
                    </span>
                    <span className="text-xs font-bold text-[#242c18] bg-[#ebf0e2] px-2 py-0.5 rounded-md inline-block mt-0.5">
                      {confirmedRecord.participationCategory || 'Solo Dance'}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold text-[#6b775f] block">
                      Institution / Guild
                    </span>
                    <span className="text-xs font-semibold text-[#334122] block mt-0.5">
                      {confirmedRecord.institution || 'Independent Artist'}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 pt-2 border-t border-[#dfd7c5] text-xs text-[#556345]">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-[#6b775f] block">
                      Parliament Track
                    </span>
                    <span className="font-medium text-[#242c18]">
                      {confirmedRecord.parliamentTrack || PARLIAMENT_TRACKS[0]}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold text-[#6b775f] block">
                      City
                    </span>
                    <span className="font-medium text-[#242c18]">
                      {confirmedRecord.cityState || 'New Delhi'}
                    </span>
                  </div>
                </div>

                {confirmedRecord.appliedCode && (
                  <div className="pt-2 border-t border-[#dfd7c5] flex items-center gap-2 text-xs">
                    <Tag className="w-3.5 h-3.5 text-[#475731]" />
                    <span className="font-semibold text-[#334122]">Special Code Applied:</span>
                    <span className="font-mono bg-[#ebf0e2] px-2 py-0.5 rounded text-[#242c18] font-bold">
                      {confirmedRecord.appliedCode}
                    </span>
                  </div>
                )}

                <div className="pt-2 border-t border-[#dfd7c5] flex flex-wrap items-center gap-4 text-xs text-[#556345]">
                  <div className="flex items-center gap-1.5">
                    <Calendar className="w-4 h-4 text-[#5b6e41]" />
                    <span>Sunday, 18 Oct 2026</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <MapPin className="w-4 h-4 text-[#5b6e41]" />
                    <span className="font-semibold text-[#242c18]">Venue: TBA</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-[#6b775f]">
                    <Phone className="w-4 h-4 text-[#5b6e41]" />
                    <span>Helpline: +91 98185 61227</span>
                  </div>
                </div>
              </div>

              {/* QR and Barcode column */}
              <div className="flex flex-col items-center justify-center p-4 bg-white rounded-2xl border border-[#dfd7c5] shadow-sm text-center">
                <PassQrCode code={confirmedRecord.accreditationCode || 'SNGM-DEL-2026'} size={120} />
                <span className="font-mono text-xs font-bold text-[#242c18] mt-2">
                  {confirmedRecord.accreditationCode || 'SNGM-DEL-2026'}
                </span>
                <span className="text-[10px] text-[#364325] font-bold mt-0.5">
                  {confirmedRecord.registrationFee === 0 ? 'Fee: ₹0 (Waived with Code)' : `Fee: ₹${confirmedRecord.registrationFee || 650} (Accredited)`}
                </span>
                <div className="mt-3 pt-2 border-t border-[#ece6d8] w-full flex justify-center">
                  <PassBarcode code={confirmedRecord.accreditationCode || 'SNGM-DEL-2026'} />
                </div>
              </div>
            </div>

            {/* Bottom Actions */}
            <div className="mt-8 pt-6 border-t border-[#dfd7c5] flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setConfirmedRecord(null);
                    setActiveMode('register');
                    setErrorMsg(null);
                  }}
                  className="text-xs font-bold text-[#556345] hover:text-[#242c18] transition-colors underline cursor-pointer"
                >
                  ← Register Another Delegate
                </button>
                <span className="text-gray-300">•</span>
                <button
                  type="button"
                  onClick={() => {
                    setConfirmedRecord(null);
                    setActiveMode('lookup');
                    setLookupCodeInput('');
                    setLookupError(null);
                  }}
                  className="text-xs font-bold text-[#556345] hover:text-[#242c18] transition-colors underline cursor-pointer"
                >
                  Look up Another Code
                </button>
              </div>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={openModal}
                  className="px-5 py-2.5 bg-[#364325] hover:bg-[#475731] text-[#d7c494] rounded-xl text-xs font-bold transition-all shadow flex items-center gap-2 border border-[#5b6e41]/50 cursor-pointer"
                >
                  <Printer className="w-4 h-4" />
                  <span>View Printable Official Pass</span>
                </button>
              </div>
            </div>

          </div>
        </div>
      ) : activeMode === 'lookup' ? (
        /* VIEW 2: Lookup Pass by Code (Code Option) */
        <div className="bg-[#fbf9f4] border border-[#d9d0be] rounded-3xl p-6 sm:p-10 shadow-sm max-w-2xl mx-auto">
          <div className="text-center mb-6">
            <div className="w-12 h-12 rounded-2xl bg-[#ebf0e2] text-[#364325] border border-[#b8cbb0] flex items-center justify-center mx-auto mb-3">
              <Search className="w-6 h-6" />
            </div>
            <h2 className="font-serif text-2xl font-extrabold text-[#242c18]">
              Retrieve Pass with Code
            </h2>
            <p className="text-xs text-[#556345] mt-1.5 max-w-md mx-auto">
              Already accredited? Enter your official tracking code (e.g. <span className="font-mono font-bold text-[#242c18]">SNGM-DEL-4BE2D</span>) to retrieve, view, and print your verified pass credential.
            </p>
          </div>

          {lookupError && (
            <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 text-red-800 text-xs sm:text-sm flex items-start gap-2.5">
              <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
              <span>{lookupError}</span>
            </div>
          )}

          <form onSubmit={handleLookupByCode} className="space-y-5">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#242c18] mb-1.5">
                Accreditation Tracking Code *
              </label>
              <div className="relative">
                <input
                  type="text"
                  required
                  value={lookupCodeInput}
                  onChange={(e) => {
                    setLookupCodeInput(e.target.value);
                    if (lookupError) setLookupError(null);
                  }}
                  placeholder="e.g. SNGM-DEL-4BE2D"
                  className="w-full px-4 py-3 text-base font-mono uppercase bg-white border-2 border-[#cfc5b0] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#5b6e41]/50 text-[#242c18] placeholder:normal-case placeholder:font-sans"
                />
                <KeyRound className="w-5 h-5 text-[#859473] absolute right-3.5 top-3.5 pointer-events-none" />
              </div>
              <p className="text-[11px] text-[#6b775f] mt-1.5">
                Format: <span className="font-mono font-semibold">SNGM-DEL-XXXXX</span>. Letters and digits are case-insensitive.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
              <button
                type="submit"
                disabled={lookupLoading || !lookupCodeInput.trim()}
                className="w-full sm:w-auto px-7 py-3 bg-[#364325] hover:bg-[#475731] text-[#d7c494] text-xs sm:text-sm font-bold rounded-xl shadow-md transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 border border-[#5b6e41]/60 cursor-pointer"
              >
                {lookupLoading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Searching Registry...</span>
                  </>
                ) : (
                  <>
                    <FileCheck className="w-4 h-4" />
                    <span>Retrieve Official Pass</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={() => {
                  setActiveMode('register');
                  setLookupError(null);
                }}
                className="w-full sm:w-auto px-5 py-3 bg-[#ede4d2] hover:bg-[#dfd4be] text-[#242c18] text-xs sm:text-sm font-bold rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>Register New Accreditation Instead</span>
              </button>
            </div>
          </form>
        </div>
      ) : (
        /* VIEW 3: Register Accreditation Form */
        <div className="bg-[#fbf9f4] border border-[#d9d0be] rounded-3xl p-6 sm:p-10 shadow-sm">
          
          {/* Top Info Banner */}
          <div className="mb-6 p-4 rounded-2xl bg-[#ebf0e2] border border-[#c4d2b5] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs sm:text-sm">
            <div className="flex items-center gap-2 text-[#242c18]">
              <Sparkles className="w-4 h-4 text-[#5b6e41]" />
              <span>Conclave Accreditation • Sunday, 18 October 2026 • Venue: TBA</span>
            </div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-[#364325] text-[#d7c494] font-bold text-xs font-mono">
              <span>{isFullWaiverCode ? 'Fee: ₹0 (Waived)' : isHalfConcessionCode ? 'Fee: ₹325 (50% Off)' : 'Standard Fee: ₹650'}</span>
            </div>
          </div>

          {errorMsg && (
            <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 text-red-800 text-xs sm:text-sm flex items-start gap-2.5">
              <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-8">
            
            {/* Step 1: Discipline Category Selection */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <label className="block text-xs font-bold uppercase tracking-wider text-[#242c18]">
                  1. Select Discipline Category *
                </label>
                <span className="text-[11px] text-[#556345] font-semibold">
                  Selected: <span className="text-[#242c18] font-bold">{formData.participationCategory}</span>
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {DISCIPLINES.map((disc) => {
                  const isSelected = formData.participationCategory === disc.id;
                  return (
                    <button
                      type="button"
                      key={disc.id}
                      onClick={() => setFormData({ ...formData, participationCategory: disc.id })}
                      className={`text-left p-3.5 rounded-2xl border-2 transition-all cursor-pointer ${
                        isSelected
                          ? 'border-[#3b4928] bg-[#ebf0e2] shadow-sm text-[#242c18]'
                          : 'border-[#dfd7c5] bg-white hover:border-[#5b6e41]/60 text-[#334122]'
                      }`}
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-2xl">{disc.icon}</span>
                        <span className="font-serif font-bold text-sm text-[#242c18]">
                          {disc.title}
                        </span>
                      </div>
                      <p className="text-[11px] text-[#6b775f] leading-tight">{disc.subtitle}</p>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Step 2: Delegate Personal & Contact Details */}
            <div className="space-y-4 pt-4 border-t border-[#dfd7c5]">
              <div className="text-xs font-bold uppercase tracking-wider text-[#242c18]">
                2. Delegate Credentials & Identification
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-[#334122] mb-1">
                    Full Legal Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.fullName}
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                    placeholder="e.g. Aarav Sharma"
                    className="w-full px-3.5 py-2.5 text-sm bg-white border border-[#cfc5b0] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#5b6e41]/50 text-[#242c18]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#334122] mb-1">
                    Email Address (for Official Digital Badge) *
                  </label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="aarav@university.edu.in"
                    className="w-full px-3.5 py-2.5 text-sm bg-white border border-[#cfc5b0] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#5b6e41]/50 text-[#242c18]"
                  />
                </div>

                {/* Mobile Number - Exactly 10 digits, no alphabet */}
                <div>
                  <label className="block text-xs font-semibold text-[#334122] mb-1">
                    Mobile Number (10 Digits Only) *
                  </label>
                  <input
                    type="tel"
                    inputMode="numeric"
                    maxLength={10}
                    pattern="[0-9]{10}"
                    required
                    value={formData.whatsappPhone}
                    onChange={handlePhoneChange}
                    placeholder="e.g. 9876543210"
                    className="w-full px-3.5 py-2.5 text-sm bg-white border border-[#cfc5b0] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#5b6e41]/50 text-[#242c18] font-mono"
                  />
                  <div className="flex items-center justify-between mt-1 text-[11px]">
                    <span className="text-[#6b775f]">Numbers only (no alphabet or symbols)</span>
                    <span className={`font-mono font-bold ${formData.whatsappPhone.length === 10 ? 'text-[#3b4928]' : 'text-[#a03232]'}`}>
                      {formData.whatsappPhone.length}/10 digits
                    </span>
                  </div>
                </div>

                {/* City - Only alphabets, no numbers */}
                <div>
                  <label className="block text-xs font-semibold text-[#334122] mb-1">
                    City (Alphabets Only) *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.cityState}
                    onChange={handleCityChange}
                    placeholder="e.g. New Delhi, Mumbai, Pune"
                    className="w-full px-3.5 py-2.5 text-sm bg-white border border-[#cfc5b0] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#5b6e41]/50 text-[#242c18]"
                  />
                  <span className="text-[11px] text-[#6b775f] block mt-1">
                    Only letters and spaces allowed (no numbers permitted).
                  </span>
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-[#334122] mb-1">
                    Institution / University / Academy / Troupe
                  </label>
                  <input
                    type="text"
                    value={formData.institution}
                    onChange={(e) => setFormData({ ...formData, institution: e.target.value })}
                    placeholder="e.g. Delhi University / Gandharva Mahavidyalaya / Independent Artist"
                    className="w-full px-3.5 py-2.5 text-sm bg-white border border-[#cfc5b0] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#5b6e41]/50 text-[#242c18]"
                  />
                </div>
              </div>
            </div>

            {/* Step 3: Parliament Track & Experience */}
            <div className="space-y-4 pt-4 border-t border-[#dfd7c5]">
              <div className="text-xs font-bold uppercase tracking-wider text-[#242c18]">
                3. Cultural Parliament Track & Background
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#334122] mb-1">
                  Assigned Youth Cultural Parliament Track *
                </label>
                <select
                  value={formData.parliamentTrack}
                  onChange={(e) => setFormData({ ...formData, parliamentTrack: e.target.value })}
                  className="w-full px-3.5 py-2.5 text-sm bg-white border border-[#cfc5b0] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#5b6e41]/50 text-[#242c18]"
                >
                  {PARLIAMENT_TRACKS.map((track) => (
                    <option key={track} value={track}>
                      {track}
                    </option>
                  ))}
                </select>
                <p className="text-[11px] text-[#6b775f] mt-1">
                  You will participate in this committee session during the 02:30 PM assembly.
                </p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#334122] mb-1">
                  Prior Stage, Arts, or Debating Experience (Brief summary)
                </label>
                <textarea
                  rows={3}
                  value={formData.priorExperience}
                  onChange={(e) => setFormData({ ...formData, priorExperience: e.target.value })}
                  placeholder="Mention previous performances, competitions, college fests, or write 'Fresher'..."
                  className="w-full px-3.5 py-2.5 text-sm bg-white border border-[#cfc5b0] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#5b6e41]/50 text-[#242c18]"
                />
              </div>
            </div>

            {/* Step 4: Special Code Option (Invite, Concession, Secretariat Code) */}
            <div className="space-y-3 pt-4 border-t border-[#dfd7c5]">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Tag className="w-4 h-4 text-[#5b6e41]" />
                  <span className="text-xs font-bold uppercase tracking-wider text-[#242c18]">
                    4. Code Option (Invite / Secretariat / Concession Code)
                  </span>
                </div>
                <span className="text-[11px] text-[#6b775f]">Optional</span>
              </div>

              <div className="p-4 rounded-2xl bg-white border border-[#dfd7c5] space-y-3">
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                  <div className="relative flex-1">
                    <input
                      type="text"
                      value={formData.accessCode}
                      onChange={(e) => setFormData({ ...formData, accessCode: e.target.value.toUpperCase() })}
                      placeholder="e.g. SECRETARIAT, VIP2026, CULTRAHUS, SANGAM50"
                      className="w-full px-3.5 py-2.5 text-sm font-mono uppercase bg-[#fcfaf5] border border-[#cfc5b0] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#5b6e41]/50 text-[#242c18]"
                    />
                  </div>

                  {formData.accessCode.trim() && (
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, accessCode: '' })}
                      className="px-3 py-2 text-xs font-semibold text-[#8a3333] hover:underline"
                    >
                      Clear Code
                    </button>
                  )}
                </div>

                {/* Live Feedback for Code Option */}
                {isFullWaiverCode ? (
                  <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>
                      <strong className="font-bold">Code &quot;{normalizedCode}&quot; Validated:</strong> 100% Fee Waiver Applied. Delegate registration fee is ₹0.
                    </span>
                  </div>
                ) : isHalfConcessionCode ? (
                  <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>
                      <strong className="font-bold">Code &quot;{normalizedCode}&quot; Validated:</strong> 50% Concession Applied. Delegate registration fee is ₹325.
                    </span>
                  </div>
                ) : normalizedCode.length > 0 ? (
                  <div className="p-2.5 rounded-xl bg-[#ebf0e2] border border-[#c4d2b5] text-[#242c18] text-xs flex items-center gap-2">
                    <Tag className="w-4 h-4 text-[#5b6e41] shrink-0" />
                    <span>
                      Affiliated Guild/Referral Code &quot;{normalizedCode}&quot; attached to registration record.
                    </span>
                  </div>
                ) : (
                  <p className="text-[11px] text-[#6b775f]">
                    Have an invitation or concession voucher from the Secretariat, patron guild, or collegiate delegation? Enter your code above.
                  </p>
                )}
              </div>
            </div>

            {/* Privileges & Fee Summary */}
            <div className="p-4 rounded-2xl bg-[#ebf0e2] border border-[#c4d2b5] flex items-start gap-3">
              <Sparkles className="w-5 h-5 text-[#5b6e41] shrink-0 mt-0.5" />
              <div className="text-xs text-[#242c18] space-y-1">
                <span className="font-bold block">Delegate Privileges & Verification</span>
                <p className="text-[#556345]">
                  By submitting, you confirm attendance on 18 October 2026. The {currentFee === 0 ? '₹0 waived fee' : `₹${currentFee} fee`} covers the official Sangam Delegate Monograph, voting keycard, entry to festival stages, and delegate lunch. Venue: TBA. An official code (`SNGM-DEL-XXXXX`) will be generated immediately.
                </p>
              </div>
            </div>

            {/* Submit Button */}
            <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-4">
              <button
                type="submit"
                disabled={submitting}
                className="w-full sm:w-auto px-8 py-3.5 bg-[#364325] hover:bg-[#475731] text-[#f4efe4] text-sm font-bold rounded-xl shadow-md transition-all transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 border border-[#5b6e41]/60 cursor-pointer"
              >
                {submitting ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin text-[#d7c494]" />
                    <span>Generating Official Accreditation...</span>
                  </>
                ) : (
                  <>
                    <span className="text-[#d7c494]">
                      {currentFee === 0
                        ? `Confirm Accreditation with Code (₹0 Free Pass)`
                        : `Confirm Accreditation & Generate Pass (₹${currentFee})`}
                    </span>
                    <ArrowRight className="w-4 h-4 text-[#d7c494]" />
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={() => {
                  setFormData({
                    fullName: '',
                    email: '',
                    whatsappPhone: '',
                    institution: '',
                    cityState: '',
                    participationCategory: 'Solo Dance',
                    parliamentTrack: PARLIAMENT_TRACKS[0],
                    priorExperience: '',
                    accessCode: ''
                  });
                  setErrorMsg(null);
                }}
                className="text-xs font-semibold text-[#556345] hover:text-[#242c18] underline cursor-pointer"
              >
                Reset form
              </button>
            </div>

          </form>
        </div>
      )}

    </div>
  );
};
