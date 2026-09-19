import React, { useState } from 'react';
import {
  Building2,
  CheckCircle2,
  Sparkles,
  Award,
  Crown,
  Star,
  ShieldCheck,
  Phone,
  Mail,
  Upload,
  FileText,
  X,
  AlertCircle,
  HelpCircle,
  Briefcase,
  ChevronRight,
  ExternalLink,
  MessageCircle,
  Flame,
  Check
} from 'lucide-react';
import { SponsorshipTier } from '../types';
import { safePostJson } from '../utils/api';

interface SponsorTierConfig {
  id: SponsorshipTier;
  amount: number;
  rateLabel: string;
  name: string;
  headline: string;
  badge?: string;
  isPopular?: boolean;
  colorBg: string;
  colorBorder: string;
  colorAccent: string;
  features: string[];
}

const SPONSORSHIP_TIERS: SponsorTierConfig[] = [
  {
    id: 'Silver Partner',
    amount: 25000,
    rateLabel: '₹25,000',
    name: 'Silver Partner',
    headline: 'A clear first step into the Sangam community, built for meaningful visibility.',
    colorBg: 'bg-[#faf8f5]',
    colorBorder: 'border-[#cfc4ad]',
    colorAccent: 'text-[#5a6c42]',
    features: [
      'Brand logo on select event collateral and communication materials',
      'Mention in official digital circulars & souvenir dossier',
      'Social media acknowledgment across festival handles',
      '2 Complimentary VIP Access Passes to all theatrical showcases',
      'Official Certificate of Cultural Patronage'
    ]
  },
  {
    id: 'Gold Partner',
    amount: 50000,
    rateLabel: '₹50,000',
    name: 'Gold Partner',
    headline: 'Bring your brand into the festival conversation with audience engagement.',
    colorBg: 'bg-[#faf8f5]',
    colorBorder: 'border-[#cfc4ad]',
    colorAccent: 'text-[#b3832f]',
    features: [
      'Prominent logo featured on promotional print, web & stage rollups',
      'Dedicated experiential booth / activation desk at festival promenade',
      'Targeted social media spotlight with brand narrative mention',
      '5 Complimentary VIP Access Passes with front-tier seating',
      'Opportunity to distribute promotional brochures or brand samples',
      'Official Cultural Patronage Plaque & Stage Recognition'
    ]
  },
  {
    id: 'Platinum Partner',
    amount: 75000,
    rateLabel: '₹75,000',
    name: 'Platinum Partner',
    headline: 'High-impact visibility designed to put your brand at the heart of the celebration.',
    badge: 'High Impact',
    colorBg: 'bg-[#fcfaf7]',
    colorBorder: 'border-[#94a3b8]',
    colorAccent: 'text-[#334155]',
    features: [
      'Prominent logo placement on main auditorium proscenium wings & banners',
      'Premium exhibition & experiential engagement space at entrance foyer',
      'Verbal acknowledgments by festival anchors before headline theatricals',
      'Co-branded stage track association (e.g., Nukkad or Classical Track)',
      '8 Complimentary All-Access VIP Passes & Delegate kits',
      'Dedicated digital push with product/brand integration reel'
    ]
  },
  {
    id: 'Presenting Partner',
    amount: 100000,
    rateLabel: '₹1,00,000',
    name: 'Presenting Partner',
    headline: 'Headline title association: Own the spotlight and lead the national conclave.',
    badge: 'Exclusive Title',
    isPopular: true,
    colorBg: 'bg-[#fdfbf6]',
    colorBorder: 'border-[#3b4928]',
    colorAccent: 'text-[#3b4928]',
    features: [
      'Headline Title: "Cultrahus Sangam 2026 Presented by [Your Brand]"',
      'Largest logo prominence on main auditorium backdrop & outdoor arches',
      'Prime large-format experiential activation pavilion at festival grounds',
      'Keynote / Guest of Honour slot during National Conclave Valedictory Ceremony',
      'Broadcast of 60-second brand video film on auditorium screens during intermissions',
      '15 All-Access VIP Passes with reserved front-row director seating',
      'Permanent brand archive inclusion in National Theatre Conclave records'
    ]
  }
];

