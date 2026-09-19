import React, { useState } from 'react';
import {
  MessageSquare,
  CheckCircle2,
  AlertCircle,
  Phone,
  Mail,
  MapPin,
  Clock,
  Sparkles,
  ExternalLink,
  Send
} from 'lucide-react';
import { InquiryRecord } from '../types';
import { CultrahusLogo } from './CultrahusLogo';
import { safePostJson } from '../utils/api';

export const ContactInquiryView: React.FC = () => {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    whatsappPhone: '',
    category: 'Delegate Helpdesk',
    subject: '',
    message: ''
  });

  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [confirmedInquiry, setConfirmedInquiry] = useState<InquiryRecord | null>(null);

  const categories = [
    'Delegate Helpdesk',
    'Troupe Logistics',
    'Ticketing & Passes',
    'Press & Media',
    'Sponsorship & Partnerships',
    'General Query'
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (formData.whatsappPhone && !/^\d{10}$/.test(formData.whatsappPhone)) {
      setErrorMsg('WhatsApp phone must be exactly 10 digits without any alphabets or symbols.');
      return;
    }

    setSubmitting(true);

    try {
      const response = await safePostJson<{ success: boolean; record: InquiryRecord; error?: string }>(
        '/api/inquiry',
        formData
      );

      if (!response.success || !response.data?.record) {
        setErrorMsg(response.error || 'Failed to submit inquiry. Please try again.');
        return;
      }

      setConfirmedInquiry(response.data.record);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch {
      setErrorMsg('An error occurred during submission. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto mb-10 flex flex-col items-center">
        <CultrahusLogo size="md" className="mb-3" />
        <span className="text-xs uppercase tracking-widest text-[#5b6e41] font-extrabold block mb-2">
          Secretariat Communications
        </span>
        <h1 className="font-serif text-3xl sm:text-5xl font-extrabold text-[#242c18] leading-tight">
          Contact Us
        </h1>
        <p className="mt-3 text-[#556345] text-sm sm:text-base">
          Have queries regarding delegate privileges, bulk university passes, jury submissions, or stage riders? Our central festival secretariat desk is at your service.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        
        {/* Left Column: Direct channels */}
        <div className="space-y-6">
          <div className="bg-[#ede4d2] text-[#242c18] rounded-3xl p-6 shadow-sm space-y-5 border-2 border-[#cfc4ad]">
            <h3 className="font-serif text-xl font-bold text-[#242c18]">
              Direct Helpline & Desk
            </h3>

            <div className="space-y-4 text-xs text-[#556345]">
              <div className="flex items-start gap-3">
                <Phone className="w-4 h-4 text-[#4b5d36] shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-[#242c18] block">Official WhatsApp & Phone</span>
                  <a
                    href="https://wa.me/919818561227"
                    target="_blank"
                    rel="noreferrer"
                    className="text-[#3b4928] font-bold hover:underline font-mono text-sm block mt-0.5"
                  >
                    +91 98185 61227
                  </a>
                  <span className="text-[10px] text-[#6b775f]">Available 24x7 Helpline Support</span>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Mail className="w-4 h-4 text-[#4b5d36] shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-[#242c18] block">Secretariat Email</span>
                  <a
                    href="mailto:cultrahusorganization@gmail.com"
                    className="text-[#3b4928] font-bold hover:underline font-mono block mt-0.5"
                  >
                    cultrahusorganization@gmail.com
                  </a>
                  <span className="text-[10px] text-[#6b775f]">Response window: &lt; 4 hours</span>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <MapPin className="w-4 h-4 text-[#4b5d36] shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-[#242c18] block">Festival Location</span>
                  <p className="text-[#242c18] mt-0.5 leading-relaxed font-bold">
                    Venue: TBA
                  </p>
                  <p className="text-[10px] text-[#6b775f] mt-0.5">
                    Central Auditorium Complex, New Delhi
                  </p>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-[#cfc4ad] text-[11px] text-[#6b775f]">
              <Clock className="w-3.5 h-3.5 inline mr-1 text-[#4b5d36]" />
              <span>Conclave Day Desk: Opens 07:30 AM on 18 Oct 2026 (Venue: TBA)</span>
            </div>
          </div>

          <div className="bg-[#fbf9f4] border border-[#d9d0be] rounded-2xl p-5 text-xs text-[#556345] space-y-2 shadow-sm">
            <span className="font-bold text-[#242c18] block">Press & Media Accreditation</span>
            <p>
              Accredited journalists and photojournalists may contact the Media Documentation desk directly at <a href="mailto:cultrahusorganization@gmail.com" className="bg-[#ebf0e2] text-[#334122] px-1 py-0.5 rounded text-[11px] font-mono hover:underline">cultrahusorganization@gmail.com</a> for press pit credentials.
            </p>
          </div>
        </div>

        {/* Right Column: Inquiry Form */}
        <div className="md:col-span-2">
          {confirmedInquiry ? (
            <div className="bg-[#fbf9f4] border-2 border-[#5b6e41]/50 rounded-2xl p-6 sm:p-8 shadow-sm space-y-5">
              <div className="flex items-center gap-3">
                <CheckCircle2 className="w-7 h-7 text-[#5b6e41] shrink-0" />
                <div>
                  <h3 className="font-serif text-xl font-bold text-[#242c18]">
                    Inquiry Docket Created!
                  </h3>
                  <p className="text-xs text-[#556345]">
                    Your reference tracking code is <span className="font-mono font-bold text-[#364325]">{confirmedInquiry.inquiryCode}</span>.
                  </p>
                </div>
              </div>

              <div className="p-4 bg-white rounded-xl border border-[#dfd7c5] space-y-2 text-xs text-[#334122]">
                <div className="flex justify-between border-b border-[#ece6d8] pb-2">
                  <span className="text-[#6b775f] font-bold uppercase">Desk Assigned:</span>
                  <span className="font-semibold text-[#364325]">{confirmedInquiry.category}</span>
                </div>
                <div className="flex justify-between border-b border-[#ece6d8] pb-2">
                  <span className="text-[#6b775f] font-bold uppercase">Subject:</span>
                  <span className="font-semibold text-[#242c18]">{confirmedInquiry.subject}</span>
                </div>
                <div>
                  <span className="text-[#6b775f] font-bold uppercase block mb-1">Message:</span>
                  <p className="text-[#556345] italic">"{confirmedInquiry.message}"</p>
                </div>
              </div>

              <p className="text-xs text-[#6b775f]">
                A duty officer from the {confirmedInquiry.category} will reach out to {confirmedInquiry.email} or WhatsApp shortly.
              </p>

              <button
                onClick={() => setConfirmedInquiry(null)}
                className="text-xs font-bold text-[#364325] hover:text-[#242c18] underline"
              >
                ← Send Another Message
              </button>
            </div>
          ) : (
            <div className="bg-[#fbf9f4] border border-[#d9d0be] rounded-3xl p-6 sm:p-8 shadow-sm">
              {errorMsg && (
                <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 text-red-800 text-xs flex items-start gap-2.5">
                  <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
                  <span>{errorMsg}</span>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-[#334122] mb-1">
                      Your Full Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.fullName}
                      onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                      placeholder="e.g. Ananya Roy"
                      className="w-full px-3.5 py-2.5 text-xs bg-white border border-[#cfc5b0] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#5b6e41]/50 text-[#242c18]"
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
                      placeholder="ananya@mail.com"
                      className="w-full px-3.5 py-2.5 text-xs bg-white border border-[#cfc5b0] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#5b6e41]/50 text-[#242c18]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#334122] mb-1">
                      WhatsApp Phone (10 Digits)
                    </label>
                    <input
                      type="tel"
                      inputMode="numeric"
                      maxLength={10}
                      pattern="[0-9]{10}"
                      value={formData.whatsappPhone}
                      onChange={(e) => {
                        const digits = e.target.value.replace(/\D/g, '').slice(0, 10);
                        setFormData({ ...formData, whatsappPhone: digits });
                      }}
                      placeholder="e.g. 9876543210"
                      className="w-full px-3.5 py-2.5 text-xs bg-white border border-[#cfc5b0] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#5b6e41]/50 text-[#242c18] font-mono"
                    />
                    {formData.whatsappPhone.length > 0 && (
                      <div className="flex justify-end mt-1 text-[10px] text-[#6b775f]">
                        <span className={formData.whatsappPhone.length === 10 ? 'text-[#3b4928] font-bold' : 'text-[#a03232]'}>
                          {formData.whatsappPhone.length}/10 digits
                        </span>
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#334122] mb-1">
                      Inquiry Category *
                    </label>
                    <select
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      className="w-full px-3.5 py-2.5 text-xs bg-white border border-[#cfc5b0] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#5b6e41]/50 text-[#242c18]"
                    >
                      {categories.map((c) => (
                        <option key={c} value={c}>
                          {c}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#334122] mb-1">
                    Subject Line *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    placeholder="e.g. Bulk delegate pass inquiry for college drama society"
                    className="w-full px-3.5 py-2.5 text-xs bg-white border border-[#cfc5b0] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#5b6e41]/50 text-[#242c18]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#334122] mb-1">
                    Detailed Message *
                  </label>
                  <textarea
                    rows={4}
                    required
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    placeholder="Provide details about your query or requirement..."
                    className="w-full px-3.5 py-2.5 text-xs bg-white border border-[#cfc5b0] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#5b6e41]/50 text-[#242c18]"
                  />
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full sm:w-auto px-6 py-3 bg-[#364325] hover:bg-[#475731] text-[#f4efe4] text-xs font-bold rounded-xl shadow transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {submitting ? (
                    <span>Transmitting to Secretariat...</span>
                  ) : (
                    <>
                      <Send className="w-3.5 h-3.5 text-[#d7c494]" />
                      <span>Submit Inquiry to Helpdesk</span>
                    </>
                  )}
                </button>
              </form>
            </div>
          )}
        </div>

      </div>

    </div>
  );
};
