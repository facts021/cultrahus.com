import React, { useState } from 'react';
import {
  Theater,
  CheckCircle2,
  AlertCircle,
  Copy,
  Printer,
  Sparkles,
  Calendar,
  MapPin,
  FileText,
  Users,
  Lightbulb,
  Mic,
  Phone
} from 'lucide-react';
import { PlayRecord } from '../types';
import { PassQrCode, PassBarcode } from './PassQrCode';
import { CultrahusLogo } from './CultrahusLogo';
import { safePostJson } from '../utils/api';

interface TroupeRegistrationViewProps {
  onPassGenerated: (passData: any) => void;
}

export const TroupeRegistrationView: React.FC<TroupeRegistrationViewProps> = ({ onPassGenerated }) => {
  const [formData, setFormData] = useState({
    troupeName: '',
    playTitle: '',
    playwright: '',
    director: '',
    contactPerson: '',
    email: '',
    whatsappPhone: '',
    category: 'Proscenium' as 'Proscenium' | 'Nukkad (Street Play)',
    castCrewCount: 12,
    durationMinutes: 45,
    synopsis: '',
    technicalRider: ''
  });

  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [confirmedPlay, setConfirmedPlay] = useState<PlayRecord | null>(null);
  const [copied, setCopied] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!/^\d{10}$/.test(formData.whatsappPhone)) {
      setErrorMsg('WhatsApp contact phone must be exactly 10 digits without any alphabets or symbols.');
      return;
    }

    setSubmitting(true);

    try {
      const response = await safePostJson<{ success: boolean; record: PlayRecord; error?: string }>(
        '/api/register-play',
        formData
      );

      if (!response.success || !response.data?.record) {
        setErrorMsg(response.error || 'Failed to register theatre troupe. Please try again.');
        return;
      }

      setConfirmedPlay(response.data.record);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch {
      setErrorMsg('An error occurred during submission. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const openPassModal = () => {
    if (!confirmedPlay) return;
    onPassGenerated({
      type: 'troupe',
      code: confirmedPlay.troupeCode,
      title: `Troupe Lead: ${confirmedPlay.troupeName}`,
      fullName: confirmedPlay.director,
      email: confirmedPlay.email,
      phone: confirmedPlay.whatsappPhone,
      detail1Label: 'Play Title',
      detail1Value: confirmedPlay.playTitle,
      detail2Label: 'Format & Cast',
      detail2Value: `${confirmedPlay.category} (${confirmedPlay.castCrewCount} members)`,
      feePaid: 'Jury Entry (Official Docket)',
      status: 'Dossier Under Review',
      issuedIst: confirmedPlay.addedBy?.timestampIst
    });
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto mb-10 flex flex-col items-center">
        <CultrahusLogo size="md" className="mb-3" />
        <span className="text-xs uppercase tracking-widest text-[#5b6e41] font-extrabold block mb-2">
          National Conclave Curation
        </span>
        <h1 className="font-serif text-3xl sm:text-5xl font-extrabold text-[#242c18] leading-tight">
          Troupe & Play Registration
        </h1>
        <p className="mt-3 text-[#556345] text-sm sm:text-base">
          Collegiate theatre societies, independent repertories, and street play squads: submit your production dossier for the 2026 Sovereign Natya Puraskar jury. Venue: TBA.
        </p>
      </div>

      {confirmedPlay ? (
        <div className="space-y-8 animate-in fade-in-50 duration-300">
          <div className="p-5 rounded-2xl bg-[#ebf0e2] border border-[#b8cbb0] text-[#242c18] flex items-start gap-3 shadow-sm">
            <CheckCircle2 className="w-6 h-6 text-[#475731] shrink-0 mt-0.5" />
            <div className="flex-1">
              <h3 className="font-serif font-bold text-lg text-[#242c18]">
                Troupe Dossier Registered Successfully!
              </h3>
              <p className="text-xs text-[#556345] mt-1">
                Your official troupe tracking code is <span className="font-mono font-bold text-[#242c18]">{confirmedPlay.troupeCode}</span>. Our artistic evaluation committee will review the synopsis and technical rider for stage slotting. Venue: TBA.
              </p>
            </div>
            <button
              onClick={openPassModal}
              className="px-4 py-2 bg-[#364325] hover:bg-[#475731] text-[#d7c494] rounded-xl text-xs font-bold transition-colors shadow flex items-center gap-1.5 shrink-0 border border-[#5b6e41]/50"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print Badge</span>
            </button>
          </div>

          <div className="bg-[#faf7f0] border-2 border-[#cfc5b0] rounded-3xl p-6 sm:p-8 shadow-xl">
            <div className="bg-[#242c18] text-[#d7c494] -mx-6 -mt-6 sm:-mx-8 sm:-mt-8 px-6 py-4 mb-6 flex flex-wrap items-center justify-between gap-3 border-b border-[#475731]">
              <div className="flex items-center gap-2">
                <Theater className="w-5 h-5 text-[#d7c494]" />
                <span className="font-serif font-bold text-base text-white">
                  {confirmedPlay.troupeName} • {confirmedPlay.playTitle}
                </span>
              </div>
              <span className="text-xs font-mono bg-[#364325] text-[#d7c494] px-3 py-1 rounded-lg font-bold border border-[#5b6e41]/60">
                {confirmedPlay.troupeCode}
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
              <div className="md:col-span-2 space-y-3.5 text-xs text-[#334122]">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-[#6b775f] block">Director</span>
                    <span className="font-serif text-sm font-bold text-[#242c18]">{confirmedPlay.director}</span>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold text-[#6b775f] block">Playwright</span>
                    <span className="font-medium text-[#242c18]">{confirmedPlay.playwright}</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 pt-2 border-t border-[#dfd7c5]">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-[#6b775f] block">Category</span>
                    <span className="font-bold text-[#364325]">{confirmedPlay.category}</span>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold text-[#6b775f] block">Cast & Crew</span>
                    <span className="font-medium text-[#242c18]">{confirmedPlay.castCrewCount} Members ({confirmedPlay.durationMinutes} mins)</span>
                  </div>
                </div>

                <div className="pt-2 border-t border-[#dfd7c5]">
                  <span className="text-[10px] uppercase font-bold text-[#6b775f] block">Production Synopsis</span>
                  <p className="text-xs text-[#556345] line-clamp-3 mt-0.5">{confirmedPlay.synopsis || 'Pending full script submission'}</p>
                </div>

                <div className="pt-2 border-t border-[#dfd7c5] flex flex-wrap items-center gap-4 text-[#556345]">
                  <div className="flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-[#5b6e41]" />
                    <span>Sunday, 18 Oct 2026</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-[#5b6e41]" />
                    <span className="font-semibold text-[#242c18]">Venue: TBA</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-[#6b775f]">
                    <Phone className="w-3.5 h-3.5 text-[#5b6e41]" />
                    <span>Helpline: +91 98185 61227</span>
                  </div>
                </div>
              </div>

              <div className="flex flex-col items-center justify-center p-4 bg-white rounded-2xl border border-[#dfd7c5] shadow-sm text-center">
                <PassQrCode code={confirmedPlay.troupeCode} size={120} />
                <span className="font-mono text-xs font-bold text-[#242c18] mt-2">
                  {confirmedPlay.troupeCode}
                </span>
                <span className="text-[10px] text-[#364325] font-bold mt-0.5">Jury Evaluation Docket</span>
                <div className="mt-3 pt-2 border-t border-[#ece6d8] w-full flex justify-center">
                  <PassBarcode code={confirmedPlay.troupeCode} />
                </div>
              </div>
            </div>

            <div className="mt-8 pt-6 border-t border-[#dfd7c5] flex flex-wrap items-center justify-between gap-4">
              <button
                onClick={() => setConfirmedPlay(null)}
                className="text-xs font-bold text-[#556345] hover:text-[#242c18] underline"
              >
                ← Register Another Production
              </button>
              <button
                onClick={openPassModal}
                className="px-5 py-2.5 bg-[#364325] hover:bg-[#475731] text-[#d7c494] rounded-xl text-xs font-bold transition-all shadow flex items-center gap-2 border border-[#5b6e41]/50"
              >
                <Printer className="w-4 h-4" />
                <span>View Printable Troupe Credential</span>
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-[#fbf9f4] border border-[#d9d0be] rounded-3xl p-6 sm:p-10 shadow-sm">
          {errorMsg && (
            <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 text-red-800 text-xs sm:text-sm flex items-start gap-2.5">
              <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            
            {/* Category selection */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#242c18] mb-2">
                Production Classification *
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, category: 'Proscenium' })}
                  className={`p-3.5 rounded-2xl border text-left transition-all ${
                    formData.category === 'Proscenium'
                      ? 'border-[#5b6e41] bg-[#ebf0e2] text-[#242c18] font-bold'
                      : 'border-[#dfd7c5] bg-white text-[#334122]'
                  }`}
                >
                  <span className="block text-sm">Proscenium Hall Drama</span>
                  <span className="text-[11px] font-normal text-[#6b775f]">Main stage with auditorium lighting & sound</span>
                </button>

                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, category: 'Nukkad (Street Play)' })}
                  className={`p-3.5 rounded-2xl border text-left transition-all ${
                    formData.category === 'Nukkad (Street Play)'
                      ? 'border-[#5b6e41] bg-[#ebf0e2] text-[#242c18] font-bold'
                      : 'border-[#dfd7c5] bg-white text-[#334122]'
                  }`}
                >
                  <span className="block text-sm">Nukkad Natak (Street Theatre)</span>
                  <span className="text-[11px] font-normal text-[#6b775f]">Open-air amphitheatre with acoustic dholak</span>
                </button>
              </div>
            </div>

            {/* Troupe details */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-[#334122] mb-1">
                  Troupe / Society Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.troupeName}
                  onChange={(e) => setFormData({ ...formData, troupeName: e.target.value })}
                  placeholder="e.g. Abhivyakti Dramatic Society"
                  className="w-full px-3.5 py-2.5 text-sm bg-white border border-[#cfc5b0] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#5b6e41]/50 text-[#242c18]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#334122] mb-1">
                  Play Title *
                </label>
                <input
                  type="text"
                  required
                  value={formData.playTitle}
                  onChange={(e) => setFormData({ ...formData, playTitle: e.target.value })}
                  placeholder="e.g. Andha Yug (Contemporary Adaptation)"
                  className="w-full px-3.5 py-2.5 text-sm bg-white border border-[#cfc5b0] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#5b6e41]/50 text-[#242c18]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#334122] mb-1">
                  Director Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.director}
                  onChange={(e) => setFormData({ ...formData, director: e.target.value })}
                  placeholder="e.g. Raghav Mathur"
                  className="w-full px-3.5 py-2.5 text-sm bg-white border border-[#cfc5b0] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#5b6e41]/50 text-[#242c18]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#334122] mb-1">
                  Playwright / Author
                </label>
                <input
                  type="text"
                  value={formData.playwright}
                  onChange={(e) => setFormData({ ...formData, playwright: e.target.value })}
                  placeholder="e.g. Dharamvir Bharati / Original"
                  className="w-full px-3.5 py-2.5 text-sm bg-white border border-[#cfc5b0] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#5b6e41]/50 text-[#242c18]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#334122] mb-1">
                  Director / Secretary Email *
                </label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="theatre.society@college.edu"
                  className="w-full px-3.5 py-2.5 text-sm bg-white border border-[#cfc5b0] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#5b6e41]/50 text-[#242c18]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#334122] mb-1">
                  WhatsApp Contact Phone (10 Digits) *
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
                  placeholder="e.g. 9811122334"
                  className="w-full px-3.5 py-2.5 text-sm bg-white border border-[#cfc5b0] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#5b6e41]/50 text-[#242c18] font-mono"
                />
                <div className="flex justify-end mt-1 text-[10px] text-[#6b775f]">
                  <span className={formData.whatsappPhone.length === 10 ? 'text-[#3b4928] font-bold' : 'text-[#a03232]'}>
                    {formData.whatsappPhone.length}/10 digits
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#334122] mb-1">
                  Total Cast & Crew Count *
                </label>
                <input
                  type="number"
                  min="2"
                  max="40"
                  required
                  value={formData.castCrewCount}
                  onChange={(e) => setFormData({ ...formData, castCrewCount: parseInt(e.target.value) || 1 })}
                  className="w-full px-3.5 py-2.5 text-sm bg-white border border-[#cfc5b0] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#5b6e41]/50 text-[#242c18]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#334122] mb-1">
                  Production Duration (Minutes) *
                </label>
                <input
                  type="number"
                  min="15"
                  max="90"
                  required
                  value={formData.durationMinutes}
                  onChange={(e) => setFormData({ ...formData, durationMinutes: parseInt(e.target.value) || 15 })}
                  className="w-full px-3.5 py-2.5 text-sm bg-white border border-[#cfc5b0] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#5b6e41]/50 text-[#242c18]"
                />
              </div>
            </div>

            {/* Synopsis */}
            <div>
              <label className="block text-xs font-semibold text-[#334122] mb-1">
                Dramatic Synopsis & Thematic Core *
              </label>
              <textarea
                rows={3}
                required
                value={formData.synopsis}
                onChange={(e) => setFormData({ ...formData, synopsis: e.target.value })}
                placeholder="Brief narrative outline, central conflict, stylistic choices, and societal relevance..."
                className="w-full px-3.5 py-2.5 text-sm bg-white border border-[#cfc5b0] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#5b6e41]/50 text-[#242c18]"
              />
            </div>

            {/* Technical Rider */}
            <div>
              <label className="block text-xs font-semibold text-[#334122] mb-1">
                Technical Rider (Lighting cues, stage props, lapel vs boundary mics)
              </label>
              <textarea
                rows={2}
                value={formData.technicalRider}
                onChange={(e) => setFormData({ ...formData, technicalRider: e.target.value })}
                placeholder="e.g. 4 cordless lapel mics, blue cyclorama back-light, 2 rostrum risers, wooden chair..."
                className="w-full px-3.5 py-2.5 text-sm bg-white border border-[#cfc5b0] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#5b6e41]/50 text-[#242c18]"
              />
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
              <button
                type="submit"
                disabled={submitting}
                className="w-full sm:w-auto px-8 py-3.5 bg-[#364325] hover:bg-[#475731] text-[#fbf9f4] text-sm font-bold rounded-xl shadow transition-all disabled:opacity-50 border border-[#5b6e41]/60 flex items-center justify-center gap-2"
              >
                {submitting ? (
                  <span>Submitting Troupe Dossier...</span>
                ) : (
                  <span className="text-[#d7c494]">Submit Troupe Entry & Generate Code</span>
                )}
              </button>

              <div className="flex items-center gap-2 text-xs text-[#556345]">
                <Phone className="w-3.5 h-3.5 text-[#5b6e41]" />
                <span>Need technical curation help? Contact Us: <strong>+91 98185 61227</strong></span>
              </div>
            </div>

          </form>
        </div>
      )}

    </div>
  );
};
