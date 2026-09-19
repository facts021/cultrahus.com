import React from 'react';
import { Sparkles, MapPin, Calendar, Mail, Phone, Heart, ShieldCheck } from 'lucide-react';
import { CultrahusLogo } from './CultrahusLogo';

interface FooterProps {
  setActiveTab: (tab: string) => void;
}

export const Footer: React.FC<FooterProps> = ({ setActiveTab }) => {
  return (
    <footer className="bg-[#ede4d2] text-[#242c18] border-t-2 border-[#cfc4ad] pt-14 pb-8 print:hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 pb-12 border-b border-[#cfc4ad]">
          
          {/* Brand Info */}
          <div className="md:col-span-2 space-y-4">
            <div className="flex items-center gap-3">
              <CultrahusLogo size="md" />
              <div>
                <h3 className="font-serif text-xl font-bold text-[#242c18] tracking-wide">
                  Cultrahus Sangam 2026
                </h3>
                <p className="text-xs text-[#556345]">
                  National Theatre Conclave & Cultural Parliament
                </p>
              </div>
            </div>

            <p className="text-xs text-[#556345] max-w-md leading-relaxed">
              India’s celebrated autumn assembly honoring proscenium dramatics, collegiate Nukkad Natak, classical choreography, indie music fusion, and youth cultural policy on Sunday, 18 October 2026.
            </p>

            <div className="flex flex-wrap items-center gap-4 text-xs text-[#3d4c2a] pt-1">
              <span className="flex items-center gap-1.5 font-medium">
                <Calendar className="w-3.5 h-3.5 text-[#4b5d36]" />
                <span>18 October 2026</span>
              </span>
              <span className="flex items-center gap-1.5 font-medium">
                <MapPin className="w-3.5 h-3.5 text-[#4b5d36]" />
                <span>Venue: TBA</span>
              </span>
            </div>
          </div>

          {/* Quick Access */}
          <div className="space-y-3">
            <span className="text-xs uppercase tracking-widest text-[#3b4928] font-extrabold block">
              Festival Portals
            </span>
            <ul className="space-y-2 text-xs text-[#4a5839]">
              <li>
                <button
                  onClick={() => {
                    setActiveTab('home');
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="hover:text-[#172010] transition-colors"
                >
                  Conclave Overview
                </button>
              </li>
              <li>
                <button
                  onClick={() => {
                    setActiveTab('delegate');
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="hover:text-[#172010] transition-colors"
                >
                  Delegate Accreditation (₹650)
                </button>
              </li>
              <li>
                <button
                  onClick={() => {
                    setActiveTab('tickets');
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="hover:text-[#172010] transition-colors"
                >
                  Auditorium Tickets (₹200+)
                </button>
              </li>
              <li>
                <button
                  onClick={() => {
                    setActiveTab('troupe');
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="hover:text-[#172010] transition-colors"
                >
                  Troupe & Play Registration
                </button>
              </li>
              <li>
                <button
                  onClick={() => {
                    setActiveTab('secretariat');
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="hover:text-[#172010] transition-colors"
                >
                  Join Secretariat Directorate
                </button>
              </li>
              <li>
                <button
                  onClick={() => {
                    setActiveTab('sponsor');
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="hover:text-[#172010] text-[#8b6521] font-semibold transition-colors flex items-center gap-1"
                >
                  <span>Sponsor Us (₹25K–₹1L)</span>
                </button>
              </li>
              <li className="pt-1">
                <button
                  onClick={() => {
                    setActiveTab('admin');
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="hover:text-[#172010] text-[#3b4928] font-bold transition-colors inline-flex items-center gap-1"
                >
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Organizer Registry</span>
                </button>
              </li>
            </ul>
          </div>

          {/* Contact Us & Secretariat Desk */}
          <div className="space-y-3">
            <span className="text-xs uppercase tracking-widest text-[#3b4928] font-extrabold block">
              Contact Us
            </span>
            <div className="space-y-2 text-xs text-[#4a5839]">
              <p className="flex items-center gap-2">
                <Phone className="w-3.5 h-3.5 text-[#4b5d36]" />
                <span>+91 98185 61227 (24x7 Helpline)</span>
              </p>
              <p className="flex items-center gap-2">
                <Mail className="w-3.5 h-3.5 text-[#4b5d36]" />
                <a
                  href="mailto:cultrahusorganization@gmail.com"
                  className="hover:underline hover:text-[#242c18]"
                >
                  cultrahusorganization@gmail.com
                </a>
              </p>
              <p className="flex items-center gap-2">
                <MapPin className="w-3.5 h-3.5 text-[#4b5d36]" />
                <span>Venue: TBA</span>
              </p>
              <div className="pt-2">
                <button
                  onClick={() => {
                    setActiveTab('contact');
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#3b4928] hover:bg-[#485932] text-[#f7f4ec] font-bold shadow-sm transition-colors"
                >
                  <span>Contact Us Now →</span>
                </button>
              </div>
            </div>
          </div>

        </div>

        {/* Bottom copyright */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between text-[11px] text-[#6b775f] gap-4">
          <p>© 2026 Cultrahus Cultural Foundation. All rights reserved. Sovereign Natya Puraskar.</p>
          <div className="flex items-center gap-4">
            <span>Venue: TBA</span>
            <span>•</span>
            <button
              onClick={() => {
                setActiveTab('admin');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="hover:underline hover:text-[#242c18] transition flex items-center gap-1"
            >
              <ShieldCheck className="w-3 h-3 text-[#5b6e41]" />
              <span>Organizer Registry</span>
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
};