export const SponsorUsView: React.FC = () => {
  const [selectedTier, setSelectedTier] = useState<SponsorshipTier>('Presenting Partner');
  const [companyName, setCompanyName] = useState('');
  const [contactPerson, setContactPerson] = useState('');
  const [email, setEmail] = useState('');
  const [whatsappPhone, setWhatsappPhone] = useState('');
  const [city, setCity] = useState('');
  const [industry, setIndustry] = useState('');
  const [website, setWebsite] = useState('');
  const [activationSpace, setActivationSpace] = useState<'Yes' | 'No' | 'Custom Request'>('Yes');
  const [objectives, setObjectives] = useState('');
  const [notes, setNotes] = useState('');

  // File upload state for deck
  const [deckFile, setDeckFile] = useState<{
    name: string;
    size: number;
    type: string;
    base64: string;
  } | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);

  // Form Submission State
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [submittedData, setSubmittedData] = useState<any | null>(null);

  const activeTierConfig = SPONSORSHIP_TIERS.find((t) => t.id === selectedTier) || SPONSORSHIP_TIERS[3];

  // Handle phone input strictly 10 digits
  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const numeric = e.target.value.replace(/\D/g, '').slice(0, 10);
    setWhatsappPhone(numeric);
  };

  // Handle city input strictly alphabets and spaces
  const handleCityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    if (val === '' || /^[A-Za-z\s]+$/.test(val)) {
      setCity(val);
    }
  };

  // Handle Deck Upload
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFileError(null);
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];
    const maxSize = 25 * 1024 * 1024; // 25 MB max

    if (file.size > maxSize) {
      setFileError('File size exceeds 25 MB. Please upload a smaller file or link.');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const base64 = reader.result as string;
      setDeckFile({
        name: file.name,
        size: file.size,
        type: file.type || 'application/octet-stream',
        base64
      });
    };
    reader.onerror = () => {
      setFileError('Failed to read file. Please try again.');
    };
    reader.readAsDataURL(file);
  };

  const removeDeckFile = () => {
    setDeckFile(null);
    setFileError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    // Strict Validations
    if (!companyName.trim()) {
      setErrorMessage('Please enter your Brand / Organization name.');
      return;
    }

    if (!contactPerson.trim()) {
      setErrorMessage('Please enter the Contact Person name.');
      return;
    }

    if (!email.trim() || !email.includes('@') || !email.includes('.')) {
      setErrorMessage('Please provide a valid official or Gmail email address.');
      return;
    }

    const cleanPhone = whatsappPhone.replace(/\D/g, '');
    if (cleanPhone.length !== 10) {
      setErrorMessage('Please enter a valid 10-digit mobile / WhatsApp number.');
      return;
    }

    if (!city.trim()) {
      setErrorMessage('Please enter your headquarters or city name (alphabets only).');
      return;
    }

    if (!/^[A-Za-z\s]+$/.test(city.trim())) {
      setErrorMessage('City name must only contain alphabetic characters and spaces.');
      return;
    }

    setIsSubmitting(true);

    try {
      const payload = {
        companyName: companyName.trim(),
        contactPerson: contactPerson.trim(),
        email: email.trim().toLowerCase(),
        whatsappPhone: cleanPhone,
        city: city.trim(),
        tier: selectedTier,
        amount: activeTierConfig.amount,
        industry: industry.trim() || 'Not specified',
        website: website.trim(),
        activationSpace,
        objectives: objectives.trim(),
        notes: notes.trim(),
        deckFileName: deckFile?.name,
        deckFileSize: deckFile?.size,
        deckFileType: deckFile?.type,
        deckFileData: deckFile?.base64
      };

      const resObj = await safePostJson<{ success: boolean; record: any; error?: string }>(
        '/api/sponsor',
        payload
      );

      if (!resObj.success || !resObj.data?.record) {
        setErrorMessage(resObj.error || 'Failed to record sponsorship proposal. Please try again.');
        return;
      }

      setSubmittedData(resObj.data.record);
      window.scrollTo({ top: 100, behavior: 'smooth' });
    } catch {
      setErrorMessage('An error occurred while transmitting your proposal. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-14 space-y-12">
      
      {/* Hero Header */}
      <div className="text-center space-y-4 max-w-3xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#ebf0e2] text-[#344222] border border-[#c3d3b4] text-xs font-bold uppercase tracking-wider">
          <Sparkles className="w-3.5 h-3.5 text-[#5b6e41]" />
          <span>National Conclave Partnership Opportunities</span>
        </div>
        <h1 className="font-serif text-3xl sm:text-5xl font-extrabold text-[#242c18] tracking-tight">
          Sponsor Cultrahus Sangam 2026
        </h1>
        <p className="text-base sm:text-lg text-[#556345] leading-relaxed">
          Position your brand before thousands of performing artists, university delegations, cultural policymakers, and theatre patrons across India.
        </p>

        {/* Quick Contact Badge */}
        <div className="pt-2 flex flex-wrap items-center justify-center gap-4 text-xs font-semibold text-[#3b4928]">
          <span className="flex items-center gap-1.5 bg-[#ede4d2] px-3 py-1.5 rounded-xl border border-[#cfc4ad]">
            <Phone className="w-3.5 h-3.5 text-[#4a5e33]" />
            <span>Sponsorship Desk: +91 98185 61227</span>
          </span>
          <a
            href="https://wa.me/919818561227?text=Hello%20Cultrahus%20Team%2C%20we%20are%20interested%20in%20sponsoring%20Cultrahus%20Sangam%202026."
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 bg-[#3b4928] hover:bg-[#485932] text-[#f7f4ec] px-3.5 py-1.5 rounded-xl transition shadow-xs"
          >
            <MessageCircle className="w-3.5 h-3.5 text-[#e5d4aa]" />
            <span>Chat on WhatsApp</span>
          </a>
        </div>
      </div>

      {/* Confirmation Screen if submitted */}
      {submittedData ? (
        <div className="bg-[#ede4d2] border-2 border-[#cfc4ad] rounded-3xl p-8 sm:p-12 shadow-lg text-center max-w-2xl mx-auto space-y-6 animate-in zoom-in-95 duration-200">
          <div className="w-16 h-16 bg-[#3b4928] text-[#f7f4ec] rounded-2xl flex items-center justify-center mx-auto shadow-md">
            <CheckCircle2 className="w-9 h-9 text-[#e5d4aa]" />
          </div>

          <div className="space-y-2">
            <span className="text-xs uppercase font-bold tracking-widest text-[#556345]">
              Proposal Registered in Organizer Registry
            </span>
            <h2 className="font-serif text-2xl sm:text-3xl font-extrabold text-[#242c18]">
              Thank You, {submittedData.contactPerson}!
            </h2>
            <p className="text-sm text-[#4a5839] max-w-md mx-auto">
              Your partnership proposal for <strong>{submittedData.companyName}</strong> under the <strong>{submittedData.tier}</strong> package has been officially received.
            </p>
          </div>

          {/* Dossier Code Card */}
          <div className="bg-white border border-[#cfc4ad] rounded-2xl p-5 text-left space-y-3 font-mono text-xs shadow-xs">
            <div className="flex justify-between items-center border-b border-[#dfd7c5] pb-2">
              <span className="text-[#6b775f] uppercase tracking-wider font-sans font-bold text-[10px]">
                Sponsorship Reference Code
              </span>
              <span className="font-bold text-sm text-[#3b4928]">{submittedData.sponsorCode}</span>
            </div>
            <div className="flex justify-between items-center py-1">
              <span className="text-[#6b775f] font-sans">Selected Tier:</span>
              <span className="font-bold text-[#242c18]">{submittedData.tier} (₹{Number(submittedData.amount).toLocaleString('en-IN')})</span>
            </div>
            <div className="flex justify-between items-center py-1">
              <span className="text-[#6b775f] font-sans">Brand / Entity:</span>
              <span className="font-bold text-[#242c18]">{submittedData.companyName}</span>
            </div>
            <div className="flex justify-between items-center py-1">
              <span className="text-[#6b775f] font-sans">Registered Email:</span>
              <span className="text-[#242c18]">{submittedData.email}</span>
            </div>
            <div className="flex justify-between items-center py-1">
              <span className="text-[#6b775f] font-sans">WhatsApp Contact:</span>
              <span className="text-[#242c18]">+91 {submittedData.whatsappPhone}</span>
            </div>
            {submittedData.deckFileName && (
              <div className="flex justify-between items-center pt-2 border-t border-[#dfd7c5]">
                <span className="text-[#6b775f] font-sans">Uploaded Deck:</span>
                <span className="text-[#3b4928] font-bold flex items-center gap-1 truncate max-w-[200px]">
                  <FileText className="w-3.5 h-3.5 shrink-0" />
                  {submittedData.deckFileName}
                </span>
              </div>
            )}
          </div>

          <div className="p-4 rounded-xl bg-[#ebf0e2] border border-[#c3d3b4] text-xs text-[#344222] text-left space-y-1">
            <span className="font-bold block uppercase text-[10px] text-[#242c18]">Next Steps</span>
            <p>
              1. Our Festival Sponsorship Directorate will contact your designated lead at <strong>+91 {submittedData.whatsappPhone}</strong> within 24 hours.
            </p>
            <p>
              2. Custom brand activation layouts, booth dimensions, and proscenium deliverables will be finalized with your brand team.
            </p>
          </div>

          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              onClick={() => {
                setSubmittedData(null);
                setCompanyName('');
                setContactPerson('');
                setEmail('');
                setWhatsappPhone('');
                setCity('');
                setDeckFile(null);
                setObjectives('');
                setNotes('');
              }}
              className="w-full sm:w-auto px-6 py-3 rounded-xl bg-[#3b4928] hover:bg-[#485932] text-[#f7f4ec] font-bold text-xs shadow-md transition"
            >
              Submit Another Inquiry
            </button>
            <a
              href="https://wa.me/919818561227?text=Hello%20Cultrahus%20Team%2C%20we%20have%20submitted%20sponsorship%20code%20"
              target="_blank"
              rel="noopener noreferrer"
              className="w-full sm:w-auto px-6 py-3 rounded-xl bg-white hover:bg-[#faf7f0] text-[#242c18] border border-[#cfc4ad] font-bold text-xs transition flex items-center justify-center gap-1.5"
            >
              <MessageCircle className="w-4 h-4 text-[#4a5e33]" />
              <span>Connect on WhatsApp</span>
            </a>
          </div>
        </div>
      ) : (
        <>
          {/* Sponsorship Tier Cards Section */}
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2 border-b border-[#dfd7c5] pb-4">
              <div>
                <span className="text-xs uppercase font-bold tracking-wider text-[#556345] block">
                  Official Partnership Packages
                </span>
                <h2 className="font-serif text-2xl sm:text-3xl font-extrabold text-[#242c18]">
                  Select Your Sponsorship Tier
                </h2>
              </div>
              <p className="text-xs text-[#556345]">
                Tap any package to customize deliverables and proceed with proposal submission
              </p>
            </div>

            {/* 4 Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5">
              {SPONSORSHIP_TIERS.map((tier) => {
                const isSelected = selectedTier === tier.id;
                return (
                  <div
                    key={tier.id}
                    onClick={() => setSelectedTier(tier.id)}
                    className={`relative rounded-3xl p-6 border-2 transition-all cursor-pointer flex flex-col justify-between ${
                      isSelected
                        ? 'border-[#3b4928] bg-[#ede4d2] shadow-lg ring-2 ring-[#3b4928]/30 transform -translate-y-1'
                        : 'border-[#cfc4ad] bg-white hover:border-[#a89b80] hover:bg-[#faf8f3] shadow-xs'
                    }`}
                  >
                    {/* Top Badges */}
                    <div className="flex items-center justify-between gap-2 min-h-[28px]">
                      {tier.badge ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wide bg-[#3b4928] text-[#e5d4aa]">
                          {tier.id === 'Presenting Partner' ? <Crown className="w-3 h-3" /> : <Star className="w-3 h-3" />}
                          <span>{tier.badge}</span>
                        </span>
                      ) : (
                        <span className="text-[11px] font-semibold text-[#6b775f]">Conclave Package</span>
                      )}

                      <div
                        className={`w-6 h-6 rounded-full flex items-center justify-center border transition-colors ${
                          isSelected
                            ? 'bg-[#3b4928] border-[#3b4928] text-[#f7f4ec]'
                            : 'border-[#cfc4ad] bg-white text-transparent'
                        }`}
                      >
                        <Check className="w-3.5 h-3.5" />
                      </div>
                    </div>

                    {/* Pricing & Name */}
                    <div className="mt-4 space-y-1">
                      <h3 className="font-serif text-xl font-bold text-[#242c18]">{tier.name}</h3>
                      <div className="flex items-baseline gap-1.5 pt-1">
                        <span className="font-serif text-3xl sm:text-4xl font-extrabold text-[#3b4928]">
                          {tier.rateLabel}
                        </span>
                        <span className="text-xs font-semibold text-[#556345]">/ festival</span>
                      </div>
                      <p className="text-xs text-[#556345] leading-relaxed pt-2 min-h-[50px]">
                        {tier.headline}
                      </p>
                    </div>

                    {/* Feature List */}
                    <div className="mt-6 pt-5 border-t border-[#dfd7c5] space-y-2.5 flex-1">
                      <span className="text-[10px] uppercase font-bold tracking-wider text-[#6b775f] block">
                        Included Deliverables
                      </span>
                      <ul className="space-y-2 text-xs text-[#344222]">
                        {tier.features.map((feat, fIdx) => (
                          <li key={fIdx} className="flex items-start gap-2 leading-snug">
                            <CheckCircle2 className="w-3.5 h-3.5 text-[#5b6e41] shrink-0 mt-0.5" />
                            <span>{feat}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Selection Button */}
                    <div className="mt-6 pt-4">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedTier(tier.id);
                        }}
                        className={`w-full py-2.5 px-4 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                          isSelected
                            ? 'bg-[#3b4928] text-[#f7f4ec] shadow-sm'
                            : 'bg-[#ede4d2] hover:bg-[#dfd4be] text-[#242c18]'
                        }`}
                      >
                        <span>{isSelected ? 'Selected Package' : `Select ${tier.name}`}</span>
                        {isSelected && <Check className="w-3.5 h-3.5 text-[#e5d4aa]" />}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Form & Upload Section */}
          <div className="bg-[#ede4d2] border-2 border-[#cfc4ad] rounded-3xl p-6 sm:p-10 shadow-sm space-y-8">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-[#dfd7c5] pb-6">
              <div>
                <span className="text-xs uppercase font-bold tracking-wider text-[#556345] block">
                  Official Partnership Dossier
                </span>
                <h3 className="font-serif text-2xl sm:text-3xl font-extrabold text-[#242c18] mt-0.5">
                  Submit Sponsorship Proposal
                </h3>
                <p className="text-xs text-[#556345] mt-1">
                  Selected Tier: <strong className="text-[#3b4928]">{activeTierConfig.name} ({activeTierConfig.rateLabel})</strong>. All data transmits straight to the Organizer Registry.
                </p>
              </div>

              {/* Tier Pill Switcher */}
              <div className="bg-white/80 p-1.5 rounded-2xl border border-[#cfc4ad] flex flex-wrap gap-1">
                {SPONSORSHIP_TIERS.map((t) => (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => setSelectedTier(t.id)}
                    className={`px-3 py-1 rounded-xl text-xs font-bold transition ${
                      selectedTier === t.id
                        ? 'bg-[#3b4928] text-[#f7f4ec] shadow-xs'
                        : 'text-[#556345] hover:text-[#242c18]'
                    }`}
                  >
                    {t.rateLabel}
                  </button>
                ))}
              </div>
            </div>

            {/* Error banner */}
            {errorMessage && (
              <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              
              {/* Row 1: Brand Name & Contact Person */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-xs font-bold text-[#344222] uppercase tracking-wider mb-1.5">
                    Brand / Company / Organization Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g., Nexus Media Labs / Heritage Arts Ltd."
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-[#cfc4ad] bg-white text-[#242c18] text-sm focus:outline-none focus:ring-2 focus:ring-[#3b4928] shadow-xs"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#344222] uppercase tracking-wider mb-1.5">
                    Authorized Contact Person Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g., Rajesh Mehta / Priya Sharma"
                    value={contactPerson}
                    onChange={(e) => setContactPerson(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-[#cfc4ad] bg-white text-[#242c18] text-sm focus:outline-none focus:ring-2 focus:ring-[#3b4928] shadow-xs"
                  />
                </div>
              </div>

              {/* Row 2: Email & Phone & City */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                <div>
                  <label className="block text-xs font-bold text-[#344222] uppercase tracking-wider mb-1.5">
                    Official Email / Gmail <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="brandlead@gmail.com / corporate@nexus.in"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-[#cfc4ad] bg-white text-[#242c18] text-sm focus:outline-none focus:ring-2 focus:ring-[#3b4928] shadow-xs"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#344222] uppercase tracking-wider mb-1.5">
                    WhatsApp / Mobile Number (10 digits) <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-[#6b775f]">
                      +91
                    </span>
                    <input
                      type="tel"
                      required
                      maxLength={10}
                      placeholder="9818561227"
                      value={whatsappPhone}
                      onChange={handlePhoneChange}
                      className="w-full pl-12 pr-4 py-3 rounded-xl border border-[#cfc4ad] bg-white text-[#242c18] text-sm font-mono focus:outline-none focus:ring-2 focus:ring-[#3b4928] shadow-xs"
                    />
                  </div>
                  <span className="text-[10px] text-[#6b775f] mt-1 block">
                    10 numeric digits only (e.g. 9818561227)
                  </span>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#344222] uppercase tracking-wider mb-1.5">
                    Headquarters / City <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g., New Delhi, Mumbai, Bengaluru"
                    value={city}
                    onChange={handleCityChange}
                    className="w-full px-4 py-3 rounded-xl border border-[#cfc4ad] bg-white text-[#242c18] text-sm focus:outline-none focus:ring-2 focus:ring-[#3b4928] shadow-xs"
                  />
                  <span className="text-[10px] text-[#6b775f] mt-1 block">
                    Alphabets and spaces only
                  </span>
                </div>
              </div>

              {/* Row 3: Industry & Website & Activation Space */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                <div>
                  <label className="block text-xs font-bold text-[#344222] uppercase tracking-wider mb-1.5">
                    Industry / Sector
                  </label>
                  <input
                    type="text"
                    placeholder="e.g., Tech, EdTech, Hospitality, FMCG"
                    value={industry}
                    onChange={(e) => setIndustry(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-[#cfc4ad] bg-white text-[#242c18] text-sm focus:outline-none focus:ring-2 focus:ring-[#3b4928] shadow-xs"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#344222] uppercase tracking-wider mb-1.5">
                    Website / Brand Handle
                  </label>
                  <input
                    type="text"
                    placeholder="https://brand.com or @instagram"
                    value={website}
                    onChange={(e) => setWebsite(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-[#cfc4ad] bg-white text-[#242c18] text-sm focus:outline-none focus:ring-2 focus:ring-[#3b4928] shadow-xs"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#344222] uppercase tracking-wider mb-1.5">
                    Festival Stall / Booth Space Required?
                  </label>
                  <select
                    value={activationSpace}
                    onChange={(e) => setActivationSpace(e.target.value as any)}
                    className="w-full px-4 py-3 rounded-xl border border-[#cfc4ad] bg-white text-[#242c18] text-sm focus:outline-none focus:ring-2 focus:ring-[#3b4928] shadow-xs"
                  >
                    <option value="Yes">Yes, Standard Booth / Activation Space</option>
                    <option value="No">No, Branding & Digital Placement Only</option>
                    <option value="Custom Request">Custom Request (Large Pavilion)</option>
                  </select>
                </div>
              </div>

              {/* Sponsorship Tier Confirmation Box */}
              <div className="p-4 rounded-2xl bg-white border border-[#cfc4ad] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#ebf0e2] text-[#344222] flex items-center justify-center shrink-0 border border-[#c3d3b4]">
                    <Crown className="w-5 h-5 text-[#3b4928]" />
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold text-[#6b775f] tracking-wider block">
                      Confirmed Sponsorship Package
                    </span>
                    <span className="font-serif text-lg font-bold text-[#242c18]">
                      {activeTierConfig.name} — {activeTierConfig.rateLabel}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs text-[#556345]">Want to change tier?</span>
                  <select
                    value={selectedTier}
                    onChange={(e) => setSelectedTier(e.target.value as SponsorshipTier)}
                    className="px-3 py-1.5 rounded-xl border border-[#cfc4ad] bg-[#fbf9f4] font-bold text-xs text-[#242c18]"
                  >
                    {SPONSORSHIP_TIERS.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.name} ({t.rateLabel})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* File Upload: Sponsorship Deck / Brand Profile */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-[#344222] uppercase tracking-wider">
                  Upload Sponsorship Deck / Brand Profile (PDF / PPT / Images)
                </label>
                <p className="text-[11px] text-[#556345]">
                  Attach your corporate media kit, deck, or logo requirements for the Curation Directorate to review.
                </p>

                {deckFile ? (
                  <div className="flex items-center justify-between p-4 rounded-2xl bg-white border-2 border-[#3b4928]/40 shadow-xs">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-10 h-10 rounded-xl bg-[#ebf0e2] text-[#3b4928] flex items-center justify-center shrink-0">
                        <FileText className="w-5 h-5" />
                      </div>
                      <div className="truncate">
                        <span className="text-xs font-bold text-[#242c18] block truncate">
                          {deckFile.name}
                        </span>
                        <span className="text-[10px] text-[#6b775f]">
                          {(deckFile.size / (1024 * 1024)).toFixed(2)} MB • Ready for submission
                        </span>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={removeDeckFile}
                      className="p-1.5 rounded-lg text-[#8c3b3b] hover:bg-red-50 transition"
                      title="Remove file"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                ) : (
                  <label className="border-2 border-dashed border-[#b5a990] hover:border-[#3b4928] bg-white/70 hover:bg-white transition-all rounded-2xl p-6 text-center flex flex-col items-center justify-center gap-2 cursor-pointer shadow-xs">
                    <Upload className="w-6 h-6 text-[#556345]" />
                    <span className="text-xs font-bold text-[#242c18]">
                      Click to choose or drag & drop Sponsorship Deck / Company Profile
                    </span>
                    <span className="text-[10px] text-[#6b775f]">
                      Supported formats: PDF, PPTX, PPT, DOCX, PNG, JPG (Max 25 MB)
                    </span>
                    <input
                      type="file"
                      accept=".pdf,.pptx,.ppt,.docx,.png,.jpg,.jpeg"
                      onChange={handleFileSelect}
                      className="hidden"
                    />
                  </label>
                )}

                {fileError && (
                  <p className="text-xs text-red-600 font-semibold">{fileError}</p>
                )}
              </div>

              {/* Objectives & Custom Deliverables */}
              <div>
                <label className="block text-xs font-bold text-[#344222] uppercase tracking-wider mb-1.5">
                  Brand Objectives / Custom Requirements / Specific Requests
                </label>
                <textarea
                  rows={3}
                  placeholder="Tell us what outcomes your brand is targeting: e.g., product launch, student recruitment, brand awareness, hospitality showcase, or specific stage integration..."
                  value={objectives}
                  onChange={(e) => setObjectives(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-[#cfc4ad] bg-white text-[#242c18] text-sm focus:outline-none focus:ring-2 focus:ring-[#3b4928] shadow-xs"
                />
              </div>

              {/* Submit CTA */}
              <div className="pt-4 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-[#dfd7c5]">
                <div className="text-xs text-[#556345]">
                  Direct inquiries helpline: <strong>+91 98185 61227</strong>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full sm:w-auto px-8 py-4 rounded-xl bg-[#3b4928] hover:bg-[#485932] text-[#f7f4ec] font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  <Building2 className="w-4 h-4 text-[#e5d4aa]" />
                  <span>
                    {isSubmitting
                      ? 'Submitting Proposal...'
                      : `Submit ${activeTierConfig.name} Proposal (${activeTierConfig.rateLabel})`}
                  </span>
                </button>
              </div>

            </form>
          </div>

          {/* Direct WhatsApp / Helpline Banner */}
          <div className="bg-[#f2ecde] border border-[#cfc4ad] rounded-2xl p-6 sm:p-8 flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="space-y-1 text-center md:text-left">
              <span className="text-[10px] uppercase font-bold tracking-wider text-[#556345] block">
                Direct Curation Liaison
              </span>
              <h4 className="font-serif text-xl font-bold text-[#242c18]">
                Need a Custom Corporate Partnership Package?
              </h4>
              <p className="text-xs text-[#556345] max-w-xl">
                We design tailored sponsorships for title tracks, hospitality lounges, collegiate youth awards, and sound & lighting prosceniums.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <a
                href="tel:9818561227"
                className="px-4 py-2.5 rounded-xl bg-white hover:bg-[#faf7f0] text-[#242c18] border border-[#cfc4ad] font-bold text-xs transition flex items-center gap-1.5"
              >
                <Phone className="w-3.5 h-3.5 text-[#4a5e33]" />
                <span>+91 98185 61227</span>
              </a>
              <a
                href="https://wa.me/919818561227?text=Hello%20Cultrahus%20Team%2C%20we%20want%20to%20discuss%20custom%20sponsorship%20for%20Sangam%202026."
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2.5 rounded-xl bg-[#3b4928] hover:bg-[#485932] text-[#f7f4ec] font-bold text-xs transition flex items-center gap-1.5 shadow-xs"
              >
                <MessageCircle className="w-3.5 h-3.5 text-[#e5d4aa]" />
                <span>WhatsApp Sponsorship Desk</span>
              </a>
            </div>
          </div>
        </>
      )}

    </div>
  );
};
