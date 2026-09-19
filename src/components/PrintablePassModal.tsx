import React from 'react';
import { X, Printer, Download, CheckCircle2, ShieldCheck, MapPin, Calendar, Clock, Sparkles, Phone } from 'lucide-react';
import { PassQrCode, PassBarcode } from './PassQrCode';
import { CultrahusLogo } from './CultrahusLogo';

interface PrintablePassModalProps {
  passData: {
    type: 'delegate' | 'ticket' | 'troupe' | 'secretariat' | 'sponsor' | string;
    code: string;
    title: string;
    fullName: string;
    email: string;
    phone: string;
    detail1Label: string;
    detail1Value: string;
    detail2Label: string;
    detail2Value: string;
    seats?: string[];
    feePaid?: string;
    status: string;
    issuedIst?: string;
  } | null;
  onClose: () => void;
}

export const PrintablePassModal: React.FC<PrintablePassModalProps> = ({ passData, onClose }) => {
  if (!passData) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-[#faf7f0] text-[#242c18] rounded-3xl shadow-2xl border border-[#cfc5b0] overflow-hidden my-8 animate-in zoom-in-95 duration-200">
        
        {/* Action Header bar (hidden during print) */}
        <div className="flex items-center justify-between px-6 py-4 bg-[#242c18] text-[#f4efe4] print:hidden">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-[#d7c494]" />
            <span className="font-serif font-bold text-base tracking-wide">Official Festival Credential</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#364325] hover:bg-[#475731] text-[#d7c494] text-xs font-bold rounded-xl transition-colors border border-[#5b6e41]/60 shadow"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print Credential</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-[#c9d6ba] hover:text-white rounded-xl hover:bg-white/10 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* The Printable Pass Canvas */}
        <div id="printable-pass" className="p-6 sm:p-8 bg-[#faf7f0]">
          {/* Decorative Outer Border with Motif Frame */}
          <div className="border-4 border-double border-[#364325]/40 rounded-2xl p-5 sm:p-6 relative bg-gradient-to-b from-[#fffefc] to-[#f4efe4] shadow-sm">
            
            {/* Top Watermark & Seal */}
            <div className="flex items-start justify-between border-b-2 border-[#cfc5b0] pb-4 mb-5">
              <div className="flex items-center gap-3">
                <CultrahusLogo size="md" />
                <div>
                  <span className="text-[10px] tracking-widest uppercase font-bold text-[#5b6e41]">
                    Republic of Arts • National Directorate
                  </span>
                  <h2 className="font-serif text-2xl sm:text-3xl font-extrabold text-[#242c18] leading-tight">
                    Cultrahus Sangam 2026
                  </h2>
                  <p className="text-xs text-[#556345] font-semibold">
                    National Theatre Conclave, Cultural Parliament & Performing Arts Festival
                  </p>
                </div>
              </div>

              <div className="text-right">
                <div className="inline-block px-3 py-1 bg-[#ebf0e2] border border-[#c4d2b5] rounded-lg text-[#334122] font-mono font-bold text-xs">
                  {passData.code}
                </div>
                <div className="text-[10px] font-semibold text-[#364325] flex items-center justify-end gap-1 mt-1">
                  <CheckCircle2 className="w-3 h-3 text-[#5b6e41]" />
                  <span>Authenticated Entry</span>
                </div>
              </div>
            </div>

            {/* Pass Tier / Role Title Ribbon */}
            <div className="bg-[#364325] text-[#d7c494] px-4 py-2 rounded-xl mb-4 flex items-center justify-between shadow-inner">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#d7c494]" />
                <span className="text-xs sm:text-sm font-serif font-bold uppercase tracking-wider text-white">
                  {passData.title}
                </span>
              </div>
              <span className="text-[11px] font-mono text-[#d7c494] font-bold">
                {passData.feePaid ? `Fee Status: ${passData.feePaid}` : 'Official Registration'}
              </span>
            </div>

            {/* Garba Night & DJ Night Inclusions Confirmation for Ticket Passes */}
            {passData.type === 'ticket' && (
              <div className="mb-5 px-3.5 py-2 rounded-xl bg-[#ebf0e2] border border-[#b8cbb0] text-xs font-semibold text-[#242c18] flex flex-wrap items-center justify-between gap-2 shadow-xs">
                <div className="flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-[#475731] shrink-0" />
                  <span>🎉 Garba Night + 🎧 DJ Night: <strong className="text-[#364325]">CONFIRMED & ALL INCLUDED</strong></span>
                </div>
                <span className="text-[10px] font-mono bg-[#364325] text-[#d7c494] px-2 py-0.5 rounded font-bold">
                  All-Inclusive Pass
                </span>
              </div>
            )}

            {/* Body Details Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 items-center">
              
              {/* Info Columns */}
              <div className="sm:col-span-2 space-y-3.5 text-sm">
                <div>
                  <span className="text-[10px] uppercase tracking-wider font-bold text-[#6b775f] block">
                    Credential Holder
                  </span>
                  <span className="font-serif text-lg font-bold text-[#242c18]">
                    {passData.fullName}
                  </span>
                  <p className="text-xs text-[#556345] font-mono">
                    {passData.email} • {passData.phone}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-3 pt-1 border-t border-[#dfd7c5]">
                  <div>
                    <span className="text-[10px] uppercase tracking-wider font-bold text-[#6b775f] block">
                      {passData.detail1Label}
                    </span>
                    <span className="font-semibold text-[#242c18] text-xs sm:text-sm">
                      {passData.detail1Value}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase tracking-wider font-bold text-[#6b775f] block">
                      {passData.detail2Label}
                    </span>
                    <span className="font-semibold text-[#242c18] text-xs sm:text-sm">
                      {passData.detail2Value}
                    </span>
                  </div>
                </div>

                {passData.seats && passData.seats.length > 0 && (
                  <div className="pt-2 border-t border-[#dfd7c5]">
                    <span className="text-[10px] uppercase tracking-wider font-bold text-[#6b775f] block">
                      Assigned Auditorium Seats
                    </span>
                    <div className="flex flex-wrap gap-1.5 mt-1">
                      {passData.seats.map((seat) => (
                        <span
                          key={seat}
                          className="px-2 py-0.5 bg-[#364325] text-[#d7c494] font-mono text-xs font-bold rounded-md"
                        >
                          Seat {seat}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                <div className="pt-2 border-t border-[#dfd7c5] grid grid-cols-2 gap-2 text-[11px] text-[#556345]">
                  <div className="flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-[#5b6e41] shrink-0" />
                    <span>Sunday, 18 Oct 2026</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-[#5b6e41] shrink-0" />
                    <span>Gates Open 03:30 PM (Evening)</span>
                  </div>
                  <div className="flex items-center gap-1.5 col-span-2">
                    <MapPin className="w-3.5 h-3.5 text-[#5b6e41] shrink-0" />
                    <span className="font-semibold text-[#242c18]">Venue: TBA</span>
                  </div>
                  <div className="flex items-center gap-1.5 col-span-2 text-[#6b775f]">
                    <Phone className="w-3.5 h-3.5 text-[#5b6e41] shrink-0" />
                    <span>Contact Us / Helpline: +91 98185 61227</span>
                  </div>
                </div>
              </div>

              {/* QR Verification Box */}
              <div className="flex flex-col items-center justify-center p-3 bg-white rounded-2xl border border-[#dfd7c5] shadow-sm text-center">
                <PassQrCode code={passData.code} size={115} />
                <span className="text-[10px] font-mono font-bold text-[#364325] mt-2">
                  VERIFY AT GATE
                </span>
                <span className="text-[9px] text-[#7b8969]">Security Encrypted ID</span>
              </div>
            </div>

            {/* Bottom Barcode & Security Microprint */}
            <div className="mt-6 pt-4 border-t-2 border-dashed border-[#cfc5b0] flex flex-col sm:flex-row items-center justify-between gap-4">
              <PassBarcode code={passData.code} />
              
              <div className="text-[10px] text-[#6b775f] text-center sm:text-right max-w-xs space-y-0.5">
                <p className="font-semibold text-[#334122]">Non-Transferable Official Credential</p>
                <p>Present government photo ID (Aadhaar / Passport / College ID) with this badge at registration desks.</p>
                {passData.issuedIst && (
                  <p className="font-mono text-[9px] text-[#8b997e]">Timestamp: {passData.issuedIst}</p>
                )}
              </div>
            </div>

          </div>

          {/* Print instructions banner */}
          <div className="mt-4 text-center text-xs text-[#6b775f] print:hidden">
            Tip: You can save this pass as a PDF or take a screenshot on your mobile device for direct entry on 18 October 2026.
          </div>
        </div>

        {/* Modal Footer Actions */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 bg-[#f4efe4] border-t border-[#dfd7c5] print:hidden">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-[#556345] hover:bg-[#e8ede0] transition-colors"
          >
            Close Window
          </button>
          <button
            onClick={handlePrint}
            className="px-4 py-2 rounded-xl text-xs font-bold bg-[#364325] hover:bg-[#475731] text-[#d7c494] transition-colors flex items-center gap-1.5 shadow"
          >
            <Printer className="w-4 h-4" />
            <span>Print Pass</span>
          </button>
        </div>

      </div>
    </div>
  );
};
