import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  Calendar,
  MapPin,
  Ticket,
  UserCheck,
  Theater,
  Users,
  Clock,
  CheckCircle2,
  ChevronDown,
  ArrowRight,
  ShieldAlert,
  Award,
  Music,
  Compass,
  Phone,
  MessageSquare,
  Crown
} from 'lucide-react';
import { FESTIVAL_GENRES, FAQ_ITEMS } from '../data/festivalData';
import { CultrahusLogo } from './CultrahusLogo';

interface HomeViewProps {
  setActiveTab: (tab: string) => void;
}

export const HomeView: React.FC<HomeViewProps> = ({ setActiveTab }) => {
  // Countdown timer to October 18, 2026, 04:00 PM IST (Grand Evening Conclave)
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0
  });

  const [openFaq, setOpenFaq] = useState<string | null>('faq-1');

  useEffect(() => {
    const festivalDate = new Date('2026-10-18T16:00:00+05:30').getTime();

    const updateCountdown = () => {
      const now = new Date().getTime();
      const distance = festivalDate - now;

      if (distance > 0) {
        setTimeLeft({
          days: Math.floor(distance / (1000 * 60 * 60 * 24)),
          hours: Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
          minutes: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
          seconds: Math.floor((distance % (1000 * 60)) / 1000)
        });
      } else {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
      }
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="space-y-16 pb-20">
      
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-[#f7f3ea] via-[#ede4d2] to-[#f6f1e8] text-[#242c18] py-16 sm:py-24 border-b border-[#cfc4ad]">
        
        {/* Subtle decorative background patterns */}
        <div className="absolute inset-0 opacity-15 pointer-events-none bg-[radial-gradient(#4d5f35_1px,transparent_1px)] [background-size:24px_24px]" />
        <div className="absolute -top-32 -right-32 w-96 h-96 rounded-full bg-[#d8cfbe]/30 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-32 -left-32 w-96 h-96 rounded-full bg-[#cad5bc]/25 blur-3xl pointer-events-none" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            
            <div className="lg:col-span-8 max-w-3xl">
              
              {/* Top metadata pill */}
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#ebf0e2] border border-[#b8cbb0] text-[#364426] text-xs font-semibold mb-6 shadow-sm">
                <Sparkles className="w-3.5 h-3.5 text-[#5b6e41]" />
                <span>National Theatre Conclave & Cultural Parliament 2026</span>
              </div>

              <h1 className="font-serif text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-[#222b17] leading-tight">
                Cultrahus <span className="text-[#4b5d36]">Sangam</span> 2026
              </h1>

              <p className="mt-5 text-lg sm:text-xl text-[#536243] font-normal leading-relaxed max-w-2xl">
                India’s premier confluence of proscenium dramaturgy, street theatre, classical choreography, indie folk fusion, and the national youth cultural parliament.
              </p>

              {/* Date and Location Badge */}
              <div className="mt-8 flex flex-wrap items-center gap-3.5 text-sm font-medium text-[#242c18]">
                <div className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white/90 backdrop-blur-sm border border-[#cfc4ad] shadow-sm">
                  <Calendar className="w-4 h-4 text-[#4b5d36]" />
                  <span>Sunday, 18 October 2026</span>
                </div>
                <div className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white/90 backdrop-blur-sm border border-[#cfc4ad] shadow-sm">
                  <MapPin className="w-4 h-4 text-[#4b5d36]" />
                  <span className="font-semibold text-[#242c18]">Venue: TBA</span>
                </div>
              </div>

              {/* Action CTAs */}
              <div className="mt-10 flex flex-wrap items-center gap-4">
                <button
                  onClick={() => setActiveTab('delegate')}
                  className="px-6 py-3.5 rounded-xl text-sm font-bold bg-[#3b4928] hover:bg-[#485932] text-[#f7f4ec] font-sans shadow-lg shadow-black/10 transition-all transform hover:-translate-y-0.5 flex items-center gap-2"
                >
                  <UserCheck className="w-4 h-4 text-[#e5d4aa]" />
                  <span>Accredited Delegate (₹650)</span>
                </button>

                <button
                  onClick={() => setActiveTab('tickets')}
                  className="px-6 py-3.5 rounded-xl text-sm font-bold bg-[#ede4d2] hover:bg-[#e2d6bf] text-[#242c18] border border-[#c5b9a1] transition-all flex items-center gap-2 shadow-sm"
                >
                  <Ticket className="w-4 h-4 text-[#4b5d36]" />
                  <span>
                    Book Passes (From ₹200 <span className="line-through text-xs text-[#828f74] font-normal">₹350</span>)
                  </span>
                </button>

                <button
                  onClick={() => setActiveTab('contact')}
                  className="px-5 py-3.5 rounded-xl text-sm font-semibold text-[#384626] hover:text-[#182010] hover:bg-[#eae1cd] transition-colors flex items-center gap-2"
                >
                  <MessageSquare className="w-4 h-4 text-[#5b6e41]" />
                  <span>Contact Us</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Garba + DJ Night Inclusion Callout */}
              <div className="mt-4 flex items-center gap-2">
                <button
                  onClick={() => setActiveTab('tickets')}
                  className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-[#ebf0e2] hover:bg-[#dfe7d2] border border-[#b8cbb0] text-xs font-semibold text-[#242c18] transition-colors shadow-xs"
                >
                  <Sparkles className="w-3.5 h-3.5 text-[#3b4928] shrink-0" />
                  <span>
                    🎉 <strong>Garba Night & DJ Night</strong> are fully included with all Conclave Ticket Passes!
                  </span>
                  <ArrowRight className="w-3 h-3 text-[#5b6e41]" />
                </button>
              </div>

            </div>

            {/* Right Hero Branding Seal */}
            <div className="lg:col-span-4 flex flex-col items-center justify-center">
              <div className="p-6 rounded-3xl bg-white/95 border-2 border-[#cfc4ad] shadow-xl backdrop-blur-md text-center max-w-xs sm:max-w-sm">
                <CultrahusLogo size="xl" className="mx-auto mb-4" />
                <h3 className="font-serif text-xl font-extrabold text-[#242c18] tracking-wide">
                  CULTRAHUS SANGAM
                </h3>
                <p className="text-xs uppercase tracking-widest text-[#55673d] font-bold mt-1">
                  — Vision to Realism —
                </p>
                <div className="mt-4 pt-4 border-t border-[#dfd7c5] text-xs text-[#556345] space-y-1.5">
                  <p className="font-semibold text-[#242c18]">National Cultural Conclave</p>
                  <p>Sunday, 18 October 2026</p>
                  <p className="text-[#3b4928] font-bold">Venue: TBA</p>
                </div>
              </div>
            </div>

          </div>

          {/* Countdown Clock Grid */}
          <div className="mt-14 pt-8 border-t border-[#cfc4ad]/70 max-w-xl">
            <div className="text-[11px] uppercase tracking-widest text-[#556345] font-bold mb-3 flex items-center gap-2">
              <Clock className="w-3.5 h-3.5 text-[#4b5d36]" />
              <span>Conclave Countdown • 18 October 2026</span>
            </div>
            <div className="grid grid-cols-4 gap-3 text-center">
              <div className="bg-white/90 backdrop-blur-sm border border-[#cfc4ad] rounded-xl p-3 shadow-sm">
                <span className="font-serif text-2xl sm:text-3xl font-extrabold text-[#3b4928] block">
                  {timeLeft.days}
                </span>
                <span className="text-[10px] uppercase font-bold text-[#6b775f] tracking-wider">Days</span>
              </div>
              <div className="bg-white/90 backdrop-blur-sm border border-[#cfc4ad] rounded-xl p-3 shadow-sm">
                <span className="font-serif text-2xl sm:text-3xl font-extrabold text-[#3b4928] block">
                  {String(timeLeft.hours).padStart(2, '0')}
                </span>
                <span className="text-[10px] uppercase font-bold text-[#6b775f] tracking-wider">Hours</span>
              </div>
              <div className="bg-white/90 backdrop-blur-sm border border-[#cfc4ad] rounded-xl p-3 shadow-sm">
                <span className="font-serif text-2xl sm:text-3xl font-extrabold text-[#3b4928] block">
                  {String(timeLeft.minutes).padStart(2, '0')}
                </span>
                <span className="text-[10px] uppercase font-bold text-[#6b775f] tracking-wider">Mins</span>
              </div>
              <div className="bg-white/90 backdrop-blur-sm border border-[#cfc4ad] rounded-xl p-3 shadow-sm">
                <span className="font-serif text-2xl sm:text-3xl font-extrabold text-[#3b4928] block">
                  {String(timeLeft.seconds).padStart(2, '0')}
                </span>
                <span className="text-[10px] uppercase font-bold text-[#6b775f] tracking-wider">Secs</span>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* Prominent Contact Us Bar */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8">
        <div className="bg-[#fcfaf5] border-2 border-[#cfc5b0] rounded-2xl p-4 sm:p-6 shadow-md flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#3d4a2c] text-[#f4efe4] flex items-center justify-center shrink-0">
              <Phone className="w-5 h-5 text-[#d7c494]" />
            </div>
            <div>
              <h4 className="font-serif text-base font-bold text-[#27311c]">
                Need Assistance? Contact Us
              </h4>
              <p className="text-xs text-[#596645]">
                Our Secretariat helpline is active daily for delegate accreditations, troupe registration, and venue questions.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <a
              href="https://wa.me/919818561227"
              target="_blank"
              rel="noreferrer"
              className="px-4 py-2 bg-[#3d4a2c] hover:bg-[#4d5d36] text-[#f4efe4] text-xs font-bold rounded-lg transition-colors flex items-center gap-1.5 shadow"
            >
              <span>WhatsApp: +91 98185 61227</span>
            </a>
            <button
              onClick={() => setActiveTab('contact')}
              className="px-4 py-2 bg-[#ede6d4] hover:bg-[#e2d9c4] text-[#242c18] text-xs font-bold rounded-lg border border-[#cfc5b0] transition-colors"
            >
              Contact Us Desk
            </button>
          </div>
        </div>
      </section>

      {/* Key Pillars Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="text-xs uppercase tracking-widest text-[#5d6e44] font-extrabold block mb-2">
            The Conclave Mandate
          </span>
          <h2 className="font-serif text-3xl sm:text-4xl font-extrabold text-[#242c18]">
            Five Pillars of Cultural Confluence
          </h2>
          <p className="mt-3 text-[#586447] text-sm sm:text-base">
            Cultrahus Sangam 2026 brings together over 1,200 artists, academicians, and youth delegates for a grand evening celebration of the Indian stage.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-[#fbf9f4] border border-[#d9d0be] rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow">
            <div className="w-12 h-12 rounded-xl bg-[#374426] text-[#d7c494] flex items-center justify-center mb-4 shadow">
              <Theater className="w-6 h-6" />
            </div>
            <h3 className="font-serif text-xl font-bold text-[#242c18]">Proscenium & Street Theatres</h3>
            <p className="mt-2 text-[#586447] text-sm leading-relaxed">
              Curated showcase featuring 16 full-scale proscenium productions and 24 collegiate Nukkad Natak squads competing for national honors.
            </p>
          </div>

          <div className="bg-[#fbf9f4] border border-[#d9d0be] rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow">
            <div className="w-12 h-12 rounded-xl bg-[#4d5d36] text-[#f4efe4] flex items-center justify-center mb-4 shadow">
              <Users className="w-6 h-6" />
            </div>
            <h3 className="font-serif text-xl font-bold text-[#242c18]">The Cultural Parliament</h3>
            <p className="mt-2 text-[#586447] text-sm leading-relaxed">
              A high-level deliberative assembly where student leaders and veteran dramaturges debate policies, arts grants, and regional proscenium preservation.
            </p>
          </div>

          <div className="bg-[#fbf9f4] border border-[#d9d0be] rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow">
            <div className="w-12 h-12 rounded-xl bg-[#2e3920] text-[#d7c494] flex items-center justify-center mb-4 shadow">
              <Music className="w-6 h-6" />
            </div>
            <h3 className="font-serif text-xl font-bold text-[#242c18]">Folk, Garba & EDM Finale</h3>
            <p className="mt-2 text-[#586447] text-sm leading-relaxed">
              Seamlessly transitioning from twilight Shehnai invocations and evening classical dance to festive open-air Dandiya Raas and a guest headliner DJ.
            </p>
          </div>
        </div>
      </section>

      {/* Performance Genres Interactive Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-[#29341d] rounded-3xl p-8 sm:p-12 text-[#f7f4ec] shadow-xl border border-[#485933]">
          <div className="mb-10 pb-6 border-b border-[#4d5f37]">
            <div>
              <span className="text-xs uppercase tracking-widest text-[#d7c494] font-bold block mb-1">
                Curated Festival Disciplines
              </span>
              <h2 className="font-serif text-3xl sm:text-4xl font-extrabold text-white">
                Performing Arts Program
              </h2>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {FESTIVAL_GENRES.map((genre, idx) => (
              <div
                key={idx}
                className="bg-[#1f2715]/70 border border-[#43532f] rounded-2xl p-6 hover:bg-[#1f2715] transition-colors flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-[10px] uppercase font-bold tracking-wider px-2.5 py-0.5 rounded-full bg-[#4a5c34] text-[#d7c494] border border-[#607444]">
                      {genre.badge}
                    </span>
                    <span className="text-xs font-mono text-[#9bb084]">Track 0{idx + 1}</span>
                  </div>
                  <h3 className="font-serif text-xl font-bold text-white mb-1">{genre.title}</h3>
                  <p className="text-xs text-[#d7c494] font-medium mb-3">{genre.tagline}</p>
                  <p className="text-[#c8d4bf] text-xs leading-relaxed">{genre.description}</p>
                </div>
                <div className="mt-6 pt-4 border-t border-[#3f4f2c] flex items-center justify-between">
                  <button
                    onClick={() => setActiveTab('delegate')}
                    className="text-xs font-bold text-[#d7c494] hover:text-[#e4d4aa] transition-colors inline-flex items-center gap-1"
                  >
                    <span>Register in Discipline</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Frequently Asked Questions Accordion */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10">
          <span className="text-xs uppercase tracking-widest text-[#5d6e44] font-extrabold block mb-2">
            Answers & Clarity
          </span>
          <h2 className="font-serif text-3xl font-extrabold text-[#242c18]">
            Frequently Asked Questions
          </h2>
        </div>

        <div className="space-y-3">
          {FAQ_ITEMS.map((faq) => {
            const isOpen = openFaq === faq.id;
            return (
              <div
                key={faq.id}
                className="bg-[#fbf9f4] border border-[#d9d0be] rounded-2xl overflow-hidden shadow-sm"
              >
                <button
                  onClick={() => setOpenFaq(isOpen ? null : faq.id)}
                  className="w-full text-left px-5 py-4 flex items-center justify-between gap-4 focus:outline-none hover:bg-[#f1ecd9] transition-colors"
                >
                  <span className="font-serif text-base font-bold text-[#242c18]">
                    {faq.question}
                  </span>
                  <ChevronDown
                    className={`w-5 h-5 text-[#5a6c42] transition-transform shrink-0 ${
                      isOpen ? 'transform rotate-180' : ''
                    }`}
                  />
                </button>
                {isOpen && (
                  <div className="px-5 pb-5 pt-1 text-sm text-[#4a5738] leading-relaxed border-t border-[#dfd7c5] bg-white">
                    {faq.answer}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* Sponsor Us / Corporate & Brand Partnerships Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-3xl p-8 sm:p-10 text-[#242c18] shadow-md border-2 border-[#cfc4ad] relative overflow-hidden">
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-8">
            <div className="max-w-2xl space-y-3">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#f6f2e9] text-[#71541c] text-xs font-bold border border-[#dfd6c3]">
                <Crown className="w-3.5 h-3.5 text-[#b3832f]" />
                <span>Brand Partnerships & Sponsorships</span>
              </div>
              <h3 className="font-serif text-2xl sm:text-3xl font-extrabold text-[#242c18]">
                Partner with Cultrahus Sangam 2026
              </h3>
              <p className="text-sm text-[#556345] leading-relaxed">
                Connect your brand directly with over 1,500+ university actors, cultural luminaries, proscenium theatre artists, and youth delegates. Official sponsorship packages at <strong>₹25,000</strong>, <strong>₹50,000</strong>, <strong>₹75,000</strong>, and <strong>₹1,00,000</strong> with brand activation spaces and deck submission.
              </p>
              <div className="flex flex-wrap items-center gap-2 pt-1 text-xs font-semibold text-[#3b4928]">
                <span className="px-2.5 py-1 rounded-lg bg-[#f7f4ec] border border-[#cfc4ad]">Silver • ₹25,000</span>
                <span className="px-2.5 py-1 rounded-lg bg-[#f7f4ec] border border-[#cfc4ad]">Gold • ₹50,000</span>
                <span className="px-2.5 py-1 rounded-lg bg-[#f7f4ec] border border-[#cfc4ad]">Platinum • ₹75,000</span>
                <span className="px-2.5 py-1 rounded-lg bg-[#f7f4ec] border border-[#cfc4ad]">Presenting • ₹1,00,000</span>
              </div>
            </div>

            <div className="shrink-0 w-full lg:w-auto">
              <button
                onClick={() => {
                  setActiveTab('sponsor');
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className="w-full lg:w-auto px-6 py-4 rounded-2xl bg-[#3b4928] hover:bg-[#485932] text-[#f7f4ec] font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2"
              >
                <Crown className="w-4 h-4 text-[#e5d4aa]" />
                <span>Explore Sponsorship Tiers & Apply →</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Bottom Conversion Banner - Beige Main with Olive Secondary */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-[#ede4d2] rounded-3xl p-8 sm:p-12 text-[#242c18] shadow-lg border-2 border-[#cfc4ad] flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="max-w-xl">
            <span className="text-xs uppercase tracking-widest text-[#4b5d36] font-extrabold block mb-2">
              National Registration Active
            </span>
            <h3 className="font-serif text-3xl sm:text-4xl font-extrabold text-[#222b17]">
              Secure Your Pass for Sangam 2026
            </h3>
            <p className="mt-2 text-[#536243] text-sm leading-relaxed">
              Auditorium seats and official delegate credentials are capped by fire-safety auditorium regulations. Early accreditation confirms your seat allocation immediately. Venue: TBA.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
            <button
              onClick={() => setActiveTab('delegate')}
              className="w-full sm:w-auto px-5 py-3.5 rounded-xl text-xs font-bold bg-[#3b4928] hover:bg-[#485932] text-[#f7f4ec] font-sans shadow-md transition-all text-center"
            >
              Delegate Accreditation (₹650)
            </button>
            <button
              onClick={() => setActiveTab('tickets')}
              className="w-full sm:w-auto px-5 py-3.5 rounded-xl text-xs font-bold bg-[#364325] hover:bg-[#475731] text-[#d7c494] shadow transition-all text-center border border-[#5b6e41]/60"
            >
              Book Conclave Passes (From ₹200)
            </button>
            <button
              onClick={() => setActiveTab('contact')}
              className="w-full sm:w-auto px-4 py-3.5 rounded-xl text-xs font-bold bg-white text-[#242c18] hover:bg-[#f6f2e9] transition-all text-center shadow border border-[#cfc4ad]"
            >
              Contact Us
            </button>
          </div>
        </div>
      </section>

    </div>
  );
};

