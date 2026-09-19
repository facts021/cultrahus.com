import React, { useState } from 'react';
import {
  Users,
  CheckCircle2,
  AlertCircle,
  Printer,
  Sparkles,
  Phone,
  Briefcase,
  Clock,
  UserPlus,
  HelpCircle,
  FileText,
  ShieldCheck
} from 'lucide-react';
import { SecretariatRecord } from '../types';
import { PassQrCode, PassBarcode } from './PassQrCode';
import { CultrahusLogo } from './CultrahusLogo';
import { safePostJson } from '../utils/api';

interface SecretariatPortalViewProps {
  onPassGenerated: (passData: any) => void;
}

const DEPARTMENTS = [
  {
    id: 'MANAGEMENT',
    label: 'MANAGEMENT',
    description: 'Event operations, crowd management, timeline execution, and overall venue coordination.'
  },
  {
    id: 'CONTENT',
    label: 'CONTENT',
    description: 'Curating speeches, drafting official communication, anchor scripts, and event documentation.'
  },
  {
    id: 'GRAPHICS',
    label: 'GRAPHICS',
    description: 'Visual identity, banner design, stage visuals, digital assets, and print collaterals.'
  },
  {
    id: 'OUTREACH',
    label: 'OUTREACH',
    description: 'Public relations, institutional tie-ups, VIP invitations, college delegation outreach.'
  },
  {
    id: 'FINANCE',
    label: 'FINANCE',
    description: 'Budget tracking, vendor billing, ticket logistics, resource allocation, and accounts.'
  }
];

