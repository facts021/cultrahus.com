import React, { useState } from 'react';
import {
  Ticket,
  CheckCircle2,
  AlertCircle,
  Copy,
  Printer,
  Sparkles,
  MapPin,
  Calendar,
  ShieldCheck,
  ChevronRight,
  Info,
  Phone,
  Music,
  Disc,
  KeyRound,
  Search
} from 'lucide-react';
import { TicketTier, TicketRecord } from '../types';
import { PassQrCode, PassBarcode } from './PassQrCode';
import { CultrahusLogo } from './CultrahusLogo';
import { safePostJson, safeGetJson } from '../utils/api';
import { saveTicketToFirestore } from '../lib/firebase';

interface TicketBookingViewProps {
  onPassGenerated: (passData: any) => void;
}

export const TicketBookingView: React.FC<TicketBookingViewProps> = ({ onPassGenerated }) => {
  const [activeMode, setActiveMode] = useState<'book' | 'lookup'>('book');
  const [tier, setTier] = useState<TicketTier>('royal');
  const [quantity, setQuantity] = useState<number>(1);

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    whatsappPhone: ''
  });

  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [confirmedTicket, setConfirmedTicket] = useState<TicketRecord | null>(null);
  const [copied, setCopied] = useState(false);

  // Code Option Lookup State
  const [lookupCode, setLookupCode] = useState('');
  const [lookupLoading, setLookupLoading] = useState(false);
  const [lookupError, setLookupError] = useState<string | null>(null);

  // Pricing constants (200, 400, 600 with crossed-out original rates)
  const tierPrices: Record<TicketTier, number> = {
    classic: 200,
    royal: 400,
    sovereign: 600
  };

  const tierOriginalPrices: Record<TicketTier, number> = {
    classic: 350,
    royal: 600,
    sovereign: 1050
  };

  // Base price per ticket & total amount
  const basePricePerTicket = tierPrices[tier] || 400;
  const totalAmount = basePricePerTicket * quantity;

  // Food inclusion mapping per tier (built-in, no separate optional food addon)
  const foodAddon: 'none' | 'sattvic_thali' | 'high_tea_box' =
    tier === 'sovereign' ? 'sattvic_thali' : tier === 'royal' ? 'high_tea_box' : 'none';

  const handleTierChange = (newTier: TicketTier) => {
    setTier(newTier);
    setErrorMsg(null);
  };

  const handleCopyTicketCode = () => {
    if (!confirmedTicket) return;
    try {
      if (navigator.clipboard) {
        navigator.clipboard.writeText(confirmedTicket.ticketCode);
      }
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // ignore
    }
  };

  const handleLookupTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    const queryCode = lookupCode.trim().toUpperCase();
    if (!queryCode) {
      setLookupError('Please enter your ticket pass code (e.g. SNGM-TKT-XXXX) or 10-digit WhatsApp phone number.');
      return;
    }

    setLookupLoading(true);
    setLookupError(null);

    try {
      const response = await safeGetJson<{ success: boolean; record?: TicketRecord; error?: string }>(
        `/api/lookup-ticket/${encodeURIComponent(queryCode)}`
      );

      if (response.success && response.data?.record) {
        setConfirmedTicket(response.data.record);
        try {
          window.scrollTo(0, 0);
        } catch {
          // ignore
        }
      } else {
        setLookupError(
          response.error || `No ticket pass found for "${queryCode}". Please check your code or book anew.`
        );
      }
    } catch (err: any) {
      setLookupError('Network error while looking up ticket code. Please try again.');
    } finally {
      setLookupLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    if (!formData.fullName.trim()) {
      setErrorMsg('Please enter your full name.');
      return;
    }

    if (!formData.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
      setErrorMsg('Please enter a valid email address.');
      return;
    }

    if (!/^\d{10}$/.test(formData.whatsappPhone)) {
      setErrorMsg('WhatsApp phone number must be exactly 10 digits without any alphabets or symbols.');
      return;
    }

    setSubmitting(true);

    try {
      const payload = {
        fullName: formData.fullName,
        email: formData.email,
        whatsappPhone: formData.whatsappPhone,
        tier,
        quantity,
        seats: [],
        foodAddon,
        totalAmount
      };

      const response = await safePostJson<{ success: boolean; record: TicketRecord; error?: string }>(
        '/api/book-ticket',
        payload
      );

      if (!response.success || !response.data?.record) {
        setErrorMsg(response.error || 'Failed to book conclave passes. Please try again.');
        return;
      }

      setConfirmedTicket(response.data.record);
      // Persist to Firebase Firestore with non-blocking error handling
      try {
        saveTicketToFirestore(response.data.record).catch((fbErr) => {
          console.warn('[Firebase] Firestore background sync notice:', fbErr);
        });
      } catch (fbErr) {
        console.warn('[Firebase] Firestore background sync notice:', fbErr);
      }
      try {
        window.scrollTo(0, 0);
      } catch {
        // ignore
      }
    } catch {
      setErrorMsg('An error occurred during booking. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const openPassModal = () => {
    if (!confirmedTicket) return;
    onPassGenerated({
      type: 'ticket',
      code: confirmedTicket.ticketCode,
      title: confirmedTicket.tierName,
      fullName: confirmedTicket.fullName,
      email: confirmedTicket.email,
      phone: confirmedTicket.whatsappPhone,
      detail1Label: 'Pass Quantity',
      detail1Value: `${confirmedTicket.quantity} Pass(es)`,
      detail2Label: 'Festival Inclusions',
      detail2Value:
        confirmedTicket.tier === 'sovereign'
          ? 'Food Included (Royal Dining) + Garba & DJ Night'
          : confirmedTicket.tier === 'royal'
          ? 'High Tea Box + Garba & DJ Night Included'
          : 'No Food Included • Garba & DJ Night Included',
      seats: confirmedTicket.seats,
      feePaid: `₹${confirmedTicket.totalAmount.toLocaleString('en-IN')}`,
      status: 'Confirmed & Validated',
      issuedIst: confirmedTicket.addedBy?.timestampIst
    });
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto mb-8 flex flex-col items-center">
        <CultrahusLogo size="md" className="mb-3" />
        <span className="text-xs uppercase tracking-widest text-[#5b6e41] font-extrabold block mb-2">
          Auditorium & Festival Conclave Passes
        </span>
        <h1 className="font-serif text-3xl sm:text-5xl font-extrabold text-[#242c18] leading-tight">
          Book Conclave Passes
        </h1>
        <p className="mt-3 text-[#556345] text-sm sm:text-base">
          Choose your pass tier and select quantities. Every pass includes full access to <strong className="text-[#242c18]">Garba Night & DJ Night</strong> celebrations! Sunday, 18 October 2026. Venue: TBA.
        </p>

        {/* Mode Selector Tabs: Book Passes vs Code Option */}
        <div className="mt-6 inline-flex p-1.5 rounded-2xl bg-[#ece4d0] border border-[#cfc4ad] shadow-inner gap-1">
          <button
            type="button"
            onClick={() => {
              setActiveMode('book');
              setLookupError(null);
            }}
            className={`px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center gap-2 cursor-pointer ${
              activeMode === 'book'
                ? 'bg-[#364325] text-[#d7c494] shadow-md'
                : 'text-[#445330] hover:text-[#1e2715] hover:bg-[#dfd5bf]'
            }`}
          >
            <Ticket className="w-4 h-4" />
            <span>Book Conclave Passes</span>
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

      {confirmedTicket ? (
        /* Confirmed Ticket Card */
        <div className="max-w-3xl mx-auto space-y-8 animate-in fade-in-50 duration-300">
          <div className="p-5 rounded-2xl bg-[#ebf0e2] border border-[#b8cbb0] text-[#242c18] flex items-start gap-3 shadow-sm">
            <CheckCircle2 className="w-6 h-6 text-[#475731] shrink-0 mt-0.5" />
            <div className="flex-1">
              <h3 className="font-serif font-bold text-lg text-[#242c18]">
                Booking Confirmed & Badge Generated!
              </h3>
              <p className="text-xs text-[#556345] mt-1">
                Your pass reference code <span className="font-mono font-bold text-[#242c18]">{confirmedTicket.ticketCode}</span> has been confirmed. Present this digital badge or printable pass at gate security. Venue: TBA.
              </p>
            </div>
            <button
              onClick={openPassModal}
              className="px-4 py-2 bg-[#364325] hover:bg-[#475731] text-[#d7c494] rounded-xl text-xs font-bold transition-colors shadow flex items-center gap-1.5 shrink-0 border border-[#5b6e41]/50"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print Pass</span>
            </button>
          </div>

          <div className="bg-[#faf7f0] border-2 border-[#cfc5b0] rounded-3xl p-6 sm:p-8 shadow-xl">
            <div className="bg-[#242c18] text-[#d7c494] -mx-6 -mt-6 sm:-mx-8 sm:-mt-8 px-6 py-4 mb-6 flex flex-wrap items-center justify-between gap-3 border-b border-[#475731]">
              <div className="flex items-center gap-2">
                <Ticket className="w-5 h-5 text-[#d7c494]" />
                <span className="font-serif font-bold text-base text-white">
                  {confirmedTicket.tierName}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono bg-[#364325] text-[#d7c494] px-3 py-1 rounded-lg font-bold border border-[#5b6e41]/60">
                  {confirmedTicket.ticketCode}
                </span>
                <button
                  type="button"
                  onClick={handleCopyTicketCode}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#364325] hover:bg-[#485932] text-[#d7c494] text-xs font-mono font-bold border border-[#5b6e41]/60 transition-colors cursor-pointer"
                  title="Copy pass code"
                >
                  <Copy className="w-3 h-3" />
                  <span>{copied ? 'Copied!' : 'Copy'}</span>
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
              <div className="md:col-span-2 space-y-4">
                <div>
                  <span className="text-[10px] uppercase font-bold text-[#6b775f] tracking-wider block">
                    Passholder
                  </span>
                  <h2 className="font-serif text-2xl font-bold text-[#242c18]">
                    {confirmedTicket.fullName}
                  </h2>
                  <p className="text-xs text-[#556345] font-mono">
                    {confirmedTicket.email} • {confirmedTicket.whatsappPhone}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4 pt-2 border-t border-[#dfd7c5] text-xs">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-[#6b775f] block">Quantity</span>
                    <span className="font-bold text-[#242c18]">{confirmedTicket.quantity} Passes</span>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold text-[#6b775f] block">Total Amount</span>
                    <span className="font-bold text-[#364325] font-mono text-sm">
                      ₹{confirmedTicket.totalAmount.toLocaleString('en-IN')}
                    </span>
                  </div>
                </div>

                {confirmedTicket.seats && confirmedTicket.seats.length > 0 && (
                  <div className="pt-2 border-t border-[#dfd7c5]">
                    <span className="text-[10px] uppercase font-bold text-[#6b775f] block">Assigned Seats</span>
                    <div className="flex flex-wrap gap-1.5 mt-1">
                      {confirmedTicket.seats.map((seat) => (
                        <span key={seat} className="px-2 py-0.5 bg-[#364325] text-[#d7c494] font-mono text-xs font-bold rounded-md">
                          Seat {seat}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                <div className="p-2.5 rounded-xl bg-[#ebf0e2] border border-[#c4d2b5] text-xs font-semibold text-[#242c18] flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-[#475731] shrink-0" />
                  <span>🎉 Garba Night + 🎧 DJ Night Access Fully Included</span>
                </div>

                <div className="pt-2 border-t border-[#dfd7c5] text-xs text-[#556345] flex flex-wrap items-center gap-4">
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

              <div className="flex flex-col items-center justify-center p-4 bg-white rounded-2xl border border-[#dfd7c5] shadow-sm text-center">
                <PassQrCode code={confirmedTicket.ticketCode} size={120} />
                <span className="font-mono text-xs font-bold text-[#242c18] mt-2">
                  {confirmedTicket.ticketCode}
                </span>
                <span className="text-[10px] text-[#364325] font-bold mt-0.5">Confirmed Access</span>
                <div className="mt-3 pt-2 border-t border-[#ece6d8] w-full flex justify-center">
                  <PassBarcode code={confirmedTicket.ticketCode} />
                </div>
              </div>
            </div>

            <div className="mt-8 pt-6 border-t border-[#dfd7c5] flex flex-wrap items-center justify-between gap-4">
              <button
                onClick={() => setConfirmedTicket(null)}
                className="text-xs font-bold text-[#556345] hover:text-[#242c18] underline"
              >
                ← Book Additional Tickets
              </button>
              <button
                onClick={openPassModal}
                className="px-5 py-2.5 bg-[#364325] hover:bg-[#475731] text-[#d7c494] rounded-xl text-xs font-bold transition-all shadow flex items-center gap-2 border border-[#5b6e41]/50"
              >
                <Printer className="w-4 h-4" />
                <span>Open Printable Pass Layout</span>
              </button>
            </div>
          </div>
        </div>
      ) : activeMode === 'lookup' ? (
        /* Code Option: Lookup Ticket Pass by Code */
        <div className="max-w-2xl mx-auto space-y-6 animate-in fade-in-50 duration-300">
          <div className="bg-[#faf7f0] border-2 border-[#cfc5b0] rounded-3xl p-6 sm:p-8 shadow-xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-[#ebf0e2] border border-[#b8cbb0] text-[#364325] flex items-center justify-center">
                <KeyRound className="w-5 h-5" />
              </div>
              <div>
                <h2 className="font-serif text-xl sm:text-2xl font-bold text-[#242c18]">
                  Lookup Ticket Pass (Code Option)
                </h2>
                <p className="text-xs text-[#556345]">
                  Already booked or received a pass code? Enter your tracking code or 10-digit phone number.
                </p>
              </div>
            </div>

            <form onSubmit={handleLookupTicket} className="space-y-4 pt-2">
              <div>
                <label className="block text-xs font-bold text-[#334122] mb-1.5 uppercase tracking-wider">
                  Ticket Pass Code or WhatsApp Number *
                </label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    value={lookupCode}
                    onChange={(e) => {
                      setLookupCode(e.target.value);
                      if (lookupError) setLookupError(null);
                    }}
                    placeholder="e.g. SNGM-TKT-78214 or 9876501234"
                    className="w-full px-4 py-3 pl-10 text-sm bg-white border border-[#cfc5b0] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#5b6e41]/50 text-[#242c18] font-mono"
                  />
                  <Search className="w-4 h-4 text-[#788864] absolute left-3.5 top-3.5" />
                </div>
                <p className="text-[11px] text-[#6b775f] mt-1.5">
                  Enter your unique ticket reference code (e.g. SNGM-TKT-XXXX) or the 10-digit WhatsApp number used during booking.
                </p>
              </div>

              {lookupError && (
                <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-300 text-xs text-amber-900 flex items-start gap-2.5">
                  <AlertCircle className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                  <span className="leading-snug">{lookupError}</span>
                </div>
              )}

              <div className="pt-2 flex flex-col sm:flex-row items-center gap-3">
                <button
                  type="submit"
                  disabled={lookupLoading}
                  className="w-full sm:w-auto px-6 py-3 bg-[#364325] hover:bg-[#475731] text-[#d7c494] text-xs font-bold rounded-xl shadow transition-all disabled:opacity-50 flex items-center justify-center gap-2 border border-[#5b6e41]/60 cursor-pointer"
                >
                  {lookupLoading ? (
                    <span>Verifying Code...</span>
                  ) : (
                    <>
                      <Search className="w-4 h-4" />
                      <span>Retrieve Pass Badge</span>
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setActiveMode('book');
                    setLookupError(null);
                  }}
                  className="w-full sm:w-auto px-4 py-3 bg-[#ede4d2] hover:bg-[#dfd5bf] text-[#242c18] text-xs font-bold rounded-xl transition-all border border-[#cfc4ad] text-center cursor-pointer"
                >
                  ← Book New Tickets
                </button>
              </div>
            </form>

            <div className="mt-6 pt-5 border-t border-[#dfd7c5] text-xs text-[#556345] space-y-2">
              <div className="flex items-center gap-2">
                <Sparkles className="w-3.5 h-3.5 text-[#5b6e41]" />
                <span>Instant verification against central Cultrahus festival registry.</span>
              </div>
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-3.5 h-3.5 text-[#5b6e41]" />
                <span>Displays printable badge with authentic security QR stub.</span>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* Booking Workflow Grid */
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left Column: Tiers & Addons */}
          <div className="lg:col-span-2 space-y-8">
            
            {/* Celebration Highlight: Garba Night & DJ Night ALL INCLUDED */}
            <div className="p-5 sm:p-6 rounded-3xl bg-gradient-to-r from-[#222b17] via-[#2f3b20] to-[#1c2413] text-[#f4efe4] border-2 border-[#d7c494]/70 shadow-lg relative overflow-hidden">
              <div className="flex flex-wrap items-center justify-between gap-2 mb-2.5">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#d7c494] text-[#1c2313] text-[11px] font-black uppercase tracking-wider shadow-sm">
                  <Sparkles className="w-3.5 h-3.5" />
                  All-Inclusive Festival Passes
                </span>
                <span className="text-xs text-[#d7c494] font-medium font-mono">
                  Sunday, 18 October 2026 • 5 Live Stages
                </span>
              </div>

              <h2 className="font-serif text-2xl sm:text-3xl font-extrabold text-[#f4efe4] tracking-tight leading-snug">
                🎉 Garba Night + 🎧 DJ Night — <span className="text-[#e8d5a7] underline decoration-[#d7c494]/60 underline-offset-4">ALL INCLUDED</span> in Every Pass!
              </h2>

              <p className="mt-2 text-[#cfdac1] text-xs sm:text-sm leading-relaxed max-w-2xl">
                No separate ticket required! Every festival pass tier (Classic ₹200, Royal Patron ₹400, or VIP Sovereign ₹600) includes full unrestricted access to the evening <strong className="text-white">Grand Garba Night & Dandiya Raas</strong> followed by the high-octane <strong className="text-white">Celebrity DJ & EDM Night</strong>, alongside all auditorium theatre plays and cultural showcases at zero extra charge.
              </p>

              <div className="mt-4 pt-3.5 border-t border-[#465732] flex flex-wrap items-center gap-2 sm:gap-3 text-xs">
                <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#364325]/90 border border-[#5b6e41] text-[#d7c494] font-semibold">
                  <Music className="w-3.5 h-3.5 text-[#d7c494]" />
                  <span>Grand Garba Night Included</span>
                </div>
                <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#364325]/90 border border-[#5b6e41] text-[#d7c494] font-semibold">
                  <Disc className="w-3.5 h-3.5 text-[#d7c494]" />
                  <span>Mega DJ Night Included</span>
                </div>
                <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#364325]/90 border border-[#5b6e41] text-[#f4efe4] font-semibold">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#d7c494]" />
                  <span>Auditorium Theatre & 5 Stages</span>
                </div>
              </div>
            </div>

            {/* Tier Selection Cards */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <label className="block text-xs font-bold uppercase tracking-wider text-[#242c18]">
                  Select Pass Tier
                </label>
                <span className="text-xs text-[#5b6e41] font-bold">
                  ✓ Garba & DJ Night Included with all tiers
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                
                {/* Classic (₹200) - No Food */}
                <div
                  onClick={() => handleTierChange('classic')}
                  className={`p-5 rounded-2xl border-2 cursor-pointer transition-all relative ${
                    tier === 'classic'
                      ? 'border-[#5b6e41] bg-[#ebf0e2] shadow-md'
                      : 'border-[#dfd7c5] bg-white hover:border-[#5b6e41]/50'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono font-bold text-[#6b775f] uppercase block">Tier 01</span>
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-[#9a3412]/10 text-[#9a3412] border border-[#fed7aa]">
                      No Food
                    </span>
                  </div>
                  <h3 className="font-serif text-xl font-bold text-[#242c18] mt-1">Classic Pass</h3>
                  <div className="mt-2 flex items-baseline gap-2">
                    <span className="text-2xl font-black font-mono text-[#364325]">₹200</span>
                    <span className="text-sm font-mono text-[#828f74] line-through font-semibold">₹350</span>
                  </div>
                  <ul className="mt-3 space-y-1.5 text-xs text-[#556345]">
                    <li className="flex items-center gap-1.5 font-bold text-[#b43838]">
                      <span className="w-3.5 h-3.5 rounded-full bg-red-100 text-red-700 flex items-center justify-center text-[10px] font-black shrink-0">✕</span>
                      <span>No food included</span>
                    </li>
                    <li className="flex items-center gap-1.5 font-semibold text-[#242c18]">
                      <CheckCircle2 className="w-3.5 h-3.5 text-[#5b6e41] shrink-0" />
                      <span>Garba Night + DJ Night Included</span>
                    </li>
                    <li className="flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-[#5b6e41] shrink-0" />
                      <span>General tiered auditorium seating</span>
                    </li>
                    <li className="flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-[#5b6e41] shrink-0" />
                      <span>Access to all 5 stages</span>
                    </li>
                  </ul>
                </div>

                {/* Royal Patron (₹400) - High Tea Box Included */}
                <div
                  onClick={() => handleTierChange('royal')}
                  className={`p-5 rounded-2xl border-2 cursor-pointer transition-all relative ${
                    tier === 'royal'
                      ? 'border-[#5b6e41] bg-[#ebf0e2] shadow-md'
                      : 'border-[#dfd7c5] bg-white hover:border-[#5b6e41]/50'
                  }`}
                >
                  <div className="absolute -top-3 right-3 bg-[#364325] text-[#d7c494] text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider shadow">
                    Popular
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono font-bold text-[#5b6e41] uppercase block">Tier 02</span>
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-[#485932]/10 text-[#364325] border border-[#c4d2b5]">
                      Save ₹200
                    </span>
                  </div>
                  <h3 className="font-serif text-xl font-bold text-[#242c18] mt-1">Royal Patron</h3>
                  <div className="mt-2 flex items-baseline gap-2">
                    <span className="text-2xl font-black font-mono text-[#364325]">₹400</span>
                    <span className="text-sm font-mono text-[#828f74] line-through font-semibold">₹600</span>
                  </div>
                  <ul className="mt-3 space-y-1.5 text-xs text-[#556345]">
                    <li className="flex items-center gap-1.5 font-semibold text-[#242c18]">
                      <CheckCircle2 className="w-3.5 h-3.5 text-[#5b6e41] shrink-0" />
                      <span>High Tea & Refreshment Box Included</span>
                    </li>
                    <li className="flex items-center gap-1.5 font-semibold text-[#242c18]">
                      <CheckCircle2 className="w-3.5 h-3.5 text-[#5b6e41] shrink-0" />
                      <span>Garba Night + DJ Night Included</span>
                    </li>
                    <li className="flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-[#5b6e41] shrink-0" />
                      <span>Mid-tier reserved seats</span>
                    </li>
                    <li className="flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-[#5b6e41] shrink-0" />
                      <span>Access to 5 stages & Souvenir programme</span>
                    </li>
                  </ul>
                </div>

                {/* VIP Sovereign (₹600) - Food Included */}
                <div
                  onClick={() => handleTierChange('sovereign')}
                  className={`p-5 rounded-2xl border-2 cursor-pointer transition-all relative ${
                    tier === 'sovereign'
                      ? 'border-[#5b6e41] bg-[#ebf0e2] shadow-md'
                      : 'border-[#dfd7c5] bg-white hover:border-[#5b6e41]/50'
                  }`}
                >
                  <div className="absolute -top-3 right-3 bg-[#24431e] text-[#d7c494] text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider shadow">
                    Food Included
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono font-bold text-[#364325] uppercase block">Tier 03</span>
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-[#24431e]/10 text-[#24431e] border border-[#a8c99b]">
                      Save ₹450
                    </span>
                  </div>
                  <h3 className="font-serif text-xl font-bold text-[#242c18] mt-1">VIP Sovereign</h3>
                  <div className="mt-2 flex items-baseline gap-2">
                    <span className="text-2xl font-black font-mono text-[#364325]">₹600</span>
                    <span className="text-sm font-mono text-[#828f74] line-through font-semibold">₹1,050</span>
                  </div>
                  <ul className="mt-3 space-y-1.5 text-xs text-[#556345]">
                    <li className="flex items-center gap-1.5 font-black text-[#1e4a19]">
                      <CheckCircle2 className="w-3.5 h-3.5 text-[#2e6827] shrink-0" />
                      <span className="underline decoration-[#4a8a42]/50 underline-offset-2">Food included (Royal Banquet Dining)</span>
                    </li>
                    <li className="flex items-center gap-1.5 font-semibold text-[#242c18]">
                      <CheckCircle2 className="w-3.5 h-3.5 text-[#5b6e41] shrink-0" />
                      <span>Garba Night + DJ Night Included</span>
                    </li>
                    <li className="flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-[#5b6e41] shrink-0" />
                      <span>Front rows (A & B)</span>
                    </li>
                    <li className="flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-[#5b6e41] shrink-0" />
                      <span>VIP lounge & artists meet</span>
                    </li>
                    <li className="flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-[#5b6e41] shrink-0" />
                      <span>Fast-track security entry</span>
                    </li>
                  </ul>
                </div>

              </div>
            </div>

          </div>

          {/* Right Column: Checkout & Summary */}
          <div className="space-y-6">
            <div className="bg-[#faf7f0] border border-[#cfc5b0] rounded-3xl p-6 shadow-md sticky top-28">
              
              <div className="border-b border-[#dfd7c5] pb-4 mb-4">
                <span className="text-[10px] uppercase font-bold text-[#5b6e41] tracking-wider">
                  Order Summary
                </span>
                <h3 className="font-serif text-xl font-bold text-[#242c18]">
                  Passholder Checkout
                </h3>
              </div>

              {errorMsg && (
                <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-red-800 text-xs flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                  <span>{errorMsg}</span>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                
                <div>
                  <label className="block text-xs font-semibold text-[#334122] mb-1">
                    Pass Quantity
                  </label>
                  <div className="flex items-center gap-2">
                    {[1, 2, 3, 4, 5].map((q) => (
                      <button
                        type="button"
                        key={q}
                        onClick={() => setQuantity(q)}
                        className={`flex-1 py-1.5 text-xs font-mono font-bold rounded-xl border transition-colors ${
                          quantity === q
                            ? 'bg-[#364325] text-[#d7c494] border-[#364325]'
                            : 'bg-white text-[#334122] border-[#dfd7c5] hover:bg-[#f3eee4]'
                        }`}
                      >
                        {q}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#334122] mb-1">
                    Primary Passholder Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.fullName}
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                    placeholder="e.g. Meera Ramanathan"
                    className="w-full px-3 py-2 text-xs bg-white border border-[#cfc5b0] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#5b6e41]/50 text-[#242c18]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#334122] mb-1">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="meera@example.com"
                    className="w-full px-3 py-2 text-xs bg-white border border-[#cfc5b0] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#5b6e41]/50 text-[#242c18]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#334122] mb-1">
                    WhatsApp Phone Number (10 Digits) *
                  </label>
                  <input
                    type="tel"
                    inputMode="numeric"
                    maxLength={10}
                    pattern="[0-9]{10}"
                    required
                    value={formData.whatsappPhone}
                    onChange={(e) => {
                      const digits = e.target.value.replace(/\D/g, '').slice(0, 10);
                      setFormData({ ...formData, whatsappPhone: digits });
                    }}
                    placeholder="e.g. 9876501234"
                    className="w-full px-3 py-2 text-xs bg-white border border-[#cfc5b0] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#5b6e41]/50 text-[#242c18] font-mono"
                  />
                  <div className="flex justify-end mt-1 text-[10px] text-[#6b775f]">
                    <span className={formData.whatsappPhone.length === 10 ? 'text-[#3b4928] font-bold' : 'text-[#a03232]'}>
                      {formData.whatsappPhone.length}/10 digits
                    </span>
                  </div>
                </div>

                {/* Price Breakdown */}
                <div className="pt-3 border-t border-[#dfd7c5] space-y-2 text-xs text-[#556345]">
                  <div className="flex justify-between items-center">
                    <span>
                      {tier.toUpperCase()} Pass ({quantity}x)
                    </span>
                    <div className="flex items-center gap-1.5">
                      <span className="font-mono text-[#828f74] line-through text-[11px]">
                        ₹{(tierOriginalPrices[tier] * quantity).toLocaleString('en-IN')}
                      </span>
                      <span className="font-mono font-bold text-[#242c18]">
                        ₹{(basePricePerTicket * quantity).toLocaleString('en-IN')}
                      </span>
                    </div>
                  </div>

                  <div className="flex justify-between items-center text-[11px]">
                    <span className="text-[#6b775f]">Dining / Food:</span>
                    <span className={`font-semibold ${tier === 'classic' ? 'text-[#a03232]' : 'text-[#2e5d1e]'}`}>
                      {tier === 'sovereign'
                        ? '🍽️ Food Included (Royal Dining)'
                        : tier === 'royal'
                        ? '☕ High Tea Box Included'
                        : '✕ No food included'}
                    </span>
                  </div>

                  <div className="pt-2 border-t border-[#cfc5b0] flex justify-between items-center text-sm font-bold text-[#242c18]">
                    <div>
                      <span>Total Payable</span>
                      <div className="text-[10px] font-medium text-[#475731]">
                        Saved ₹{((tierOriginalPrices[tier] - basePricePerTicket) * quantity).toLocaleString('en-IN')} on tickets
                      </div>
                    </div>
                    <span className="font-mono text-base text-[#364325]">
                      ₹{totalAmount.toLocaleString('en-IN')}
                    </span>
                  </div>
                </div>

                {/* Garba + DJ Night Inclusion Callout */}
                <div className="p-3 rounded-xl bg-[#ebf0e2] border border-[#c4d2b5] text-[11px] text-[#242c18] flex items-start gap-2.5 shadow-sm">
                  <Sparkles className="w-4 h-4 text-[#475731] shrink-0 mt-0.5" />
                  <div className="leading-snug">
                    <strong className="text-[#1c2413] font-bold block">
                      🎉 Garba Night + 🎧 DJ Night Included!
                    </strong>
                    <span className="text-[#4b5936] text-[10px]">
                      Complimentary all-access pass to the evening celebrations with every ticket. No separate fee.
                    </span>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full py-3 bg-[#364325] hover:bg-[#475731] text-[#f4efe4] text-xs font-bold rounded-xl shadow transition-all disabled:opacity-50 flex items-center justify-center gap-2 border border-[#5b6e41]/60"
                >
                  {submitting ? (
                    <span>Issuing Passes...</span>
                  ) : (
                    <>
                      <span className="text-[#d7c494]">Book Passes & Generate Badge</span>
                      <ChevronRight className="w-4 h-4 text-[#d7c494]" />
                    </>
                  )}
                </button>

                <p className="text-[10px] text-[#6b775f] text-center">
                  Instant confirmed ticket badge with verifiable QR stub. Venue: TBA.
                </p>

              </form>
            </div>
          </div>

        </div>
      )}

    </div>
  );
};