export const SecretariatPortalView: React.FC<SecretariatPortalViewProps> = ({ onPassGenerated }) => {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    previousExperience: '',
    department: 'MANAGEMENT',
    whyJoin: '',
    whatsappPhone: '',
    timeCommitment: '',
    referredBy: ''
  });

  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [confirmedSec, setConfirmedSec] = useState<SecretariatRecord | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    // Validation
    if (
      !formData.fullName.trim() ||
      !formData.email.trim() ||
      !formData.previousExperience.trim() ||
      !formData.department ||
      !formData.whyJoin.trim() ||
      !formData.whatsappPhone.trim() ||
      !formData.timeCommitment.trim() ||
      !formData.referredBy.trim()
    ) {
      setErrorMsg('Please fill in all required fields indicated with *.');
      return;
    }

    if (!/^\d{10}$/.test(formData.whatsappPhone)) {
      setErrorMsg('MOBILE NO. must be exactly 10 digits without any alphabets or symbols.');
      return;
    }

    setSubmitting(true);

    try {
      const response = await safePostJson<{ success: boolean; record: SecretariatRecord; error?: string }>(
        '/api/secretariat-apply',
        formData
      );

      if (!response.success || !response.data?.record) {
        setErrorMsg(response.error || 'Failed to submit application. Please try again.');
        return;
      }

      setConfirmedSec(response.data.record);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch {
      setErrorMsg('An error occurred during submission. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const openPassModal = () => {
    if (!confirmedSec) return;
    onPassGenerated({
      type: 'secretariat',
      code: confirmedSec.applicationCode,
      title: `Cultrahus Secretariat: ${confirmedSec.department}`,
      fullName: confirmedSec.fullName,
      email: confirmedSec.email,
      phone: confirmedSec.whatsappPhone,
      detail1Label: 'Department',
      detail1Value: confirmedSec.department,
      detail2Label: 'Referred By',
      detail2Value: confirmedSec.referredBy,
      feePaid: 'Cultrahus Organisation Core Team',
      status: 'Application Received',
      issuedIst: confirmedSec.addedBy?.timestampIst
    });
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      
      {/* Header Banner - Google Forms style branding */}
      <div className="bg-[#ede4d2] border-2 border-[#cfc4ad] rounded-3xl p-6 sm:p-8 mb-8 shadow-sm text-left">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-[#dfd6c3] pb-6 mb-6">
          <div className="flex items-center gap-3">
            <CultrahusLogo size="md" />
            <div>
              <span className="text-[11px] uppercase tracking-widest text-[#5b6e41] font-extrabold block">
                Official Application Form
              </span>
              <h1 className="font-serif text-2xl sm:text-4xl font-extrabold text-[#242c18] leading-tight">
                CULTRAHUS ORGANISATION
              </h1>
            </div>
          </div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-[#cfc4ad] text-xs font-mono text-[#3b4928]">
            <ShieldCheck className="w-4 h-4 text-[#5b6e41]" />
            <span>Secretariat Recruitment</span>
          </div>
        </div>

        <div className="space-y-4 text-sm text-[#3b4928] leading-relaxed">
          <p className="font-medium text-[#242c18] text-base sm:text-lg">
            Cultrahus is an event management company dedicated to creating memorable and well-executed events. From planning and logistics to marketing and on-ground management, Cultrahus focuses on delivering creative, seamless, and engaging experiences.
          </p>

          <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-[#dfd6c3] text-xs text-[#556345]">
            <div className="flex items-center gap-2">
              <span className="font-medium text-[#242c18]">cultrahusorganization@gmail.com</span>
              <span className="text-[#839174]">• Official Communications Desk</span>
            </div>
            <div className="text-[#a03232] font-semibold flex items-center gap-1">
              <span>* Indicates required question</span>
            </div>
          </div>
        </div>
      </div>

      {confirmedSec ? (
        <div className="space-y-8 animate-in fade-in-50 duration-300">
          <div className="p-5 rounded-2xl bg-[#ebf0e2] border border-[#b8cbb0] text-[#242c18] flex items-start gap-3 shadow-sm">
            <CheckCircle2 className="w-6 h-6 text-[#475731] shrink-0 mt-0.5" />
            <div className="flex-1">
              <h3 className="font-serif font-bold text-lg text-[#242c18]">
                Application Submitted Successfully!
              </h3>
              <p className="text-xs text-[#556345] mt-1">
                Your Cultrahus Secretariat application docket code is <span className="font-mono font-bold text-[#242c18]">{confirmedSec.applicationCode}</span>. Our recruitment panel will review your application for the <strong>{confirmedSec.department}</strong> department and reach out via WhatsApp and Email.
              </p>
            </div>
            <button
              onClick={openPassModal}
              className="px-4 py-2 bg-[#364325] hover:bg-[#475731] text-[#d7c494] rounded-xl text-xs font-bold transition-colors shadow flex items-center gap-1.5 shrink-0 border border-[#5b6e41]/50"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print Docket</span>
            </button>
          </div>

          {/* Dossier Card */}
          <div className="bg-[#faf7f0] border-2 border-[#cfc5b0] rounded-3xl p-6 sm:p-8 shadow-xl">
            <div className="bg-[#242c18] text-[#d7c494] -mx-6 -mt-6 sm:-mx-8 sm:-mt-8 px-6 py-4 mb-6 flex flex-wrap items-center justify-between gap-3 border-b border-[#475731]">
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-[#d7c494]" />
                <span className="font-serif font-bold text-base text-white">
                  CULTRAHUS ORGANISATION • {confirmedSec.department}
                </span>
              </div>
              <span className="text-xs font-mono bg-[#364325] text-[#d7c494] px-3 py-1 rounded-lg font-bold border border-[#5b6e41]/60">
                {confirmedSec.applicationCode}
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
              <div className="md:col-span-2 space-y-3.5 text-xs text-[#334122]">
                <div>
                  <span className="text-[10px] uppercase font-bold text-[#6b775f] block">Applicant Name</span>
                  <span className="font-serif text-lg font-bold text-[#242c18]">{confirmedSec.fullName}</span>
                  <p className="text-xs text-[#556345] font-mono">{confirmedSec.email} • {confirmedSec.whatsappPhone}</p>
                </div>

                <div className="grid grid-cols-2 gap-4 pt-2 border-t border-[#dfd7c5]">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-[#6b775f] block">Selected Department</span>
                    <span className="font-bold text-[#364325] text-sm">{confirmedSec.department}</span>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold text-[#6b775f] block">Referred By</span>
                    <span className="font-medium text-[#242c18]">{confirmedSec.referredBy}</span>
                  </div>
                </div>

                <div className="pt-2 border-t border-[#dfd7c5]">
                  <span className="text-[10px] uppercase font-bold text-[#6b775f] block">Time Commitment</span>
                  <p className="text-xs font-medium text-[#242c18] mt-0.5">{confirmedSec.timeCommitment}</p>
                </div>

                <div className="pt-2 border-t border-[#dfd7c5]">
                  <span className="text-[10px] uppercase font-bold text-[#6b775f] block">Why Cultrahus</span>
                  <p className="text-xs text-[#556345] line-clamp-3 mt-0.5">{confirmedSec.whyJoin}</p>
                </div>
              </div>

              <div className="flex flex-col items-center justify-center p-4 bg-white rounded-2xl border border-[#dfd7c5] shadow-sm text-center">
                <PassQrCode code={confirmedSec.applicationCode} size={120} />
                <span className="font-mono text-xs font-bold text-[#242c18] mt-2">
                  {confirmedSec.applicationCode}
                </span>
                <span className="text-[10px] text-[#364325] font-bold mt-0.5">Application Verified</span>
                <div className="mt-3 pt-2 border-t border-[#ece6d8] w-full flex justify-center">
                  <PassBarcode code={confirmedSec.applicationCode} />
                </div>
              </div>
            </div>

            <div className="mt-8 pt-6 border-t border-[#dfd7c5] flex flex-wrap items-center justify-between gap-4">
              <button
                onClick={() => setConfirmedSec(null)}
                className="text-xs font-bold text-[#556345] hover:text-[#242c18] underline"
              >
                ← Submit Another Application
              </button>
              <button
                onClick={openPassModal}
                className="px-5 py-2.5 bg-[#364325] hover:bg-[#475731] text-[#d7c494] rounded-xl text-xs font-bold transition-all shadow flex items-center gap-2 border border-[#5b6e41]/50"
              >
                <Printer className="w-4 h-4" />
                <span>View Application Docket</span>
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-[#fbf9f4] border-2 border-[#cfc4ad] rounded-3xl p-6 sm:p-10 shadow-sm">
          {errorMsg && (
            <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 text-red-800 text-xs flex items-start gap-2.5">
              <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-8 text-left">
            
            {/* 1. NAME */}
            <div className="bg-white border-2 border-[#dfd7c5] rounded-2xl p-5 sm:p-6 shadow-xs hover:border-[#3b4928] transition-colors">
              <label className="block text-sm font-bold text-[#242c18] mb-1">
                NAME <span className="text-[#a03232]">*</span>
              </label>
              <p className="text-xs text-[#6b775f] mb-3">Your full legal name as per government ID.</p>
              <input
                type="text"
                required
                value={formData.fullName}
                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                placeholder="Your answer"
                className="w-full px-4 py-3 text-sm bg-[#faf7f0] border-b-2 border-[#cfc4ad] focus:border-[#3b4928] rounded-t-lg outline-none text-[#242c18] transition"
              />
            </div>

            {/* 2. EMAIL */}
            <div className="bg-white border-2 border-[#dfd7c5] rounded-2xl p-5 sm:p-6 shadow-xs hover:border-[#3b4928] transition-colors">
              <label className="block text-sm font-bold text-[#242c18] mb-1">
                EMAIL <span className="text-[#a03232]">*</span>
              </label>
              <p className="text-xs text-[#6b775f] mb-3">Official email address for communication and dockets.</p>
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="Your answer"
                className="w-full px-4 py-3 text-sm bg-[#faf7f0] border-b-2 border-[#cfc4ad] focus:border-[#3b4928] rounded-t-lg outline-none text-[#242c18] transition"
              />
            </div>

            {/* 3. PREVIOUS EXPERIENCE */}
            <div className="bg-white border-2 border-[#dfd7c5] rounded-2xl p-5 sm:p-6 shadow-xs hover:border-[#3b4928] transition-colors">
              <label className="block text-sm font-bold text-[#242c18] mb-1">
                PREVIOUS EXPERIENCE <span className="text-[#a03232]">*</span>
              </label>
              <p className="text-xs text-[#6b775f] mb-3">
                List your past events, internships, college societies, festivals, leadership roles, or write &quot;Fresher&quot; if none.
              </p>
              <textarea
                rows={3}
                required
                value={formData.previousExperience}
                onChange={(e) => setFormData({ ...formData, previousExperience: e.target.value })}
                placeholder="Your answer"
                className="w-full px-4 py-3 text-sm bg-[#faf7f0] border-b-2 border-[#cfc4ad] focus:border-[#3b4928] rounded-t-lg outline-none text-[#242c18] transition"
              />
            </div>

            {/* 4. DEPARTMENT */}
            <div className="bg-white border-2 border-[#dfd7c5] rounded-2xl p-5 sm:p-6 shadow-xs hover:border-[#3b4928] transition-colors">
              <label className="block text-sm font-bold text-[#242c18] mb-1">
                DEPARTMENT <span className="text-[#a03232]">*</span>
              </label>
              <p className="text-xs text-[#6b775f] mb-4">
                Select the primary department you want to contribute to in Cultrahus Organisation:
              </p>
              
              <div className="space-y-3">
                {DEPARTMENTS.map((dept) => {
                  const isChecked = formData.department === dept.id;
                  return (
                    <label
                      key={dept.id}
                      className={`flex items-start gap-3 p-3.5 rounded-xl border-2 cursor-pointer transition-all ${
                        isChecked
                          ? 'border-[#3b4928] bg-[#ebf0e2] text-[#242c18]'
                          : 'border-[#dfd7c5] hover:border-[#b8cbb0] bg-[#faf7f0] text-[#344222]'
                      }`}
                    >
                      <input
                        type="radio"
                        name="department"
                        value={dept.id}
                        checked={isChecked}
                        onChange={() => setFormData({ ...formData, department: dept.id })}
                        className="mt-1 w-4 h-4 text-[#3b4928] border-[#cfc4ad] focus:ring-[#3b4928]"
                      />
                      <div className="flex-1">
                        <span className="font-mono font-bold text-sm block text-[#242c18]">
                          {dept.label}
                        </span>
                        <span className="text-xs text-[#556345] block mt-0.5">
                          {dept.description}
                        </span>
                      </div>
                    </label>
                  );
                })}
              </div>
            </div>

            {/* 5. WHY DO YOU WANT TO JOIN THIS ORGANIZATION */}
            <div className="bg-white border-2 border-[#dfd7c5] rounded-2xl p-5 sm:p-6 shadow-xs hover:border-[#3b4928] transition-colors">
              <label className="block text-sm font-bold text-[#242c18] mb-1">
                Why do you want to join this organization <span className="text-[#a03232]">*</span>
              </label>
              <p className="text-xs text-[#6b775f] mb-3">
                Share your motivation, passion for event management, and what you aim to achieve with Cultrahus.
              </p>
              <textarea
                rows={4}
                required
                value={formData.whyJoin}
                onChange={(e) => setFormData({ ...formData, whyJoin: e.target.value })}
                placeholder="Your answer"
                className="w-full px-4 py-3 text-sm bg-[#faf7f0] border-b-2 border-[#cfc4ad] focus:border-[#3b4928] rounded-t-lg outline-none text-[#242c18] transition"
              />
            </div>

            {/* 6. MOBILE NO. */}
            <div className="bg-white border-2 border-[#dfd7c5] rounded-2xl p-5 sm:p-6 shadow-xs hover:border-[#3b4928] transition-colors">
              <label className="block text-sm font-bold text-[#242c18] mb-1">
                MOBILE NO. <span className="text-[#a03232]">*</span>
              </label>
              <p className="text-xs text-[#6b775f] mb-3">Primary WhatsApp and calling number (+91).</p>
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
                placeholder="10-digit mobile number (numbers only)"
                className="w-full px-4 py-3 text-sm bg-[#faf7f0] border-b-2 border-[#cfc4ad] focus:border-[#3b4928] rounded-t-lg outline-none text-[#242c18] font-mono transition"
              />
              <div className="flex justify-end mt-1 text-[11px] text-[#6b775f]">
                <span className={formData.whatsappPhone.length === 10 ? 'text-[#3b4928] font-bold' : 'text-[#a03232]'}>
                  {formData.whatsappPhone.length}/10 digits
                </span>
              </div>
            </div>

            {/* 7. HOW MUCH TIME YOU CAN GIVE TO THIS ORGANIZATION */}
            <div className="bg-white border-2 border-[#dfd7c5] rounded-2xl p-5 sm:p-6 shadow-xs hover:border-[#3b4928] transition-colors">
              <label className="block text-sm font-bold text-[#242c18] mb-1">
                How much time you can give to this organization <span className="text-[#a03232]">*</span>
              </label>
              <p className="text-xs text-[#6b775f] mb-3">
                E.g. &quot;10-15 hours per week&quot;, &quot;Weekends and evenings&quot;, &quot;Full-time on event days&quot;.
              </p>
              <input
                type="text"
                required
                value={formData.timeCommitment}
                onChange={(e) => setFormData({ ...formData, timeCommitment: e.target.value })}
                placeholder="Your answer"
                className="w-full px-4 py-3 text-sm bg-[#faf7f0] border-b-2 border-[#cfc4ad] focus:border-[#3b4928] rounded-t-lg outline-none text-[#242c18] transition"
              />
            </div>

            {/* 8. WHO REFERRED YOU TO JOIN THIS ORGANIZATION? */}
            <div className="bg-white border-2 border-[#dfd7c5] rounded-2xl p-5 sm:p-6 shadow-xs hover:border-[#3b4928] transition-colors">
              <label className="block text-sm font-bold text-[#242c18] mb-1">
                Who referred you to join this organization? <span className="text-[#a03232]">*</span>
              </label>
              <p className="text-xs text-[#6b775f] mb-3">
                Name of the core team member, friend, social media handle, college society, or write &quot;Direct / Instagram / Website&quot;.
              </p>
              <input
                type="text"
                required
                value={formData.referredBy}
                onChange={(e) => setFormData({ ...formData, referredBy: e.target.value })}
                placeholder="Your answer"
                className="w-full px-4 py-3 text-sm bg-[#faf7f0] border-b-2 border-[#cfc4ad] focus:border-[#3b4928] rounded-t-lg outline-none text-[#242c18] transition"
              />
            </div>

            {/* Form Footer & Submit */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-[#dfd7c5]">
              <button
                type="submit"
                disabled={submitting}
                className="w-full sm:w-auto px-8 py-3.5 bg-[#3b4928] hover:bg-[#485932] text-[#fbf9f4] text-sm font-bold rounded-xl shadow-md transition-all disabled:opacity-50 border border-[#242c18] flex items-center justify-center gap-2"
              >
                {submitting ? (
                  <span>Submitting Application...</span>
                ) : (
                  <span className="text-[#e5d4aa]">Submit Secretariat Application</span>
                )}
              </button>

              <button
                type="button"
                onClick={() => {
                  setFormData({
                    fullName: '',
                    email: '',
                    previousExperience: '',
                    department: 'MANAGEMENT',
                    whyJoin: '',
                    whatsappPhone: '',
                    timeCommitment: '',
                    referredBy: ''
                  });
                  setErrorMsg(null);
                }}
                className="text-xs font-semibold text-[#556345] hover:text-[#242c18] underline"
              >
                Clear form
              </button>
            </div>

            {/* Security & Authenticity notice */}
            <div className="pt-4 text-center border-t border-[#dfd7c5] space-y-1 text-[11px] text-[#6b775f]">
              <p>
                Never submit passwords through forms. Official Cultrahus Organisation candidate recruitment desk.
              </p>
              <p className="text-[#8b997e]">
                Inquiries: <a href="mailto:cultrahusorganization@gmail.com" className="underline hover:text-[#3b4928]">cultrahusorganization@gmail.com</a>
              </p>
            </div>

          </form>
        </div>
      )}

    </div>
  );
};
